"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [useMfa, setUseMfa] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.startsWith("doctor")) {
      router.push("/doctor/dashboard");
    } else if (email.startsWith("admin")) {
      router.push("/admin/heatmap");
    } else {
      router.push("/patient/1");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg-void px-4">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-teal-glow rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[rgba(255,68,102,0.05)] rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-bg-glass backdrop-blur-xl border border-steel-gray/30 p-8 rounded-2xl shadow-2xl relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full p-4 bg-bg-deep border border-steel-gray/30 shadow-[0_0_20px_rgba(0,212,170,0.2)]">
          <Activity className="w-8 h-8 text-teal" />
        </div>

        <h1 className="text-3xl font-display font-bold text-center mt-4 mb-2 tracking-tight">Vitalix</h1>
        <p className="text-steel-gray text-center mb-8 font-body">Secure Healthcare Access</p>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-bone-white ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-gray" />
              <input
                type="email"
                placeholder="doctor@phc.in"
                className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-10 pr-4 text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-bone-white ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-gray" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-10 pr-10 text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-gray hover:text-bone-white transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded appearance-none border border-steel-gray/50 bg-bg-deep checked:bg-teal checked:border-teal transition-colors focus:ring-1 focus:ring-teal"
                checked={useMfa}
                onChange={(e) => setUseMfa(e.target.checked)}
              />
              <span className="text-steel-gray hover:text-bone-white transition-colors">Use MFA Token</span>
            </label>
            <Link href="/forgot" className="text-teal hover:text-teal-dim transition-colors">
              Forgot password?
            </Link>
          </div>

          {useMfa && (
            <div className="pt-2">
              <label className="text-sm font-medium text-bone-white ml-1 flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber" /> 
                Authenticator Code
              </label>
              <input
                type="text"
                placeholder="123 456"
                className="w-full bg-bg-deep border border-amber/30 rounded-lg py-3 px-4 text-center tracking-[0.5em] text-lg text-bone-white focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
                maxLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full relative overflow-hidden group bg-teal hover:bg-teal-dim text-bg-void font-bold py-3 mt-2 rounded-lg transition-colors cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Secure Sign In 
              <ShieldCheck className="w-5 h-5" />
            </span>
          </button>
        </form>

        <p className="text-center text-sm text-steel-gray mt-6">
          System access requested?{" "}
          <Link href="/signup" className="text-teal hover:text-bone-white transition-colors font-medium">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
