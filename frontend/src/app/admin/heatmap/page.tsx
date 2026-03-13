"use client";

import dynamic from "next/dynamic";
import { Activity, ShieldAlert, Users, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Dynamically import Map component (ssr: false) since react-leaflet needs window
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-bg-deep rounded-2xl border border-steel-gray/20">
      <div className="w-10 h-10 rounded-full border-2 border-teal border-t-transparent animate-spin mb-4" />
      <span className="text-teal font-mono tracking-widest text-xs">INITIALIZING SATELLITE...</span>
    </div>
  ),
});

export default function HeatmapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#03050f] text-[#e8edf5] p-6 lg:p-10 font-body flex flex-col h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-bg-deep border border-steel-gray/20 flex items-center justify-center text-steel-gray hover:text-bone-white hover:border-teal/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-bone-white">Epidemiological Heatmap</h1>
            <p className="text-steel-gray text-sm mt-1">Real-time disease outbreak monitoring (Admin)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <span className="flex items-center gap-2 text-xs font-mono text-teal bg-teal/10 px-3 py-1.5 rounded-full border border-teal/20">
             <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />Live Data Active
           </span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Map Area */}
        <div className="flex-1 rounded-2xl overflow-hidden relative border border-steel-gray/20 shadow-2xl h-[50vh] lg:h-auto">
           <MapView />
        </div>

        {/* Intelligence Side Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
           {/* Stats */}
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-bg-deep border border-steel-gray/20 rounded-xl p-4">
                <ShieldAlert className="w-5 h-5 text-[#FF3366] mb-2" />
                <p className="text-2xl font-bold font-display text-bone-white">12</p>
                <p className="text-xs text-steel-gray">Active Outbreaks</p>
             </div>
             <div className="bg-bg-deep border border-steel-gray/20 rounded-xl p-4">
                <Users className="w-5 h-5 text-teal mb-2" />
                <p className="text-2xl font-bold font-display text-bone-white">4.2k</p>
                <p className="text-xs text-steel-gray">Affected Patients</p>
             </div>
           </div>

           {/* Alert Feed */}
           <div className="bg-bg-glass backdrop-blur-md border border-steel-gray/20 rounded-xl p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <h3 className="text-sm font-mono tracking-widest text-steel-gray mb-4 shrink-0 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> 
                INTELLIGENCE FEED
              </h3>
              
              <div className="space-y-4 flex-1">
                 {[
                   { region: "Mumbai, MH", disease: "Dengue", severity: "high", time: "10 min ago", delta: "+15% cases" },
                   { region: "Delhi", disease: "Typhoid", severity: "medium", time: "1 hr ago", delta: "Stable" },
                   { region: "Kochi, KL", disease: "Malaria", severity: "low", time: "2 hrs ago", delta: "-5% cases" },
                   { region: "Chennai, KL", disease: "Dengue", severity: "high", time: "5 hrs ago", delta: "+22% cases" },
                 ].map((alert, i) => (
                    <div key={i} className="p-3 rounded-lg bg-black/20 border border-[rgba(255,255,255,0.03)] hover:border-teal/30 transition-colors cursor-pointer group">
                       <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-sm text-bone-white">{alert.region}</span>
                         <span className="text-[10px] text-steel-gray">{alert.time}</span>
                       </div>
                       <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-sm border ${
                             alert.severity === 'high' ? 'text-[#ff4466] bg-[#ff4466]/10 border-[#ff4466]/20' : 
                             alert.severity === 'medium' ? 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20' : 
                             'text-teal bg-teal/10 border-teal/20'
                          }`}>
                            {alert.disease}
                          </span>
                          <span className="text-xs font-mono text-steel-gray group-hover:text-bone-white transition-colors">{alert.delta}</span>
                       </div>
                    </div>
                 ))}
                 
                 <div className="pt-4 mt-auto text-center hidden lg:block">
                    <button className="text-xs text-teal hover:text-teal-dim underline underline-offset-2 transition-colors">
                      View Full Intelligence Report
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}
