// FILE: components/city/ui/ConnectionPopup.tsx
'use client';

import { useEffect, useRef } from 'react';
import { X, Handshake } from "lucide-react";
import { ConnectionData } from "../connectionsconfig";

interface ConnectionPopupProps {
  data: ConnectionData;
  onClose: () => void;
}

export const ConnectionPopup = ({ data, onClose }: ConnectionPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add event listener with a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    // Positioned so arrow tip aligns with curve peak
    <div 
      ref={popupRef}
      className="relative group animate-in fade-in zoom-in-95 duration-300" 
      style={{ marginBottom: 0, paddingBottom: '6px' }}
      onClick={(e) => e.stopPropagation()}
    >
       
       {/* GLASS CONTAINER - Tiny sized (w-52), tight padding (p-2.5) */}
       <div className="relative w-52 overflow-hidden rounded-xl border border-white/60 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] ring-1 ring-white/50 p-2.5 backdrop-blur-xl backdrop-saturate-150 bg-gradient-to-b from-white/70 to-white/40">
         
          {/* Top highlight */}
         <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />

          {/* Tiny Close Button */}
         <button 
           onClick={(e) => { e.stopPropagation(); onClose(); }}
           className="absolute top-1.5 right-1.5 p-0.5 rounded-full text-slate-400 hover:bg-white/50 hover:text-slate-700 transition-all z-20"
         >
           <X size={10} />
         </button>

         {/* Content */}
         <div className="relative z-10 flex flex-col gap-1.5">
            {/* Header */}
            <div className="flex items-center gap-1.5 pr-4">
                <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 border border-blue-500/20">
                    <Handshake size={10} />
                </div>
                <h3 className="text-[8px] font-bold uppercase tracking-wider text-blue-600/80 truncate leading-none mt-0.5">
                    {data.title}
                </h3>
            </div>
            
            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-blue-200/30 to-transparent my-0.5" />

            {/* Description - Very small text */}
            <p className="text-slate-700 text-[10px] font-semibold leading-tight">
              {data.description}
            </p>
         </div>
       </div>

       {/* The "Tail" pointing down */}
       <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r border-white/60 bg-white/40 backdrop-blur-xl z-0"></div>
    </div>
  );
};
