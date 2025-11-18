import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, User as UserIcon, WifiOff, Smile, Paperclip } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../../lib/api';

interface Message {
  id: string;
  text: string;
  userName: string;
  timestamp: string | Date;
  system?: boolean;
  clientMessageId?: string;
  pending?: boolean;
  persisted?: boolean;
}

interface CampusRoom {
  id: string;
  name: string;
  description: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://ultimate-b-tech-buddy.onrender.com/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/?api$/, '');
const FALLBACK_ROOMS: CampusRoom[] = [
  { id: 'nst-commons', name: 'NST Commons', description: 'Everyone in NST shares updates, quick questions, and support.' },
  { id: 'nst-placements', name: 'NST Placements', description: 'Leads, referrals, and prep chat for internships & jobs.' },
];
const DEFAULT_ROOM = FALLBACK_ROOMS[0].id;

export default function Chat() {
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState<CampusRoom[]>(FALLBACK_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState(() => localStorage.getItem('chat_room') || DEFAULT_ROOM);
  const [joinedRoom, setJoinedRoom] = useState<string>('');
  const [name, setName] = useState(localStorage.getItem('chat_name') || 'Anonymous');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // gently keep the latest message in view whenever content changes
    const container = messagesContainerRef.current;
    if (!container) return;
    const raf = requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, joinedRoom]);

