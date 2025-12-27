'use client';

import { useMemo, forwardRef, useEffect } from 'react';
import * as THREE from 'three';

interface GroundFadeMaterialProps {
  fadeRadius?: number;
  timeOfDay?: number; // 0 = day, 1 = night
}

export const GroundFadeMaterial = forwardRef<THREE.ShaderMaterial | null, GroundFadeMaterialProps>(
  ({ fadeRadius = 22, timeOfDay = 0 }, ref) => {
    const material = useMemo(() => {
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uRadius: { value: fadeRadius },
          uTimeOfDay: { value: timeOfDay }, // 0 = day, 1 = night
          uMoonPosition: { value: new THREE.Vector3(50, 50, 50) }, // Moon position for gradient
          // Color definitions
          uGrassColor: { value: new THREE.Color(0.6, 0.7, 0.6) }, // Soft desaturated sage green
          uSnowColorDay: { value: new THREE.Color(1.0, 0.73, 0.53) }, // Warm soft orange matching sunlight hue (#ffbb88)
          uSnowColorNight: { value: new THREE.Color('#D9E4F5') }, // Light blue snow at night
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          varying vec3 vWorldNormal;
          
          void main() {
            vUv = uv;
            vPosition = position;
            // Calculate world position for accurate distance calculation
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
          uniform float uRadius;
          uniform float uTimeOfDay;
          uniform vec3 uMoonPosition;
          uniform vec3 uGrassColor;
          uniform vec3 uSnowColorDay;
          uniform vec3 uSnowColorNight;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          varying vec3 vWorldNormal;
          
          void main() {
            // Calculate distance from center using world position
            float dist = length(vWorldPosition.xz);
            float normalizedDist = dist / uRadius;
            
            vec3 baseColor;
            
            // Daytime: Grass in center, transitioning to snow at edges
            // Nighttime: All snow with moon gradient
            if (uTimeOfDay < 0.5) {
              // Daytime - grass center with snow edges
              if (normalizedDist < 0.35) {
                baseColor = uGrassColor;
              } else if (normalizedDist < 0.65) {
                float transitionFactor = (normalizedDist - 0.35) / 0.3;
                float smoothTransition = smoothstep(0.0, 1.0, transitionFactor);
                baseColor = mix(uGrassColor, uSnowColorDay, smoothTransition);
              } else {
                baseColor = uSnowColorDay;
              }
            } else {
              // Nighttime - all snow with moon gradient
              // Darken the base snow color for nighttime
              baseColor = uSnowColorNight * 0.7; // Reduce base brightness by 30%
              
              // Add gradient that gets brighter further from moon
              vec2 moonPos2D = uMoonPosition.xz;
              vec2 groundPos2D = vWorldPosition.xz;
              float distFromMoon = length(groundPos2D - moonPos2D);
              
              // Normalize distance (max distance is roughly 2 * uRadius)
              float maxDist = uRadius * 2.0;
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
            float alphaFadeStart = 0.75;
            float alpha = 1.0;
            
            if (normalizedDist > alphaFadeStart) {
              float fadeRange = 1.0 - alphaFadeStart;
              float fadeFactor = (normalizedDist - alphaFadeStart) / fadeRange;
              float smoothFade = smoothstep(0.0, 1.0, fadeFactor);
              alpha = 1.0 - smoothFade * smoothFade * smoothFade;
            }
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false, // Prevent z-fighting with transparent edges
        depthTest: true,
      });
      
      return shaderMaterial;
    }, [fadeRadius, timeOfDay]);
    
    // Update ref when material is created
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(material);
        } else {
          (ref as React.MutableRefObject<THREE.ShaderMaterial | null>).current = material;
        }
      }
      return () => {
        if (ref && typeof ref !== 'function') {
          (ref as React.MutableRefObject<THREE.ShaderMaterial | null>).current = null;
        }
      };
    }, [material, ref]);
    
    // Update timeOfDay uniform when it changes (smoothly via useFrame in parent)
    // Also update immediately for instant feedback
    useEffect(() => {
      if (material && material.uniforms && material.uniforms.uTimeOfDay) {
        material.uniforms.uTimeOfDay.value = timeOfDay;
      }
    }, [material, timeOfDay]);
    
    return <primitive object={material} attach="material" />;
  }
);

GroundFadeMaterial.displayName = 'GroundFadeMaterial';

