import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        <Stars radius={300} depth={60} count={1000} factor={7} />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}