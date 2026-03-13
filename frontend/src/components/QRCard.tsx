"use client";

import { useState } from "react";
import { Printer, Copy, Check } from "lucide-react";

interface QRCardProps {
  patient: {
    id: number;
    full_name: string;
    blood_group: string;
    gender: string;
    date_of_birth: string;
    qr_image_url?: string | null;
    scan_url?: string | null;
  };
}

export default function QRCard({ patient }: QRCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!patient.scan_url) return;
    try {
      await navigator.clipboard.writeText(patient.scan_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = patient.scan_url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => window.print();

  return (
    <>
      <div className="qr-print-target bg-gradient-to-br from-[#001F3F] to-[#003d7a] rounded-2xl p-5 border border-[rgba(0,212,170,0.15)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        {/* QR Image */}
        <div className="flex justify-center mb-4">
          {patient.qr_image_url ? (
            <img
              src={patient.qr_image_url}
              alt={`Health Card QR for ${patient.full_name}`}
              width={200}
              height={200}
              className="rounded-lg border border-[rgba(0,212,170,0.2)]"
            />
          ) : (
            <div className="w-[200px] h-[200px] rounded-lg bg-[rgba(0,0,0,0.3)] flex items-center justify-center text-[#4a5568] text-xs font-mono">
              No QR Generated
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="text-center mb-4">
          <h3 className="text-[#e8edf5] font-bold text-lg font-['Syne',sans-serif]">
            {patient.full_name}
          </h3>
          <p className="text-[#4a5568] text-xs font-mono tracking-wider mt-1">
            PHC-{String(patient.id).padStart(3, "0")}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-[#e8edf5]">
            <span>{patient.gender}</span>
            <span className="text-[#4a5568]">·</span>
            <span className="text-[#00d4aa] font-bold">{patient.blood_group}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.08)] text-[#e8edf5] text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Card
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[rgba(0,212,170,0.1)] hover:bg-[rgba(0,212,170,0.18)] border border-[rgba(0,212,170,0.2)] text-[#00d4aa] text-xs font-bold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          body > *:not(.qr-print-target) {
            display: none !important;
          }
          .qr-print-target {
            width: 85mm;
            height: 54mm;
            border: 1px solid #000;
            border-radius: 0;
            padding: 8mm;
            background: white !important;
            color: #000 !important;
          }
          .qr-print-target * {
            color: #000 !important;
          }
        }
      `}</style>
    </>
  );
}
