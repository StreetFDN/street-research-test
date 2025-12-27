// FILE: components/city/assets/ApplyTile.tsx
'use client';

import { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { CELL_SIZE } from './roads';

export const ApplyTile = ({ position }: { position: [number, number, number] }) => {
  const [hovered, setHover] = useState(false);
  
  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  const SIZE = CELL_SIZE * 0.85; 

  return (
    <group position={position}>
      
      {/* 1. Base */}
      <mesh 
        position={[0, 0.1, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          window.open("https://apply.street.app", "_blank");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
        }}
      >
        <boxGeometry args={[SIZE, 0.15, SIZE]} />
        <meshStandardMaterial 
          color={hovered ? "#e0f2fe" : "#ffffff"} 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Border */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[SIZE + 0.25, 0.1, SIZE + 0.25]} />
        <meshStandardMaterial 
          color={hovered ? "#94a3b8" : "#cbd5e1"} 
        />
      </mesh>

      {/* 3. Text Label - REMOVED CUSTOM FONT PATH TO PREVENT CRASH */}
      <Text
        position={[0, 0.18, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.45} 
        fontWeight={800} // Keeps it bold using default font
        color={hovered ? "#0f172a" : "#475569"} 
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={1.3}
      >
        Apply for{'\n'}Batch S01
      </Text>
      
    </group>
  );
};
