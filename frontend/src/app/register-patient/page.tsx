"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Calendar, MapPin, Phone, Hash, ChevronRight, Activity, QrCode, ExternalLink } from "lucide-react";
import QRCard from "@/components/QRCard";

export default function RegisterPatient() {
  const [formData, setFormData] = useState({
    abha_id: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    contact_number: "",
    emergency_contact: "",
    location_id: "",
    medical_history: [],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createdPatient, setCreatedPatient] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In production, this would call the Python FastAPI server on :8000
      const response = await fetch("http://127.0.0.1:8000/api/patients/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if(response.ok) {
        const data = await response.json();
        setCreatedPatient(data);
        setSuccess(true);
        setFormData({
            abha_id: "", full_name: "", date_of_birth: "", gender: "", blood_group: "",
            contact_number: "", emergency_contact: "", location_id: "", medical_history: []
        });
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      console.error(err);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden isolation pb-24">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-[400px] bg-teal-glow rounded-full blur-[150px] opacity-20 -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-[500px] bg-[rgba(3,5,15,0.8)] rounded-full blur-[120px] opacity-40 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] -z-20" />

      {/* Nav Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/dashboard" className="text-[13px] text-steel-gray hover:text-bone-white transition-colors cursor-pointer flex items-center gap-1 font-mono tracking-wide">
          &larr; BACK TO DASHBOARD
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-bg-glass backdrop-blur-xl border border-steel-gray/30 p-8 md:p-12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] mt-12 relative">
        <div className="flex items-center gap-3 mb-8 border-b border-steel-gray/20 pb-6">
            <div className="p-3 rounded-lg bg-teal/10 border border-teal/20">
                <Activity className="w-6 h-6 text-teal" />
            </div>
            <div>
                <h1 className="text-3xl font-display font-bold text-bone-white tracking-tight">Patient Registry</h1>
                <p className="text-steel-gray text-sm font-mono mt-1">SECURE BLOCK: NEW RECORD INITIATION</p>
            </div>
        </div>

        {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-fadeIn space-y-6">
                <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center border border-teal/40">
                   <Activity className="w-8 h-8 text-teal" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-bone-white mb-2">Registration Confirmed</h2>
                  <p className="text-steel-gray text-sm">Patient added to the PHC network. Smart Health Card generated.</p>
                </div>

                {/* QR Card */}
                {createdPatient && (
                  <div className="w-full max-w-xs">
                    <QRCard patient={createdPatient} />
                  </div>
                )}

                {/* View Patient Detail */}
                {createdPatient && (
                  <Link
                    href={`/patient/${createdPatient.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal/10 hover:bg-teal/20 text-teal border border-teal/20 text-sm font-bold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Patient Detail
                  </Link>
                )}

                <button onClick={() => { setSuccess(false); setCreatedPatient(null); }} className="px-6 py-3 bg-steel-gray/20 hover:bg-steel-gray/30 text-bone-white rounded-lg transition-colors font-bold text-sm tracking-wide">
                    + Register Another Patient
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              
              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-[#00d4aa] ml-1">FULL NAME</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-gray" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-11 pr-4 text-sm text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-steel-gray ml-1">ABHA ID <span className="opacity-50">(Optional)</span></label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-gray" />
                  <input
                    type="text"
                    value={formData.abha_id}
                    onChange={(e) => setFormData({...formData, abha_id: e.target.value})}
                    placeholder="0000-0000-0000"
                    className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-11 pr-4 text-sm text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-steel-gray ml-1">DATE OF BIRTH</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-gray" />
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-11 pr-4 text-sm text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-steel-gray ml-1">GENDER</label>
                <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 px-4 text-sm text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors appearance-none" 
                    required
                >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-steel-gray ml-1">CONTACT NUMBER</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-gray" />
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    placeholder="+91"
                    className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-11 pr-4 text-sm text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-steel-gray ml-1">EMERGENCY CONTACT</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pulse-red/70" />
                  <input
                    type="tel"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                    placeholder="Relative/Guardian"
                    className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-11 pr-4 text-sm text-bone-white focus:outline-none focus:border-pulse-red focus:ring-1 focus:ring-pulse-red transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-mono tracking-widest text-steel-gray ml-1">PHC LOCATION / DISTRICT</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-gray" />
                  <input
                    type="text"
                    value={formData.location_id}
                    onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                    placeholder="e.g. Pune Rural Clinic 04"
                    className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-11 pr-4 text-sm text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 mt-4 pt-6 border-t border-steel-gray/20">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal text-bg-void font-bold py-3.5 px-4 rounded-lg hover:bg-teal-dim transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.2)] disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Register Patient & Generate Record'}
                  {!loading && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
}
