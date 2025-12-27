// FILE: components/city/effects/atmosphere.tsx
'use client';

import { Cloud } from "@react-three/drei";

export const Atmosphere = () => {
  return (
    <group>
      {/* 1. High Altitude Clouds (The layer we fly through) 
          FIX: Replaced width/depth with 'bounds={[x, y, z]}'
      */}
      <Cloud 
        position={[-10, 50, -10]} 
        opacity={0.5} 
        speed={0.2} 
        bounds={[20, 2, 5]} // [Width, Height, Depth]
        segments={20} 
      />
      
      {/* 2. Lower Atmosphere (Mist near the ground) */}
      <Cloud 
        position={[0, -5, 0]} 
        opacity={0.3} 
        speed={0.1} 
        bounds={[30, 4, 10]} // Wider bounds for ground mist
        segments={10} 
        color="#e0f2fe"
      />
    </group>
  );
};
