// FILE: components/city/layout/RoadNetwork.tsx
'use client';

import { useMemo, useRef, useCallback, useState } from "react";
import { RoadSegment, RoadVariant, CELL_SIZE } from "../assets/roads";
import { startups } from "../startupsconfig";
import { StartupBuilding } from "../startupbuilding";
import { Traffic } from "../assets/traffic";
import { Startup } from "../types";
import { ApplyTile } from "../assets/applytile";
import { GroundFadeMaterial } from "../effects/groundfadematerial";
import * as THREE from "three"; 

type RoadConfig = {
  id: string;
  variant: RoadVariant;
  x: number; 
  z: number;
  rot: number;
};

const H = Math.PI / 2;

const ROAD_SEGMENTS: RoadConfig[] = [
  { id: "spine-top", variant: "cross", x: 0, z: -2, rot: H },
  { id: "spine-mid-top", variant: "straight", x: 0, z: -1, rot: H },
  { id: "spine-center", variant: "straight", x: 0, z: 0, rot: H },
  { id: "spine-mid-bot", variant: "straight", x: 0, z: 1, rot: H },
  { id: "spine-bot", variant: "cross", x: 0, z: 2, rot: 0 },
  { id: "ring-tl", variant: "curve", x: -2, z: -2, rot: H },
  { id: "ring-t-l", variant: "straight", x: -1, z: -2, rot: 0 },
  { id: "ring-t-r", variant: "straight", x: 1, z: -2, rot: 0 },
  { id: "ring-tr", variant: "curve", x: 2, z: -2, rot: -0 },
  { id: "ring-r-t", variant: "straight", x: 2, z: -1, rot: H },
  { id: "ring-r-m", variant: "straight", x: 2, z: 0, rot: H },
  { id: "ring-r-b", variant: "straight", x: 2, z: 1, rot: H },
  { id: "ring-br", variant: "curve", x: 2, z: 2, rot: 3 * H },
  { id: "ring-b-r", variant: "straight", x: 1, z: 2, rot: 0 },
  { id: "ring-b-l", variant: "straight", x: -1, z: 2, rot: 0 },
  { id: "ring-bl", variant: "curve", x: -2, z: 2, rot: 2 * H  },
  { id: "ring-l-b", variant: "straight", x: -2, z: 1, rot: H },
  { id: "ring-l-m", variant: "straight", x: -2, z: 0, rot: H },
  { id: "ring-l-t", variant: "straight", x: -2, z: -1, rot: H },
];

interface RoadNetworkProps {
  onBuildingSelect: (s: Startup) => void;
  labelsVisible?: boolean; // NEW PROP
  groundMaterialRef?: React.RefObject<THREE.MeshStandardMaterial | THREE.ShaderMaterial | null>;
  timeOfDay?: number; // 0 = day, 1 = night
  isNight?: boolean; // NEW: Night mode prop
}

export const RoadNetwork = ({ onBuildingSelect, labelsVisible = true, groundMaterialRef, timeOfDay = 0, isNight = false }: RoadNetworkProps) => {
  // Store refs for all buildings using a Map
  const buildingRefsMap = useRef<Map<string, React.RefObject<THREE.Group | null>>>(new Map());
  const [allBuildingRefs, setAllBuildingRefs] = useState<React.RefObject<THREE.Group | null>[]>([]);
  
  // Callback to register a building ref
  const registerBuildingRef = useCallback((id: string, ref: React.RefObject<THREE.Group | null>) => {
    buildingRefsMap.current.set(id, ref);
    // Update the refs array whenever a ref is registered
    setAllBuildingRefs(Array.from(buildingRefsMap.current.values()));
  }, []);

  const buildings = useMemo(() => {
    return startups.map(s => {
      const x = (s.gridPosition[0] - 6) * CELL_SIZE;
      const z = (s.gridPosition[1] - 6) * CELL_SIZE;
      return (
        <StartupBuilding 
            key={s.id} 
            startup={s} 
            position={[x, 0, z]} 
            onSelect={onBuildingSelect}
            visible={labelsVisible} // PASS DOWN
            isNight={isNight} // PASS DOWN
            allBuildingRefs={allBuildingRefs} // Pass all building refs for occlusion
            onRegisterRef={registerBuildingRef} // Pass callback to register ref
        />
      );
    });
  }, [onBuildingSelect, labelsVisible, isNight, registerBuildingRef, allBuildingRefs]);

  return (
    <group>
      {ROAD_SEGMENTS.map((r) => (
        <RoadSegment
          key={r.id}
          variant={r.variant}
          position={[r.x * CELL_SIZE, 0, r.z * CELL_SIZE]}
          rotationY={r.rot}
        />
      ))}
      
      <Traffic />
      
      {buildings}

      <ApplyTile position={[0, 0, 3 * CELL_SIZE]} />

      {/* Single ground mesh with smart shader material */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22, 128]} />
        <GroundFadeMaterial 
          ref={groundMaterialRef as React.RefObject<THREE.ShaderMaterial | null>}
          fadeRadius={22}
          timeOfDay={timeOfDay}
        />
      </mesh>

      {/* Transparent shadow-receiving plane above ground for shadows on grass/snow */}
      {/* This allows shadows to appear without modifying the ground material */}
      <mesh position={[0, -0.09, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22, 128]} />
        <shadowMaterial opacity={0.4} transparent />
      </mesh>
    </group>
  );
};
