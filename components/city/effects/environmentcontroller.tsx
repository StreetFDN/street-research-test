'use client';

import { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type TimeMode = 'day' | 'night';

interface EnvironmentControllerProps {
  mode: TimeMode;
  groundMaterialRef?: React.RefObject<THREE.MeshStandardMaterial | THREE.ShaderMaterial | null>;
  directionalLightRef?: React.RefObject<THREE.DirectionalLight | null>;
  moonLightRef?: React.RefObject<THREE.DirectionalLight | null>;
  sunLightRef?: React.RefObject<THREE.DirectionalLight | null>;
}

export const EnvironmentController = ({
  mode,
  groundMaterialRef,
  directionalLightRef,
  moonLightRef,
  sunLightRef,
}: EnvironmentControllerProps) => {
  const { scene } = useThree();
  const previousModeRef = useRef<TimeMode | null>(null);
  
  // Day colors
  const DAY_GROUND_COLOR = new THREE.Color('#ffffff');
  const DAY_AMBIENT_COLOR = new THREE.Color('#fffbf0'); // Warm yellowish tint
  const DAY_DIRECTIONAL_COLOR = new THREE.Color('#FFE4B5'); // Warm white/gold for sun to make snow pop
  const DAY_FOG_COLOR = new THREE.Color('#9BA4B5'); // Dusty blue-grey for atmospheric perspective
  const DAY_BG_COLOR = new THREE.Color('#d5a7b4'); // Sky color
  const DAY_SUN_COLOR = new THREE.Color('#ff8800'); // Intense warm orange for sun
  
  // Night colors - deep indigo atmosphere
  const NIGHT_GROUND_COLOR = new THREE.Color('#63606e'); // Ground color
  const NIGHT_AMBIENT_COLOR = new THREE.Color('#3A4A6C'); // Dim blue with subtle warm tint for coziness
  const NIGHT_DIRECTIONAL_COLOR = new THREE.Color('#E8F4FF'); // Slightly warm moon light (soft blue-white)
  const NIGHT_FOG_COLOR = new THREE.Color('#5b5c71'); // Fog that blends sky and ground
  const NIGHT_BG_COLOR = new THREE.Color('#43526f'); // Sky color
  
  const isDay = mode === 'day';
  
  // Set initial light positions IMMEDIATELY - use both useLayoutEffect and useEffect
  // to catch the ref as soon as it's available
  const initializeLightPosition = () => {
    if (directionalLightRef?.current) {
      // Mark as controlled immediately to prevent dynamic movement
      (directionalLightRef.current as any).__controlledByEnv = true;
      const targetPosition = mode === 'day' ? [30, 45, 30] : [-50, -10, -50];
      directionalLightRef.current.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      return true;
    }
    return false;
  };

  // Try to set immediately on mount (before first frame)
  useLayoutEffect(() => {
    initializeLightPosition();
  }, []); // Run once on mount
  
  // Also try when mode changes (in case ref wasn't ready on mount)
  useEffect(() => {
    // Keep trying until ref is available
    if (!initializeLightPosition()) {
      // If ref not ready, try again after a microtask
      const timeoutId = setTimeout(() => {
        initializeLightPosition();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    previousModeRef.current = mode;
  }, [mode, directionalLightRef]);
  
  // Update Moon position when mode changes
  useEffect(() => {
    if (moonLightRef?.current) {
      if (mode === 'day') {
        moonLightRef.current.position.set(-50, -10, -50);
        // Disable shadow casting during daytime to prevent doubled shadows
        moonLightRef.current.castShadow = false;
      } else {
        moonLightRef.current.position.set(50, 50, 50);
        // Enable shadow casting at night
        moonLightRef.current.castShadow = true;
      }
    }
  }, [mode, moonLightRef]);
  
  useFrame((state, delta) => {
    const { gl } = state;
    
    // Adjust tone mapping exposure for night scene (darker)
    const targetExposure = isDay ? 1.0 : 0.6; // Reduce exposure at night
    gl.toneMappingExposure = THREE.MathUtils.lerp(gl.toneMappingExposure, targetExposure, delta * 2);
    
    // Update Sun (DirectionalLight) properties with smooth transitions
    if (directionalLightRef?.current) {
      const light = directionalLightRef.current;
      // Mark as controlled immediately - prevents dynamic movement from Lights component
      (light as any).__controlledByEnv = true;
      
      // Fixed position - set every frame to prevent any movement (shadows on opposite side from camera)
      if (isDay) {
        light.position.set(30, 45, 30);
      } else {
        light.position.set(-50, -10, -50);
      }
      
      // Smoothly lerp sun intensity
      const targetIntensity = isDay ? 2.0 : 0;
      light.intensity = THREE.MathUtils.lerp(light.intensity, targetIntensity, delta * 2);
      
      // Smoothly lerp sun color - warm white/gold to make snow pop
      const targetColor = isDay ? DAY_DIRECTIONAL_COLOR : new THREE.Color(0, 0, 0);
      light.color.lerp(targetColor, delta * 2);
    }
    
    // Update Moon properties with smooth transitions
    if (moonLightRef?.current) {
      const moon = moonLightRef.current;
      
      // Fixed position - set every frame to maintain shadow casting position
      if (isDay) {
        moon.position.set(-50, -10, -50);
      } else {
        moon.position.set(50, 50, 50);
      }
      
      // Disable shadow casting during daytime to prevent doubled shadows
      moon.castShadow = !isDay;
      
      // Smoothly lerp moon intensity: dimmed at night, 0 at day
      const targetMoonIntensity = isDay ? 0 : 0.15; // Dimmed by 50% for darker night scene
      moon.intensity = THREE.MathUtils.lerp(moon.intensity, targetMoonIntensity, delta * 2);
      
      // Smoothly lerp moon color: white
      const targetMoonColor = isDay ? new THREE.Color(0, 0, 0) : NIGHT_DIRECTIONAL_COLOR;
      moon.color.lerp(targetMoonColor, delta * 2);
    }
    
    // Update Warm Sun Light properties with smooth transitions
    if (sunLightRef?.current) {
      const sunLight = sunLightRef.current;
      
      // Smoothly lerp sun light intensity: 3.0 at day, 0 at night (twice as bright)
      const targetSunIntensity = isDay ? 3.0 : 0;
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, targetSunIntensity, delta * 2);
      
      // Smoothly lerp sun light color: warm orange during day
      const targetSunColor = isDay ? DAY_SUN_COLOR : new THREE.Color(0, 0, 0);
      sunLight.color.lerp(targetSunColor, delta * 2);
    }
    
    // Update ambient light with smooth lerp (reduced for deep shadows)
    const ambientLight = scene.children.find(
      (child) => child instanceof THREE.AmbientLight
    ) as THREE.AmbientLight | undefined;
    
    if (ambientLight) {
      // Dimmed ambient light at night with blue hue (50% dimmer than before)
      const targetAmbientIntensity = isDay ? 0.35 : 0.04; // Very dim at night
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbientIntensity, delta * 2);
      
      const targetAmbientColor = isDay ? DAY_AMBIENT_COLOR : NIGHT_AMBIENT_COLOR;
      ambientLight.color.lerp(targetAmbientColor, delta * 2);
    }
    
    // Update hemisphere light for natural bounce-light (already exists in Lights component)
    const hemisphereLight = scene.children.find(
      (child) => child instanceof THREE.HemisphereLight
    ) as THREE.HemisphereLight | undefined;
    
    if (hemisphereLight) {
      const targetHemisphereIntensity = isDay ? 0.5 : 0.05; // Much dimmer at night
      hemisphereLight.intensity = THREE.MathUtils.lerp(hemisphereLight.intensity, targetHemisphereIntensity, delta * 2);
      
      // Transition hemisphere light colors for nighttime indigo atmosphere
      const targetSkyColor = isDay ? new THREE.Color('#ffffff') : new THREE.Color('#5b5c71'); // Match fog color
      const targetGroundColor = isDay ? new THREE.Color('#444444') : new THREE.Color('#63606e'); // Match ground color
      hemisphereLight.color.lerp(targetSkyColor, delta * 2); // color is the sky color
      hemisphereLight.groundColor.lerp(targetGroundColor, delta * 2);
    }
    
    // Update spot light (rim light) - make it warm and cozy at night
    const spotLight = scene.children.find(
      (child) => child instanceof THREE.SpotLight
    ) as THREE.SpotLight | undefined;
    
    if (spotLight) {
      const targetSpotIntensity = isDay ? 0.5 : 0.15; // Soft warm glow at night
      spotLight.intensity = THREE.MathUtils.lerp(spotLight.intensity, targetSpotIntensity, delta * 2);
      
      // Make rim light warmer at night for coziness
      const targetSpotColor = isDay ? new THREE.Color('#c2e6ff') : new THREE.Color('#FFD4A3'); // Warm orange-tinted at night
      spotLight.color.lerp(targetSpotColor, delta * 2);
    }
    
    // Update ground material uniforms for shader (smooth transition)
    if (groundMaterialRef?.current) {
      if ('uniforms' in groundMaterialRef.current) {
        // Shader material - update uniforms
        const uniforms = (groundMaterialRef.current as THREE.ShaderMaterial).uniforms;
        if (uniforms) {
          // Update timeOfDay: 0 = day, 1 = night
          if (uniforms.uTimeOfDay) {
            const targetTimeOfDay = isDay ? 0 : 1;
            uniforms.uTimeOfDay.value = THREE.MathUtils.lerp(uniforms.uTimeOfDay.value, targetTimeOfDay, delta * 2);
          }
          
          // Update moon position for gradient effect
          if (uniforms.uMoonPosition && moonLightRef?.current) {
            uniforms.uMoonPosition.value.copy(moonLightRef.current.position);
          }
        }
      }
    }
    
    // Update fog color and density with smooth lerp
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog;
      const targetFogColor = isDay ? DAY_FOG_COLOR : NIGHT_FOG_COLOR;
      fog.color.lerp(targetFogColor, delta * 2);
      
      // Reduced fog in center, thicker at edges to blend into background
      const targetFogNear = isDay ? 25 : 20; // Start fog further away to reduce density in center
      const targetFogFar = isDay ? 120 : 30; // Thick fog at edges to hide map boundaries
      
      fog.near = THREE.MathUtils.lerp(fog.near, targetFogNear, delta * 2);
      fog.far = THREE.MathUtils.lerp(fog.far, targetFogFar, delta * 2);
    }
    
    // Update background color (#d5a7b4)
    // Set directly to ensure it's always the correct color (no lerp needed on first frame)
    const targetBgColor = isDay ? DAY_BG_COLOR : NIGHT_BG_COLOR;
    if (scene.background) {
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(targetBgColor, delta * 2);
      } else {
        scene.background = targetBgColor.clone();
      }
    } else {
      scene.background = targetBgColor.clone();
    }
  });
  
  // Sky component removed - it was rendering a full skybox that covered the background color
  // Using scene.background color instead (#D4A373 - The Golden Haze)
  return null;
};


