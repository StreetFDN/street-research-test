// FILE: app/city/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Loader } from '@react-three/drei';
import { FutureCity } from '@/components/city/futurecity';
import { DetailPanel } from '@/components/city/detailpanel';
import { Startup } from '@/components/city/types';
// Removed CinematicIntro import

export default function CityPage() {
  const [selected, setSelected] = useState<Startup | null>(null);
  
  // We no longer need state for "introFinished" since we want to skip it.
  // We will pass 'true' directly to components that rely on it.

  return (
    <div className="w-screen h-screen bg-[#f2f4f7] relative overflow-hidden">
      
      <Canvas
        dpr={[1, 2]}
        // CHANGED: Lowered position from [0, 150, 0] to [25, 25, 25] for a closer view
        camera={{ position: [25, 25, 25], fov: 35 }} 
        shadows
        className="w-full h-full"
      >
        <color attach="background" args={['#f2f4f7']} />
        
        {/* CHANGED: Increased 'far' to 120 immediately so it starts clear, not foggy */}
        <fog attach="fog" args={['#f2f4f7', 10, 120]} />

        <Suspense fallback={null}>
          <FutureCity 
            selected={selected} 
            onSelect={setSelected} 
            introFinished={true} // Hardcoded to true so labels/lines show immediately
          />
          <Environment preset="city" blur={0.5} background={false} />
          
          {/* REMOVED: <CinematicIntro /> */}
        </Suspense>

        <OrbitControls 
          makeDefault 
          enabled={!selected} // Enabled immediately (unless a building is selected)
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={80}
          dampingFactor={0.05}
          target={[0, 0, 0]} // Focus on center immediately
        />
      </Canvas>
      
      {selected && (
        <DetailPanel startup={selected} onClose={() => setSelected(null)} />
      )}
      
      <Loader />
    </div>
  );
}
