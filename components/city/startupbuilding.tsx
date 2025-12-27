// FILE: components/city/StartupBuilding.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Startup } from './types';
import { BuildingModel } from './assets/buildings';

interface StartupBuildingProps {
  startup: Startup;
  position: [number, number, number];
  onSelect: (startup: Startup) => void;
  visible?: boolean; // NEW PROP
  isNight?: boolean; // NEW: Night mode prop
  allBuildingRefs?: React.RefObject<THREE.Group | null>[]; // Refs to all buildings for occlusion
  onRegisterRef?: (id: string, ref: React.RefObject<THREE.Group | null>) => void; // Callback to register this building's ref
}

// Building height offsets - adjustments per building model to align name tags with roof
// OpenDroids (building-skyscraper-c) uses formula: (scale || 1) * 3 + 1 = 4.0 ✓
// This offset is added to the base formula to account for different building model heights
// Negative values lower the name tag, positive values raise it
// Goal: Name tags should hover slightly above the roof
const BUILDING_HEIGHT_OFFSETS: Record<string, number> = {
  "building-skyscraper-a": -0.8, // Street Labs - perfect ✓
  "building-skyscraper-b": 0.8, // Kled AI - raise slightly to hover above roof
  "building-skyscraper-c": 0, // OpenDroids - reference building, offset is 0
  "building-skyscraper-d": 0.9, // Noice - raise slightly to hover above roof
  "building-skyscraper-e": 0.15, // StarFun - raise slightly to hover above roof
};

export const StartupBuilding = ({ startup, position, onSelect, visible = true, isNight = false, allBuildingRefs = [], onRegisterRef }: StartupBuildingProps) => {
  const [hovered, setHover] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const buildingMeshRef = useRef<THREE.Group>(null);
  const [targetScale, setTargetScale] = useState(1);
  const { camera } = useThree();

  // Register this building's ref with the parent for occlusion
  useEffect(() => {
    if (onRegisterRef) {
      onRegisterRef(startup.id, buildingMeshRef);
    }
  }, [startup.id, onRegisterRef]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 10);
      groupRef.current.scale.setScalar(s);
    }
  });

  // Calculate name tag position using OpenDroids' working formula
  // Base formula: (scale || 1) * 3 + 1
  // Add building-specific offset to account for different model heights
  const basePosition = (startup.scale || 1) * 3 + 1;
  const heightOffset = BUILDING_HEIGHT_OFFSETS[startup.modelKey] || 0;
  const nameTagY = basePosition + heightOffset;

  // Get all building refs except this one for occlusion
  // Filter out null refs and this building's ref
  const occludeRefs = allBuildingRefs
    .filter(ref => ref !== buildingMeshRef && ref.current !== null)
    .map(ref => ref as React.RefObject<THREE.Group>);

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={[0, startup.rotation, 0]}
      onClick={(e) => {
        // Prevent interaction during intro if not visible
        if (!visible) return;
        e.stopPropagation();
        onSelect(startup);
      }}
      onPointerOver={(e) => {
        if (!visible) return;
        e.stopPropagation();
        setHover(true);
        setTargetScale(1.05);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        if (!visible) return;
        e.stopPropagation();
        setHover(false);
        setTargetScale(1);
        document.body.style.cursor = 'auto';
      }}
    >
      <group ref={buildingMeshRef}>
        <BuildingModel 
          modelKey={startup.modelKey} 
          color={startup.color} 
          hovered={hovered} 
          scale={startup.scale}
          isNight={isNight}
        />
      </group>
      
      {/* ONLY RENDER LABEL IF VISIBLE */}
      {visible && (
        <Html 
            position={[0, nameTagY, 0]} 
            center 
            distanceFactor={15}
            zIndexRange={[500, 0]}
            occlude={occludeRefs.length > 0 ? occludeRefs : undefined}
        >
            <div className={`
            px-3 py-1.5 rounded-full backdrop-blur-md border border-white/40 shadow-lg
            transition-all duration-300 flex items-center gap-2
            ${hovered ? 'bg-white/90 scale-110' : 'bg-white/60 scale-100'}
            `}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: startup.color }} />
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap">{startup.name}</span>
            </div>
        </Html>
      )}
    </group>
  );
};
