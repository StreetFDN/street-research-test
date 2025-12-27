// FILE: components/city/assets/Roads.tsx
'use client';

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

// --- CONFIGURATION ---
// Standard low-poly road tiles are 1.00m in Blender. 
// We scale by 3 to make them visible and robust.
export const ROAD_UNIT = 1;
export const ROAD_SCALE = 3;
export const CELL_SIZE = ROAD_UNIT * ROAD_SCALE;

const ROAD_FILES = {
  straight: "/models/roads/road-straight.glb",
  curve: "/models/roads/road-bend.glb",          // UPDATED: Using 'road-bend'
  intersection: "/models/roads/road-crossroad.glb",
  split: "/models/roads/road-split.glb",           
  end: "/models/roads/road-straight.glb", 
};

Object.values(ROAD_FILES).forEach((path) => useGLTF.preload(path));

export type RoadVariant = "straight" | "curve" | "cross" | "t" | "end";

interface RoadSegmentProps {
  variant: RoadVariant;
  position: [number, number, number];
  rotationY?: number; 
}

export const RoadSegment = ({ variant, position, rotationY = 0 }: RoadSegmentProps) => {
  let url = ROAD_FILES.straight;
  if (variant === "curve") url = ROAD_FILES.curve;
  if (variant === "cross") url = ROAD_FILES.intersection;
  if (variant === "t") url = ROAD_FILES.split;
  if (variant === "end") url = ROAD_FILES.end;

  const { scene } = useGLTF(url);

  const clone = useMemo(() => {
    const c = scene.clone();
    c.scale.set(ROAD_SCALE, ROAD_SCALE, ROAD_SCALE);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <primitive 
      object={clone} 
      position={position} 
      rotation={[0, rotationY, 0]} 
    />
  );
};
