'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

interface PostProcessingProps {
  isNight?: boolean;
}

export function PostProcessing({ isNight = false }: PostProcessingProps) {
  return (
    <EffectComposer enableNormalPass={false} multisampling={4}>
      <Bloom 
        // Lower threshold at night to catch connection lines (slightly below window glow)
        luminanceThreshold={isNight ? 0.6 : 1.2} 
        // Increased strength for radiant, hazy bleed effect
        intensity={isNight ? 2.5 : 0.2} 
        mipmapBlur 
        // Larger radius for soft, atmospheric glow that affects surroundings
        radius={isNight ? 0.8 : 0.25}
        // Additional properties for better control
        luminanceSmoothing={isNight ? 0.95 : 0.5}
      />
      <Vignette 
        eskil={false}
        offset={isNight ? 0.3 : 0.1}
        darkness={isNight ? 0.8 : 0.4}
      />
    </EffectComposer>
  );
}
