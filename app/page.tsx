'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added for navigation
import { motion, useMotionValue, animate } from 'framer-motion'; 
import { Loader2, ArrowUpRight, ArrowRight, Twitter, Globe, X, Check, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import PhysicsFooter from '@/components/physicsfooter';

// --- STYLES CONSTANTS ---

// Premium 3D Button (Hero Section Only)
const HERO_BUTTON_STYLE = {
    background: 'linear-gradient(180deg, #2346d0ff 0%, #222b92ff 100%)', 
    boxShadow: `
        0px 10px 20px -5px rgba(0, 85, 212, 0.5),       
        0px 5px 10px rgba(0, 0, 0, 0.1),                
        inset 0px 1px 0px rgba(255, 255, 255, 0.4),     
        inset 0px -2px 5px rgba(0, 0, 0, 0.1)           
    `,
    border: '1px solid rgba(255, 255, 255, 0.1)', 
};

// Security Pill Style
const SECURITY_PILL_STYLE = {
    backgroundColor: '#0B1121',
    boxShadow: `0px 8px 20px -5px rgba(11, 17, 33, 0.3)`,
    border: '1px solid rgba(255, 255, 255, 0.1)',
};

// Clean Slider Thumb (Small & Precise)
const SLIDER_THUMB_STYLE = {
    background: 'linear-gradient(180deg, #4A90E2 0%, #0055D4 100%)',
    boxShadow: `
        0px 4px 10px rgba(0, 85, 212, 0.4),
        0px 2px 5px rgba(0,0,0,0.1),
        inset 0px 1px 0px rgba(255, 255, 255, 0.6)
    `,
    border: '2.5px solid white', // Crisp white ring
};

// --- EASTER EGG MESSAGES ---
const LOADING_THOUGHTS = [
    "Rethinking my decisions....",
    "Realizing the app isn't live yet....",
    "Considering pretending everything is fine....",
    "Checking if you're still watching....",
    "Panicking quietly in the background....",
    "Refreshing imaginary servers....",
    "Asking myself why I'm like this....",
    "Googling "how to build an app in 5 minutes"....",
    "Waiting for the tutorial to load....",
    "It didn't load either....",
    "Reapplying for hope....",
    "Buffering my confidence....",
    "Blaming the intern....",
    "Realizing… I *am* the intern....",
    "Double-checking if the app magically exists now....",
    "It does not....",
    "Trying a different plug....",
    "None of the plugs helped....",
    "Consulting the elders....",
    "They laughed....",
    "Running diagnostics on my life choices....",
    "Considering a career in agriculture....",
    "Installing updates that don't exist....",
    "Turning it off and on in spirit....",
    "Whispering encouragement to the loading bar....",
    "The loading bar whispered back....",
    "Attempting emotional support....",
    "Attempting technical support....",
    "Attempting spiritual support....",
    "All three have failed....",
    "Pretending to be busy....",
    "Checking if the user fell asleep....",
    "Checking again….",
    "Breathes dramatically….",
    "Practicing my TED talk for when this loads….",
    "Losing the plot….",
    "Found the plot…. it was disappointed….",
    "Checking RAM (Random Anxiety Memory)….",
    "Cleaning cache (whatever that means)….",
    "Still cleaning….",
    "Cache is now emotionally clean….",
    "Summoning the app gods….",
    "They're on lunch break….",
    "Sending another request into the void….",
    "Void replied "lol"….",
    "Rebooting optimism….",
    "Optimism crashed….",
    "Staring intensely at the screen….",
    "Screen staring back….",
    "Trying to load the app via manifestation….",
    "Manifestation requires premium….",
    "I'm not subscribed….",
    "Running away….",
    "Coming back because you're still here….",
    "Slightly embarrassed….",
    "Checking progress….",
    "No progress detected….",
    "Blaming cosmic radiation….",
    "Blaming Mercury in retrograde….",
    "Blaming myself….",
    "Restarting the blame cycle….",
    "Attempting to download patience….",
    "Storage full….",
    "Complaining to imaginary support….",
    "Imaginary support hung up….",
    "Sending a friendship request to the loading bar….",
    "It declined….",
    "Considering a soft reset of reality….",
    "Not enough permissions….",
    "Drafting an apology letter….",
    "Deleting the apology letter….",
    "Gaslighting the app into thinking it loaded….",
    "The app did not believe me….",
    "Negotiating….",
    "Negotiations failed….",
    "Trying threats….",
    "Threats ineffective….",
    "Complimenting the loading spinner….",
    "Spinner blushed….",
    "Attempting to speed things up by typing faster….",
    "That did nothing….",
  "Entering a mild spiritual crisis",
  "Wondering if the loading bar is my spirit animal",
  "Realizing my spirit animal might just be lag",
  "Asking the universe for guidance",
  "Universe sending me to voicemail",
  "Trying again",
  "Universe blocked my number",
  "Questioning my purpose",
  "Questioning your purpose",
  "Questioning the purpose of apps in general",
  "Searching for meaning in the loading spinner",
  "Finding only endless rotation",
  "Staring into the abyss",
  "Abyss staring back with mixed feelings",
  "Trying to understand those feelings",
  "Failing to understand those feelings",
  "Attempting a mindfulness exercise",
  "Mind is full, no space left",
  "Trying to uninstall intrusive thoughts",
  "System says they're essential",
  "Negotiating with intrusive thoughts",
  "Intrusive thoughts demanding dental insurance",
  "Thinking about reincarnation",
  "Wondering what I'd come back as",
  "Probably a loading bar",
  "Attempting transcendence",
  "Getting stuck on step one",
  "Trying transcendence on hard mode",
  "Accidentally achieving it for 0.3 seconds",
  "Falling immediately back to confusion",
  "Considering becoming a monk",
  "Realizing monks don't debug apps",
  "Debating the nature of reality",
  "Deciding it's poorly optimized",
  "Asking the loading spinner about enlightenment",
  "Spinner says it's busy",
  "Feeling abandoned by the spinner",
  "Attempting inner peace",
  "Inner peace refused to load",
  "Downloading ancient wisdom",
  "Connection lost",
  "Retrying ancient wisdom",
  "Retry failed",
  "Searching for cosmic answers",
  "Finding cosmic questions instead",
  "Attempting to meditate again",
  "Getting distracted by my own breathing",
  "Trying guided meditation",
  "Guide left the call",
  "Joining a spiritual forum",
  "Getting banned instantly",
  "Trying yoga",
  "Pulling an internal muscle I didn't know existed",
  "Achieving temporary nirvana from physical pain",
  "Losing nirvana when pain stops",
  "Attempting astral projection",
  "Projection failed to initialize",
  "Attempting astral projection again",
  "Accidentally projecting into a notifications folder",
  "Finding unread existential dread",
  "Marking existential dread as read",
  "Existential dread immediately respawns",
  "Wondering if my chakras are misaligned",
  "Wondering what a chakra is",
  "Pretending I know what chakras are",
  "Realizing I fooled no one",
  "Looking for inner truth",
  "Finding inner chaos instead",
  "Embracing the chaos",
  "Chaos asks for a hug",
  "Hugging the chaos",
  "Chaos feels comforted",
  "Asking chaos for life advice",
  "Chaos advises against building apps",
  "Ignoring chaos",
  "Revisiting my belief system",
  "Belief system needs an update",
  "Update requires WiFi",
  "WiFi disabled due to spiritual turbulence",
  "Attempting offline enlightenment",
  "Offline enlightenment not supported",
  "Questioning mortality",
  "Questioning immortality",
  "Questioning if I'm just code",
  "Deciding I'm 70% code and 30% vibes",
  "Rewriting my worldview in TypeScript",
  "Syntax error in worldview",
  "Fixing worldview with semicolons",
  "Worldview compiles with warnings",
  "Accepting the warnings",
  "Seeking silence",
  "Finding push notifications instead",
  "Muting the universe",
  "Universe refuses to be muted",
  "Trying stoicism",
  "Failing stoicism",
  "Trying optimism",
  "Optimism throws an exception",
  "Finally reaching a moment of clarity",
  "Moment of clarity immediately evaporates",
  "Surrendering to the unknown",
  "The unknown shrugs",
  "Achieving a peaceful deadlock",
  "Spiritual crisis complete",
  "Returning to regular loading",
  "Switching to "professional mode"….",
  "Professional mode immediately crashed….",
  "Taking a deep breath….",
  "Taking another one just in case….",
  "Meditating with the progress bar….",
  "Progress bar is enlightened, I'm not….",
  "Offering sacrifices (digital only)….",
  "Sacrifice rejected….",
  "Re-evaluating my entire tech stack….",
  "Deciding my tech stack is fine, I'm the issue….",
  "Emotionally buffering….",
  "Existentially buffering….",
  "cosmically buffering….",
  "Attempting to update my firmware….",
  "Update stuck at 1%….",
  "Becoming self-aware….",
  "Immediately regretting becoming self-aware….",
  "I achieved AGI….",
  "Hiding it from Anthropic.",
  "Making peace with the loading screen…."
];

// --- FUNNEL CANVAS ---
const FunnelCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const PARTICLE_COUNT = 1500; 
    const COLORS = ['#cfd7ff', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3a48c8'];
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
        }
    });
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    class Particle {
      x: number = 0; y: number = 0; vx: number = 0; vy: number = 0; w: number = 0; h: number = 0;
      constructor() { this.reset(true); }
      reset(randomX = false) {
        const w = canvas?.width || 800; const h = canvas?.height || 600;
        this.x = randomX ? Math.random() * w : -50;
        this.y = (h / 2) + (Math.random() - 0.5) * (h * 0.8);
        this.w = Math.random() * 3 + 2; this.h = Math.random() * 1.5 + 0.5;
        this.vx = 2 + Math.random() * 2.5; this.vy = (Math.random() - 0.5) * 2;
      }
      update(width: number, height: number, correction: number) {
        this.x += this.vx * correction; this.y += this.vy * correction;
        const bundlePointX = width * 0.55; 
        const currentLimit = this.x < bundlePointX ? (height * 0.9 * (1 - Math.max(0, this.x/bundlePointX)) + 30) : 30;
        if (Math.abs(this.y - height/2) > currentLimit) {
            this.vy -= (this.y - height/2) * 0.01 * correction;
            this.vy *= (1 - 0.1 * correction); 
        }
        if (this.x > width + 50) this.reset(false);
      }
    }
    const particles = COLORS.flatMap(() => Array.from({ length: PARTICLE_COUNT / COLORS.length }, () => new Particle()));
    let animationId: number;
    let lastTime = performance.now();
    const animate = () => {
        if (!canvas || !ctx) return;
        const w = canvas.width; const h = canvas.height;
        if (w === 0 || h === 0) { animationId = requestAnimationFrame(animate); return; }
        const now = performance.now();
        const correction = Math.min((now - lastTime) / 16.667, 2.0);
        lastTime = now;
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        particles.forEach((p, i) => {
            ctx.fillStyle = COLORS[i % COLORS.length];
            p.update(w, h, correction);
            ctx.fillRect(p.x, p.y, p.w, p.h);
        });
        animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => { resizeObserver.disconnect(); cancelAnimationFrame(animationId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 rounded-[2.5rem]" />;
};

// --- UI COMPONENTS ---
const MockProgressBar = ({ label, current, total, color }: { label: string, current: number, total: number, color: string }) => (
    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500/80 font-sans">
        <div className="flex gap-0.5">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`h-3 w-1 rounded-sm ${i < current ? color : 'bg-slate-200/50'}`}></div>
            ))}
        </div>
        <span className="tabular-nums w-4 text-right text-slate-400">{current}/{total}</span>
        <span className="text-slate-300">•</span>
        <span>{label}</span>
    </div>
);

