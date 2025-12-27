// FILE: components/city/CinematicIntro.tsx
'use client';

import { useState, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// --- CONFIGURATION ---
const SUBTITLES = [
  { start: 0, end: 3, text: "The epicenter of innovation crypto once was... is dead." },
  { start: 3, end: 6, text: "Another Layer 1. Another perps DEX. Another launchpad." },
  { start: 6, end: 9, text: "The beacon of accelerationism turned into a circlejerk of capital." },
  { start: 9, end: 12, text: "We lost the plot." },
  { start: 12, end: 15, text: "Blockchain hit the innovation ceiling. Great distribution, zero substance." },
  { start: 15, end: 19, text: "Street's goal: 100 Web2 startups. Radical ideas. Bold founders." },
  { start: 19, end: 22, text: "Capital. Distribution. Connections." },
  { start: 22, end: 25, text: "Welcome to Street Network City." },
];

const FLIGHT_POINTS = [
  new THREE.Vector3(0, 120, 0),    
  new THREE.Vector3(60, 80, 60),   
  new THREE.Vector3(-40, 50, 50),  
  new THREE.Vector3(-30, 30, -30), 
  new THREE.Vector3(20, 20, 20),   
];

interface CinematicIntroProps {
  onComplete: () => void;
}

// --- NAMED EXPORT (Must match the import in page.tsx) ---
export const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const { camera } = useThree();
  const [activeText, setActiveText] = useState("");
  const startTime = useRef<number | null>(null);

  const flightPath = useMemo(() => {
    return new THREE.CatmullRomCurve3(FLIGHT_POINTS, false, 'catmullrom', 0.5);
  }, []);

  useFrame((state) => {
    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTime.current;
    const DURATION = 25; 

    // 1. Update Camera
    if (elapsed < DURATION) {
      const progress = elapsed / DURATION;
      
      const pos = new THREE.Vector3();
      flightPath.getPointAt(progress, pos);
      state.camera.position.copy(pos);

      const lookAtTarget = new THREE.Vector3();
      const lookAhead = Math.min(progress + 0.05, 1);
      flightPath.getPointAt(lookAhead, lookAtTarget);
      
      const center = new THREE.Vector3(0, 0, 0);
      const mixFactor = progress > 0.8 ? 1 : 0.5; 
      const finalLook = new THREE.Vector3().lerpVectors(lookAtTarget, center, mixFactor);
      
      state.camera.lookAt(finalLook);
    } else {
      onComplete();
    }

    // 2. Update Text
    const currentSub = SUBTITLES.find(s => elapsed >= s.start && elapsed < s.end);
    if (currentSub && currentSub.text !== activeText) {
      setActiveText(currentSub.text);
    } else if (!currentSub && activeText !== "") {
      setActiveText("");
    }
  });

  return (
    <Html fullscreen style={{ pointerEvents: 'none', zIndex: 2000 }}>
      <div className="flex flex-col items-center justify-center w-full h-full pb-32">
        <AnimatePresence mode="wait">
          {activeText && (
            <motion.div
              key={activeText}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(5px)" }}
              transition={{ duration: 0.5 }} 
              className="max-w-4xl px-6 text-center"
            >
              <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-slate-900 leading-snug drop-shadow-xl bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                {activeText}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => {
             camera.position.set(20, 20, 20);
             camera.lookAt(0,0,0);
             onComplete();
          }}
          className="pointer-events-auto absolute bottom-12 right-12 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors z-50"
        >
          Skip Arrival
        </button>
      </div>
    </Html>
  );
};
