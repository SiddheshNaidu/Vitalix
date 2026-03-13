"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Shield, AlertTriangle, Phone, MapPin, ChevronRight, Activity } from "lucide-react";

interface PatientProfile {
  id: number;
  full_name: string;
  age: number | null;
  gender: string;
  blood_group: string;
  location_id: string;
  emergency_contact: string;
  last_diagnosis: string | null;
  last_visit: string | null;
  doctor: string | null;
  alert: string | null;
}

interface ScanResponse {
  valid: boolean;
  access?: string;
  patient?: PatientProfile;
  error?: string;
}

export default function ScanPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const token = searchParams.get("token") || "";

  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<ScanResponse | null>(null);

  useEffect(() => {
    if (!patientId || !token) {
      setState("error");
      setData({ valid: false, error: "Missing patient ID or token" });
      return;
    }

    fetch(`http://127.0.0.1:8000/api/scan/${patientId}?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json: ScanResponse) => {
        if (json.valid) {
          setState("success");
        } else {
          setState("error");
        }
        setData(json);
      })
      .catch(() => {
        setState("error");
        setData({ valid: false, error: "Network error — could not verify health card" });
      });
  }, [patientId, token]);

  /* ─── LOADING STATE ─── */
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#03050f] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin" />
        <p className="font-mono text-[13px] text-[#00d4aa] tracking-wider">
          Verifying Health Card...
        </p>
      </div>
    );
  }

  /* ─── ERROR STATE ─── */
  if (state === "error") {
    return (
      <div className="min-h-screen bg-[#03050f] flex flex-col items-center justify-center gap-4 px-6">
        <AlertTriangle className="w-16 h-16 text-[#f59e0b]" />
        <h1 className="text-2xl font-bold text-[#e8edf5] font-['Syne',sans-serif]">
          Invalid Health Card
        </h1>
        <p className="text-[#4a5568] text-sm text-center max-w-xs">
          {data?.error || "This QR code is invalid or has expired."}
        </p>
      </div>
    );
  }

  /* ─── SUCCESS STATE ─── */
  const p = data!.patient!;

  const formatDate = (d: string | null) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const initials = p.full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#03050f] flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {/* ─── Card ─── */}
        <div className="bg-[#0d1628] border border-[rgba(0,212,170,0.2)] rounded-[20px] p-7 shadow-[0_0_60px_rgba(0,212,170,0.06)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00d4aa]" />
              <span className="text-[#e8edf5] font-bold text-base font-['Syne',sans-serif]">
                Vitalix Health Card
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider text-[#00d4aa] bg-[rgba(0,212,170,0.12)] border border-[rgba(0,212,170,0.3)] animate-[cardPulse_2s_ease-in-out_infinite]">
              <Shield className="w-3 h-3" />
              VERIFIED
            </span>
          </div>

          {/* Avatar + Name */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#0ea5e9] flex items-center justify-center text-[#03050f] font-bold text-xl font-['Syne',sans-serif]">
              {initials}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#e8edf5] font-['Syne',sans-serif]">
                {p.full_name}
              </h2>
              <p className="text-[#4a5568] text-xs font-mono tracking-wider mt-1">
                PHC-{String(p.id).padStart(3, "0")}
              </p>
            </div>
          </div>

          {/* Vitals Row */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "Age", value: p.age ?? "—" },
              { label: "Gender", value: p.gender },
              { label: "Blood", value: p.blood_group },
            ].map((v) => (
              <div
                key={v.label}
                className="bg-[rgba(13,22,40,0.8)] border border-[rgba(255,255,255,0.06)] rounded-xl py-3 text-center"
              >
                <p className="text-[10px] font-mono text-[#4a5568] tracking-wider uppercase mb-1">
                  {v.label}
                </p>
                <p className="text-[#e8edf5] font-bold text-lg font-['Syne',sans-serif]">
                  {v.value}
                </p>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-4 text-sm text-[#4a5568]">
            <MapPin className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-[#e8edf5]">{p.location_id}</span>
          </div>

          {/* Alert (allergies) */}
          {p.alert && (
            <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.3)] rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-[#f59e0b] tracking-wider mb-0.5">
                  ⚠ ALLERGY ALERT
                </p>
                <p className="text-[#e8edf5] text-sm font-semibold">{p.alert}</p>
              </div>
            </div>
          )}

          {/* Last Diagnosis */}
          {p.last_diagnosis && (
            <div className="bg-[rgba(255,68,102,0.06)] border-l-[3px] border-l-[#FF4466] rounded-xl p-4 mb-5">
              <p className="text-[10px] font-mono text-[#FF4466] tracking-wider mb-1">
                ⚠ LAST DIAGNOSIS
              </p>
              <p className="text-[#e8edf5] font-bold text-base">{p.last_diagnosis}</p>
              <p className="text-[#4a5568] text-xs mt-1">
                {p.doctor && `${p.doctor} · `}
                {formatDate(p.last_visit)}
              </p>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Phone className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-[#4a5568]">Emergency:</span>
            <a
              href={`tel:${p.emergency_contact}`}
              className="text-[#f59e0b] font-mono font-bold hover:underline"
            >
              {p.emergency_contact}
            </a>
          </div>

          {/* Full History CTA */}
          <button
            onClick={() =>
              router.push(`/login?redirect=/patient/${p.id}&from=scan`)
            }
            className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#0ea5e9] text-[#03050f] font-bold text-base flex items-center justify-between hover:shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all group"
          >
            <div className="text-left">
              <p className="font-bold">View Full Medical History & Body Map</p>
            </div>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Footer */}
          <p className="text-center text-[10px] text-[#4a5568] mt-5 font-mono">
            Full history requires healthcare staff login
          </p>
        </div>
      </div>

      {/* Pulse keyframe */}
      <style jsx global>{`
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
