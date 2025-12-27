'use client';

import * as THREE from 'three';

/**
 * Utility functions for modifying specific regions of building textures
 * Type assertions added for HTMLImageElement to resolve TypeScript compilation errors
 */

/**
 * Creates a modified version of a texture with region-specific changes using UV coordinates
 * 
 * @param originalTexture - The original texture from the GLB model
 * @param modifications - Array of modifications to apply
 * @returns A new texture with modifications applied
 */
export function modifyTextureRegions(
  originalTexture: THREE.Texture,
  modifications: Array<{
    // UV region to modify (0-1 range)
    uMin: number;
    uMax: number;
    vMin: number;
    vMax: number;
    // Modification function or color change
    modifier: (r: number, g: number, b: number, a: number) => [number, number, number, number];
  }>
): THREE.Texture {
  // Clone the original texture's image
  const img = originalTexture.image as HTMLImageElement;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = img.width || img.naturalWidth || 1024;
  canvas.height = img.height || img.naturalHeight || 1024;
  
  // Draw original image
  ctx.drawImage(img, 0, 0);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply modifications pixel by pixel
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = x / canvas.width;
      const v = y / canvas.height;
      
      // Check if this pixel is in any modification region
      for (const mod of modifications) {
        if (u >= mod.uMin && u <= mod.uMax && v >= mod.vMin && v <= mod.vMax) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx] / 255;
          const g = data[idx + 1] / 255;
          const b = data[idx + 2] / 255;
          const a = data[idx + 3] / 255;
          
          const [newR, newG, newB, newA] = mod.modifier(r, g, b, a);
          
          data[idx] = Math.round(newR * 255);
          data[idx + 1] = Math.round(newG * 255);
          data[idx + 2] = Math.round(newB * 255);
          data[idx + 3] = Math.round(newA * 255);
          break; // Only apply first matching modification
        }
      }
    }
  }
  
  // Put modified data back
  ctx.putImageData(imageData, 0, 0);
  
  // Create new texture
  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.flipY = false;
  newTexture.needsUpdate = true;
  
  return newTexture;
}

/**
 * Creates a shader material that applies region-specific modifications at runtime
 * This is more performant than canvas manipulation for dynamic changes
 */
export function createRegionModifierShader(
  originalTexture: THREE.Texture,
  modifications: Array<{
    uMin: number;
    uMax: number;
    vMin: number;
    vMax: number;
    // Color multiplier (e.g., [1.2, 1.0, 0.8] to make region more red)
    colorMultiplier?: [number, number, number];
    // Color shift (adds to color, 0-1 range)
    colorShift?: [number, number, number];
    // Brightness multiplier
    brightness?: number;
  }>
): THREE.ShaderMaterial {
  // Build shader code dynamically based on modifications
  const modCode = modifications.map((mod, i) => {
    const uvCheck = `
      if (vUv.x >= ${mod.uMin} && vUv.x <= ${mod.uMax} && 
          vUv.y >= ${mod.vMin} && vUv.y <= ${mod.vMax}) {
        vec3 modColor = texColor.rgb;
        ${mod.colorMultiplier ? `modColor *= vec3(${mod.colorMultiplier.join(', ')});` : ''}
        ${mod.colorShift ? `modColor += vec3(${mod.colorShift.join(', ')});` : ''}
        ${mod.brightness !== undefined ? `modColor *= ${mod.brightness};` : ''}
        texColor.rgb = modColor;
      }
    `;
    return uvCheck;
  }).join('\n');

  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: originalTexture },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      varying vec2 vUv;
      
      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        
        ${modCode}
        
        gl_FragColor = texColor;
      }
    `,
  });
}

/**
 * Helper: Modify texture region by color (e.g., make all windows glow, all bricks darker)
 */
export function modifyTextureByColor(
  originalTexture: THREE.Texture,
  targetColor: { r: number; g: number; b: number },
  tolerance: number,
  modifier: (r: number, g: number, b: number, a: number) => [number, number, number, number]
): THREE.Texture {
  const img = originalTexture.image as HTMLImageElement;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = img.width || img.naturalWidth || 1024;
  canvas.height = img.height || img.naturalHeight || 1024;
  
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    
    // Calculate color distance
    const dist = Math.sqrt(
      Math.pow(r - targetColor.r, 2) +
      Math.pow(g - targetColor.g, 2) +
      Math.pow(b - targetColor.b, 2)
    );
    
    if (dist <= tolerance) {
      const [newR, newG, newB, newA] = modifier(r, g, b, data[i + 3] / 255);
      data[i] = Math.round(newR * 255);
      data[i + 1] = Math.round(newG * 255);
      data[i + 2] = Math.round(newB * 255);
      data[i + 3] = Math.round(newA * 255);
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.flipY = false;
  newTexture.needsUpdate = true;
  
  return newTexture;
}

