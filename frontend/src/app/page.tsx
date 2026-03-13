"use client";

import { useEffect, useRef, Suspense } from "react";
import dynamic from 'next/dynamic';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Activity, ChevronDown } from "lucide-react";
import { Html } from "@react-three/drei";

const ParticleUniverse = dynamic(
  () => import('@/components/landing/ParticleUniverse'),
  { ssr: false }
);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  
  // UI layer refs for GSAP fades
  const heroRef = useRef<HTMLDivElement>(null);
  const unifiedRef = useRef<HTMLDivElement>(null);
  const diagnosisRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);
  const liveMapRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=400%",
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;

        // Progress 0.00 -> 0.15 (Hero fade out)
        if (heroRef.current) {
          heroRef.current.style.opacity = String(p < 0.08 ? 1 : p > 0.15 ? 0 : 1 - (p - 0.08) / 0.07);
          heroRef.current.style.pointerEvents = p > 0.15 ? "none" : "auto";
        }

        // Progress 0.20 -> 0.45 (Unified text)
        if (unifiedRef.current) {
          unifiedRef.current.style.opacity = String(p < 0.2 ? 0 : p < 0.35 ? (p - 0.2) / 0.15 : p < 0.45 ? 1 : p < 0.5 ? 1 - (p - 0.45) / 0.05 : 0);
        }

        // Progress 0.45 -> 0.65 (Diagnosis cards)
        if (diagnosisRef.current) {
          diagnosisRef.current.style.opacity = String(p < 0.45 ? 0 : p < 0.55 ? (p - 0.45) / 0.1 : p < 0.65 ? 1 : p < 0.70 ? 1 - (p - 0.65) / 0.05 : 0);
        }

        // Progress 0.62 -> 0.90 (Tracking disease)
        if (trackingRef.current) {
          trackingRef.current.style.opacity = String(p < 0.62 ? 0 : p < 0.75 ? (p - 0.62)/0.13 : p < 0.85 ? 1 : p < 0.90 ? 1 - (p - 0.85)/0.05 : 0);
        }

        // Progress 0.90 -> 1.00 (Live Map Hold)
        if (liveMapRef.current) {
          liveMapRef.current.style.opacity = String(p < 0.9 ? 0 : (p - 0.9) / 0.1);
          liveMapRef.current.style.pointerEvents = p > 0.9 ? "auto" : "none";
        }

        // Progress 0.80+ (Pulse rings CSS overlay)
        if (ringsRef.current) {
          ringsRef.current.style.opacity = String(p > 0.8 ? 1 : 0);
        }
      }
    });

  }, []);

  return (
    <main className="bg-bg-void text-bone-white overflow-x-hidden min-h-screen selection:bg-teal selection:text-bg-void">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-[64px] bg-[#03050f]/80 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-24 border-b border-steel-gray/20">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl tracking-wide">⚕ Vitalix</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-steel-gray">
          <span className="hover:text-teal transition-colors cursor-pointer">Overview</span>
          <span className="hover:text-teal transition-colors cursor-pointer">Features</span>
          <span className="hover:text-teal transition-colors cursor-pointer">Heatmap</span>
          <span className="hover:text-teal transition-colors cursor-pointer">Demo</span>
        </div>
        <Link href="/login" className="px-5 py-2 rounded shadow-[0_0_15px_rgba(0,212,170,0.3)] bg-teal-gradient text-bg-void font-bold text-sm hover:opacity-90 transition-opacity">
          Access System
        </Link>
      </nav>

      {/* CONTAINER */}
      <section ref={containerRef} className="particle-scroll-container w-full h-screen bg-[#03050f] relative overflow-hidden flex items-center justify-center">
        
        {/* 3D CANVAS */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.1} color="#ffffff" />
            <Suspense fallback={
              <Html center>
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-teal/20 border-t-teal animate-spin" />
                  <span className="text-teal font-mono text-[12px] whitespace-nowrap">Initializing Particle System...</span>
                </div>
              </Html>
            }>
              <ParticleUniverse scrollProgress={progressRef} />
            </Suspense>
          </Canvas>
        </div>

        {/* UI OVERLAY */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pt-[64px] pointer-events-none">
          
          {/* STATE 0: HERO */}
          <div ref={heroRef} className="absolute text-center flex flex-col items-center pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/30 text-teal text-[10px] font-mono mb-6 backdrop-blur-md tracking-widest">
              <Activity className="w-3 h-3" /> SMART HEALTHCARE PHC 2026
            </div>
            <h1 className="text-6xl md:text-[68px] font-display font-black leading-[1.05] tracking-tight mb-2">
              Every Patient.<br/>
              Every Record.<br/>
              <span
                className="text-transparent"
                style={{
                  background: 'linear-gradient(135deg, #00d4aa, #0ea5e9)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >One Scan.</span>
            </h1>
            <p className="text-[#94a3b8] text-[16px] leading-[1.7] font-body max-w-sm mt-4 mb-8">
              Rural India&apos;s missing healthcare layer.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="px-6 py-3 rounded bg-teal text-bg-void font-bold text-sm hover:bg-teal-dim transition-colors shadow-[0_0_20px_rgba(0,212,170,0.3)]">
                Enter Platform
              </Link>
              <Link href="/signup" className="px-6 py-3 rounded bg-[rgba(255,255,255,0.05)] border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold cursor-pointer">
                Create Account
              </Link>
            </div>
            
            <div className="absolute -bottom-32 flex flex-col items-center justify-center opacity-50 bounce-arrow">
              <p className="text-[10px] font-mono text-teal mb-1">SCROLL</p>
              <ChevronDown className="w-4 h-4 text-teal" />
            </div>
          </div>

          {/* STATE 1: UNIFIED */}
          <div ref={unifiedRef} className="absolute text-center px-4" style={{ opacity: 0 }}>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Every patient. One unified record.</h2>
            <p className="mt-4 text-teal font-mono text-sm tracking-widest">CONNECTING 50+ PHCs ACROSS INDIA</p>
          </div>

          {/* STATE 2: DIAGNOSIS */}
          <div ref={diagnosisRef} className="absolute w-full max-w-5xl flex justify-between px-8" style={{ opacity: 0 }}>
            <div className="bg-[rgba(13,22,40,0.7)] backdrop-blur-lg p-5 rounded-xl border border-[rgba(0,212,170,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-[280px]">
              <p className="font-mono text-[10px] tracking-[2px] text-teal mb-2">DETECTION</p>
              <h4 className="font-bold text-lg">Dengue Detected</h4>
              <p className="text-xs text-steel-gray mt-1 leading-relaxed">Systemic Infection</p>
            </div>
            
            <div className="bg-[rgba(13,22,40,0.7)] backdrop-blur-lg p-5 rounded-xl border border-[rgba(255,68,102,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-[280px]">
              <p className="font-mono text-[10px] tracking-[2px] text-pulse-red mb-2">CARDIAC RISK</p>
              <h4 className="font-bold text-lg">Severe Hypertension</h4>
              <p className="text-xs text-steel-gray mt-1 leading-relaxed">Historical BP alert.</p>
            </div>
          </div>

          {/* STATE 3: TRACKING */}
          <div ref={trackingRef} className="absolute text-center px-4" style={{ opacity: 0 }}>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Tracking disease across India</h2>
            <p className="mt-4 text-steel-gray font-mono text-sm tracking-widest">REAL-TIME SURVEILLANCE. 156 DISTRICTS MONITORED.</p>
          </div>

          {/* STATE 4: LIVE MAP */}
          <div ref={liveMapRef} className="absolute text-center flex flex-col items-center" style={{ opacity: 0 }}>
            <h2 className="text-5xl font-display font-bold mb-8">Live Disease Surveillance</h2>
            <Link href="/login" className="px-8 py-4 rounded-lg bg-teal text-bg-void font-bold text-lg hover:bg-teal-dim transition-colors shadow-[0_0_30px_rgba(0,212,170,0.4)] pointer-events-auto">
              Enter Platform &rarr;
            </Link>
            <p className="mt-8 text-steel-gray text-xs font-mono tracking-widest">SCROLL DOWN TO EXPLORE</p>
          </div>

          {/* HOTSPOT RINGS (CSS OVERLAY) */}
          <div ref={ringsRef} className="absolute inset-0" style={{ opacity: 0 }}>
            <div className="absolute top-[52%] left-[45%] w-8 h-8 rounded-full border border-pulse-red animate-ping" />
            <div className="absolute top-[38%] left-[48%] w-8 h-8 rounded-full border border-pulse-red animate-ping" style={{ animationDelay: '0.2s'}} />
            <div className="absolute top-[47%] left-[57%] w-12 h-12 rounded-full border border-pulse-red animate-ping" style={{ animationDelay: '0.4s'}} />
            <div className="absolute top-[60%] left-[51%] w-8 h-8 rounded-full border border-pulse-red animate-ping" style={{ animationDelay: '0.1s'}} />
            <div className="absolute top-[54%] left-[49%] w-8 h-8 rounded-full border border-pulse-red animate-ping" style={{ animationDelay: '0.3s'}} />
          </div>

        </div>
      </section>

      <footer className="py-12 flex items-center justify-center bg-bg-void border-t border-steel-gray/10">
         <p className="text-steel-gray font-mono text-sm tracking-wide">
           Built with ♥ by <span className="text-teal font-bold">Team Algorythym</span> · Hackathon 2026
         </p>
      </footer>

    </main>
  );
}
