import React, { useState } from "react";
import { Shield, FileText, PhoneCall, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 text-xs relative z-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top level links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold italic text-lg text-teal-300">Neuraliso</span>
            <span className="text-[10px] text-slate-500 font-mono">— A quiet space for your mind</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-slate-300">
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5 bg-transparent border-none"
            >
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => setActiveModal("terms")}
              className="hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5 bg-transparent border-none"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Terms of Service</span>
            </button>

            <button
              onClick={() => setActiveModal("crisis")}
              className="hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5 bg-transparent border-none text-rose-300 font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>Crisis Resources</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="space-y-3 text-center sm:text-left max-w-4xl mx-auto text-slate-500 leading-relaxed text-[11px]">
          <p className="font-medium text-slate-400">
            <strong>Disclaimer:</strong> Neuraliso is not a substitute for professional medical advice, diagnosis, or treatment. If you're in crisis, call 988 or go to your nearest emergency room.
          </p>
          <p>© {new Date().getFullYear()} Neuraliso. Your privacy matters. We keep your data safe.</p>
        </div>
      </div>

      {/* Modal overlays for Privacy, Terms, and Crisis Resources */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-200 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            {activeModal === "privacy" && (
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-teal-300 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Privacy Policy
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your privacy matters. We keep your data safe. Neuraliso stores your mood logs and journal entries securely. We do not sell, trade, or expose your personal entries to third parties. All personal data is encrypted and protected.
                </p>
              </div>
            )}

            {activeModal === "terms" && (
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-cyan-300 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Terms of Service
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Neuraliso provides self-guided mindfulness tools, mood check-ins, and breathing exercises. By using Neuraliso, you acknowledge that this software is for wellness support and self-reflection only, and does not constitute psychiatric or medical care.
                </p>
              </div>
            )}

            {activeModal === "crisis" && (
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-rose-300 flex items-center gap-2">
                  <PhoneCall className="w-5 h-5" /> Crisis Resources
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you or someone you know is struggling or in crisis, help is available 24/7:
                </p>
                <ul className="space-y-2 text-xs font-semibold">
                  <li className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>988 Suicide & Crisis Lifeline:</span>
                    <a href="tel:988" className="bg-rose-600 text-white px-3 py-1 rounded-full text-[11px] font-bold">Call 988</a>
                  </li>
                  <li className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>Crisis Text Line:</span>
                    <a href="sms:741741?body=HOME" className="bg-teal-600 text-white px-3 py-1 rounded-full text-[11px] font-bold">Text HOME to 741741</a>
                  </li>
                  <li className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>Emergency Services:</span>
                    <a href="tel:911" className="bg-slate-700 text-white px-3 py-1 rounded-full text-[11px] font-bold">Call 911</a>
                  </li>
                </ul>
              </div>
            )}

            <div className="pt-3 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
