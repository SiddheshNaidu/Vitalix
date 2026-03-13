"use client";

import { useState } from "react";
import { Search, UserPlus, FileText, ClipboardList, Activity, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock data
const recentPatients = [
  { id: 1, name: "Aarav Sharma", age: 34, lastVisit: "2026-03-10", diagnosis: "Hypertension" },
  { id: 2, name: "Priya Patel", age: 28, lastVisit: "2026-03-12", diagnosis: "Migraine" },
  { id: 3, name: "Rohan Verma", age: 45, lastVisit: "2026-03-13", diagnosis: "Diabetes Type 2" },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/patient/1`); // Dummy navigate to patient profile for any search
    }
  };

  return (
    <div className="min-h-screen bg-[#03050f] text-[#e8edf5] p-6 lg:p-10 font-body flex flex-col md:flex-row gap-8">
      {/* Sidebar/Navigation */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-teal" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-bone-white">Vitalix</h1>
            <p className="text-xs text-steel-gray font-mono tracking-widest uppercase">Doctor Portal</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Link href="/doctor/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal/10 text-teal border border-teal/20 transition-all font-medium">
            <ClipboardList className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-steel-gray hover:text-bone-white hover:bg-bg-deep transition-all font-medium">
            <UserPlus className="w-5 h-5" />
            Register Patient
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-steel-gray hover:text-bone-white hover:bg-bg-deep transition-all font-medium">
            <FileText className="w-5 h-5" />
            My Appointments
          </Link>
        </nav>
        
        <div className="mt-auto pt-10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-steel-gray/20 bg-bg-deep/50 mt-10">
            <div className="w-8 h-8 rounded-full bg-steel-gray/20 flex items-center justify-center">
              <User className="w-4 h-4 text-bone-white" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-bone-white truncate">Dr. Rajesh Kumar</p>
               <p className="text-xs text-steel-gray truncate">Cardiologist</p>
            </div>
          </div>
          <Link href="/login" className="block text-center text-sm text-steel-gray hover:text-red-400 transition-colors mt-4">
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-bone-white">Good Morning, Dr. Kumar</h2>
            <p className="text-steel-gray text-sm mt-1">Here is your schedule and patient overview for today.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-gray" />
            <input
              type="text"
              placeholder="Search patient by ID or name..."
              className="w-full bg-bg-deep border border-steel-gray/30 rounded-full py-2.5 pl-10 pr-4 text-sm text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Today's Appointments", value: "12", trend: "+2 from yesterday" },
            { label: "Pending Reports", value: "4", trend: "Needs review" },
            { label: "Total Patients", value: "842", trend: "This month" }
          ].map((stat, i) => (
             <div key={i} className="bg-bg-glass backdrop-blur-md border border-steel-gray/20 rounded-2xl p-5 hover:border-teal/30 transition-colors group cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-teal/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <p className="text-sm text-steel-gray font-medium">{stat.label}</p>
               <h3 className="text-3xl font-display font-bold text-bone-white mt-1 mb-2">{stat.value}</h3>
               <p className="text-xs text-teal">{stat.trend}</p>
             </div>
          ))}
        </div>

        {/* Recent Patients */}
        <section>
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold font-display text-bone-white">Recent Patients</h3>
             <button className="text-sm text-teal hover:text-teal-dim flex items-center gap-1 transition-colors">
               View All <ArrowRight className="w-4 h-4" />
             </button>
           </div>
           
           <div className="bg-bg-deep border border-steel-gray/20 rounded-2xl overflow-hidden">
             <div className="grid grid-cols-12 gap-4 p-4 border-b border-steel-gray/20 text-xs font-mono text-steel-gray bg-black/20">
               <div className="col-span-1">ID</div>
               <div className="col-span-4">PATIENT NAME</div>
               <div className="col-span-2">AGE</div>
               <div className="col-span-3">LAST DIAGNOSIS</div>
               <div className="col-span-2 text-right">ACTION</div>
             </div>
             
             <div className="divide-y divide-steel-gray/10">
               {recentPatients.map((p) => (
                 <div key={p.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                    <div className="col-span-1 text-xs font-mono text-steel-gray">#{String(p.id).padStart(3, '0')}</div>
                    <div className="col-span-4 font-medium text-bone-white">{p.name}</div>
                    <div className="col-span-2 text-sm text-steel-gray">{p.age} yrs</div>
                    <div className="col-span-3 text-sm text-steel-gray">
                      <span className="px-2 py-1 rounded bg-teal/10 text-teal text-xs border border-teal/20">{p.diagnosis}</span>
                    </div>
                    <div className="col-span-2 text-right">
                       <Link href={`/patient/${p.id}`} className="text-sm font-medium text-teal hover:text-teal-dim opacity-0 group-hover:opacity-100 transition-opacity">
                         View Profile
                       </Link>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </section>

      </main>
    </div>
  );
}
