"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Fingerprint, Smartphone } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [role, setRole] = useState("Doctor");

  // Simple password strength calculation
  useEffect(() => {
    let s = 0;
    if (password.length > 5) s += 1;
    if (password.length > 8) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) s += 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStrength(Math.min(3, Math.ceil(s * 0.6))); // Map to 1-3 scale
  }, [password]);

  const strengthLabels = ["Muted", "Weak", "Moderate", "Strong"];

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg-void px-4 py-8">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-teal-glow rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-glow rounded-full blur-[120px] pointer-events-none -z-10 opacity-30" />
      
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="text-[13px] text-steel-gray hover:text-bone-white transition-colors cursor-pointer flex items-center gap-1">
          &larr; Back to Home
        </Link>
      </div>

      <div className="w-full max-w-[480px] bg-bg-glass backdrop-blur-xl border border-steel-gray/30 p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-3 bg-bg-deep border border-steel-gray/30">
            <Fingerprint className="w-8 h-8 text-teal" />
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold text-center mb-2 tracking-tight">Create Your Account</h1>
        <p className="text-steel-gray text-center text-sm mb-8 font-body">Connect to India&apos;s PHC Network using secure credentials.</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-bone-white ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-gray" />
              <input
                type="text"
                placeholder="Dr. Rajesh Kumar"
                className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-10 pr-4 text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-bone-white ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-gray" />
              <input
                type="email"
                placeholder="doctor@phc.in"
                className="w-full bg-bg-deep border border-steel-gray/50 rounded-lg py-3 pl-10 pr-4 text-bone-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-bone-white ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-gray" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 mb-1">
                <div className="flex gap-1 h-[3px] w-full rounded-[2px] overflow-hidden">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 transition-colors duration-300 ${
                        strength >= level
                          ? strength === 1
                            ? "bg-pulse-red"
                            : strength === 2
                            ? "bg-amber"
                            : "bg-teal"
                          : "bg-steel-gray/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-right mt-1 text-steel-gray">
                  Strength: {strengthLabels[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Role Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-bone-white ml-1">Your Role</label>
            <div className="grid grid-cols-3 gap-3">
              {['Admin', 'Doctor', 'Viewer'].map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-1 rounded-lg border text-sm font-medium transition-all ${
                    role === r 
                      ? "border-teal bg-teal/15 text-teal" 
                      : "border-white/10 text-steel-gray hover:border-white/20"
                  }`}
                >
                  {r === 'Admin' && '🏥 '}
                  {r === 'Doctor' && '👨‍⚕️ '}
                  {r === 'Viewer' && '👁 '}
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-bg-deep border-l-[3px] border-l-teal border-y border-r border-steel-gray/20 mt-4">
            <h4 className="text-sm font-medium text-teal flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4" /> MFA Enrollment
            </h4>
            <p className="text-xs text-steel-gray">
              Upon successful registration, you will be prompted to scan a QR code with your authenticator app to enable Multi-Factor Authentication.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-teal hover:bg-teal-dim text-bg-void font-bold py-3 mt-4 rounded-lg transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </form>

        <div className="absolute top-4 left-6 text-sm font-mono text-steel-gray mt-2 opacity-50">
          * Ensure you&apos;re connecting with authorized hardware
        </div>
        <p className="text-center text-sm text-steel-gray mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal hover:text-bone-white transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
