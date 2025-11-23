import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Camera, CameraOff, Users, PhoneOff, MonitorPlay, Mic, MicOff, Expand } from 'lucide-react';
import api from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ultimate-b-tech-buddy.onrender.com/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/?api$/, '');

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302'
    ]
  },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

const parsedIceServers = (() => {
  const raw = import.meta.env.VITE_ICE_SERVERS;
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value as RTCIceServer[] : [];
  } catch (err) {
    console.warn('Invalid VITE_ICE_SERVERS JSON. Falling back to defaults.', err);
    return [];
  }
})();

const ICE_SERVERS: RTCConfiguration['iceServers'] = parsedIceServers.length ? parsedIceServers : DEFAULT_ICE_SERVERS;

interface PeerStream {
  peerId: string;
  stream: MediaStream;
  userName: string;
}

interface VideoChatProps {
  isActive?: boolean;
  onExpand?: () => void;
}

export default function VideoChat({ isActive = true, onExpand }: VideoChatProps) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState<string>('');
  const [roomInput, setRoomInput] = useState(() => localStorage.getItem('video_room') || 'nst-huddle');
  const [name, setName] = useState(localStorage.getItem('video_name') || 'NST Student');
  const [nameLoading, setNameLoading] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [peerInfo, setPeerInfo] = useState<Record<string, { userName: string }>>({});
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [error, setError] = useState<string>('');

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const pendingCandidatesRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const floatingVideoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef('');
  const socketHandlersRef = useRef<Record<string, (...args: any[]) => void> | null>(null);

  useEffect(() => {
    let canceled = false;
    const fallbackName = localStorage.getItem('guest') === 'true' ? 'Guest' : 'NST Student';
    const stored = localStorage.getItem('video_name');
    if (stored) {
      setName(stored);
    } else {
      setName(fallbackName);
    }

    const resolveName = async () => {
      if (localStorage.getItem('guest') === 'true') {
        setName('Guest');
        setNameLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const derived = res.data?.username || res.data?.name || res.data?.email?.split?.('@')[0];
        if (!canceled) {
          const finalName = derived?.toString().trim() || fallbackName;
          setName(finalName);
          localStorage.setItem('video_name', finalName);
        }
      } catch {
        if (!canceled) {
          setName(fallbackName);
          localStorage.setItem('video_name', fallbackName);
        }
      } finally {
        if (!canceled) {
          setNameLoading(false);
        }
      }
    };

    resolveName();

    return () => {
      canceled = true;
    };
  }, []);

  const stopLocalStream = useCallback(() => {
    const stream = localStreamRef.current;
    stream?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const teardownSocket = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handlers = socketHandlersRef.current;
    if (handlers) {
      socket.off('connect', handlers.connect);
      socket.off('disconnect', handlers.disconnect);
      socket.off('video:peers', handlers.peers);
      socket.off('video:peer-connected', handlers.peerConnected);
      socket.off('video:signal', handlers.signal);
      socket.off('video:peer-disconnected', handlers.peerDisconnected);
      socketHandlersRef.current = null;
    }

    socket.disconnect();
    socketRef.current = null;
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    pendingCandidatesRef.current = {};
    setRemoteStreams({});
    setPeerInfo({});
    stopLocalStream();
    setSocketConnected(false);
  }, [stopLocalStream]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const shouldConnect = isActive || Boolean(joinedRoom);
    if (shouldConnect && !socketRef.current) {
      const socket = io(SOCKET_URL, { transports: ['websocket'], reconnection: false });

      const handleConnect = () => setSocketConnected(true);
      const handleDisconnect = () => setSocketConnected(false);
      const handlePeers = async ({ peers, roomId }: { peers: any[]; roomId: string }) => {
        if (!roomId || !Array.isArray(peers)) return;
        const normalizedPeers = peers
          .map((entry) => (typeof entry === 'string' ? { peerId: entry, userName: 'NST Student' } : entry))
          .filter((peer) => peer?.peerId && peer.peerId !== socket.id);
        if (!normalizedPeers.length) return;
        setPeerInfo((prev) => {
          const next = { ...prev };
          normalizedPeers.forEach(({ peerId, userName }) => {
            next[peerId] = { userName: userName?.trim() || prev[peerId]?.userName || 'NST Student' };
          });
          return next;
        });
        for (const peer of normalizedPeers) {
          await createOfferForPeer(peer.peerId, roomId);
        }
      };
      const handlePeerConnected = ({ peerId, roomId, userName }: { peerId: string; roomId: string; userName?: string }) => {
        const currentRoom = roomRef.current;
        if (!roomId || peerId === socket.id || roomId !== currentRoom) return;
        if (userName) {
          setPeerInfo((prev) => ({
            ...prev,
            [peerId]: { userName: userName.trim() || prev[peerId]?.userName || 'NST Student' }
          }));
        }
        if (!peersRef.current[peerId]) {
          createPeerConnection(peerId, roomId);
        }
      };
      const handleSignal = async ({ from, data, roomId }: { from: string; data: any; roomId: string }) => {
        const currentRoom = roomRef.current;
        if (!currentRoom || roomId !== currentRoom) return;
        let pc = peersRef.current[from];
        if (!pc) {
          const stream = await ensureLocalStream();
          pc = createPeerConnection(from, roomId, stream);
        }
        if (data?.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video:signal', { roomId: currentRoom, targetId: from, data: pc.localDescription });
          await flushPendingCandidates(from);
        } else if (data?.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          await flushPendingCandidates(from);
        } else if (data?.candidate) {
          await handleIncomingCandidate(from, data);
        }
      };
      const handlePeerDisconnected = ({ peerId, roomId }: { peerId: string; roomId: string }) => {
        const currentRoom = roomRef.current;
        if (!roomId || roomId !== currentRoom) return;
        removePeer(peerId);
      };

      socketHandlersRef.current = {
        connect: handleConnect,
        disconnect: handleDisconnect,
        peers: handlePeers,
        peerConnected: handlePeerConnected,
        signal: handleSignal,
        peerDisconnected: handlePeerDisconnected,
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('video:peers', handlePeers);
      socket.on('video:peer-connected', handlePeerConnected);
      socket.on('video:signal', handleSignal);
      socket.on('video:peer-disconnected', handlePeerDisconnected);

      socketRef.current = socket;
      if (socket.connected) {
        setSocketConnected(true);
      }
    } else if (!shouldConnect && socketRef.current) {
      teardownSocket();
    }
  }, [isActive, joinedRoom, teardownSocket]);

  useEffect(() => {
    return () => {
      teardownSocket();
    };
  }, [teardownSocket]);

  useEffect(() => {
    roomRef.current = joinedRoom;
  }, [joinedRoom]);

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Media capture failed', err);
      setError('Please allow camera & microphone access to join the video room.');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (localStreamRef.current !== localStream) {
      localStreamRef.current = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const assignSrc = (element: HTMLVideoElement | null) => {
      if (!element) return;
      if (localStream) {
        if (element.srcObject !== localStream) {
          element.srcObject = localStream;
        }
        element.play?.().catch(() => {
          /* autoplay might fail silently; ignore */
        });
      } else if (element.srcObject) {
        element.srcObject = null;
      }
    };

    assignSrc(localVideoRef.current);
    assignSrc(floatingVideoRef.current);
  }, [localStream, isActive]);

  const createPeerConnection = (peerId: string, roomId: string, streamOverride?: MediaStream | null) => {
    const socket = socketRef.current;
    if (!socket) throw new Error('Socket not ready');
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current[peerId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('video:signal', { roomId, targetId: peerId, data: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const [firstStream] = event.streams;
      const resolvedStream = firstStream ?? new MediaStream([event.track]);
      setRemoteStreams((prev) => ({ ...prev, [peerId]: resolvedStream }));
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        removePeer(peerId);
      }
    };

    const streamToUse = streamOverride ?? localStreamRef.current;
    streamToUse?.getTracks().forEach((track) => pc.addTrack(track, streamToUse));

    return pc;
  };

  const createOfferForPeer = async (peerId: string, roomId: string) => {
    const stream = await ensureLocalStream();
    const pc = createPeerConnection(peerId, roomId, stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit('video:signal', { roomId, targetId: peerId, data: offer });
  };

  async function handleIncomingCandidate(peerId: string, candidate: RTCIceCandidateInit) {
    if (!candidate) return;
    const pc = peersRef.current[peerId];
    if (!pc || !pc.remoteDescription) {
      if (!pendingCandidatesRef.current[peerId]) {
        pendingCandidatesRef.current[peerId] = [];
      }
      pendingCandidatesRef.current[peerId].push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('ICE candidate failed', err);
    }
  }

  async function flushPendingCandidates(peerId: string) {
    const pc = peersRef.current[peerId];
    const pending = pendingCandidatesRef.current[peerId];
    if (!pc || !pending?.length || !pc.remoteDescription) return;

    while (pending.length) {
      const candidate = pending.shift();
      if (!candidate) continue;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('ICE candidate failed', err);
      }
    }

    delete pendingCandidatesRef.current[peerId];
  }

  const removePeer = (peerId: string) => {
    const pc = peersRef.current[peerId];
    if (pc) {
      pc.close();
      delete peersRef.current[peerId];
    }
    if (pendingCandidatesRef.current[peerId]) {
      delete pendingCandidatesRef.current[peerId];
    }
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    setPeerInfo((prev) => {
      if (!prev[peerId]) return prev;
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  };



  const handleJoin = async () => {
    if (!socketRef.current || !roomInput.trim() || nameLoading) return;
    setJoining(true);
    try {
      const stream = await ensureLocalStream();
      stream.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabled;
      });
      stream.getAudioTracks().forEach((track) => {
        track.enabled = micEnabled;
      });
      const normalizedRoom = roomInput.trim().toLowerCase();
      roomRef.current = normalizedRoom;
      setJoinedRoom(normalizedRoom);
      socketRef.current.emit('video:join', { roomId: normalizedRoom, userName: name || 'NST Student' });
      localStorage.setItem('video_room', normalizedRoom);
      localStorage.setItem('video_name', name || 'NST Student');
      setError('');
    } catch {
      // error already set in ensureLocalStream
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('video:leave', { roomId: joinedRoom });
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    pendingCandidatesRef.current = {};
    setRemoteStreams({});
    setPeerInfo({});
    stopLocalStream();
    roomRef.current = '';
    setJoinedRoom('');
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      const stream = localStreamRef.current || localStream;
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.stop();
          stream.removeTrack(track);
        });
        Object.values(peersRef.current).forEach((pc) => {
          pc.getSenders().forEach((sender) => {
            if (sender.track?.kind === 'video') {
              sender.replaceTrack(null);
            }
          });
        });
      }
      setCameraEnabled(false);
      return;
    }

    try {
      let activeStream = localStreamRef.current || localStream;
      if (!activeStream) {
        activeStream = await ensureLocalStream();
      }
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const [videoTrack] = videoStream.getVideoTracks();
      if (!videoTrack) throw new Error('No video track available');
      activeStream?.addTrack(videoTrack);
      localStreamRef.current = activeStream || new MediaStream([videoTrack]);
      setLocalStream((prev) => activeStream || prev || null);

      if (localVideoRef.current && localVideoRef.current.srcObject !== (activeStream || videoStream)) {
        localVideoRef.current.srcObject = activeStream || videoStream;
      }

      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        } else if (activeStream) {
          pc.addTrack(videoTrack, activeStream);
        }
      });

      setCameraEnabled(true);
    } catch (err) {
      console.error('Failed to enable camera', err);
      setError('Unable to enable camera. Please allow camera access.');
    }
  };

  const toggleMic = async () => {
    if (micEnabled) {
      const stream = localStreamRef.current || localStream;
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.stop();
          stream.removeTrack(track);
        });
        Object.values(peersRef.current).forEach((pc) => {
          pc.getSenders().forEach((sender) => {
            if (sender.track?.kind === 'audio') {
              sender.replaceTrack(null);
            }
          });
        });
      }
      setMicEnabled(false);
      return;
    }

    try {
      let activeStream = localStreamRef.current || localStream;
      if (!activeStream) {
        activeStream = await ensureLocalStream();
      }

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [audioTrack] = audioStream.getAudioTracks();
      if (!audioTrack) throw new Error('No audio track available');

      activeStream?.addTrack(audioTrack);
      localStreamRef.current = activeStream || new MediaStream([audioTrack]);
      setLocalStream((prev) => activeStream || prev || null);

      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'audio');
        if (sender) {
          sender.replaceTrack(audioTrack);
        } else if (activeStream) {
          pc.addTrack(audioTrack, activeStream);
        }
      });

      setMicEnabled(true);
    } catch (err) {
      console.error('Failed to enable microphone', err);
      setError('Unable to enable microphone. Please allow mic access.');
    }
  };

  const remotePeers = useMemo<PeerStream[]>(
    () => Object.entries(remoteStreams).map(([peerId, stream]) => ({
      peerId,
      stream,
      userName: peerInfo[peerId]?.userName || 'Peer'
    })),
    [remoteStreams, peerInfo]
  );

  useEffect(() => {
    remotePeers.forEach(({ peerId, stream }) => {
      const videoEl = document.getElementById(`remote-${peerId}`) as HTMLVideoElement | null;
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
        videoEl.play?.().catch(() => {
          /* Ignore autoplay errors; browser will resume once user interacts */
        });
      }
    });
  }, [remotePeers, isActive]);

  if (!isActive) {
    if (!joinedRoom) return null;
    const participantCount = 1 + remotePeers.length;
    return (
      <div className="fixed bottom-6 right-6 z-40 w-[min(320px,90vw)] animate-fade-in">
        <div className="swiss-card p-4 border-2 border-[var(--border-color)] bg-[var(--bg-panel)] shadow-[0_15px_45px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Video Room</p>
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{joinedRoom}</p>
            </div>
            <div className="flex items-center gap-2">
              {onExpand && (
                <button
                  type="button"
                  onClick={onExpand}
                  className="p-2 border border-[var(--border-color)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors"
                  title="Return to Video Chat"
                >
                  <Expand className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleLeave}
                className="p-2 border border-red-500 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                title="Leave room"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative w-full aspect-video border border-[var(--border-strong)] bg-black overflow-hidden rounded-md">
            {!localStream && (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)] text-xs font-mono uppercase tracking-widest">
                Connecting...
              </div>
            )}
            <video
              ref={floatingVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!cameraEnabled ? 'opacity-40' : ''}`}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-[10px] font-mono text-white border border-white/20 rounded-sm">
              {participantCount} online
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
            Continue collaborating while exploring other tools. Tap the arrow to reopen the full studio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 text-[var(--text-primary)]">
      <div className="swiss-card p-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-widest mb-2">Live rooms</p>
          <h2 className="heading-lg">NST Video Lounge</h2>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-2">Open the room, invite a batchmate, collaborate face-to-face.</p>
        </div>
        <div className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border ${socketConnected ? 'border-green-600 text-green-700 bg-green-50' : 'border-red-600 text-red-700 bg-red-50'}`}>
          {socketConnected ? 'Socket connected' : 'Socket offline'}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-8 xl:grid-cols-[340px_1fr]">
        <section className="swiss-card p-6 flex flex-col gap-6 h-fit">
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Room ID</label>
            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              disabled={!!joinedRoom}
              className="input-swiss w-full"
              placeholder="nst-huddle"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Participant</label>
            <div className="input-swiss w-full cursor-not-allowed select-none bg-[var(--bg-subtle)]">
              {nameLoading ? 'Resolving profile...' : name}
            </div>
          </div>
          {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 p-3">{error}</p>}
          <div className="flex gap-3">
            {joinedRoom ? (
              <button
                onClick={handleLeave}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-red-500 bg-red-500/10 text-red-200 font-bold uppercase tracking-wide px-4 py-3 hover:bg-red-500/20 transition-colors"
              >
                <PhoneOff className="w-4 h-4" /> End Call
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining || nameLoading}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-bold uppercase tracking-wide transition-colors ${joining || nameLoading
                  ? 'border-green-700 text-green-700/70 bg-green-900/10 cursor-not-allowed'
                  : 'border-green-500 text-green-300 hover:bg-green-500/10'
                  }`}
              >
                <MonitorPlay className="w-4 h-4" /> {joining ? 'Joining...' : 'Join room'}
              </button>
            )}
          </div>
          {joinedRoom && (
            <div className="flex gap-3">
              <button onClick={toggleCamera} className={`flex-1 py-3 border border-[var(--border-strong)] font-bold text-sm transition-all ${cameraEnabled ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)]' : 'bg-[var(--bg-page)] text-[var(--text-tertiary)]'}`}>
                {cameraEnabled ? <Camera className="inline w-4 h-4 mr-2" /> : <CameraOff className="inline w-4 h-4 mr-2" />}Camera
              </button>
              <button onClick={toggleMic} className={`flex-1 py-3 border border-[var(--border-strong)] font-bold text-sm transition-all ${micEnabled ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)]' : 'bg-[var(--bg-page)] text-[var(--text-tertiary)]'}`}>
                {micEnabled ? <Mic className="inline w-4 h-4 mr-2" /> : <MicOff className="inline w-4 h-4 mr-2" />}Mic
              </button>
            </div>
          )}
        </section>

        <section className="swiss-card p-6 min-h-[500px] relative flex flex-col overflow-hidden bg-[var(--bg-subtle)]">
          {joinedRoom ? (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <p className="uppercase text-[10px] font-bold tracking-widest text-[var(--text-secondary)] mb-1">Now in</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{joinedRoom}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 border border-green-500 bg-black/80 text-green-300 px-4 py-2 shadow-[0_0_12px_rgba(16,185,129,0.45)]">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="font-bold tracking-wide">{1 + remotePeers.length} participant{remotePeers.length === 0 ? '' : 's'}</span>
                </div>
              </div>
              <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto pr-2">
                <div className="grid gap-4 p-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  <div className="relative border border-[var(--border-strong)] bg-black overflow-hidden w-full aspect-video shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
                    {/* Camera Crosshairs */}
                    <div className="absolute inset-0 pointer-events-none opacity-50">
                      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/50"></div>
                      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/50"></div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/50"></div>
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/50"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                        <div className="w-[1px] h-2 bg-white/30"></div>
                        <div className="h-[1px] w-2 bg-white/30 absolute"></div>
                      </div>
                    </div>

                    {!localStream && (
                      <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-mono font-bold uppercase tracking-widest">
                        <span className="animate-pulse">Waiting_for_signal...</span>
                      </div>
                    )}
                    <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!cameraEnabled ? 'opacity-40' : ''}`} />
                    <div className="absolute bottom-3 left-3 text-xs font-mono font-bold bg-white text-black px-2 py-0.5 border border-black flex items-center gap-2">
                      <span>LOCAL_FEED</span>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    </div>
                  </div>
                  {remotePeers.length === 0 && (
                    <div className="w-full aspect-video border border-dashed border-[var(--border-strong)] flex flex-col items-center justify-center text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-page)] p-6 text-center">
                      <div className="w-12 h-12 border border-[var(--border-strong)] flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-[var(--text-tertiary)]" />
                      </div>
                      <span className="font-mono uppercase tracking-widest text-xs mb-2">Awaiting Peers</span>
                      Share this room ID to bring others into the call.
                    </div>
                  )}
                  {remotePeers.map(({ peerId, userName }) => (
                    <div key={peerId} className="relative border border-[var(--border-strong)] bg-black overflow-hidden w-full aspect-video shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {/* Remote Crosshairs */}
                      <div className="absolute inset-0 pointer-events-none opacity-30">
                        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white"></div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white"></div>
                      </div>
                      <video id={`remote-${peerId}`} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 left-3 text-xs font-mono font-bold bg-[var(--accent-color)] text-white px-2 py-0.5 border border-black">
                        {userName.toUpperCase()}
                      </div>
                      <div className="absolute top-3 right-3 px-1.5 py-0.5 bg-black/50 text-[10px] font-mono text-white border border-white/20">
                        LIVE
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating controls bar */}
              <div className="pointer-events-none absolute left-0 right-0 bottom-6 flex justify-center">
                <div className="pointer-events-auto px-4 py-3 bg-white border border-[var(--border-strong)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <button onClick={handleLeave} className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
                    <PhoneOff className="w-4 h-4" /> Leave
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
              {!socketConnected && (
                <div className="w-full max-w-sm border border-green-500/40 bg-black text-green-300 font-mono px-5 py-4 text-left">
                  <p className="text-[10px] uppercase tracking-[0.3em] mb-2">socket://nst-video</p>
                  <p className="text-sm font-bold tracking-wide">Linking media relays...</p>
                  <p className="text-[11px] text-green-200">
                    {joinedRoom ? 'Re-establishing peer mesh and ICE candidates.' : 'Booting SFU nodes and dialing peers.'}
                  </p>
                  <div className="mt-4 h-2 w-full border border-green-500/40 bg-green-500/10 overflow-hidden">
                    <div className="h-full w-1/2 bg-green-400 animate-pulse" />
                  </div>
                </div>
              )}
              <div className="w-20 h-20 bg-white border border-[var(--border-strong)] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users className="w-10 h-10 text-[var(--text-primary)]" />
              </div>
              <h3 className="heading-lg">Pick a room to start video chat</h3>
              <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md leading-relaxed">
                Enter a simple room id (e.g., nst-huddle) and share it with your batch. Everyone who joins that id will be connected in a secure peer-to-peer call.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
