// FILE: components/city/effects/Lights.tsx
'use client';

import { useRef, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DirectionalLight } from 'three';

export interface LightsHandle {
  directionalRef: React.RefObject<DirectionalLight | null>;
  moonRef: React.RefObject<DirectionalLight | null>;
  sunLightRef: React.RefObject<DirectionalLight | null>;
}

export const Lights = forwardRef<LightsHandle>((props, ref) => {
  const directionalRef = useRef<DirectionalLight | null>(null);
  const moonRef = useRef<DirectionalLight | null>(null);
  const sunLightRef = useRef<DirectionalLight | null>(null);

  useImperativeHandle<LightsHandle, LightsHandle>(ref, (): LightsHandle => {
    return {
      directionalRef: directionalRef as React.RefObject<DirectionalLight | null>,
      moonRef: moonRef as React.RefObject<DirectionalLight | null>,
      sunLightRef: sunLightRef as React.RefObject<DirectionalLight | null>,
    } satisfies LightsHandle;
  });

  // Set __controlledByEnv flag IMMEDIATELY on mount (synchronously, before first frame)
  // This prevents any movement before EnvironmentController takes control
  useLayoutEffect(() => {
    if (directionalRef.current) {
      // Mark as controlled by default - EnvironmentController will maintain control
      (directionalRef.current as any).__controlledByEnv = true;
      // Set initial fixed position immediately
      directionalRef.current.position.set(30, 45, 30);
    }
  }, []); // Run once on mount, synchronously before first paint

  // Track if we've initialized the flag to prevent movement
  const hasInitializedRef = useRef(false);

  // Dynamic Shadows: Sun moves slowly in an arc (only if not controlled by EnvironmentController)
  // This will be disabled when EnvironmentController is active
  useFrame(({ clock }) => {
    if (directionalRef.current) {
      // On first frame, ensure flag is set to prevent any movement
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        (directionalRef.current as any).__controlledByEnv = true;
        directionalRef.current.position.set(30, 45, 30);
        return; // Don't move on first frame
      }
      
      // Only move if not explicitly controlled by EnvironmentController
      // EnvironmentController sets __controlledByEnv flag to prevent movement
      if (!(directionalRef.current as any).__controlledByEnv) {
        const t = clock.getElapsedTime() * 0.05; // Slow time
        // Move sun in a wide arc
        directionalRef.current.position.x = Math.sin(t) * 40;
        directionalRef.current.position.z = Math.cos(t) * 20;
        directionalRef.current.position.y = 30 + Math.cos(t) * 10;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color={new Color("#ffffff")} />
      
      <hemisphereLight 
        args={[new Color("#ffffff"), new Color("#444444"), 0.5]}
      />

      <directionalLight 
        ref={directionalRef}
        position={[30, 45, 30]} 
        intensity={2.0} 
        color={new Color("#FFE4B5")} 
        castShadow
        shadow-bias={-0.0005}
        shadow-mapSize={[2048, 2048]}
        shadow-radius={6}
        // Initial position set to fixed shadow position - EnvironmentController will maintain it
      >
        <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30]} />
      </directionalLight>

      {/* Soft Rim Light for 3D depth */}
      <spotLight position={[-20, 10, -20]} intensity={0.5} color="#c2e6ff" />
      
      {/* Moon Light - positioned opposite to sun, controlled by EnvironmentController */}
      <directionalLight 
        ref={moonRef}
        position={[-20, 30, -20]} 
        intensity={0} 
        color={new Color("#ffffff")} 
        castShadow={false}
        shadow-bias={-0.0005}
        shadow-mapSize={[2048, 2048]}
        shadow-radius={6}
      >
        <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30]} />
      </directionalLight>
      
      {/* Warm Sun Light - positioned opposite to shadow-casting light, simulates sunlight */}
      <directionalLight 
        ref={sunLightRef}
        position={[-50, 50, -50]} 
        intensity={0} 
        color={new Color("#ff8800")} 
        castShadow={false}
      />
    </>
  );
});

Lights.displayName = 'Lights';
