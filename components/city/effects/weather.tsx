// FILE: components/city/effects/Weather.tsx
'use client';

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Weather = () => {
  const count = 400; 
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 60,
        y: Math.random() * 40,
        z: (Math.random() - 0.5) * 60,
        speed: 0.05 + Math.random() * 0.1,
        drift: (Math.random() - 0.5) * 0.02
      });
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();

  useFrame(() => {
    // TypeScript Fix: Capture ref in a local variable to ensure it's not null inside the loop
    const instance = mesh.current;
    if (!instance) return;

    particles.forEach((particle, i) => {
      particle.y -= particle.speed;
      particle.x += particle.drift;

      if (particle.y < 0) {
        particle.y = 40;
        particle.x = (Math.random() - 0.5) * 60;
        particle.z = (Math.random() - 0.5) * 60;
      }

      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      
      // Safe to use 'instance' here because we checked it above
      instance.setMatrixAt(i, dummy.matrix);
    });
    instance.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
};