  useEffect(() => {
    // create socket connection
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('roomHistory', (history: Message[]) => {
      setMessages(history?.map((msg) => ({ ...msg, pending: false, persisted: msg.persisted ?? true })) || []);
    });

    socket.on('newMessage', (msg: Message) => {
      setMessages((prev) => {
        // replace pending optimistic message if clientMessageId matches
        if (msg.clientMessageId) {
          const existingIndex = prev.findIndex((m) => m.clientMessageId === msg.clientMessageId);
          if (existingIndex !== -1) {
            const next = [...prev];
            next[existingIndex] = { ...msg, pending: false, persisted: msg.persisted ?? true };
            if (msg.clientMessageId) {
              const timer = pendingTimersRef.current[msg.clientMessageId];
              if (timer) {
                clearTimeout(timer);
                delete pendingTimersRef.current[msg.clientMessageId];
              }
            }
            return next;
          }
        }
        // legacy server fallback: match on text + user when clientMessageId missing
        const fallbackIndex = prev.findIndex((m) => {
          if (!m.pending) return false;
          if (!m.userName || !m.text) return false;
          if (m.userName !== msg.userName || m.text !== msg.text) return false;
          const localTs = new Date(m.timestamp).getTime();
          const incomingTs = new Date(msg.timestamp).getTime();
          return Math.abs(localTs - incomingTs) < 10000; // 10s window
        });
        if (fallbackIndex !== -1) {
          const next = [...prev];
          const legacyClientId = next[fallbackIndex].clientMessageId;
          next[fallbackIndex] = {
            ...msg,
            clientMessageId: legacyClientId,
            pending: false,
            persisted: msg.persisted ?? true,
          };
          if (legacyClientId && pendingTimersRef.current[legacyClientId]) {
            clearTimeout(pendingTimersRef.current[legacyClientId]);
            delete pendingTimersRef.current[legacyClientId];
          }
          return next;
        }
        // avoid duplicates when server replays same _id
        if (prev.some((m) => m.id === msg.id)) {
          return prev;
        }
        return [...prev, { ...msg, pending: false, persisted: msg.persisted ?? true }];
      });
    });

    socket.on('systemMessage', (msg: any) => {
      const systemMsg: Message = {
        id: `sys-${Date.now()}`,
        text: msg.text,
        userName: 'System',
        timestamp: msg.timestamp || new Date(),
        system: true,
      };
      setMessages((prev) => [...prev, systemMsg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      Object.values(pendingTimersRef.current).forEach(clearTimeout);
      pendingTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.get('/chat/rooms')
      .then((res) => {
        if (!isMounted) return;
        const apiRooms = Array.isArray(res.data?.rooms) && res.data.rooms.length ? res.data.rooms : FALLBACK_ROOMS;
        setRooms(apiRooms);
        setSelectedRoom((prev: string) => {
          if (!apiRooms.length) return prev;
          return apiRooms.find((room: CampusRoom) => room.id === prev)?.id || apiRooms[0].id;
        });
      })
      .catch(() => {
        // keep fallback rooms silently
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const joinRoom = useCallback((targetRoom?: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    const nextRoom = (targetRoom ?? selectedRoom ?? DEFAULT_ROOM).trim().toLowerCase();
    if (!nextRoom) return;
    socket.emit('joinRoom', { roomId: nextRoom, user: { name } });
    setJoinedRoom(nextRoom);
    setSelectedRoom(nextRoom);
    setMessages([]);
    localStorage.setItem('chat_room', nextRoom);
    localStorage.setItem('chat_name', name);
  }, [name, selectedRoom]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !joinedRoom) return;
    const socket = socketRef.current;
    if (!socket) return;

    const clientMessageId = crypto.randomUUID();
    const optimisticMessage: Message = {
      id: clientMessageId,
      clientMessageId,
      text: message.trim(),
      userName: name || 'Anonymous',
      timestamp: new Date(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    pendingTimersRef.current[clientMessageId] = window.setTimeout(() => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.clientMessageId === clientMessageId);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], pending: false, persisted: false };
        return next;
      });
      delete pendingTimersRef.current[clientMessageId];
    }, 7000);

    socket.emit('sendMessage', { roomId: joinedRoom, message: { ...optimisticMessage } }, (response: { ok: boolean; message?: Message }) => {
      const savedMessage = response?.message;
      if (response?.ok && savedMessage) {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.clientMessageId === clientMessageId);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...savedMessage, pending: false, persisted: savedMessage.persisted ?? true };
          return next;
        });
        if (pendingTimersRef.current[clientMessageId]) {
          clearTimeout(pendingTimersRef.current[clientMessageId]);
          delete pendingTimersRef.current[clientMessageId];
        }
        return;
      }
      if (!response?.ok || !savedMessage) {
        setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
        setMessages((prev) => [...prev, {
          id: `error-${clientMessageId}`,
          text: 'Message failed to send. Please retry.',
          userName: 'System',
          timestamp: new Date(),
          system: true,
        }]);
        if (pendingTimersRef.current[clientMessageId]) {
          clearTimeout(pendingTimersRef.current[clientMessageId]);
          delete pendingTimersRef.current[clientMessageId];
        }
      }
    });
    setMessage('');
  };

  const activeRoom = useMemo(() => rooms.find((room) => room.id === (joinedRoom || selectedRoom)), [rooms, selectedRoom, joinedRoom]);

  return (
    <div className="glass-panel h-[calc(100vh-9rem)] p-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Ultimate B-Tech Buddy</p>
          <h2 className="mt-2 font-display text-3xl">NST Community Chat</h2>
        </div>
        <div className={`rounded-full border px-4 py-1 text-sm ${connected ? 'border-emerald-400/60 text-emerald-200' : 'border-red-400/60 text-red-200'}`}>
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      <div className="grid gap-5 pt-5 lg:grid-cols-[320px_1fr] flex-1 min-h-0">
        <section className="glass-panel border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-gray-400">Campus rooms</p>
              <h3 className="text-lg font-semibold">Pick a space</h3>
            </div>
            <span className="text-xs text-gray-500">History: 30 days</span>
          </div>
          <div className="space-y-3 overflow-y-auto pr-1">
            {rooms.map((room) => {
              const isSelected = room.id === (joinedRoom || selectedRoom);
              return (
                <div
                  key={room.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isSelected ? 'border-white/40 bg-white/10 shadow-inner' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{room.id}</p>
                      <h4 className="text-base font-semibold text-white">{room.name}</h4>
                    </div>
                    {isSelected && <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-200">Selected</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{room.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="ghost-btn text-xs"
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      {isSelected ? 'Stay here' : 'Preview'}
                    </button>
                    <button
                      className="primary-btn text-xs"
                      onClick={() => joinRoom(room.id)}
                    >
                      Join
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-panel border-white/10 p-4 sm:p-5 flex flex-col min-h-0">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div>
              <p className="text-xs uppercase text-gray-400">Current room</p>
              <h3 className="text-2xl font-semibold text-white">{activeRoom?.name || 'Select a room'}</h3>
              <p className="text-sm text-gray-400">{activeRoom?.description || 'Pick NST Commons or NST Placements to start chatting.'}</p>
            </div>
            <div className="ml-auto flex flex-col gap-2 min-w-[220px]">
              <label className="text-xs text-gray-400 uppercase tracking-wide">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                placeholder="Your name"
              />
              <button
                onClick={() => joinRoom(selectedRoom)}
                className="primary-btn"
              >
                {joinedRoom === selectedRoom ? 'Refresh history' : `Join ${selectedRoom === 'nst-commons' ? 'NST Commons' : 'NST Placements'}`}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">You’ll automatically see every message shared in this room for the last 30 days.</p>

          {joinedRoom ? (
            <>
              <div
                ref={messagesContainerRef}
                className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-10">No posts yet. Say hi and start a thread!</div>
                )}
                {messages.map((msg) => {
                  const isMine = !msg.system && (msg.userName?.trim().toLowerCase() === (name || '').trim().toLowerCase());
                  const ts = new Date(msg.timestamp);
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-3 ${msg.system ? 'opacity-80' : ''} ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isMine ? 'bg-amber-500/20 text-amber-200' : 'bg-white/5 text-white/60'}`}>
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div className={`flex flex-col ${isMine ? 'items-end text-right' : ''}`}>
                        {!msg.system && (
                          <div className="flex flex-wrap items-center gap-2 text-gray-400">
                            <span className="text-sm text-gray-300">{msg.userName}</span>
                            <span className="text-xs">{ts.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        <div
                          className={`mt-1 max-w-[80%] rounded-3xl px-4 py-3 shadow-inner ${
                            msg.system
                              ? 'bg-white/5 text-white/70'
                              : isMine
                                ? 'bg-amber-500/30 text-white'
                                : 'bg-white/10 text-white'
                          } ${msg.pending ? 'opacity-80' : ''}`}
                        >
                          {msg.text}
                        </div>
                        {!msg.system && (
                          <div className={`mt-1 text-[11px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                            {msg.pending ? 'Sending…' : msg.persisted === false ? 'Not saved' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="mt-auto">
                <div className="flex items-center gap-2">
                  <button type="button" className="ghost-btn h-12 w-12 rounded-2xl">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button type="button" className="ghost-btn h-12 w-12 rounded-2xl">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Post an update, drop a question..."
                    className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <button type="submit" className="primary-btn flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-400 gap-3">
              <WifiOff className="w-10 h-10 text-gray-500" />
              <p className="text-lg font-semibold text-white">Join NST Commons or NST Placements</p>
              <p className="text-sm text-gray-400">Pick a room on the left, then tap "Join" to load every message shared in the last 30 days.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}