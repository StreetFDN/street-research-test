// FILE: components/city/Overlay.tsx
'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

// The Narrative Script
const SCENES = [
  {
    id: 1,
    text: [
      "The epicenter of innovation crypto once was is dead.",
      "Another Layer 1. Another perps DEX. Another launchpad.",
    ],
    highlight: "dead."
  },
  {
    id: 2,
    text: [
      "The beacon of accelerationism turned into a circlejerk of capital.",
      "Only here to extract from its users.",
      "We lost the plot.",
    ],
    highlight: "lost the plot."
  },
  {
    id: 3,
    text: [
      "Blockchain has reached the peak of the innovation S-curve.",
      "We proved how great it is for distribution.",
      "Now, we build the real world.",
    ],
    highlight: "real world."
  },
  {
    id: 4,
    text: [
      "Street's goal is to start an ecosystem of 100 Web2 startups.",
      "Radical ideas. Bold founders. GDP growth.",
      "The future we dreamed about reading Sci-Fi novels.",
    ],
    highlight: "100 Web2 startups."
  },
  {
    id: 5,
    text: [
      "Capital. Distribution. Connections.",
      "Street started in January 2026.",
      "You're entering our Street Network City now.",
    ],
    highlight: "Network City"
  }
];

interface OverlayProps {
  onFinished: () => void;
}

export const Overlay = ({ onFinished }: OverlayProps) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-advance logic (optional, but cinematic requires pacing)
  useEffect(() => {
    if (!isVisible) return;
    
    // Time per slide - give people time to read
    const timer = setTimeout(() => {
      handleNext();
    }, 4500); 

    return () => clearTimeout(timer);
  }, [sceneIndex, isVisible]);

  const handleNext = () => {
    if (sceneIndex < SCENES.length - 1) {
      setSceneIndex(prev => prev + 1);
    } else {
      finishIntro();
    }
  };

  const finishIntro = () => {
    setIsVisible(false);
    setTimeout(onFinished, 1000); // Wait for fade out before unlocking controls
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-[1000] flex flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
        >
          {/* 1. Frosted Glass Background (Blurs the 3D City behind it) */}
          <div className="absolute inset-0 bg-[#f2f4f7]/80 backdrop-blur-xl z-0" />
          
          {/* 2. Text Content Container */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={sceneIndex}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-6"
              >
                {SCENES[sceneIndex].text.map((line, i) => (
                  <p 
                    key={i} 
                    className={`text-2xl md:text-4xl font-medium tracking-tight leading-snug text-slate-800
                      ${line.includes(SCENES[sceneIndex].highlight) ? "text-slate-900 font-bold" : "text-slate-500"}
                    `}
                  >
                    {line}
                  </p>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. Progress / Controls */}
          <div className="absolute bottom-12 z-20 flex flex-col items-center gap-4">
             {/* Progress Bar */}
             <div className="flex gap-2">
                {SCENES.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-500 ${i === sceneIndex ? "w-8 bg-slate-900" : "w-2 bg-slate-300"}`} 
                    />
                ))}
             </div>

             <button 
                onClick={finishIntro}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-2 mt-4"
              >
                Skip Intro <ArrowRight size={12} />
             </button>
          </div>

          {/* Click anywhere to advance (invisible overlay) */}
          <div 
            className="absolute inset-0 z-10 cursor-pointer" 
            onClick={handleNext}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
