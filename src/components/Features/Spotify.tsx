import { useState, useRef, useEffect, SyntheticEvent, ChangeEvent, FormEvent } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart } from 'lucide-react';
import api from '../../lib/api';

type Song = {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
};

const COVER_POOL = [
  'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1422111027209-95b0930a5d29?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=600&q=80'
];

const SONG_SEED = [
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

const SONGS: Song[] = SONG_SEED.map((song, index) => ({
  ...song,
  cover: COVER_POOL[index % COVER_POOL.length]
}));

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';

const DEFAULT_FAVORITES = [
  { id: 'fav-1', title: 'Focus Flow', artist: 'Bensound' },
  { id: 'fav-2', title: 'Deep Focus', artist: 'Bensound' },
  { id: 'fav-3', title: 'Calm Thinking', artist: 'Bensound' }
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (guest) {
        const stored = localStorage.getItem('fav-songs');
        if (stored) {
          try {
            setFavorites(JSON.parse(stored));
          } catch {
            setFavorites(DEFAULT_FAVORITES);
          }
        } else {
          setFavorites(DEFAULT_FAVORITES);
        }
        setIsLoaded(true);
        return;
      }

      try {
        const { data } = await api.get('/songs');
        if (Array.isArray(data)) {
          setFavorites(data);
          localStorage.setItem('fav-songs', JSON.stringify(data));
        } else {
          setFavorites(DEFAULT_FAVORITES);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
        const fallback = localStorage.getItem('fav-songs');
        if (fallback) {
          try {
            setFavorites(JSON.parse(fallback));
          } catch {
            setFavorites(DEFAULT_FAVORITES);
          }
        } else {
          setFavorites(DEFAULT_FAVORITES);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    loadFavorites();
  }, [guest]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fav-songs', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const handleCoverFallback = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_COVER;
  };

  const isFavorited = (song: Song) => favorites.some((f) => f.title === song.title && f.artist === song.artist);

  const toggleFavorite = async (song: Song) => {
    // Optimistic update for instant feedback
    if (isFavorited(song)) {
      setFavorites((prev) => prev.filter((f) => !(f.title === song.title && f.artist === song.artist)));
      if (!guest) {
        try {
          const fav = favorites.find((f) => f.title === song.title && f.artist === song.artist);
          if (fav) await api.delete(`/songs/${fav.id}`);
        } catch { }
      }
    } else {
      const newFav = { id: crypto.randomUUID(), title: song.title, artist: song.artist };
      setFavorites((prev) => [newFav, ...prev]);
      if (!guest) {
        try {
          await api.post('/songs', { title: song.title, artist: song.artist });
        } catch { }
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

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
      const normalized = Math.max(0, Math.min(1, volume / 100));
      audioRef.current.volume = normalized;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onLoaded = () => {
      const metaDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(metaDuration);
    };
    const onEnd = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnd);

    // reset state immediately when source changes
    setCurrentTime(0);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnd);
    };
  }, [currentSong]);

  const formatTime = (s: number) => {
    if (!s || Number.isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(100, value));
    const trackDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
    if (!trackDuration) return;
    const newTime = (clamped / 100) * trackDuration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekChange = (event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    if (Number.isFinite(value)) {
      handleSeek(value);
    }
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>) => {
    const next = Math.max(0, Math.min(100, Number(event.currentTarget.value)));
    setVolume(Number.isFinite(next) ? next : 0);
  };

  const filtered = SONGS.filter((s) => (s.title + ' ' + s.artist).toLowerCase().includes(query.toLowerCase()));
  const activeSong = SONGS[currentSong] || SONGS[0];
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="swiss-card p-6">
      <audio ref={audioRef} src={SONGS[currentSong]?.url} />

      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.75fr]">
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Focus Wave</p>
            <h2 className="heading-lg heading-gamer">Now Playing</h2>
          </div>

          <div className="border border-[var(--border-strong)] bg-[var(--bg-page)] p-6 flex flex-col gap-6 lg:flex-row">
            <div className="relative w-full max-w-sm aspect-square bg-[var(--bg-subtle)] border border-[var(--border-color)] overflow-hidden">
              <img src={activeSong?.cover} onError={handleCoverFallback} alt={activeSong?.title || 'Album cover'} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-4">
                <div className="text-sm font-bold uppercase tracking-widest text-white/70">Now Playing</div>
                <div className="text-2xl font-bold text-white leading-tight">{activeSong?.title}</div>
                <div className="text-sm font-medium text-white/80">{activeSong?.artist}</div>
                <button
                  onClick={() => toggleFavorite(activeSong)}
                  className="mt-4 btn-outline text-xs flex items-center gap-2 w-fit"
                >
                  <Heart className={`w-4 h-4 ${activeSong && isFavorited(activeSong) ? 'fill-red-600 text-red-600' : 'text-white'}`} />
                  <span>{activeSong && isFavorited(activeSong) ? 'Saved' : 'Add to Favorites'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col justify-between">
              <div className="flex items-center justify-center gap-6 mb-6">
                <button onClick={previousSong} className="p-2 text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors">
                  <SkipBack className="w-8 h-8" />
                </button>
                <button onClick={togglePlay} className="w-20 h-20 rounded-full btn-primary flex items-center justify-center p-0">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button onClick={nextSong} className="p-2 text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors">
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold tabular-nums text-[var(--text-secondary)] mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={Math.min(100, Math.max(0, progressPercent))}
                  onChange={handleSeekChange}
                  onInput={handleSeekChange}
                  className="w-full h-2 cursor-pointer accent-[var(--accent-color)]"
                />
              </div>
            </div>
          </div>

          <div className="border border-[var(--border-color)] p-5 bg-[var(--bg-page)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Playlist</h3>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="input-swiss py-1 px-3 text-sm w-48"
              />
            </div>
            <div className="grid gap-0 border border-[var(--border-color)] divide-y divide-[var(--border-color)] max-h-[45vh] overflow-y-auto">
              {filtered.map((song) => {
                const idx = SONGS.findIndex((s) => s.id === song.id);
                return (
                  <div
                    key={song.id}
                    className={`w-full flex items-center gap-4 p-3 transition-colors hover:bg-[var(--bg-subtle)] ${currentSong === idx ? 'bg-[var(--bg-subtle)]' : 'bg-[var(--bg-page)]'}`}
                  >
                    <button onClick={() => {
                      if (idx >= 0) {
                        setCurrentSong(idx);
                        setIsPlaying(true);
                      }
                    }} className="flex items-center gap-4 flex-1 text-left">
                      <div className={`h-12 w-12 flex-shrink-0 border border-[var(--border-color)] overflow-hidden ${currentSong === idx ? 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-page)]' : ''}`}>
                        <img src={song.cover} onError={handleCoverFallback} alt={song.title} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${currentSong === idx ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}>{song.title}</div>
                        <div className="text-xs font-medium text-[var(--text-secondary)]">{song.artist}</div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFavorite(song)} className="p-2 hover:text-red-600 text-[var(--text-tertiary)]">
                        <Heart className={`w-4 h-4 ${isFavorited(song) ? 'fill-red-600 text-red-600' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="p-6 border border-[var(--border-color)] bg-[var(--bg-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Library</p>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Favorites</h3>
              </div>
              <button
                onClick={() => setShowFav((v) => !v)}
                className="btn-ghost text-xs font-bold uppercase tracking-widest"
              >
                {showFav ? 'Hide' : 'Show'}
              </button>
            </div>
            {showFav ? (
              favorites.length ? (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                  {favorites.map((f) => {
                    const playableIdx = SONGS.findIndex((s) => s.title === f.title && s.artist === f.artist);
                    return (
                      <div key={f.id} className="flex items-center justify-between gap-3 p-3 bg-[var(--bg-page)] border border-[var(--border-color)]">
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{f.title}</div>
                          <div className="text-xs font-medium text-[var(--text-secondary)]">{f.artist}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {playableIdx >= 0 && (
                            <button
                              onClick={() => {
                                setCurrentSong(playableIdx);
                                setIsPlaying(true);
                              }}
                              className="p-2 text-[var(--text-primary)] hover:text-[var(--accent-color)]"
                              title="Play this track"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (guest) {
                                setFavorites((prev) => prev.filter((x) => x.id !== f.id));
                              } else {
                                try {
                                  await api.delete(`/songs/${f.id}`);
                                  setFavorites((prev) => prev.filter((x) => x.id !== f.id));
                                } catch { }
                              }
                            }}
                            className="text-[var(--text-tertiary)] hover:text-red-600 text-xs font-bold uppercase tracking-widest"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] italic">No favorites yet.</p>
              )
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">Favorites hidden</p>
            )}
          </div>

          <div className="p-6 border border-[var(--border-color)] bg-[var(--bg-page)]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Pinned for Focus</h3>
            {favorites.length ? (
              <div className="space-y-2">
                {favorites.slice(0, 5).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      const idx = SONGS.findIndex((s) => s.title === f.title && s.artist === f.artist);
                      if (idx >= 0) {
                        setCurrentSong(idx);
                        setIsPlaying(true);
                      }
                    }}
                    className="w-full text-left text-sm truncate hover:text-[var(--accent-color)]"
                  >
                    <span className="font-bold text-[var(--text-primary)]">{f.title}</span>
                    <span className="text-[var(--text-tertiary)]"> · {f.artist}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] italic">Save tracks to pin them here.</p>
            )}
          </div>

          <div className="p-6 border border-[var(--border-color)] bg-[var(--bg-subtle)]">
            <div className="flex items-center gap-3 mb-2">
              <Volume2 className="w-5 h-5 text-[var(--text-primary)]" />
              <span className="text-sm font-bold uppercase tracking-widest">Volume</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
              onInput={handleVolumeChange}
              className="w-full h-2 cursor-pointer accent-[var(--accent-color)]"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
