"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { DiagnosisEntry } from "@/components/AnatomyViewer";
import { ArrowLeft, Activity, Layers, ChevronRight } from "lucide-react";

/* Dynamic import — SSR disabled for Three.js */
const AnatomyViewer = dynamic(() => import("@/components/AnatomyViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#03050f]">
      <div className="w-10 h-10 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin" />
    </div>
  ),
});

interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  date_of_visit: string;
  diagnosis: string;
  symptoms: string[];
  prescription: { medicine: string; dosage: string }[];
  notes: string | null;
}

interface Patient {
  id: number;
  full_name: string;
  records: MedicalRecord[];
}

const DIAGNOSIS_COLORS: Record<string, number> = {
  dengue: 0xff4444,
  malaria: 0xff8c00,
  typhoid: 0xff8c00,
  hypertension: 0xff3366,
  diabetes: 0xffd700,
  pneumonia: 0x4488ff,
  tuberculosis: 0x4488ff,
  migraine: 0x9966ff,
  "knee fracture": 0xf59e0b,
  anemia: 0x00d4aa,
  default: 0x00d4aa,
};

const DIAGNOSIS_REGIONS: Record<string, string[]> = {
  dengue: ["head", "torso", "left_leg", "right_leg"],
  malaria: ["liver_spleen", "abdomen"],
  typhoid: ["abdomen", "liver_spleen"],
  hypertension: ["heart"],
  diabetes: ["pancreas", "abdomen"],
  pneumonia: ["left_lung", "right_lung"],
  tuberculosis: ["left_lung", "right_lung"],
  migraine: ["head"],
  "knee fracture": ["left_knee", "right_knee"],
  arthritis: ["left_knee", "right_knee", "left_arm", "right_arm"],
  anemia: ["heart", "torso"],
};

const REGION_LABELS: Record<string, string> = {
  heart: "❤️ Cardiac",
  left_lung: "🫁 Respiratory",
  right_lung: "🫁 Respiratory",
  head: "🧠 Neurological",
  abdomen: "🔬 Gastrointestinal",
  liver_spleen: "🔬 Hepatic",
  pancreas: "🧪 Endocrine",
  left_knee: "🦴 Musculoskeletal",
  right_knee: "🦴 Musculoskeletal",
  left_arm: "🦴 Musculoskeletal",
  right_arm: "🦴 Musculoskeletal",
  torso: "🏥 Systemic",
  left_leg: "🏥 Systemic",
  right_leg: "🏥 Systemic",
};

function getDiagnosisColor(d: string): number {
  return DIAGNOSIS_COLORS[d.toLowerCase()] || DIAGNOSIS_COLORS.default;
}

