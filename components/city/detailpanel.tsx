// FILE: components/city/detailpanel.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Startup } from "./types";
import { ArrowRight, X, ExternalLink, ShieldAlert, Clock } from "lucide-react";

// 1. UPDATED MAPPING: Using the specific mixed extensions from your Github skeleton
const LOGO_MAP: Record<string, string> = {
  "street": "/streetlogo.jpg",      
  "kled": "/kledlogo.jpg",          
  "starfun": "/starlogo.png",       
  "noice": "/noicelogo.jpg",         
  "opendroids": "/opendroidslogo.jpg" 
};

interface DetailPanelProps {
  startup: Startup;
  onClose: () => void;
}

export const DetailPanel = ({ startup, onClose }: DetailPanelProps) => {
  const logoPath = LOGO_MAP[startup.id];
  const panelRef = useRef<HTMLDivElement>(null);

  // --- LOGIC: DETERMINE STATUS ---
  // StarFun & Noice = Partners (Not ERC-S)
  const isPartner = ['starfun', 'noice'].includes(startup.id);
  // Kled, OpenDroids & Street = Upcoming (Governance not live)
  const isUpcoming = ['kled', 'opendroids', 'street'].includes(startup.id);
  // No live projects currently
  const isLive = false; 

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/10 z-[9998]" 
        onClick={onClose}
      />
      <div 
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-1/3 min-w-[350px] bg-white/80 backdrop-blur-xl border-l border-white/60 shadow-2xl p-8 md:p-12 flex flex-col justify-center z-[9999] animate-in slide-in-from-right duration-500" 
        style={{ position: 'fixed', zIndex: 9999 }}
        onClick={(e) => e.stopPropagation()}
      >
      
      <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors bg-white/50 p-2 rounded-full z-[10000]">
          <X size={24} />
      </button>

      <div className="space-y-8 mt-10">
          <div className="flex items-center gap-4">
              {/* Logo Container */}
              <div className="w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden bg-white shrink-0 border border-slate-100">
                  {logoPath ? (
                    <img 
                      src={logoPath} 
                      alt={`${startup.name} Logo`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Letter */}
                  <div className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white ${logoPath ? 'hidden' : ''}`} style={{ backgroundColor: startup.color }}>
                      {startup.name[0]}
                  </div>
              </div>

              <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {startup.district} District
                    </span>
                    
                    {/* STATUS BADGES */}
                    {isPartner && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            Partner
                        </span>
                    )}
                    {isUpcoming && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            Soon
                        </span>
                    )}
                  </div>

                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                    {startup.name}
                  </h2>
              </div>
          </div>

          <div className="h-px w-full bg-slate-200" />

          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
              {startup.description}
          </p>

          <div className="pt-4 space-y-4">
              {/* --- DYNAMIC ACTION BUTTON --- */}
              {isLive ? (
                  // LIVE BUTTON (Street)
                  <button 
                      onClick={() => window.open("https://app.street.money", "_blank")} 
                      className="group w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                      Govern this SPV <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
              ) : (
                  // DISABLED STATE (Partners & Upcoming)
                  <div className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-center cursor-not-allowed select-none
                      ${isPartner ? 'bg-amber-50/50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'}
                  `}>
                      <div className="flex items-center gap-2 font-bold text-sm">
                          {isPartner ? <ShieldAlert size={16}/> : <Clock size={16} />}
                          {isPartner ? "Ecosystem Partner" : "Coming Soon"}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                          {isPartner ? "Not an ERC-S Token" : "Governance Not Yet Live"}
                      </span>
                  </div>
              )}
              
              <a 
                  href={startup.link} 
                  target="_blank" 
                  className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors py-2 uppercase tracking-wide"
              >
                  View Official Website <ExternalLink size={14} />
              </a>
          </div>
      </div>
    </div>
    </>
  );
};
