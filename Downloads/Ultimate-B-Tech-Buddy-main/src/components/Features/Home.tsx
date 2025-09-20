import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { StickyNote, CheckCircle2, Code2, Music } from 'lucide-react'

function Spinning() {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <icosahedronGeometry args={[2.2, 1]} />
      <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.2} />
    </mesh>
  )
}

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="relative w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden border border-slate-200 bg-white/70 backdrop-blur-xl">
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Spinning />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-6 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">BTech Buddy</h1>
            <p className="mt-3 text-slate-600">Your clean, simple dashboard for notes, tasks, music, and coding practice, synced across devices.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-900 text-white"><StickyNote className="w-5 h-5" /></div>
          <div>
            <div className="font-semibold text-slate-900">Notes</div>
            <div className="text-sm text-slate-600">Capture ideas quickly</div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-900 text-white"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <div className="font-semibold text-slate-900">Tasks</div>
            <div className="text-sm text-slate-600">Organize and complete</div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-900 text-white"><Code2 className="w-5 h-5" /></div>
          <div>
            <div className="font-semibold text-slate-900">LeetCode</div>
            <div className="text-sm text-slate-600">Track and improve</div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-900 text-white"><Music className="w-5 h-5" /></div>
          <div>
            <div className="font-semibold text-slate-900">Spotify</div>
            <div className="text-sm text-slate-600">Focus playlists</div>
          </div>
        </div>
      </div>
    </div>
  )
}
