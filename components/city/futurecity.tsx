// FILE: components/city/FutureCity.tsx
'use client';

import { Suspense, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei"; 
import * as THREE from "three";

import { RoadNetwork } from "./layout/roadnetwork";
import { Lights, LightsHandle } from "./effects/lights";
import { Weather } from "./effects/weather"; 
import { NatureScatter } from "./assets/nature";
import { PostProcessing } from "./effects/postprocessing"; 
import { Atmosphere } from "./effects/atmosphere"; 
import { EcosystemConnections } from "./assets/ecosystemconnections"; 
import { EnvironmentController, NightGlowLights, TimeMode } from "./effects/environmentcontroller";
import { GroundMaterialInjector } from "./effects/groundmaterialinjector";
import { Startup } from "./types";
import { CELL_SIZE } from "./assets/roads";

// --- DYNAMIC FOG CONTROLLER ---
const FogController = ({ introFinished }: { introFinished: boolean }) => {
  const { scene } = useThree();
  // 15 = Very Dense Fog (Island barely visible), 120 = Clear Day
  const targetDensity = introFinished ? 120 : 15; 
  
  useFrame((state, delta) => {
    if (scene.fog && (scene.fog as THREE.Fog).far) {
       const current = (scene.fog as THREE.Fog).far;
       // Smoothly transition fog density
       (scene.fog as THREE.Fog).far = THREE.MathUtils.lerp(current, targetDensity, delta * 0.5); 
    }
  });
  return null;
}

const CameraController = ({ selectedStartup }: { selectedStartup: Startup | null }) => {
  const { controls } = useThree();
  
  useEffect(() => {
    // @ts-ignore
    if (controls) controls.enabled = !selectedStartup; 
  }, [selectedStartup, controls]);

  useFrame((state, delta) => {
    if (selectedStartup) {
      const bx = (selectedStartup.gridPosition[0] - 6) * CELL_SIZE;
      const bz = (selectedStartup.gridPosition[1] - 6) * CELL_SIZE;
      const targetPos = new THREE.Vector3(bx + 12, 14, bz + 12);
      const lookAtPos = new THREE.Vector3(bx + 2, 4, bz);

      state.camera.position.lerp(targetPos, delta * 2);
      // @ts-ignore
      if (controls) {
          // @ts-ignore
          controls.target.lerp(lookAtPos, delta * 3);
          // @ts-ignore
          controls.update();
      }
    }
  });
  return null;
};

interface FutureCityProps {
  selected: Startup | null;
  onSelect: (s: Startup | null) => void;
  introFinished?: boolean;
  timeMode?: TimeMode;
}

export const FutureCity = ({ selected, onSelect, introFinished = true, timeMode = 'day' }: FutureCityProps) => {
  const lightsRef = useRef<LightsHandle>(null);
  const groundMaterialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Calculate timeOfDay based on mode: 0 = day, 1 = night
  const timeOfDay = timeMode === 'night' ? 1 : 0;
  const isNight = timeMode === 'night';
  
  return (
    <group>
        <FogController introFinished={introFinished} />
        
        <Lights ref={lightsRef} />
        <EnvironmentController 
          mode={timeMode}
          groundMaterialRef={groundMaterialRef}
          directionalLightRef={lightsRef.current?.directionalRef}
          moonLightRef={lightsRef.current?.moonRef}
          sunLightRef={lightsRef.current?.sunLightRef}
        />
        <GroundMaterialInjector timeOfDay={timeOfDay} debug={false} />
        <NightGlowLights isNight={isNight} />
        <Weather />
        <Atmosphere />
        <PostProcessing isNight={isNight} />

        {/* Pass visibility prop down */}
        <RoadNetwork 
          onBuildingSelect={onSelect} 
          labelsVisible={introFinished}
          groundMaterialRef={groundMaterialRef}
          timeOfDay={timeOfDay}
          isNight={isNight}
        />
        
        {/* Only render lines if intro is finished */}
        <EcosystemConnections visible={introFinished} isNight={isNight} />

        <Suspense fallback={null}>
          <NatureScatter />
        </Suspense>
        
        <ContactShadows opacity={0.4} scale={80} blur={2} far={4} resolution={512} color="#000000" />
        <CameraController selectedStartup={selected} />
    </group>
  );
};
