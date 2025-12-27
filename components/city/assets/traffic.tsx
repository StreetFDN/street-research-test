// FILE: components/city/assets/Traffic.tsx
'use client';

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CELL_SIZE } from "./roads";

// --- VEHICLE CONFIGURATION ---
const VEHICLES = [
  { file: "/models/car/vehicle-speedster.glb", speed: 0.05, scale: 0.45, path: "outer", offset: 0.0 },
  { file: "/models/car/vehicle-truck.glb",     speed: 0.02, scale: 0.55, path: "outer", offset: 0.35 },
  { file: "/models/car/vehicle-racer.glb",     speed: 0.05, scale: 0.45, path: "left",  offset: 0.1 },
  { file: "/models/car/vehicle-suv.glb",       speed: 0.02, scale: 0.50, path: "right", offset: 0.5 },
];

const S = CELL_SIZE; // 6 units

// --- PATH DEFINITIONS ---
const PATHS: Record<string, THREE.Vector3[]> = {
  // 1. Full Outer Ring (Clockwise)
  outer: [
    new THREE.Vector3(-2 * S, 0, -2 * S), // TL
    new THREE.Vector3( 0 * S, 0, -2 * S), // TM
    new THREE.Vector3( 2 * S, 0, -2 * S), // TR
    new THREE.Vector3( 2 * S, 0,  0 * S), // RM
    new THREE.Vector3( 2 * S, 0,  2 * S), // BR
    new THREE.Vector3( 0 * S, 0,  2 * S), // BM
    new THREE.Vector3(-2 * S, 0,  2 * S), // BL
    new THREE.Vector3(-2 * S, 0,  0 * S), // LM
  ],
  // 2. Left District Loop (Counter-Clockwise using Center Spine)
  left: [
    new THREE.Vector3(-2 * S, 0, -2 * S), // TL
    new THREE.Vector3(-2 * S, 0,  2 * S), // BL
    new THREE.Vector3( 0 * S, 0,  2 * S), // BM (Spine Bot)
    new THREE.Vector3( 0 * S, 0, -2 * S), // TM (Spine Top)
  ],
  // 3. Right District Loop (Clockwise using Center Spine)
  right: [
    new THREE.Vector3( 2 * S, 0, -2 * S), // TR
    new THREE.Vector3( 2 * S, 0,  2 * S), // BR
    new THREE.Vector3( 0 * S, 0,  2 * S), // BM (Spine Bot)
    new THREE.Vector3( 0 * S, 0, -2 * S), // TM (Spine Top)
  ]
};

// Preload all models
VEHICLES.forEach(v => useGLTF.preload(v.file));

const Car = ({ config }: { config: typeof VEHICLES[0] }) => {
  const { scene } = useGLTF(config.file);
  const groupRef = useRef<THREE.Group>(null);
  const carRef = useRef<THREE.Group>(null); // For local animations (jump)
  
  // Physics/Animation State
  const [jumping, setJumping] = useState(false);
  const jumpTime = useRef(0);

  // Clone & Setup Model
  const carModel = useMemo(() => {
    const c = scene.clone();
    c.scale.set(config.scale, config.scale, config.scale); 
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene, config.scale]);

  // Create Curve
  const curve = useMemo(() => {
    const points = PATHS[config.path] || PATHS.outer;
    return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.15); // tension 0.15 for tighter turns
  }, [config.path]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Move along curve
    // config.offset distributes them so they don't spawn on top of each other
    const rawTime = state.clock.elapsedTime() * config.speed + config.offset;
    const t = rawTime % 1; 
    
    const position = curve.getPointAt(t);
    const lookAtPos = curve.getPointAt((t + 0.01) % 1);

    groupRef.current.position.copy(position);
    groupRef.current.lookAt(lookAtPos);

    // 2. Jump Physics (On Click)
    if (jumping && carRef.current) {
      jumpTime.current += delta * 12;
      carRef.current.position.y = Math.sin(jumpTime.current) * 2.0;
      
      if (jumpTime.current > Math.PI) {
        setJumping(false);
        carRef.current.position.y = 0;
        jumpTime.current = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group 
        ref={carRef}
        onClick={(e) => { e.stopPropagation(); setJumping(true); }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        {/* Rotate 180 deg to face forward */}
        <primitive object={carModel} rotation={[0, Math.PI, 0]} />
      </group>
    </group>
  );
};

export const Traffic = () => {
  return (
    <group>
      {VEHICLES.map((v, i) => (
        <Car key={i} config={v} />
      ))}
    </group>
  );
};
