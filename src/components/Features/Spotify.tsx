import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart } from 'lucide-react';
import api from '../../lib/api';

type Song = {
  id: number;
  title: string;
  artist: string;
  url: string;
};

const SONGS: Song[] = [
  // a few playable royalty-free samples
  { id: 1, title: 'Focus Flow', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3' },
  { id: 2, title: 'Deep Focus', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-dreams.mp3' },
  { id: 3, title: 'Calm Thinking', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-goinghigher.mp3' },
  { id: 4, title: 'Soft Breeze', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3' },
  { id: 5, title: 'Ambient Light', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-sweet.mp3' },
  { id: 6, title: 'Gentle Rain', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-november.mp3' },
  { id: 7, title: 'Morning Haze', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3' },
  // popular English songs (metadata only) - links point to Spotify/YT pages (not used for playback)
  { id: 101, title: 'Blinding Lights', artist: 'The Weeknd', url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
  { id: 102, title: 'Shape of You', artist: 'Ed Sheeran', url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' },
  { id: 103, title: 'Rolling in the Deep', artist: 'Adele', url: 'https://open.spotify.com/track/3PRoXYsngSwjEQWR5PsHWR' },
  { id: 104, title: 'Someone Like You', artist: 'Adele', url: 'https://open.spotify.com/track/4kflIGfjdZJW4ot2ioixTB' },
  { id: 105, title: 'Levitating', artist: 'Dua Lipa', url: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9' },
  // popular Indian songs (metadata only)
  { id: 201, title: 'Kesariya', artist: 'Arijit Singh', url: 'https://www.youtube.com/watch?v=V0B3k1v6l6I' },
  { id: 202, title: 'Tum Hi Aana', artist: 'Jubin Nautiyal', url: 'https://www.youtube.com/watch?v=THn2C1PzJ7s' },
  { id: 203, title: 'Tujhe Kitna Chahne Lage', artist: 'Arijit Singh', url: 'https://www.youtube.com/watch?v=Q6jz1iS0pGw' },
  { id: 204, title: 'Naatu Naatu', artist: 'Rahul Sipligunj', url: 'https://www.youtube.com/watch?v=5f6gQ1V8-2I' },
  { id: 205, title: 'Ranjha', artist: 'B Praak', url: 'https://www.youtube.com/watch?v=K5xQe2mX_4c' },
  // more mixed/popular metadata
  { id: 301, title: 'Bad Habits', artist: 'Ed Sheeran', url: 'https://open.spotify.com/track/6PQ88X9TkUIAUIZJHW2upE' },
  { id: 302, title: 'Heat Waves', artist: 'Glass Animals', url: 'https://open.spotify.com/track/0Y2fA0bYJpKk7wQd3VbZ6Q' },
  { id: 303, title: 'Lean On', artist: 'Major Lazer', url: 'https://open.spotify.com/track/0w6b4W7h1VQh9S2w9plZ9N' },
  { id: 304, title: 'Closer', artist: 'The Chainsmokers', url: 'https://open.spotify.com/track/6V4pQ1G3S4VaK0e5c9k6Qb' },
  { id: 305, title: 'Cheap Thrills', artist: 'Sia', url: 'https://open.spotify.com/track/6Z8HOhqQY2Q2iYQGv4p7I9' },
];

export default function Spotify() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [favorites, setFavorites] = useState<{ id: string; title: string; artist: string }[]>([]);
  const [showFav, setShowFav] = useState(true);
  const [query, setQuery] = useState<string>('');
  const guest = localStorage.getItem('guest') === 'true';

  useEffect(() => {
    if (guest) {
      const stored = localStorage.getItem('fav-songs');
      if (stored) setFavorites(JSON.parse(stored));
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/songs');
        setFavorites(res.data.map((s: any) => ({ id: s._id, title: s.title, artist: s.artist })));
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (guest) localStorage.setItem('fav-songs', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorited = (song: Song) => favorites.some((f) => f.title === song.title && f.artist === song.artist);

  const toggleFavorite = async (song: Song) => {
    if (guest) {
      if (isFavorited(song)) {
        setFavorites((prev) => prev.filter((f) => !(f.title === song.title && f.artist === song.artist)));
      } else {
        setFavorites((prev) => [{ id: crypto.randomUUID(), title: song.title, artist: song.artist }, ...prev]);
      }
      return;
    }

    // for authenticated users - simple optimistic UI, backend endpoints assumed
    try {
      if (isFavorited(song)) {
        // find the matching favorite id
        const fav = favorites.find((f) => f.title === song.title && f.artist === song.artist);
        if (fav) {
          await api.delete(`/songs/${fav.id}`);
          setFavorites((prev) => prev.filter((x) => x.id !== fav.id));
        }
      } else {
        const res = await api.post('/songs', { title: song.title, artist: song.artist });
        const s = res.data;
        setFavorites((prev) => [{ id: s._id, title: s.title, artist: s.artist }, ...prev]);
      }
    } catch (e) {
      // ignore errors for now
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextSong = () => {
    setCurrentSong((prev) => (prev + 1) % SONGS.length);
  };

  const previousSong = () => {
    setCurrentSong((prev) => (prev - 1 + SONGS.length) % SONGS.length);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) audio.play().catch((err) => console.error('Play error:', err));
      else audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audioRef.current]);

  const formatTime = (s: number) => {
    if (!s || Number.isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const seekTo = (evt: React.MouseEvent<HTMLDivElement>) => {
    const el = evt.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    const clickX = evt.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * (duration || 0);
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const filtered = SONGS.filter((s) => (s.title + ' ' + s.artist).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="glass-panel border-white/10 p-6 space-y-8">
      <audio ref={audioRef} src={SONGS[currentSong]?.url} />

      <div>
        <p className="pill">Focus wave</p>
        <h2 className="panel-title mt-4">Now Playing</h2>
        <div className={`mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 neon-border ${isPlaying ? 'neon-pulse' : ''}`}>
          <h3 className="text-xl font-semibold text-white">{SONGS[currentSong]?.title}</h3>
          <p className="text-white/60">{SONGS[currentSong]?.artist}</p>
          <div className="mt-4">
            <button
              onClick={() => toggleFavorite(SONGS[currentSong])}
              className="primary-btn flex items-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isFavorited(SONGS[currentSong]) ? 'text-red-400' : 'text-white/90'}`} />
              <span>{isFavorited(SONGS[currentSong]) ? 'Saved' : 'Add to Favorites'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Favorites</h3>
        <button
          onClick={() => setShowFav((v) => !v)}
          className="ghost-btn flex items-center gap-2"
        >
          <Heart className={`w-5 h-5 ${showFav ? 'text-red-400' : 'text-white/50'}`} fill={showFav ? '#ef4444' : 'none'} />
          <span>{showFav ? 'Hide' : 'Show'}</span>
        </button>
      </div>

      {showFav && (
        <div>
          <div className="space-y-2">
            {favorites.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="text-white">{f.title}</div>
                  <div className="text-sm text-white/60">{f.artist}</div>
                </div>
                <button
                  onClick={async () => {
                    if (guest) {
                      setFavorites((prev) => prev.filter((x) => x.id !== f.id));
                    } else {
                      try {
                        await api.delete(`/songs/${f.id}`);
                        setFavorites((prev) => prev.filter((x) => x.id !== f.id));
                      } catch {}
                    }
                  }}
                  className="text-white/40 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] bg-white/5 p-6 rounded-xl">
        <audio ref={audioRef} src={SONGS[currentSong]?.url} />

        <div className="feature-card flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-full max-w-sm">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 neon-border">
                <div className="flex h-full w-full items-center justify-center text-amber-900 text-lg font-semibold">{SONGS[currentSong]?.title}</div>
              </div>
              <div className="absolute -bottom-6 left-6 flex items-center gap-3">
                <button onClick={() => setShowFav((v) => !v)} className="ghost-btn flex items-center gap-2">
                  <Heart className={`w-5 h-5 ${showFav ? 'text-red-400' : 'text-white/50'}`} />
                  <span className="text-sm">{showFav ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-white">{SONGS[currentSong]?.title}</h2>
              <p className="muted mt-1">{SONGS[currentSong]?.artist}</p>

              <div className="mt-6">
                <div className="flex items-center gap-4">
                  <button onClick={previousSong} className="p-2 text-white/80 hover:text-white">
                    <SkipBack className="w-6 h-6" />
                  </button>
                  <button onClick={togglePlay} className="w-16 h-16 rounded-full primary-btn flex items-center justify-center text-black">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button onClick={nextSong} className="p-2 text-white/80 hover:text-white">
                    <SkipForward className="w-6 h-6" />
                  </button>
                  <div className="ml-auto text-sm muted">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div onClick={seekTo} className="mt-4 h-2 w-full cursor-pointer rounded-full bg-white/5" style={{ position: 'relative' }}>
                  <div className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white mb-3">Playlist</h3>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search songs or artists" className="ml-3 bg-white/3 text-sm rounded-md px-3 py-1 text-white/80" />
            </div>
            <div className="grid gap-2 overflow-y-auto max-h-[40vh] lg:max-h-[60vh] pr-2">
              {filtered.map((song) => {
                const idx = SONGS.findIndex((s) => s.id === song.id);
                return (
                  <div
                    key={song.id}
                    className={`w-full flex items-center gap-4 rounded-lg p-3 transition-colors ${
                      currentSong === idx ? 'bg-white/6 now-playing-row' : 'bg-white/2 hover:bg-white/4'
                    }`}
                  >
                    <button onClick={() => { if (idx >=0) { setCurrentSong(idx); setIsPlaying(true); } }} className="flex items-center gap-4 flex-1 text-left">
                      <div className={`h-12 w-12 flex-shrink-0 rounded-md bg-gradient-to-tr from-amber-300 to-amber-500 flex items-center justify-center text-sm font-semibold text-amber-900`}>{song.title.split(' ').slice(0,2).map(s=>s[0]).join('')}</div>
                      <div className="flex-1">
                        <div className="text-white/90">{song.title}</div>
                        <div className="muted text-sm">{song.artist}</div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFavorite(song)} className="p-2 rounded-md hover:bg-white/5">
                        <Heart className={`w-5 h-5 ${isFavorited(song) ? 'text-red-400' : 'text-white/50'}`} />
                      </button>
                      {currentSong === idx && <div className="text-amber-300">Playing</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="feature-card flex flex-col min-h-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Favorites</h3>
            <button onClick={() => setShowFav((v) => !v)} className="ghost-btn text-sm">{showFav ? 'Hide' : 'Show'}</button>
          </div>

          {showFav ? (
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[40vh] pr-1">
              {favorites.length ? favorites.map((f) => {
                const matchIdx = SONGS.findIndex((s) => s.title === f.title && s.artist === f.artist);
                return (
                  <div key={f.id} className="flex items-center justify-between gap-3">
                    <button onClick={() => { if (matchIdx >= 0) { setCurrentSong(matchIdx); setIsPlaying(true); } }} className="text-left flex-1">
                      <div className="text-white">{f.title}</div>
                      <div className="muted text-sm">{f.artist}</div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { if (guest) setFavorites((prev)=>prev.filter(x=>x.id!==f.id)); else { try { api.delete(`/songs/${f.id}`); setFavorites((prev)=>prev.filter(x=>x.id!==f.id)) } catch{} } }} className="text-white/60 hover:text-red-400">Remove</button>
                    </div>
                  </div>
                );
              }) : <div className="muted text-sm">No favorites yet — save a track.</div>}
            </div>
          ) : (
            <div className="muted mt-4">Favorites hidden</div>
          )}

          <div className="mt-auto flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white/70" />
            <input type="range" min={0} max={100} value={volume} onChange={(e)=>setVolume(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
