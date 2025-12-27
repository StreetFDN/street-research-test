// FILE: app/verify/page.tsx
'use client';

import { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhysicsFooter from '@/components/physicsfooter';

// --- VERIFIED DATA ---
const VERIFIED_SOURCES = [
  // EMAILS
  { input: 'ashley@street.app', platform: 'Email', handle: 'ashley@street.app' },
  { input: 'team@street.app', platform: 'Email', handle: 'team@street.app' },
  { input: 'gruber@street.app', platform: 'Email', handle: 'gruber@street.app' },
  { input: 'ertl@street.app', platform: 'Email', handle: 'ertl@street.app' },
  
  // X (TWITTER)
  { input: 'miyahedge', platform: 'X (Twitter)', handle: '@miyahedge' },
  { input: 'ashleyjkimm', platform: 'X (Twitter)', handle: '@ashleyjkimm' },
  { input: 'simbo_01', platform: 'X (Twitter)', handle: '@Simbo_01' },

  // TELEGRAM
  { input: 'drsaratancredi2', platform: 'Telegram', handle: '@drsaratancredi2' },
  { input: 'simbo01', platform: 'Telegram', handle: '@simbo01' },
  { input: 'ashleyjkimm', platform: 'Telegram', handle: '@ashleyjkimm' },
];

// --- NAVBAR (Copied from Scouting Page) ---
const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 transition-all bg-transparent pointer-events-none">
        <div className="max-w-[1100px] mx-auto px-8 flex justify-between items-center pointer-events-auto">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <a href="/">
                    {/* Assuming the logo logic from Scouting page: invert if it's a white logo on white bg, or standard if black */}
                    <img src="/street-logo.png" alt="Street" className="h-8 w-auto object-contain invert" />
                </a>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-6">
                
                {/* NAV LINKS */}
                <div className="hidden md:flex items-center gap-8 mr-2">
                    <a href="/scouting" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors font-sans">Scouting</a>
                    <a href="/web3" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors font-sans">Research</a>
                    <a href="/city" className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors font-sans">
                        Network City
                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">New</span>
                    </a>
                </div>

                <a href="#" className="hidden md:block text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors font-sans uppercase tracking-widest">
                    Manifesto
                </a>

                <button 
                    className="bg-slate-900/5 backdrop-blur-md border border-slate-900/10 text-slate-900 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-slate-900/10 hover:scale-105 transition-all shadow-sm flex items-center gap-2 font-sans"
                >
                    Launch App
                </button>
            </div>
        </div>
    </nav>
);

export default function VerifyPage() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<'idle' | 'verified' | 'unverified'>('idle');
    const [matches, setMatches] = useState<typeof VERIFIED_SOURCES>([]);

    const handleCheck = () => {
        if (!query.trim()) {
            setResult('idle');
            return;
        }

        // Normalize: remove '@', trim, lowercase
        const normalizedQuery = query.trim().replace(/^@/, '').toLowerCase();
        
        // Find all matches
        const found = VERIFIED_SOURCES.filter(s => s.input.toLowerCase() === normalizedQuery);

        if (found.length > 0) {
            setMatches(found);
            setResult('verified');
        } else {
            setMatches([]);
            setResult('unverified');
        }
    };

    // Handle Enter Key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleCheck();
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100 flex flex-col">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20">
                
                <div className="max-w-md w-full space-y-10">
                    
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-serif font-medium text-slate-900">
                            Verify Contact
                        </h1>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                            Check if a user, email, or handle is officially affiliated with Street Labs.
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-slate-500 transition-colors">
                            <Search size={16} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Enter username, email, or handle..." 
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if(result !== 'idle') setResult('idle');
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-4 pl-12 pr-4 outline-none focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-300 text-center"
                        />
                    </div>

                    {/* Result Area */}
                    <div className="min-h-[120px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            
                            {/* IDLE STATE */}
                            {result === 'idle' && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleCheck}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-900 pb-0.5"
                                >
                                    Press Enter to Verify
                                </motion.button>
                            )}

                            {/* VERIFIED STATE */}
                            {result === 'verified' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full bg-green-50/50 border border-green-100 rounded-2xl p-6 text-center space-y-3"
                                >
                                    <div className="flex justify-center text-green-600 mb-2">
                                        <CheckCircle2 size={32} strokeWidth={1.5} />
                                    </div>
                                    
                                    <h3 className="text-sm font-bold text-green-900">Official Street Source</h3>
                                    
                                    <div className="space-y-1">
                                        {matches.map((m, i) => (
                                            <p key={i} className="text-xs text-green-800">
                                                Verified on <span className="font-bold">{m.platform}</span>
                                            </p>
                                        ))}
                                    </div>

                                    {/* Security Warning about OTHER platforms */}
                                    <div className="pt-3 border-t border-green-200/50">
                                        <p className="text-[10px] text-green-700/70 font-medium leading-relaxed">
                                            Note: This handle is verified <u>only</u> on the platform(s) listed above. <br/>
                                            Do not trust this handle on any other platform.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* UNVERIFIED STATE */}
                            {result === 'unverified' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full bg-red-50/50 border border-red-100 rounded-2xl p-6 text-center space-y-3"
                                >
                                    <div className="flex justify-center text-red-500 mb-2">
                                        <AlertTriangle size={32} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-sm font-bold text-red-900">Unverified Source</h3>
                                    <p className="text-xs text-red-700 leading-relaxed">
                                        "{query}" is not recognized as an official Street Labs account.
                                    </p>
                                    <p className="text-[10px] text-red-600/60 pt-2 font-medium">
                                        Please exercise extreme caution. This may be an impersonator.
                                    </p>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-slate-100 bg-white relative z-10">
                <PhysicsFooter />
                <div className="max-w-[1100px] mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="text-[10px] text-slate-400 font-sans uppercase tracking-widest">
                        © 2025 Street Labs Inc.
                    </div>
                    <div className="flex gap-8 text-[10px] font-bold text-slate-900 uppercase tracking-widest font-sans">
                        <a href="#" className="hover:text-slate-500 transition-colors">Manifesto</a>
                        <a href="#" className="hover:text-slate-500 transition-colors">Legal</a>
                        <a href="https://x.com/StreetFDN" target="_blank" className="hover:text-slate-500 transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