function hexToCSS(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default function AnatomyPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/patients/patients/${patientId}`)
      .then((r) => r.json())
      .then((data) => {
        setPatient(data);
        setLoading(false);
        // Trigger entry anim after data loads
        setTimeout(() => setPageReady(true), 200);
      })
      .catch(() => setLoading(false));
  }, [patientId]);

  const diagnosisMap: DiagnosisEntry[] = useMemo(() => {
    if (!patient) return [];
    return patient.records.map((r) => ({
      diagnosis: r.diagnosis.toLowerCase(),
      date: r.date_of_visit,
      doctor: null,
      color: getDiagnosisColor(r.diagnosis),
    }));
  }, [patient]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03050f] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#03050f] flex items-center justify-center text-[#e8edf5]">
        Patient not found.
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#03050f] text-[#e8edf5] flex flex-col transition-opacity duration-500 ${
        pageReady ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Top Bar */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-3.5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="text-[#4a5568] hover:text-[#e8edf5] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Activity className="w-4 h-4 text-[#00d4aa]" />
        <span className="font-bold font-['Syne',sans-serif] text-sm">
          {patient.full_name}
        </span>
        <span className="text-[#4a5568] text-[10px] font-mono">
          DIAGNOSIS BODY MAP
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left — Layer Control */}
        <div className="lg:w-[200px] border-b lg:border-b-0 lg:border-r border-[rgba(255,255,255,0.06)] p-4 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="text-[10px] font-mono tracking-widest text-[#4a5568]">
              LAYERS
            </h3>
          </div>
          <div className="space-y-2">
            {["Skin", "Organs", "Skeleton"].map((layer) => (
              <div
                key={layer}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-xs text-[#e8edf5]"
              >
                <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />
                {layer}
              </div>
            ))}
          </div>

          {/* Diagnosis Legend */}
          <h3 className="text-[10px] font-mono tracking-widest text-[#4a5568] mt-6 mb-3">
            LEGEND
          </h3>
          <div className="space-y-1.5">
            {diagnosisMap.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px]"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: hexToCSS(entry.color) }}
                />
                <span className="capitalize truncate">{entry.diagnosis}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center — 3D Viewer */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <AnatomyViewer
            diagnosisMap={diagnosisMap}
            autoHighlight
            hoveredRegion={hoveredRegion}
            onRegionClick={(region) => {
              // Find the record matching this region
              const match = patient.records.find((r) => {
                const regions = DIAGNOSIS_REGIONS[r.diagnosis.toLowerCase()] || [];
                return regions.includes(region);
              });
              if (match) setSelectedRecord(match);
            }}
          />

          {/* Instruction overlay */}
          {pageReady && diagnosisMap.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[rgba(0,0,0,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] text-[11px] text-[#4a5568] font-mono animate-[fadeOut_3s_2s_forwards]">
              Click any body part to inspect
            </div>
          )}
        </div>

        {/* Right — Diagnosis List */}
        <div className="lg:w-[300px] border-t lg:border-t-0 lg:border-l border-[rgba(255,255,255,0.06)] p-4 shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-none">
          <h3 className="text-[10px] font-mono tracking-widest text-[#4a5568] mb-3">
            DIAGNOSES ({patient.records.length})
          </h3>

          {patient.records.length === 0 ? (
            <p className="text-[#4a5568] text-xs">No diagnoses recorded.</p>
          ) : (
            <div className="space-y-2">
              {patient.records.map((rec) => {
                const color = getDiagnosisColor(rec.diagnosis);
                const regions = DIAGNOSIS_REGIONS[rec.diagnosis.toLowerCase()] || [];
                const tag = regions.length > 0 ? REGION_LABELS[regions[0]] : null;

                return (
                  <button
                    key={rec.id}
                    onMouseEnter={() => {
                      if (regions.length > 0) setHoveredRegion(regions[0]);
                    }}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => setSelectedRecord(rec)}
                    className="w-full text-left p-3 rounded-xl bg-[#0d1628] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,212,170,0.25)] transition-all group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: hexToCSS(color) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-[#e8edf5]">
                            {rec.diagnosis}
                          </p>
                          <ChevronRight className="w-3 h-3 text-[#4a5568] group-hover:text-[#00d4aa] transition-colors" />
                        </div>
                        <p className="text-[10px] text-[#4a5568] font-mono mt-0.5">
                          {formatDate(rec.date_of_visit)}
                        </p>
                        {tag && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono bg-[rgba(255,255,255,0.04)] text-[#4a5568] border border-[rgba(255,255,255,0.06)]">
                            {tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setSelectedRecord(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[#0d1628] border-l border-[rgba(0,212,170,0.15)] h-full shadow-2xl p-6 overflow-y-auto animate-[slideIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-[#4a5568] hover:text-[#e8edf5] text-xl"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: hexToCSS(getDiagnosisColor(selectedRecord.diagnosis)),
                }}
              />
              <h2 className="font-bold text-xl font-['Syne',sans-serif]">
                {selectedRecord.diagnosis}
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-mono text-[#4a5568] tracking-wider mb-1">
                  DATE OF VISIT
                </p>
                <p className="text-sm">{formatDate(selectedRecord.date_of_visit)}</p>
              </div>

              {selectedRecord.symptoms.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-[#4a5568] tracking-wider mb-2">
                    SYMPTOMS
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecord.symptoms.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full text-xs bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[#e8edf5]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.prescription.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-[#4a5568] tracking-wider mb-2">
                    PRESCRIPTION
                  </p>
                  <div className="space-y-2">
                    {selectedRecord.prescription.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(0,212,170,0.04)] border border-[rgba(0,212,170,0.1)]"
                      >
                        <span className="text-[#00d4aa] text-lg">💊</span>
                        <div>
                          <p className="text-sm font-bold text-[#e8edf5]">
                            {p.medicine}
                          </p>
                          <p className="text-xs text-[#4a5568]">{p.dosage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <p className="text-[10px] font-mono text-[#4a5568] tracking-wider mb-1">
                    DOCTOR NOTES
                  </p>
                  <p className="text-sm text-[#e8edf5] italic leading-relaxed">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
