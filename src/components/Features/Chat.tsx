import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, User as UserIcon, WifiOff } from 'lucide-react';
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
  const [name, setName] = useState('Anonymous');
  const [nameLoading, setNameLoading] = useState(true);
  const [message, setMessage] = useState('');
  const isBrowser = typeof window !== 'undefined';
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomsOpen, setRoomsOpen] = useState(() => (isBrowser ? window.innerWidth >= 1024 : false));
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem('chat_name');
    if (stored) {
      setName(stored);
      setNameLoading(false);
      return;
    }
    const resolveName = async () => {
      if (localStorage.getItem('guest') === 'true') {
        setName('Guest');
        setNameLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const apiName = res.data?.username || res.data?.name || res.data?.email?.split?.('@')[0];
        const finalName = apiName?.toString().trim() || 'Anonymous';
        setName(finalName);
        localStorage.setItem('chat_name', finalName);
      } catch (err) {
        const fallback = localStorage.getItem('guest') === 'true' ? 'Anonymous' : 'NST Student';
        setName(fallback);
        localStorage.setItem('chat_name', fallback);
      } finally {
        setNameLoading(false);
      }
    };
    resolveName();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = (event?: MediaQueryListEvent) => {
      const matches = event ? event.matches : mq.matches;
      setRoomsOpen(matches);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const collapseRoomsOnMobile = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) {
      setRoomsOpen(false);
    }
  }, []);

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
    let mounted = true;
    let socket: any = null;

    // Delay socket creation slightly to prevent rapid reconnection
    const connectionTimeout = setTimeout(() => {
      if (!mounted) return;

      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: false,
        autoConnect: true,
      });
      socketRef.current = socket;

      const handleConnect = () => {
        if (mounted) setConnected(true);
      };
      const handleDisconnect = () => {
        if (mounted) setConnected(false);
      };
      const handleHistory = (history: Message[]) => {
        setMessages(history?.map((msg) => ({ ...msg, pending: false, persisted: msg.persisted ?? true })) || []);
      };
      const handleNewMessage = (msg: Message) => {
        setMessages((prev) => {
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
      };

      const handleSystemMessage = (msg: any) => {
        const systemMsg: Message = {
          id: `sys-${Date.now()}`,
          text: msg.text,
          userName: 'System',
          timestamp: msg.timestamp || new Date(),
          system: true,
        };
        setMessages((prev) => [...prev, systemMsg]);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('roomHistory', handleHistory);
      socket.on('newMessage', handleNewMessage);
      socket.on('systemMessage', handleSystemMessage);
    }, 100); // 100ms delay

    return () => {
      mounted = false;
      clearTimeout(connectionTimeout);
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('roomHistory');
        socket.off('newMessage');
        socket.off('systemMessage');
        socket.disconnect();
      }
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
    if (!socket || !socket.connected) return;
    const nextRoom = (targetRoom ?? selectedRoom ?? DEFAULT_ROOM).trim().toLowerCase();
    if (!nextRoom) return;
    socket.emit('joinRoom', { roomId: nextRoom, user: { name } });
    setJoinedRoom(nextRoom);
    setSelectedRoom(nextRoom);
    setMessages([]);
    localStorage.setItem('chat_room', nextRoom);
    localStorage.setItem('chat_name', name);
    collapseRoomsOnMobile();
  }, [name, selectedRoom, collapseRoomsOnMobile]);

  useEffect(() => {
    if (nameLoading) return;
    if (!connected) return;
    if (!selectedRoom) return;
    if (joinedRoom === selectedRoom) return;
    joinRoom(selectedRoom);
  }, [nameLoading, connected, selectedRoom, joinedRoom, joinRoom]);

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

  const TerminalBanner = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="border-b border-green-500/40 bg-black text-green-300 font-mono px-6 py-3">
      <p className="text-[10px] uppercase tracking-[0.3em] mb-1">socket://nst-chat</p>
      <p className="text-sm font-bold tracking-wide">{title}</p>
      <p className="text-[11px] text-green-200">{subtitle}</p>
      <div className="mt-3 h-1.5 w-full border border-green-500/40 bg-green-500/10 overflow-hidden">
        <div className="h-full w-1/2 bg-green-400 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="swiss-card flex flex-col flex-1 p-0 overflow-hidden h-[calc(100vh-7rem)]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-[var(--border-color)] bg-[var(--bg-panel)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Ultimate B-Tech Buddy</p>
          <h2 className="heading-lg">NST Community Chat</h2>
        </div>
        <div className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${connected ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      {!connected && (
        <TerminalBanner
          title="Establishing secure channel..."
          subtitle="Waiting for socket handshake, micro-service ping in progress."
        />
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] flex-1 min-h-0 bg-[var(--bg-page)]">
        <button
          className="lg:hidden p-4 border-b border-[var(--border-color)] flex items-center justify-between font-bold"
          onClick={() => setRoomsOpen((prev) => !prev)}
        >
          <span>{roomsOpen ? 'Hide Rooms' : 'Browse Rooms'}</span>
          <svg className={`h-4 w-4 transition-transform ${roomsOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <section
          className={`border-r border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col min-h-0 ${roomsOpen ? 'block' : 'hidden'} lg:block`}
        >
          <div className="p-4 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Rooms</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {rooms.map((room) => {
              const isSelected = room.id === (joinedRoom || selectedRoom);
              return (
                <div
                  key={room.id}
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${isSelected
                    ? 'bg-[var(--bg-subtle)] border border-green-500/50 shadow-[0_0_10px_rgba(0,255,0,0.1)]'
                    : 'hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)]'
                    }`}
                  onClick={() => { setSelectedRoom(room.id); joinRoom(room.id); }}
                >
                  <div className={`h-10 w-10 rounded-md flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? 'bg-green-500 text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                    }`}>
                    {room.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-green-500' : 'text-[var(--text-primary)]'
                      }`}>
                      {room.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate group-hover:text-[var(--text-secondary)]">
                      {isSelected ? '>> Connected' : 'Click to join'}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col min-h-0 bg-[var(--bg-page)]">
          <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{activeRoom?.name || 'Select a room'}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{activeRoom?.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 border border-[var(--border-color)]">
                <UserIcon className="w-3 h-3" />
                <span className="text-xs font-bold">{nameLoading ? '...' : name}</span>
              </div>
            </div>
          </div>

          {joinedRoom ? (
            <div className="flex flex-col flex-1 min-h-0">
              <div
                ref={messagesContainerRef}
                className="flex-1 space-y-6 overflow-y-auto p-6 min-h-0"
              >
                {messages.length === 0 && (
                  <div className="text-center text-[var(--text-tertiary)] text-sm py-10 italic">No posts yet. Start the conversation.</div>
                )}
                {messages.map((msg) => {
                  const isMine = !msg.system && (msg.userName?.trim().toLowerCase() === (name || '').trim().toLowerCase());
                  const ts = new Date(msg.timestamp);
                  if (msg.system) {
                    return (
                      <div key={msg.id} className="flex justify-center my-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] bg-[var(--bg-subtle)] px-3 py-1">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-3xl mx-auto w-full`}
                    >
                      <div className={`flex items-baseline gap-2 mb-1 ${isMine ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-xs font-bold text-[var(--text-secondary)]">{msg.userName}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">
                          {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 border shadow-sm ${isMine
                          ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                          : 'bg-[var(--bg-panel)] text-white border-[var(--border-color)]'
                          } ${msg.pending ? 'opacity-50' : ''}`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      {!msg.system && (
                        <div className={`mt-1 text-[10px] ${isMine ? 'text-[var(--text-secondary)] text-right' : 'text-[var(--text-tertiary)]'}`}>
                          {msg.pending ? 'Sending...' : msg.persisted === false ? 'Not saved' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-panel)]">
                <div className="flex items-center gap-3 max-w-3xl mx-auto">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-swiss flex-1"
                  />
                  <button type="submit" className="btn-primary h-[46px] w-[46px] flex items-center justify-center p-0">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center p-8 gap-4">
              <WifiOff className="w-12 h-12 text-[var(--text-tertiary)]" />
              <p className="text-lg font-bold">Join a room to start chatting</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}