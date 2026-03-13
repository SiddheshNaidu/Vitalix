"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCard from "@/components/QRCard";
import {
  Activity,
  ChevronRight,
  Calendar,
  User,
  FileText,
  Pill,
  Plus,
  ArrowLeft,
  Heart,
  Wind,
  Brain,
  Bone,
  Dna,
} from "lucide-react";

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
  abha_id: string | null;
  full_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  contact_number: string;
  emergency_contact: string;
  location_id: string;
  medical_history: string[];
  records: MedicalRecord[];
  qr_token: string | null;
  qr_image_url: string | null;
  scan_url: string | null;
}

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

const REGION_TAGS: Record<string, { label: string; icon: React.ReactNode }> = {
  heart: { label: "❤️ Cardiac", icon: <Heart className="w-3 h-3" /> },
  left_lung: { label: "🫁 Respiratory", icon: <Wind className="w-3 h-3" /> },
  right_lung: { label: "🫁 Respiratory", icon: <Wind className="w-3 h-3" /> },
  head: { label: "🧠 Neurological", icon: <Brain className="w-3 h-3" /> },
  abdomen: { label: "🔬 Gastrointestinal", icon: <Dna className="w-3 h-3" /> },
  liver_spleen: { label: "🔬 Hepatic", icon: <Dna className="w-3 h-3" /> },
  pancreas: { label: "🧪 Endocrine", icon: <Dna className="w-3 h-3" /> },
  left_knee: { label: "🦴 Musculoskeletal", icon: <Bone className="w-3 h-3" /> },
  right_knee: { label: "🦴 Musculoskeletal", icon: <Bone className="w-3 h-3" /> },
  left_arm: { label: "🦴 Musculoskeletal", icon: <Bone className="w-3 h-3" /> },
  right_arm: { label: "🦴 Musculoskeletal", icon: <Bone className="w-3 h-3" /> },
  torso: { label: "🏥 Systemic", icon: <Activity className="w-3 h-3" /> },
  left_leg: { label: "🏥 Systemic", icon: <Activity className="w-3 h-3" /> },
  right_leg: { label: "🏥 Systemic", icon: <Activity className="w-3 h-3" /> },
};

const DIAGNOSIS_COLORS: Record<string, string> = {
  dengue: "#FF4444",
  malaria: "#FF8C00",
  typhoid: "#FF8C00",
  hypertension: "#FF3366",
  diabetes: "#FFD700",
  pneumonia: "#4488FF",
  tuberculosis: "#4488FF",
  migraine: "#9966FF",
  "knee fracture": "#F59E0B",
  default: "#00D4AA",
};

function getDiagnosisColor(diagnosis: string): string {
  return DIAGNOSIS_COLORS[diagnosis.toLowerCase()] || DIAGNOSIS_COLORS.default;
}

