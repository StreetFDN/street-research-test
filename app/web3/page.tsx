// FILE: app/web3/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Twitter, Globe } from 'lucide-react';
import PhysicsFooter from '@/components/physicsfooter';

// --- CONFIGURATION ---
const TARGET_DATE = '2025-12-23T15:00:00Z'; // 23nd December 2025, 3pm UTC

// --- DOT MATRIX LOGIC ---
const DIGIT_PATTERNS: Record<string, number[]> = {
    '0': [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    '1': [0,0,1,0,0, 0,1,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0],
    '2': [0,1,1,1,0, 1,0,0,0,1, 0,0,0,0,1, 0,0,1,1,0, 0,1,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
    '3': [0,1,1,1,0, 1,0,0,0,1, 0,0,0,0,1, 0,0,1,1,0, 0,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    '4': [0,0,0,1,0, 0,0,1,1,0, 0,1,0,1,0, 1,0,0,1,0, 1,1,1,1,1, 0,0,0,1,0, 0,0,0,1,0],
    '5': [1,1,1,1,1, 1,0,0,0,0, 1,1,1,1,0, 0,0,0,0,1, 0,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    '6': [0,1,1,1,0, 1,0,0,0,0, 1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    '7': [1,1,1,1,1, 0,0,0,0,1, 0,0,0,1,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0],
    '8': [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    '9': [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,1, 0,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    ':': [0,0,0, 0,0,0, 0,1,0, 0,0,0, 0,1,0, 0,0,0, 0,0,0]
};

const MatrixDot = ({ active }: { active: boolean }) => (
    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-[1px] transition-all duration-300 ${active ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-100' : 'bg-slate-800/30 scale-90'}`} />
);

const MatrixDigit = ({ value }: { value: string }) => {
    const pattern = DIGIT_PATTERNS[value] || DIGIT_PATTERNS['0'];
    const cols = value === ':' ? 3 : 5; 
    return (
        <div className="grid gap-[2px] sm:gap-1" style={{ gridTemplateColumns: `repeat(${cols}, min-content)` }}>
            {pattern.map((isOn, i) => <MatrixDot key={i} active={isOn === 1} />)}
        </div>
    );
};

const DotMatrixClock = ({ timeLeft }: { timeLeft: { days: string, hours: string, minutes: string, seconds: string } }) => (
    <div className="bg-black/95 border-4 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex items-center justify-center gap-4 sm:gap-8 overflow-x-auto max-w-[95vw] mx-auto">
        <div className="flex gap-2 sm:gap-4"><MatrixDigit value={timeLeft.days[0]} /><MatrixDigit value={timeLeft.days[1]} /></div>
        <MatrixDigit value=":" />
        <div className="flex gap-2 sm:gap-4"><MatrixDigit value={timeLeft.hours[0]} /><MatrixDigit value={timeLeft.hours[1]} /></div>
        <MatrixDigit value=":" />
        <div className="flex gap-2 sm:gap-4"><MatrixDigit value={timeLeft.minutes[0]} /><MatrixDigit value={timeLeft.minutes[1]} /></div>
        <MatrixDigit value=":" />
        <div className="flex gap-2 sm:gap-4"><MatrixDigit value={timeLeft.seconds[0]} /><MatrixDigit value={timeLeft.seconds[1]} /></div>
    </div>
);

const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 transition-all bg-transparent">
        <div className="max-w-[1100px] mx-auto px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <a href="/">
                    <img src="/street-logo.png" alt="Street" className="h-8 w-auto object-contain" />
                </a>
            </div>
            <div className="flex items-center gap-6">
                <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-white hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 font-sans">
                    Launch App
                </button>
            </div>
        </div>
    </nav>
);

export default function ResearchCountdownPage() {
    const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const calculateTime = () => {
            const difference = +new Date(TARGET_DATE) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
                    minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
                    seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
                });
            } else {
                setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
            }
        };
        const timer = setInterval(calculateTime, 1000);
        calculateTime(); 
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen font-sans bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative flex flex-col justify-between">
            <div className="fixed inset-0 z-0 pointer-events-none">
                 <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #4A90E2 0%, #93C5FD 45%, #FFFFFF 100%)' }}></div>
                 <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.5) 100%)' }}></div>
            </div>

            <Navbar />

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-10">
                <div className="text-center space-y-4 mb-10">
                    <h1 className="text-4xl md:text-6xl font-serif text-white font-medium drop-shadow-sm tracking-tight">
                        Street Research
                    </h1>
                </div>

                <div className="relative mb-8 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <DotMatrixClock timeLeft={timeLeft} />
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <p className="text-blue-50/80 text-sm font-mono tracking-wider uppercase">
                        TARGET: 22 DEC 2025 // 15:00 UTC
                    </p>
                </div>
            </main>

            <footer className="w-full border-t border-gray-100 bg-white relative z-10">
                <PhysicsFooter />
                <div className="max-w-[1100px] mx-auto px-8 pb-12 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2 space-y-4">
                           <div className="flex items-center gap-2">
                               <div className="relative h-6 w-24">
                                  <img src="/street-logo2.png" alt="Street" className="h-6 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                               </div>
                           </div>
                           <p className="text-xs text-gray-500 leading-relaxed max-w-xs font-sans">
                              Street turns private equity into liquid, programmable digital assets through the ERC-S standard.
                           </p>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-sans">Platform</h4>
                           <ul className="space-y-2 text-xs text-gray-500 font-sans">
                              <li><a href="#" className="hover:text-blue-600 transition">Governance</a></li>
                              <li><a href="#" className="hover:text-blue-600 transition">Treasury</a></li>
                              <li><a href="https://ERC-S.com" target="_blank" className="hover:text-blue-600 transition">Documentation</a></li>
                           </ul>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-sans">Legal</h4>
                           <ul className="space-y-2 text-xs text-gray-500 font-sans">
                              <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
                              <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
                              <li><a href="#" className="hover:text-blue-600 transition">Cookie Policy</a></li>
                           </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-gray-400 font-sans">© 2025 Street Labs. All rights reserved.</p>
                        <div className="flex gap-6 text-gray-400">
                            <a href="https://x.com/StreetFDN" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">
                                <Twitter size={16} />
                            </a>
                            <a href="#" className="hover:text-blue-600 transition">
                                <Globe size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
