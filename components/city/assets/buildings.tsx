// FILE: components/city/assets/Buildings.tsx
'use client';

import { useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Window color ranges based on texture palette:
 * - Light blue to darker blue (third from right on top row) - ONLY THIS ONE
 */
const WINDOW_BLUE_COLORS = [
  { r: 0.4, g: 0.6, b: 0.9 },   // Light blue
  { r: 0.2, g: 0.4, b: 0.8 },  // Medium blue
  { r: 0.1, g: 0.3, b: 0.7 },  // Darker blue
];

const COLOR_TOLERANCE = 0.1; // Reduced tolerance for more precise matching

// Building glow configuration - easily adjustable
// Edit these values to change glow positions and heights for each building
// Center: 0.0 = bottom of building, 1.0 = top of building
// Height: Size of glow area (0.0 = no height, 1.0 = full building height)
// Each building has 3 glow areas with individual center and height values

type GlowConfig = {
  glow1Center: number;
  glow1Height: number;
  glow2Center: number;
  glow2Height: number;
  glow3Center: number;
  glow3Height: number;
};

const BUILDING_GLOW_CONFIG: Record<string, GlowConfig> = {
  // Street Labs (building-skyscraper-a)
  "building-skyscraper-a": {
    glow1Center: 0.41,
    glow1Height: 0.0128,
    glow2Center: 0.442,
    glow2Height: 0.014,
    glow3Center: 0.455,
    glow3Height: 0.02,
  },
  // Kled AI (building-skyscraper-b)
  "building-skyscraper-b": {
    glow1Center: 0.42,
    glow1Height: 0.016,
    glow2Center: 0.442,
    glow2Height: 0.008,
    glow3Center: 0.458,
    glow3Height: 0.008,
  },
  // OpenDroids (building-skyscraper-c)
  "building-skyscraper-c": {
    glow1Center: 0.0718,
    glow1Height: 0.499,
    glow2Center: 0.8,
    glow2Height: 0.8,
    glow3Center: 0.72,
    glow3Height: 0.78,
  },
  // Noice (building-skyscraper-d)
  "building-skyscraper-d": {
    glow1Center: 0.35,
    glow1Height: 0.02,
    glow2Center: 0.442,
    glow2Height: 0.1,
    glow3Center: 0.28,
    glow3Height: 0.077,
  },
  // StarFun (building-skyscraper-e)
  "building-skyscraper-e": {
    glow1Center: 0.31,
    glow1Height: 0.088,
    glow2Center: 0.535,
    glow2Height: 0.01,
    glow3Center: 0.6,
    glow3Height: 0.3,
  },
};

const BUILDING_FILES = {
  "building-skyscraper-a": "/models/buildings/building-skyscraper-a.glb",
  "building-skyscraper-b": "/models/buildings/building-skyscraper-b.glb",
  "building-skyscraper-c": "/models/buildings/building-skyscraper-c.glb",
  "building-skyscraper-d": "/models/buildings/building-skyscraper-d.glb",
  "building-skyscraper-e": "/models/buildings/building-skyscraper-e.glb",
  "building-b": "/models/buildings/low-detail-building-b.glb",
  "building-c": "/models/buildings/low-detail-building-c.glb",
  "building-e": "/models/buildings/low-detail-building-e.glb",
};

Object.values(BUILDING_FILES).forEach(path => {
  try { useGLTF.preload(path); } catch(e) {}
});

interface BuildingModelProps {
  modelKey: string;
  color: string;
  hovered: boolean;
  scale?: number; // Added scale prop
  isNight?: boolean; // NEW: Night mode prop
}

/**
 * Check if a color matches window colors (blue range only)
 */
function isWindowColor(r: number, g: number, b: number): boolean {
  // Check against blue window colors only
  for (const blueColor of WINDOW_BLUE_COLORS) {
    const dist = Math.sqrt(
      Math.pow(r - blueColor.r, 2) +
      Math.pow(g - blueColor.g, 2) +
      Math.pow(b - blueColor.b, 2)
    );
    if (dist <= COLOR_TOLERANCE) return true;
  }
  
  return false;
}

/**
 * Create a shader material that makes windows glow at night
 */
function createWindowGlowShader(originalTexture: THREE.Texture, isNight: boolean, glowConfig: GlowConfig | null): THREE.ShaderMaterial {
  // Default glow config if none provided
  const defaultConfig: GlowConfig = {
    glow1Center: 0.25,
    glow1Height: 0.08,
    glow2Center: 0.50,
    glow2Height: 0.08,
    glow3Center: 0.75,
    glow3Height: 0.08,
  };
  
  const config = glowConfig || defaultConfig;
  
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: originalTexture },
      uIsNight: { value: isNight ? 1.0 : 0.0 },
      uTime: { value: 0 },
      // Building glow parameters (easily adjustable - edit BUILDING_GLOW_CONFIG)
      uGlow1Center: { value: config.glow1Center },
      uGlow1Height: { value: config.glow1Height },
      uGlow2Center: { value: config.glow2Center },
      uGlow2Height: { value: config.glow2Height },
      uGlow3Center: { value: config.glow3Center },
      uGlow3Height: { value: config.glow3Height },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uIsNight;
      uniform float uTime;
      uniform float uGlow1Center;
      uniform float uGlow1Height;
      uniform float uGlow2Center;
      uniform float uGlow2Height;
      uniform float uGlow3Center;
      uniform float uGlow3Height;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      // Window color definitions (normalized 0-1)
      // Blue window colors only (third from right on top row)
      vec3 windowBlue1 = vec3(0.4, 0.6, 0.9);   // Light blue
      vec3 windowBlue2 = vec3(0.2, 0.4, 0.8);   // Medium blue
      vec3 windowBlue3 = vec3(0.1, 0.3, 0.7);   // Darker blue
      
      float colorTolerance = 0.1; // Reduced tolerance for more precise matching
      
      bool isWindowColor(vec3 color) {
        // Check blue colors only
        float dist1 = distance(color, windowBlue1);
        float dist2 = distance(color, windowBlue2);
        float dist3 = distance(color, windowBlue3);
        if (dist1 <= colorTolerance || dist2 <= colorTolerance || dist3 <= colorTolerance) {
          return true;
        }
        
        return false;
      }
      
      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        vec3 color = texColor.rgb;
        
        if (uIsNight > 0.5 && isWindowColor(color)) {
          bool shouldGlow = false;
          
          // All buildings: Glow within specific height ranges (easily adjustable)
          // Use uniforms for glow areas - these can be updated dynamically
          // Center position (0.0 = bottom, 1.0 = top) and Height (0-1)
          float halfHeight1 = uGlow1Height * 0.5;
          float halfHeight2 = uGlow2Height * 0.5;
          float halfHeight3 = uGlow3Height * 0.5;
          
          bool inGlowArea = (vUv.y >= (uGlow1Center - halfHeight1) && vUv.y <= (uGlow1Center + halfHeight1)) ||
                            (vUv.y >= (uGlow2Center - halfHeight2) && vUv.y <= (uGlow2Center + halfHeight2)) ||
                            (vUv.y >= (uGlow3Center - halfHeight3) && vUv.y <= (uGlow3Center + halfHeight3));
          
          // All windows in the height ranges will glow
          if (inGlowArea) {
            shouldGlow = true;
          }
          
          if (shouldGlow) {
            // Make windows glow at night with darker reddish-orange color
            // Darker reddish tint (reduced brightness, more red, less orange)
            vec3 darkReddishGlow = vec3(0.85, 0.35, 0.15); // Darker reddish-orange (RGB: 217, 89, 38)
            
            // Apply intensity (reduced by 28% from 3.0 = 2.16)
            vec3 glowColor = darkReddishGlow * 2.16;
            
            // Add subtle pulsing effect
            float pulse = sin(uTime * 2.0) * 0.1 + 1.0;
            color = glowColor * pulse;
          }
        }
        
        gl_FragColor = vec4(color, texColor.a);
      }
    `,
  });
}

export const BuildingModel = ({ modelKey, color, hovered, scale = 1, isNight = false }: BuildingModelProps) => {
  // @ts-ignore
  const path = BUILDING_FILES[modelKey] || BUILDING_FILES["building-skyscraper-a"];
  const { scene } = useGLTF(path);
  const shaderMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);
  
  // Get glow configuration for this building
  const glowConfig = BUILDING_GLOW_CONFIG[modelKey] || null;
  
  // Create a dependency string from glow config to force useMemo update when config changes
  const glowConfigKey = glowConfig 
    ? `${glowConfig.glow1Center}-${glowConfig.glow1Height}-${glowConfig.glow2Center}-${glowConfig.glow2Height}-${glowConfig.glow3Center}-${glowConfig.glow3Height}`
    : 'none';
  
  const clone = useMemo(() => {
    const c = scene.clone();
    shaderMaterialsRef.current = []; // Reset shader materials array
    
    // Traverse and modify materials for window glow
    c.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Set renderOrder to ensure proper depth sorting (lower values render first, behind higher values)
        mesh.renderOrder = 0;
        
        // Apply window glow shader if material has a texture
        if (mesh.material) {
          // Handle both single materials and material arrays
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const newMaterials: THREE.Material[] = [];
          
          for (const mat of materials) {
            const material = mat as THREE.MeshStandardMaterial;
            
            // Check if material has a texture
            if (material.map) {
              // Create shader material with window glow effect
              // Glow config is read here, so it'll be current when useMemo runs
              const shaderMaterial = createWindowGlowShader(material.map, isNight, glowConfig);
              
              // Copy other material properties
              shaderMaterial.side = material.side;
              shaderMaterial.transparent = material.transparent;
              shaderMaterial.opacity = material.opacity;
              
              // Store reference for time updates
              shaderMaterialsRef.current.push(shaderMaterial);
              
              newMaterials.push(shaderMaterial);
            } else {
              // Keep original material if no texture
              newMaterials.push(material);
            }
          }
          
          // Assign back (single or array)
          mesh.material = newMaterials.length === 1 ? newMaterials[0] : newMaterials;
        }
      }
    });
    
    // Apply the passed scale, defaulting to 1
    c.scale.set(scale, scale, scale); 
    
    return c;
  }, [scene, scale, isNight, glowConfigKey]); // Use glowConfigKey to detect config changes

  // Update time uniform for pulsing effect and glow parameters
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    shaderMaterialsRef.current.forEach((mat) => {
      if (!mat.uniforms) return;
      
      if (mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
      // Update night mode if it changed
      if (mat.uniforms.uIsNight) {
        mat.uniforms.uIsNight.value = isNight ? 1.0 : 0.0;
      }
      // Update glow parameters (allows live editing of BUILDING_GLOW_CONFIG)
      // Always update these uniforms every frame so changes to config are reflected immediately
      if (mat.uniforms.uGlow1Center !== undefined && glowConfig) {
        mat.uniforms.uGlow1Center.value = glowConfig.glow1Center;
        mat.uniforms.uGlow1Height.value = glowConfig.glow1Height;
        mat.uniforms.uGlow2Center.value = glowConfig.glow2Center;
        mat.uniforms.uGlow2Height.value = glowConfig.glow2Height;
        mat.uniforms.uGlow3Center.value = glowConfig.glow3Center;
        mat.uniforms.uGlow3Height.value = glowConfig.glow3Height;
      }
    });
  });

  return <primitive object={clone} />;
};
