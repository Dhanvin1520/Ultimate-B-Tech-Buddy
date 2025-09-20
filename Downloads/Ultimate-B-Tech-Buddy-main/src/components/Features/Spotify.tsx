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
  {
    id: 1,
    title: "Focus Flow",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3"
  },
  {
    id: 2,
    title: "Deep Focus",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-dreams.mp3"
  },
  {
    id: 3,
    title: "Calm Thinking",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-goinghigher.mp3"
  },
  {
    id: 4,
    title: "Soft Breeze",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3"
  },
  {
    id: 5,
    title: "Ambient Light",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-sweet.mp3"
  },
  {
    id: 6,
    title: "Gentle Rain",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-november.mp3"
  },
  {
    id: 7,
    title: "Morning Haze",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3"
  },
];

export default function Spotify() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [favorites, setFavorites] = useState<{ id: string; title: string; artist: string }[]>([]);
  const [showFav, setShowFav] = useState(true);
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
      if (isPlaying) {
        audio.play().catch((err) => console.error("Play error:", err));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl border border-slate-200">

      <audio ref={audioRef} src={SONGS[currentSong]?.url} />

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Now Playing</h2>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-slate-900 font-medium">{SONGS[currentSong]?.title}</h3>
          <p className="text-slate-600">{SONGS[currentSong]?.artist}</p>
          <div className="mt-3">
            <button
              onClick={async () => {
                const song = SONGS[currentSong];
                if (!song) return;
                if (guest) {
                  const item = { id: crypto.randomUUID(), title: song.title, artist: song.artist };
                  setFavorites((prev) => [item, ...prev]);
                } else {
                  try {
                    const res = await api.post('/songs', { title: song.title, artist: song.artist });
                    const s = res.data;
                    setFavorites((prev) => [{ id: s._id, title: s.title, artist: s.artist }, ...prev]);
                  } catch {}
                }
              }}
              className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Add to Favorites
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 font-medium">Favorites</h3>
        <button onClick={() => setShowFav((v) => !v)} className={`p-2 rounded-lg border border-slate-200 ${showFav? 'bg-white':'bg-slate-50'} flex items-center gap-2`}>
          <Heart className={`w-5 h-5 ${showFav? 'text-red-500':'text-slate-500'}`} fill={showFav? '#ef4444':'none'} />
          <span className="text-slate-800 text-sm">{showFav? 'Hide':'Show'}</span>
        </button>
      </div>

      {showFav && (
        <div className="mb-8">
          <div className="space-y-2">
            {favorites.map((f) => (
              <div key={f.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-slate-900">{f.title}</div>
                  <div className="text-sm text-slate-600">{f.artist}</div>
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
                  className="text-slate-600 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={previousSong}
          className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={togglePlay}
          className="p-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={nextSong}
          className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-slate-600" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="mt-2">
        <h3 className="text-slate-900 font-medium mb-4">Playlist</h3>
        <div className="space-y-2">
          {SONGS.map((song, index) => (
            <button
              key={song.id}
              onClick={() => {
                setCurrentSong(index);
                setIsPlaying(true);
              }}
              className={`w-full p-3 rounded-lg text-left transition-colors border border-slate-200 ${
                currentSong === index
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="font-medium">{song.title}</div>
              <div className="text-sm opacity-75">{song.artist}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-slate-900 font-medium mb-4">Favorites</h3>
        <div className="space-y-2">
          {favorites.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <div className="text-slate-900">{f.title}</div>
                <div className="text-sm text-slate-600">{f.artist}</div>
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
                className="text-slate-600 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}