function getRegionTag(diagnosis: string) {
  const regions = DIAGNOSIS_REGIONS[diagnosis.toLowerCase()] || [];
  if (regions.length === 0) return null;
  return REGION_TAGS[regions[0]] || null;
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

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "history">("summary");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/patients/patients/${patientId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPatient(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Backend error or not found, using mock data for UI testing:", err);
        // Provide mock data so the UI can be tested without the backend running
        setPatient({
          id: Number(patientId) || 1,
          abha_id: "14-2345-8891-0012",
          full_name: "Mock Patient (UI Test)",
          date_of_birth: "1988-11-23",
          gender: "Female",
          blood_group: "A+",
          contact_number: "+91 9876543210",
          emergency_contact: "+91 9123456789",
          location_id: "Mumbai, MH",
          medical_history: ["Asthma", "Penicillin Allergy"],
          records: [
            {
              id: 101,
              patient_id: Number(patientId) || 1,
              doctor_id: 1,
              date_of_visit: "2026-03-10T10:00:00Z",
              diagnosis: "Dengue",
              symptoms: ["High Fever", "Joint Pain", "Rash"],
              prescription: [
                { medicine: "Paracetamol", dosage: "500mg PRN" },
                { medicine: "IV Fluids", dosage: "As directed" }
              ],
              notes: "Monitor platelet count strictly."
            },
            {
              id: 102,
              patient_id: Number(patientId) || 1,
              doctor_id: 2,
              date_of_visit: "2025-08-15T14:30:00Z",
              diagnosis: "Migraine",
              symptoms: ["Aura", "Photophobia", "Nausea"],
              prescription: [
                { medicine: "Sumatriptan", dosage: "50mg at onset" }
              ],
              notes: null
            }
          ],
          qr_token: "mock-token-xyz",
          qr_image_url: null,
          scan_url: null
        });
        setLoading(false);
      });
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03050f] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#03050f] flex flex-col items-center justify-center text-[#e8edf5] px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FF3366]/10 border border-[#FF3366]/20 flex items-center justify-center mb-6">
           <Activity className="w-8 h-8 text-[#FF3366]" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Patient Not Found</h2>
        <p className="text-steel-gray text-center max-w-md mb-8">
          The requested medical record could not be located in the Vitalix registry, or your access has been denied.
        </p>
        <button 
          onClick={() => router.back()} 
          className="px-6 py-2.5 bg-teal/10 text-teal border border-teal/30 rounded-lg hover:bg-teal hover:text-[#03050f] transition-all font-bold tracking-wide flex items-center gap-2 cursor-pointer"
        >
           <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    );
  }

  const age = (() => {
    try {
      const dob = new Date(patient.date_of_birth);
      const today = new Date();
      return today.getFullYear() - dob.getFullYear();
    } catch {
      return "—";
    }
  })();

  return (
    <div className="min-h-screen bg-[#03050f] text-[#e8edf5]">
      {/* Top Bar */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-[#4a5568] hover:text-[#e8edf5] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Activity className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="font-bold font-['Syne',sans-serif] text-lg">
          {patient.full_name}
        </h1>
        <span className="text-[#4a5568] text-xs font-mono ml-2">
          PHC-{String(patient.id).padStart(3, "0")}
        </span>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-[rgba(255,255,255,0.06)]">
        {(["summary", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-mono tracking-wider transition-colors ${
              activeTab === tab
                ? "text-[#00d4aa] border-b-2 border-[#00d4aa]"
                : "text-[#4a5568]"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 3-column Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        {/* LEFT PANEL — QR + Vitals */}
        <div className="lg:w-[260px] lg:border-r border-[rgba(255,255,255,0.06)] p-5 space-y-5 shrink-0 hidden lg:block">
          <QRCard patient={patient} />

          {/* Vitals */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono tracking-widest text-[#4a5568]">
              PATIENT VITALS
            </h3>
            {[
              { label: "Age", value: age },
              { label: "Gender", value: patient.gender },
              { label: "Blood Group", value: patient.blood_group },
              { label: "Location", value: patient.location_id },
              { label: "Contact", value: patient.contact_number },
              { label: "Emergency", value: patient.emergency_contact },
            ].map((v) => (
              <div
                key={v.label}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-[#4a5568]">{v.label}</span>
                <span className="text-[#e8edf5] font-mono">{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL — Diagnosis Summary */}
        <div
          className={`flex-1 p-5 lg:p-8 space-y-6 ${
            activeTab !== "summary" ? "hidden lg:block" : ""
          }`}
        >
          {/* View Body Map CTA */}
          <button
            onClick={() => router.push(`/patient/${patient.id}/anatomy`)}
            className="w-full p-5 rounded-[14px] bg-[linear-gradient(135deg,rgba(0,212,170,0.12),rgba(14,165,233,0.12))] border border-[rgba(0,212,170,0.35)] flex items-center gap-4 hover:border-[rgba(0,212,170,0.6)] hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center text-2xl shrink-0">
              🧬
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-[#e8edf5] text-base font-['Syne',sans-serif]">
                View Diagnosis Body Map
              </p>
              <p className="text-[#4a5568] text-xs mt-0.5">
                See all diagnosed regions highlighted on 3D anatomy
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#4a5568] group-hover:text-[#00d4aa] group-hover:translate-x-1 transition-all" />
          </button>

          {/* Diagnosis Summary Cards */}
          <div>
            <h3 className="text-[10px] font-mono tracking-widest text-[#4a5568] mb-3">
              DIAGNOSIS SUMMARY
            </h3>
            {patient.records.length === 0 ? (
              <p className="text-[#4a5568] text-sm">No medical records yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {patient.records.map((rec) => {
                  const color = getDiagnosisColor(rec.diagnosis);
                  const tag = getRegionTag(rec.diagnosis);
                  return (
                    <div
                      key={rec.id}
                      className="bg-[#0d1628] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(0,212,170,0.2)] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#e8edf5]">
                            {rec.diagnosis}
                          </p>
                          <p className="text-[#4a5568] text-xs mt-0.5">
                            {formatDate(rec.date_of_visit)}
                          </p>
                          {tag && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[rgba(255,255,255,0.04)] text-[#4a5568] border border-[rgba(255,255,255,0.06)]">
                              {tag.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Medical History Tags */}
          {patient.medical_history.length > 0 && (
            <div>
              <h3 className="text-[10px] font-mono tracking-widest text-[#4a5568] mb-3">
                MEDICAL HISTORY
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.medical_history.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1.5 rounded-full text-xs font-mono bg-[rgba(0,212,170,0.08)] text-[#00d4aa] border border-[rgba(0,212,170,0.15)]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Medical Records Timeline */}
        <div
          className={`lg:w-[340px] lg:border-l border-[rgba(255,255,255,0.06)] p-5 space-y-4 shrink-0 ${
            activeTab !== "history" ? "hidden lg:block" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono tracking-widest text-[#4a5568]">
              MEDICAL RECORDS
            </h3>
            <button className="flex items-center gap-1 text-xs text-[#00d4aa] hover:text-[#00b492] transition-colors font-bold">
              <Plus className="w-3.5 h-3.5" /> Add Record
            </button>
          </div>

          {patient.records.length === 0 ? (
            <p className="text-[#4a5568] text-sm">No records found.</p>
          ) : (
            <div className="space-y-3">
              {patient.records.map((rec, i) => (
                <div
                  key={rec.id}
                  className="relative bg-[#0d1628] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(0,212,170,0.2)] transition-colors"
                >
                  {/* Timeline line */}
                  {i < patient.records.length - 1 && (
                    <div className="absolute left-[26px] top-[52px] bottom-[-12px] w-px bg-[rgba(255,255,255,0.06)]" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#00d4aa]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-steel-gray font-mono">
                        {formatDate(rec.date_of_visit)}
                      </p>
                      <p className="font-bold text-sm text-[#e8edf5] mt-1">
                        {rec.diagnosis}
                      </p>

                      {/* Symptoms */}
                      {rec.symptoms && rec.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rec.symptoms.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-[10px] bg-[rgba(255,255,255,0.04)] text-[#4a5568] border border-[rgba(255,255,255,0.06)]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Prescription */}
                      {rec.prescription && rec.prescription.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {rec.prescription.map((p, j) => (
                            <div
                              key={j}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <Pill className="w-3 h-3 text-[#00d4aa]" />
                              <span className="text-[#e8edf5]">
                                {p.medicine}
                              </span>
                              <span className="text-[#4a5568]">
                                {p.dosage}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {rec.notes && (
                        <p className="text-[#4a5568] text-xs mt-2 italic">
                          {rec.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
