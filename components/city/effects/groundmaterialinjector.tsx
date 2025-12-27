'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GroundMaterialInjectorProps {
  timeOfDay: number; // 0 = day, 1 = night
  debug?: boolean;
}

export const GroundMaterialInjector = ({ timeOfDay, debug = false }: GroundMaterialInjectorProps) => {
  const { scene } = useThree();
  const injectedRef = useRef<Set<THREE.Mesh>>(new Set());
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    // Create the shader material once
    if (!shaderMaterialRef.current) {
      shaderMaterialRef.current = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: timeOfDay },
          uRadiusGrass: { value: 8.0 }, // Green zone radius
          uRadiusSnow: { value: 15.0 }, // White zone radius
          uMapRadius: { value: 22.0 }, // Total map radius
          uMoonPosition: { value: new THREE.Vector3(50, 50, 50) }, // Moon position for gradient
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          varying vec3 vWorldNormal;
          
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            // Calculate world normal for lighting
            vNormal = normal;
            vec4 worldNormal = modelMatrix * vec4(normal, 0.0);
            vWorldNormal = normalize(worldNormal.xyz);
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uRadiusGrass;
          uniform float uRadiusSnow;
          uniform float uMapRadius;
          uniform vec3 uMoonPosition;
          
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          varying vec3 vWorldNormal;
          
          void main() {
            // Calculate distance from center using world position
            float dist = length(vWorldPosition.xz);
            
            // Color definitions
            vec3 grassColor = vec3(0.6, 0.7, 0.6); // Soft desaturated sage green
            vec3 snowColorDay = vec3(1.0, 0.73, 0.53); // Warm soft orange matching sunlight hue
            vec3 snowColorNight = vec3(0.851, 0.894, 0.961); // Light blue snow at night (#D9E4F5)
            
            vec3 baseColor;
            
            // Daytime: Grass in center, transitioning to snow at edges
            // Nighttime: All snow with moon gradient
            if (uTime < 0.5) {
              // Daytime - grass center with snow edges
              if (dist < uRadiusGrass) {
                baseColor = grassColor;
              } else if (dist < uRadiusSnow) {
                float transitionFactor = (dist - uRadiusGrass) / (uRadiusSnow - uRadiusGrass);
                float smoothTransition = smoothstep(0.0, 1.0, transitionFactor);
                baseColor = mix(grassColor, snowColorDay, smoothTransition);
              } else {
                baseColor = snowColorDay;
              }
            } else {
              // Nighttime - all snow with moon gradient
              // Darken the base snow color for nighttime
              baseColor = snowColorNight * 0.7; // Reduce base brightness by 30%
              
              // Add gradient that gets brighter further from moon
              vec2 moonPos2D = uMoonPosition.xz;
              vec2 groundPos2D = vWorldPosition.xz;
              float distFromMoon = length(groundPos2D - moonPos2D);
              
              // Normalize distance (max distance is roughly 2 * uMapRadius)
              float maxDist = uMapRadius * 2.0;
              float normalizedMoonDist = clamp(distFromMoon / maxDist, 0.0, 1.0);
              
              // Create gradient: darker near moon, brighter away from moon
              // Use smoothstep for smooth transition
              float gradientFactor = smoothstep(0.0, 1.0, normalizedMoonDist);
              
              // Brighten the color based on distance from moon
              // Start at 50% brightness near moon, go to 80% far from moon (darker overall)
              float brightness = mix(0.5, 0.8, gradientFactor);
              baseColor = baseColor * brightness;
            }
            
            vec3 finalColor = baseColor;
            
            // Radial Alpha Fade
            float alphaFadeStart = uMapRadius * 0.8;
            float alpha = 1.0;
            
            if (dist > alphaFadeStart) {
              float fadeRange = uMapRadius - alphaFadeStart;
              float fadeFactor = (dist - alphaFadeStart) / fadeRange;
              float smoothFade = smoothstep(0.0, 1.0, fadeFactor);
              alpha = 1.0 - smoothFade * smoothFade;
            }
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });
    }

    // Also update all cloned materials' uniforms
    injectedRef.current.forEach((mesh) => {
      if (mesh.material && 'uniforms' in mesh.material) {
        const uniforms = (mesh.material as THREE.ShaderMaterial).uniforms;
        if (uniforms && uniforms.uTime) {
          uniforms.uTime.value = timeOfDay;
        }
      }
    });

    // Traverse scene to find ground meshes
    const groundMeshNames = ['Ground', 'Plane', 'Floor', 'ground', 'plane', 'floor', 'Base', 'base'];
    const foundMeshes: { name: string; mesh: THREE.Mesh }[] = [];
    const allMeshes: string[] = [];

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const meshName = object.name || 'unnamed';
        allMeshes.push(meshName);

        // Check if this is a ground mesh
        const isGroundMesh = groundMeshNames.some(name => 
          meshName.toLowerCase().includes(name.toLowerCase())
        );

        // Also check if it's a large flat mesh (likely ground)
        const isLargeFlatMesh = object.geometry && 
          object.geometry.boundingBox &&
          (object.geometry.boundingBox.max.y - object.geometry.boundingBox.min.y) < 0.5 &&
          (object.geometry.boundingBox.max.x - object.geometry.boundingBox.min.x) > 10 &&
          (object.geometry.boundingBox.max.z - object.geometry.boundingBox.min.z) > 10;

        if ((isGroundMesh || isLargeFlatMesh) && !injectedRef.current.has(object)) {
          foundMeshes.push({ name: meshName, mesh: object });
        }
      }
    });

    // Debug: Log all mesh names if ground not found
    if (debug || foundMeshes.length === 0) {
      console.log('=== Ground Material Injector Debug ===');
      console.log('All mesh names in scene:', allMeshes);
      console.log('Found ground meshes:', foundMeshes.map(m => m.name));
    }

    // Inject shader material into found ground meshes
    foundMeshes.forEach(({ mesh }) => {
      if (mesh.material) {
        // Dispose old material
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }

      // Replace with shader material (clone to avoid sharing uniforms)
      const clonedMaterial = shaderMaterialRef.current!.clone();
      clonedMaterial.transparent = true;
      clonedMaterial.depthWrite = false; // Prevent z-fighting with transparent edges
      mesh.material = clonedMaterial;
      mesh.material.needsUpdate = true;
      injectedRef.current.add(mesh);
    });

    // Cleanup function
    return () => {
      // Don't dispose here - let React Three Fiber handle it
    };
  }, [scene, debug]);

  // Smoothly update uniforms
  useFrame((state, delta) => {
    if (shaderMaterialRef.current) {
      const uniforms = shaderMaterialRef.current.uniforms;
      
      // Update timeOfDay
      const currentTime = uniforms.uTime.value;
      uniforms.uTime.value = THREE.MathUtils.lerp(
        currentTime,
        timeOfDay,
        delta * 2
      );
      
      // Update moon position for gradient effect
      // Moon is at [50, 50, 50] at night, [-50, -10, -50] at day
      if (uniforms.uMoonPosition) {
        const moonPos = timeOfDay > 0.5 
          ? new THREE.Vector3(50, 50, 50) 
          : new THREE.Vector3(-50, -10, -50);
        uniforms.uMoonPosition.value.copy(moonPos);
      }
      
      // Update all cloned materials' uniforms
      injectedRef.current.forEach((mesh) => {
        if (mesh.material && 'uniforms' in mesh.material) {
          const meshUniforms = (mesh.material as THREE.ShaderMaterial).uniforms;
          if (meshUniforms) {
            if (meshUniforms.uTime) meshUniforms.uTime.value = uniforms.uTime.value;
            if (meshUniforms.uMoonPosition) meshUniforms.uMoonPosition.value.copy(uniforms.uMoonPosition.value);
          }
        }
      });
    }
  });

  return null;
};

