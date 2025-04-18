import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

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
];

export default function Spotify() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    <div className="bg-gray-800 p-6 rounded-xl">

      <audio ref={audioRef} src={SONGS[currentSong]?.url} />

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Now Playing</h2>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-white font-medium">{SONGS[currentSong]?.title}</h3>
          <p className="text-gray-400">{SONGS[currentSong]?.artist}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={previousSong}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={togglePlay}
          className="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={nextSong}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-white font-medium mb-4">Playlist</h3>
        <div className="space-y-2">
          {SONGS.map((song, index) => (
            <button
              key={song.id}
              onClick={() => {
                setCurrentSong(index);
                setIsPlaying(true);
              }}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                currentSong === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{song.title}</div>
              <div className="text-sm opacity-75">{song.artist}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}