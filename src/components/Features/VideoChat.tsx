import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Camera, CameraOff, Users, PhoneOff, MonitorPlay, Mic, MicOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ultimate-b-tech-buddy.onrender.com/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/?api$/, '');

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302'
  ] },
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

export default function VideoChat() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState<string>('');
  const [roomInput, setRoomInput] = useState(() => localStorage.getItem('video_room') || 'nst-huddle');
  const [name, setName] = useState(localStorage.getItem('video_name') || 'NST Student');
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
  const roomRef = useRef('');

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('video:peers', async ({ peers, roomId }) => {
      if (!roomId || !Array.isArray(peers)) return;
      const normalizedPeers = peers.map((entry) =>
        typeof entry === 'string' ? { peerId: entry, userName: 'NST Student' } : entry
      ).filter((peer) => peer?.peerId && peer.peerId !== socket.id);
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
    });

    socket.on('video:peer-connected', ({ peerId, roomId, userName }) => {
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
    });

    socket.on('video:signal', async ({ from, data, roomId }) => {
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
    });

    socket.on('video:peer-disconnected', ({ peerId, roomId }) => {
      const currentRoom = roomRef.current;
      if (!roomId || roomId !== currentRoom) return;
      removePeer(peerId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      pendingCandidatesRef.current = {};
      stopLocalStream();
    };
  }, []);

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
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      const element = localVideoRef.current;
      element.play?.().catch(() => {
        /* autoplay might fail silently; ignore */
      });
    }
  }, [localStream]);

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

  const stopLocalStream = () => {
    const stream = localStreamRef.current || localStream;
    stream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    localStreamRef.current = null;
  };

  const handleJoin = async () => {
    if (!socketRef.current || !roomInput.trim()) return;
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

  const toggleCamera = () => {
    const next = !cameraEnabled;
    setCameraEnabled(next);
    const stream = localStreamRef.current || localStream;
    stream?.getVideoTracks().forEach((track) => (track.enabled = next));
  };

  const toggleMic = () => {
    const next = !micEnabled;
    setMicEnabled(next);
    const stream = localStreamRef.current || localStream;
    stream?.getAudioTracks().forEach((track) => (track.enabled = next));
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
  }, [remotePeers]);

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-5 text-white">
      <div className="glass-panel relative flex flex-wrap items-center justify-between gap-3 overflow-hidden p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 tracking-[0.3em]">Live rooms</p>
          <h2 className="text-2xl font-semibold">NST Video Lounge</h2>
          <p className="text-sm text-gray-400">Open the room, invite a batchmate, collaborate face-to-face.</p>
        </div>
        <div className={`rounded-full border px-4 py-1 text-xs backdrop-blur-md ${socketConnected ? 'border-emerald-400/70 text-emerald-200 bg-emerald-500/5' : 'border-red-400/70 text-red-200 bg-red-500/5'}`}>
          {socketConnected ? 'Socket connected' : 'Socket offline'}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[340px_1fr]">
        <section className="glass-panel border-white/10 p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase">Room ID</label>
            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              disabled={!!joinedRoom}
              className="mt-1 w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none"
              placeholder="nst-huddle"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!joinedRoom}
              className="mt-1 w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            {joinedRoom ? (
              <button onClick={handleLeave} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 flex items-center justify-center gap-2">
                <PhoneOff className="w-4 h-4" /> Leave room
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-xl py-2 flex items-center justify-center gap-2"
              >
                <MonitorPlay className="w-4 h-4" /> {joining ? 'Joining...' : 'Join room'}
              </button>
            )}
          </div>
          {joinedRoom && (
            <div className="flex gap-2">
              <button onClick={toggleCamera} className={`flex-1 rounded-xl py-2 border ${cameraEnabled ? 'border-emerald-500 text-emerald-300' : 'border-gray-600 text-gray-400'}`}>
                {cameraEnabled ? <Camera className="inline w-4 h-4 mr-2" /> : <CameraOff className="inline w-4 h-4 mr-2" />}Camera
              </button>
              <button onClick={toggleMic} className={`flex-1 rounded-xl py-2 border ${micEnabled ? 'border-emerald-500 text-emerald-300' : 'border-gray-600 text-gray-400'}`}>
                {micEnabled ? <Mic className="inline w-4 h-4 mr-2" /> : <MicOff className="inline w-4 h-4 mr-2" />}Mic
              </button>
            </div>
          )}
        </section>

        <section className="glass-panel border-white/10 p-4 min-h-0 relative flex flex-col overflow-hidden">
          {joinedRoom ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <div>
                  <p className="uppercase text-[11px] tracking-[0.4em] text-white/40">Now in</p>
                  <p className="text-lg font-semibold text-white">{joinedRoom}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-1">
                  <Users className="w-4 h-4 text-white/60" />
                  <span>{1 + remotePeers.length} participant{remotePeers.length === 0 ? '' : 's'}</span>
                </div>
              </div>
              <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto pr-2">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(220px,_1fr)]">
                <div className="relative rounded-2xl bg-black overflow-hidden aspect-video transition-all">
                  {!localStream && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Waiting for camera...</div>
                  )}
                  <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!cameraEnabled ? 'opacity-40' : ''}`} />
                  <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded-full">You ({name || 'You'})</div>
                </div>
                {remotePeers.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-700 flex items-center justify-center text-sm text-gray-400">
                    Share the room ID with a friend. They’ll appear here.
                  </div>
                )}
                  {remotePeers.map(({ peerId, userName }) => (
                    <div key={peerId} className="relative rounded-2xl bg-black overflow-hidden aspect-video transition-all">
                      <video id={`remote-${peerId}`} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded-full">{userName}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating glass controls bar */}
              <div className="pointer-events-none absolute left-0 right-0 bottom-6 flex justify-center">
                <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-gray-800 shadow-lg">
                  <button onClick={toggleMic} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${micEnabled ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'}`}>
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button onClick={toggleCamera} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${cameraEnabled ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'}`}>
                    {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </button>
                  <div className="w-px h-6 bg-gray-700 mx-1" />
                  <button onClick={handleLeave} className="w-24 h-10 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium flex items-center justify-center gap-2">
                    <PhoneOff className="w-4 h-4" /> Leave
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3">
              <Users className="w-10 h-10 text-gray-500" />
              <p className="text-lg font-semibold text-white">Pick a room to start video chat</p>
              <p className="text-sm max-w-md">Enter a simple room id (e.g., nst-huddle) and share it with your batch. Everyone who joins that id will be connected in a secure peer-to-peer call.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