// Warm Point Lights for Night Glow
export const NightGlowLights = ({ isNight }: { isNight: boolean }) => {
  const { scene } = useThree();
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    // Find building positions (approximate based on grid)
    const buildingPositions: [number, number, number][] = [];
    const CELL_SIZE = 3; // From roads.tsx
    
    // Generate warm lights near buildings
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const px = (x - 6) * CELL_SIZE;
        const pz = (z - 6) * CELL_SIZE;
        buildingPositions.push([px + 2, 3, pz + 2]);
      }
    }
    
    // Create warm, cozy point lights with soft falloff
    buildingPositions.forEach((pos) => {
      const light = new THREE.PointLight('#FFB366', 0.4, 12); // Warmer orange, softer, wider range
      light.position.set(pos[0], pos[1], pos[2]);
      light.castShadow = false;
      light.decay = 2; // Softer falloff for cozier feel
      light.userData.maxIntensity = 0.4; // Store max intensity for smooth transitions
      scene.add(light);
      lightsRef.current.push(light);
    });
    
    // Add additional scattered warm lights for ambient coziness
    const additionalPositions: [number, number, number][] = [
      [-8, 2, -8], [8, 2, -8], [-8, 2, 8], [8, 2, 8],
      [-4, 1.5, 0], [4, 1.5, 0], [0, 1.5, -4], [0, 1.5, 4]
    ];
    
    additionalPositions.forEach((pos) => {
      const light = new THREE.PointLight('#FFA366', 0.25, 10); // Softer warm lights
      light.position.set(pos[0], pos[1], pos[2]);
      light.castShadow = false;
      light.decay = 2;
      light.userData.maxIntensity = 0.25; // Store max intensity for smooth transitions
      scene.add(light);
      lightsRef.current.push(light);
    });
    
    return () => {
      lightsRef.current.forEach((light) => {
        scene.remove(light);
        light.dispose();
      });
      lightsRef.current = [];
      initializedRef.current = false;
    };
  }, [scene]);
  
  useFrame((state, delta) => {
    // Smoothly transition light intensity based on isNight (cozy warm glow)
    lightsRef.current.forEach((light) => {
      // Use the light's original max intensity as reference
      const maxIntensity = light.userData.maxIntensity || 0.4;
      const targetIntensity = isNight ? maxIntensity : 0;
      light.intensity = THREE.MathUtils.lerp(light.intensity, targetIntensity, delta * 2);
      light.visible = isNight || light.intensity > 0.05;
    });
  });
  
  return null;
};