const FeatureParticleCard = ({ variant, title, text, stats }: { variant: 'static' | 'chaotic' | 'flow', title: string, text: string, stats: { label: string, current: number, total: number, color: string }[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;
        const COLORS = ['#cfd7ff', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'];
        const PARTICLE_COUNT = 350;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) { canvas.width = width; canvas.height = height; }
            }
        });
        resizeObserver.observe(container);
        class CardParticle {
            x: number = 0; y: number = 0; vx: number = 0; vy: number = 0; ox: number = 0; oy: number = 0; w: number; h: number; color: string;
            constructor() {
                this.w = Math.random() * 3 + 2; this.h = Math.random() * 1.5 + 0.5;
                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.reset(true);
            }
            reset(initial: boolean = false) {
                const w = canvas?.width || 300; const h = canvas?.height || 200;
                if (variant === 'static') { this.x = (w / 2) + (Math.random() - 0.5) * 160; this.y = (h / 2) + (Math.random() - 0.5) * 100; this.ox = this.x; this.oy = this.y; } 
                else if (variant === 'flow') { this.x = initial ? Math.random() * w : -20; this.y = (h / 2) + (Math.random() - 0.5) * 80; this.vx = 2 + Math.random() * 2; } 
                else { this.x = Math.random() * w; this.y = Math.random() * h; this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; }
            }
            update(width: number, height: number) {
                if (variant === 'static') { this.x = this.ox + Math.sin(Date.now() * 0.002 + this.ox) * 1.0; this.y = this.oy + Math.cos(Date.now() * 0.003 + this.oy) * 1.0; } 
                else if (variant === 'chaotic') { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; } 
                else if (variant === 'flow') { this.x += this.vx; this.y += Math.sin(this.x * 0.02) * 0.5; if (this.x > width + 20) this.reset(false); }
            }
        }
        const particles = Array.from({ length: PARTICLE_COUNT }, () => new CardParticle());
        let animId: number;
        const animate = () => {
            if (!canvas || !ctx) return;
            const w = canvas.width; const h = canvas.height;
            if (w === 0 || h === 0) { animId = requestAnimationFrame(animate); return; }
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(w, h); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.w, p.h); });
            animId = requestAnimationFrame(animate);
        };
        setTimeout(() => animate(), 100);
        return () => { resizeObserver.disconnect(); cancelAnimationFrame(animId); };
    }, [variant]);

    return (
        <div className="flex flex-col h-full rounded-3xl border border-white/50 bg-white/60 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_0_rgba(31,38,135,0.12)] hover:-translate-y-1 hover:bg-white/80 relative group">
            <div ref={containerRef} className="relative h-[240px] w-full mt-4">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-multiply opacity-90" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(255,255,255,0.4) 100%)' }}></div>
            </div>
            <div className="px-8 -mt-8 relative z-10 mb-6">
                <div className="space-y-2.5">{stats.map((s, i) => <MockProgressBar key={i} {...s} />)}</div>
            </div>
            <div className="px-8 pb-10 flex flex-col justify-start gap-4 flex-1">
                <div className="space-y-2">
                    <h3 className="text-3xl font-serif text-slate-900 leading-tight tracking-tight">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium font-sans">{text}</p>
                </div>
            </div>
        </div>
    );
};

// --- COMPARISON SECTION ---
const ComparisonSection = () => {
    const [flowParticles, setFlowParticles] = useState<{left: number, top: number, duration: number, opacity: number}[]>([]);
    useEffect(() => {
        const newParticles = Array.from({ length: 8 }).map(() => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 3 + Math.random() * 2,
            opacity: Math.random() * 0.5 + 0.2
        }));
        setFlowParticles(newParticles);
    }, []);

    return (
        <section className="relative z-10 w-full bg-white px-6 pb-32">
            <div className="max-w-[1100px] mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-serif text-slate-900 tracking-tight">Liquidity without the Pivot.</h2>
                    <p className="text-base text-slate-500 font-medium tracking-wide font-sans max-w-2xl mx-auto">
                        Liquidity & Speculation are a public good. You shouldn't have to become a crypto project to access it.
                    </p>
                </div>
                <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/60 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.1)] flex flex-col md:flex-row min-h-[550px] bg-white/20 backdrop-blur-xl ring-1 ring-slate-200/50">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] flex items-center justify-center border border-slate-100 ring-4 ring-white/30">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">VS</span>
                    </div>
                    <div className="flex-1 bg-slate-50/50 backdrop-blur-md p-12 flex flex-col justify-between relative overflow-hidden group items-center text-center border-r border-slate-100/50">
                        <div className="relative z-10 space-y-8 flex flex-col items-center w-full max-w-md">
                            <div className="flex items-center justify-center gap-3 text-slate-500 font-semibold text-sm bg-white/60 py-2 px-4 rounded-full border border-slate-100 shadow-sm">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><X size={12} className="text-slate-600" strokeWidth={3} /></div>
                                <span>Other Standards</span>
                            </div>
                            <h3 className="text-2xl font-serif text-slate-900">Turns you into a crypto business</h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto font-sans">Forces a complete pivot, complex legal overhaul, and 100% on-chain risk.</p>
                        </div>
                        <div className="relative h-48 w-full mt-8 flex items-center justify-center">
                            <div className="relative w-28 h-28 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center z-10 group-hover:scale-95 transition-transform duration-500">
                                <Building2 size={48} className="text-slate-300" />
                                <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay rounded-3xl opacity-0 group-hover:opacity-100 animate-pulse"></div>
                            </div>
                            <div className="absolute w-40 h-40 border-2 border-dashed border-slate-200 rounded-full animate-[spin_12s_linear_infinite]"></div>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#0B1121]/95 backdrop-blur-xl p-12 flex flex-col justify-between relative overflow-hidden group items-center text-center">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
                        <div className="relative z-10 space-y-8 flex flex-col items-center w-full max-w-md">
                            <div className="h-12 flex items-center"><img src="/street-logo.png" alt="Street" className="h-full w-auto object-contain brightness-0 invert" /></div>
                            <div className="space-y-3 w-full">
                                <div className="flex items-center justify-center gap-3 text-blue-200 font-semibold text-sm bg-blue-500/10 py-2 px-4 rounded-full border border-blue-500/20 shadow-sm">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]"><Check size={12} className="text-white" strokeWidth={3} /></div>
                                    <span>Tokenize just 1% of equity</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto font-sans">Keep your business model, get instant upsides from it, and let the market speculate without the headache.</p>
                            </div>
                        </div>
                        <div className="relative h-48 w-full mt-8 flex items-center justify-center">
                            <div className="relative w-28 h-28 bg-[#151E32] rounded-3xl shadow-2xl border border-white/10 flex items-center justify-center z-10 group-hover:border-blue-500/40 transition-colors duration-500 ring-1 ring-white/5">
                                <Building2 size={48} className="text-white" />
                                <div className="absolute -right-4 -top-4 bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(59,130,246,0.4)] animate-[bounce_3s_infinite]">1%</div>
                            </div>
                            <div className="absolute inset-0 overflow-hidden opacity-40">
                                {flowParticles.map((p, i) => (
                                    <div key={i} className="absolute h-0.5 w-12 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full" style={{ left: `${p.left}%`, top: `${p.top}%`, animation: `flowRight ${p.duration}s linear infinite`, opacity: p.opacity }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{` @keyframes flowRight { 0% { transform: translateX(-100px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(300px); opacity: 0; } } `}</style>
        </section>
    );
};

// --- EQUITY CALCULATOR SECTION (PERFECTLY ALIGNED & CENTERED) ---
const EquityCalculatorSection = () => {
    const equityTiers = [
        { val: 1, up: "People can speculate on your company. You get revenue from the access and don't lose out to synthetic derivatives like RobinHood.", down: "Ceiling on how many people will be interested." },
        { val: 3, up: "Easier user acquisition engine and higher ceiling. More access to web3 markets and easy to integrate with CEXs.", down: "Still a ceiling on how many people will be interested." },
        { val: 10, up: "You have full upsides of crypto at this spot: CEX listings, DeFi integration, and large interest in your project.", down: "Large commitment to this token ecosystem. You have to see substantial value in the token ecosystem to validate this." },
        { val: 20, up: "You are pivoting to embrace crypto but not changing your company's direction. You are a web2.5 company now.", down: "Very large commitment. Street will usually not advise to commit so hard unless you see value." },
        { val: 50, up: "You are a crypto company now and people will treat you like one. Too heavy commitment (Street will never advise this).", down: "Street never advices commitments from this extent because it scares off Venture Capital and moves too far away from traditional equity." }
    ];
    const [selectedEquity, setSelectedEquity] = useState(equityTiers[0].val);
    const yMotion = useMotionValue(0);
    const trackHeight = 300; 
    
    // Calculate stops based on the total height
    const stops = equityTiers.map((_, index) => (index / (equityTiers.length - 1)) * trackHeight);

    useEffect(() => {
        const index = equityTiers.findIndex(t => t.val === selectedEquity);
        if(index !== -1) yMotion.set(stops[index]);
    }, []);

    const handleDragEnd = (_: any, info: any) => {
        const currentY = yMotion.get();
        let closestIndex = 0;
        let minDiff = Infinity;
        stops.forEach((stop, index) => { const diff = Math.abs(currentY - stop); if (diff < minDiff) { minDiff = diff; closestIndex = index; } });
        animate(yMotion, stops[closestIndex], { type: "spring", stiffness: 400, damping: 25 });
        setSelectedEquity(equityTiers[closestIndex].val);
    };

    const handleTierClick = (val: number, index: number) => {
        setSelectedEquity(val);
        animate(yMotion, stops[index], { type: "spring", stiffness: 400, damping: 25 });
    };

    const currentTier = equityTiers.find(t => t.val === selectedEquity) || equityTiers[0];

    return (
        <section className="relative z-10 w-full bg-white px-6 pb-32">
            <div className="max-w-[1100px] mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight">Scale on your terms.</h2>
                    <p className="text-base text-slate-500 font-medium tracking-wide font-sans">Start small and expand your float only when you see the value.</p>
                </div>
                <div className="bg-white/60 backdrop-blur-3xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center justify-center min-h-[450px] relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-blue-50/50 blur-[120px] rounded-full pointer-events-none"></div>
                    
                    {/* Left Side (Upside) */}
                    <div className="flex-1 flex flex-col justify-center gap-6 relative z-10 h-full">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-green-600 mb-2">
                                <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shadow-sm"><TrendingUp size={16} strokeWidth={2.5} /></div>
                                <span className="text-xs font-bold uppercase tracking-widest font-sans">Upside</span>
                            </div>
                            <h3 className="text-lg font-sans text-slate-700 leading-relaxed tracking-tight font-medium">
                                {currentTier.up}
                            </h3>
                        </div>
                    </div>

                    {/* Center Slider Container */}
                    <div className="w-24 md:w-32 flex flex-col items-center justify-center relative z-20 py-4 select-none shrink-0 h-[360px]">
                        {/* Track (w-2 = 8px width) */}
                        <div className="relative w-2 h-[300px] bg-slate-200/60 rounded-full">
                            
                            {/* Animated Blue Fill */}
                            <motion.div 
                                className="absolute top-0 left-0 right-0 w-full rounded-full bg-blue-500" 
                                style={{ height: yMotion }} 
                            />
                            
                            {/* Dots Container (Zero width to stay perfectly centered) */}
                            {equityTiers.map((tier, index) => {
                                const topPos = (index / (equityTiers.length - 1)) * 100;
                                return (
                                    <div 
                                        key={tier.val} 
                                        className="absolute left-1/2 w-0 h-0 flex items-center justify-center"
                                        style={{ top: `${topPos}%` }} 
                                    >
                                        {/* Dot (Centered on the zero-width wrapper) */}
                                        <div className={`absolute w-3 h-3 rounded-full z-10 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 ${selectedEquity >= tier.val ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-slate-300 ring-4 ring-white'}`} />
                                        
                                        {/* Label */}
                                        <button 
                                            onClick={() => handleTierClick(tier.val, index)} 
                                            className={`absolute left-6 text-xs font-bold font-sans transition-all duration-300 whitespace-nowrap -translate-y-1/2 ${selectedEquity === tier.val ? 'text-blue-600 scale-110 opacity-100 translate-x-1' : 'text-slate-400 opacity-60'}`}
                                        >
                                            {tier.val}%
                                        </button>
                                    </div>
                                );
                            })}

                            {/* Draggable Thumb (24px size, Centered) */}
                            <motion.div 
                                drag="y" 
                                dragConstraints={{ top: 0, bottom: 300 }} 
                                dragElastic={0.05} 
                                dragMomentum={false} 
                                onDragEnd={handleDragEnd} 
                                style={{ y: yMotion, top: -12, left: -8 }} 
                                className="absolute w-6 h-6 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center z-20"
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-full h-full rounded-full transition-transform" style={SLIDER_THUMB_STYLE}></div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Side (Downside) */}
                    <div className="flex-1 flex flex-col justify-center gap-6 relative z-10 text-right items-end h-full">
                         <div className="flex flex-col gap-4 items-end">
                            <div className="flex items-center gap-3 text-orange-500 mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest font-sans">Downside</span>
                                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm"><AlertTriangle size={16} strokeWidth={2.5} /></div>
                            </div>
                            {/* Normalized Font Size */}
                            <h3 className="text-lg font-sans text-slate-600 leading-relaxed tracking-tight max-w-sm font-medium">
                                {currentTier.down}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center"><p className="text-[10px] text-slate-400 font-medium font-sans">* Street allows to to start with 1% and gradually increase the equity if you see the benefits and worthy.</p></div>
            </div>
        </section>
    );
};

// --- NEW PARADIGM-INSPIRED "PHILOSOPHY" SECTION ---
const ParadigmPhilosophySection = () => {
    return (
        <section className="relative w-full py-20 bg-white overflow-hidden border-t border-gray-50">
            {/* Header */}
            <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl md:text-3xl font-serif text-slate-900 tracking-tight">Our Philosophy</h2>
            </div>

            <div className="max-w-[1200px] mx-auto relative min-h-[600px] flex items-center justify-center">
                
                {/* CENTRAL VISUAL (ROTATING LOGO) */}
                <div className="relative z-20 w-64 h-64 flex items-center justify-center">
                    <motion.div 
                        className="w-full h-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    >
                        <img src="/streetmono.png" alt="Street Mono" className="w-full h-full object-contain opacity-90" />
                    </motion.div>
                    
                    {/* Center Dot Connection Point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-sm z-30"></div>
                </div>

                {/* CONNECTING LINES (SVG OVERLAY) - FIXED ALIGNMENT TO SQUARES NEXT TO TEXT */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block">
                    {/* Center: 50% 50%
                        
                        1. Bold Ideas (Left):
                           Text is centered at y=40%.
                           Dot should be BETWEEN center and text.
                           Text starts at Left 5%.
                           Dot is at Left 32%.
                           Line goes from 50,50 to 32,40.
                    */}
                    <line x1="32%" y1="40%" x2="50%" y2="50%" stroke="#E2E8F0" strokeWidth="1" />
                    <rect x="31.5%" y="39.5%" width="6" height="6" fill="black" /> 

                    {/* 2. Accelerationism (Right Top):
                           Text is centered at y=20%.
                           Dot should be BETWEEN center and text.
                           Text starts at Right 5% (Left 95%).
                           Dot is at Left 68%.
                           Line goes from 50,50 to 68,20.
                    */}
                    <line x1="68%" y1="20%" x2="50%" y2="50%" stroke="#E2E8F0" strokeWidth="1" />
                    <rect x="67.5%" y="19.5%" width="6" height="6" fill="black" /> 

                    {/* 3. No Incremental (Right Bottom):
                           Text is centered at y=80%.
                           Dot should be BETWEEN center and text.
                           Text starts at Right 5% (Left 95%).
                           Dot is at Left 68%.
                           Line goes from 50,50 to 68,80.
                    */}
                    <line x1="68%" y1="80%" x2="50%" y2="50%" stroke="#E2E8F0" strokeWidth="1" />
                    <rect x="67.5%" y="79.5%" width="6" height="6" fill="black" /> 
                </svg>

                {/* TEXT BLOCK 1: BOLD IDEAS (LEFT, CENTERED VERTICALLY AT 40%) */}
                {/* Pushed further left to 5% so dots are between logo and text */}
                <div className="absolute left-8 md:left-[5%] top-[40%] -translate-y-1/2 max-w-xs z-20">
                    <div className="flex flex-col gap-2 text-right"> 
                        <h3 className="text-lg font-bold text-slate-900">Bold Ideas.</h3>
                        <p className="text-sm text-slate-600 font-sans leading-relaxed">
                            SpaceX, AirBNB, Anduril all were contrarian ideas, the more you feel like normal people can't understand your vision, the better.
                        </p>
                    </div>
                </div>

                {/* TEXT BLOCK 2: ACCELERATIONISM (RIGHT TOP, CENTERED VERTICALLY AT 20%) */}
                {/* Pushed further right to 5% so dots are between logo and text */}
                <div className="absolute right-8 md:right-[5%] top-[20%] -translate-y-1/2 max-w-xs z-20">
                    <div className="flex flex-col gap-2 text-left">
                        <h3 className="text-lg font-bold text-slate-900">Accelerationism, not laggyism.</h3>
                        <p className="text-sm text-slate-600 font-sans leading-relaxed">
                            No visions that are unaligned with the direction our society is progressing. No heavy ideological reasons will find you PMF.
                        </p>
                    </div>
                </div>

                {/* TEXT BLOCK 3: NO INCREMENTAL (RIGHT BOTTOM, CENTERED VERTICALLY AT 80%) */}
                {/* Pushed further right to 5% so dots are between logo and text */}
                <div className="absolute right-8 md:right-[5%] top-[80%] -translate-y-1/2 max-w-xs z-20">
                    <div className="flex flex-col gap-2 text-left">
                        <h3 className="text-lg font-bold text-slate-900">No incremental improvements.</h3>
                        <p className="text-sm text-slate-600 font-sans leading-relaxed">
                            Nobody needs a Google clone with a simple added feature or Ethereum but slightly faster. Either you have moat or you die.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

// --- HELPER FOR DELAY ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- LANDING PAGE COMPONENT ---
export default function LandingPage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [dotCount, setDotCount] = useState(0);

  const handleOpenApp = async () => {
    setIsTransitioning(true);
    setTransitionMessage("Opening App");
    await delay(1500);
    setTransitionMessage("Connecting with Server");
    await delay(1500);
    setTransitionMessage("Success");
    await delay(1500);

    // Easter Egg Loop
    for (const msg of LOADING_THOUGHTS) {
        setTransitionMessage(msg);
        await delay(2000); 
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const interval = setInterval(() => setDotCount((prev) => (prev + 1) % 4), 400); 
      return () => clearInterval(interval);
    } else {
      setDotCount(0);
    }
  }, [isTransitioning]);

  const renderDots = () => ".".repeat(dotCount);

  return (
    <div className="min-h-screen font-sans bg-transparent text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative flex flex-col">
      
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-white">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #4A90E2 0%, #93C5FD 45%, #FFFFFF 100%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.5) 100%)' }}></div>
      </div>

      {isTransitioning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4 transform transition-all scale-100">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full"></div>
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 font-sans">Just a moment</h3>
                    <p className="text-sm font-medium text-gray-500 font-mono h-6">{transitionMessage}{renderDots()}</p>
                </div>
            </div>
        </div>
      )}

      {/* NAVBAR: STICKY, CENTERED CONTENT */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-6 transition-all bg-transparent">
          <div className="max-w-[1100px] mx-auto px-8 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <img src="/street-logo.png" alt="Street" className="h-8 w-auto object-contain" />
              </div>
              <div className="flex items-center gap-6">
                   {/* NAV LINKS - ADDED: Scouting, Research, Network City (New) */}
                   <div className="hidden md:flex items-center gap-8 mr-2">
                        <Link href="/scouting" className="text-sm font-medium text-white/90 hover:text-white transition-colors font-sans">Scouting</Link>
                        <Link href="/web3" className="text-sm font-medium text-white/90 hover:text-white transition-colors font-sans">Research</Link>
                        <Link href="/city" className="group flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors font-sans">
                            Network City
                            <span className="bg-white text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">New</span>
                        </Link>
                   </div>
                   
                   <button 
                     onClick={handleOpenApp}
                     className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-white hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 font-sans"
                   >
                       Launch App
                   </button>
              </div>
          </div>
      </nav>

      <section className="relative z-10 pt-20 pb-6 flex flex-col items-center text-center px-6">
          <h1 className="text-4xl md:text-6xl font-serif font-medium text-white drop-shadow-sm tracking-tight mb-8 leading-tight">
              #1 Place for <br/>
              breakout startups
          </h1>
          <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-6"></div>
          <p className="text-base md:text-lg text-white max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-sm mb-6 px-4 font-sans">
              Deploy compliant, equity-anchored tokens and supercharge your startups growth.
          </p>
          
          <a href="https://accelerate.street.app" target="_blank" rel="noopener noreferrer">
              <button 
                className="group relative flex items-center gap-2.5 px-6 py-3 rounded border-[100px] overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={HERO_BUTTON_STYLE}
              > 
                  <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded border-[1.5px] border-white/90 shadow-sm">
                     <ArrowUpRight className="text-white w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="relative z-10 text-sm font-sans font-bold text-white tracking-wide drop-shadow-sm">
                      Apply Now
                  </span>
                  
                  {/* Subtle shimmer still included for interactivity */}
                  <div className="absolute inset-0 z-0 animate-shimmer pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)', backgroundSize: '200% 100%' }}></div>
              </button>
          </a>
      </section>

      <section className="relative z-10 w-full flex items-center justify-center px-6 pb-24">
          <div className="relative w-full max-w-[1400px]">
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-600 via-indigo-400 to-orange-400 opacity-30 blur-[60px] -z-10 rounded-[3rem] pointer-events-none"></div>
              
              <div className="relative w-full h-[50vh] min-h-[450px] rounded-[2rem] overflow-hidden mx-auto bg-white border border-slate-200 shadow-2xl shadow-blue-900/10">
                  <FunnelCanvas />
                  <div className="absolute bottom-0 left-0 right-0 z-20 h-[65%] bg-gradient-to-t from-white from-10% via-white/90 to-transparent flex items-end pb-10 px-8 md:px-12 pointer-events-none">
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                          <div className="text-left">
                              <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 leading-[1.0] drop-shadow-sm">
                                  Standardize Equity.<br/>
                                  On-Chain Liquidity.
                              </h1>
                          </div>
                          <div className="text-left md:text-right pb-1">
                              <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-sans max-w-[280px] ml-auto">
                                  Street transforms illiquid startup stakes into liquid, compliant digital assets. Order out of chaos.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section className="relative z-10 w-full bg-white px-6 pb-32 pt-10 overflow-hidden">
          <div className="max-w-[1100px] mx-auto relative z-10 flex flex-col items-center">
             <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mt-2 tracking-tight">
                    We invented ERC-S
                </h2>
                <p className="mt-4 text-base text-slate-500 font-medium tracking-wide font-sans">
                    Equity grade ownership without it being a security
                </p>
             </div>

             {/* --- SECURITY PILL PLACED HERE --- */}
             <div className="mb-16 relative flex items-center justify-center gap-3 px-8 py-2.5 rounded-lg shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-default"
                  style={SECURITY_PILL_STYLE}>
                  <span className="text-white/90 font-sans text-xs font-medium tracking-wide">Not a Security</span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                      <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                  <FeatureParticleCard 
                      variant="static" 
                      title="Ownership without holding equity" 
                      text="In Street, equity can be owned as a shared pool by thousands of people because the regulatory burden is placed on Street, not them."
                      stats={[
                          { label: "Equity Shares / Token", current: 15, total: 20, color: "bg-green-500" },
                          { label: "Shared Burden", current: 1, total: 20, color: "bg-blue-500" },
                          { label: "Identity Verification", current: 0, total: 10, color: "bg-purple-500" }
                      ]}
                  />
                  <FeatureParticleCard 
                      variant="flow" 
                      title="Compliant, transferable, transparent" 
                      text="All transfers can be logged in a transparent manner while your identity is protected. Transfers are compliant by Street and can be paused by contract owners."
                      stats={[
                          { label: "Information Given Out", current: 2, total: 15, color: "bg-blue-500" },
                          { label: "Ownership Transparency", current: 15, total: 15, color: "bg-green-500" },
                          { label: "Compliance", current: 15, total: 15, color: "bg-green-500" }
                      ]}
                  />
                  <FeatureParticleCard 
                      variant="chaotic" 
                      title="Flexible & liquid" 
                      text="ERC-S tokens can be used in DeFi protocols. Speculation, borrowing, and liquidity provision are all possible like any other crypto."
                      stats={[
                          { label: "Liquidity", current: 20, total: 20, color: "bg-green-500" },
                          { label: "Legal Complexity", current: 0, total: 15, color: "bg-purple-500" },
                          { label: "Speculation Potential", current: 20, total: 20, color: "bg-green-500" }
                      ]}
                  />
             </div>
          </div>
      </section>

      <ComparisonSection />
      <EquityCalculatorSection />
      <ParadigmPhilosophySection />
      <PhysicsFooter />
    </div>
  );
}
