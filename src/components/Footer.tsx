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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-200 space-y-4 shadow-2xl relative">
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
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
                  <h3 className="text-xl font-serif font-bold text-cyan-300 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" /> Terms &amp; Conditions
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    SereneAI / Neuraliso — Mental Wellness Platform • Version 1.0
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                  <p className="italic text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    This document sets out the Terms and Conditions ("Terms") governing access to and use of the SereneAI / Neuraliso Service. By creating an account or using the Service, you agree to be bound by these Terms.
                  </p>

                  <div className="space-y-3">
                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">1. About the Service</h4>
                      <p className="text-slate-300">
                        SereneAI / Neuraliso provides informational tools, mood tracking, guided exercises, and AI-supported content intended to promote mental wellness and help users develop coping strategies ("Content" and "Features").
                      </p>
                      <p className="text-amber-300/90 font-medium mt-1">
                        • The Service is not a substitute for professional mental health care, diagnosis, or treatment.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">2. Eligibility</h4>
                      <p className="text-slate-300">
                        You must be at least 13 years old to use the Service. If you are aged 13–17, you may use the Service only with parental or guardian consent where required by applicable law. By using the Service, you confirm you have the legal capacity to accept these Terms.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">3. Account Registration</h4>
                      <p className="text-slate-300">
                        Some features require creating an account. You agree to provide accurate, current information and to keep your credentials secure. You are responsible for all activity under your account. Notify us immediately of any unauthorized use.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">4. User Conduct</h4>
                      <p className="text-slate-300">
                        Use the Service lawfully, respectfully, and in good faith. Do not submit content that is unlawful, abusive, harassing, defamatory, violent, pornographic, invasive of privacy, or that infringes the rights of others. Do not attempt to reverse-engineer, exploit, spam, or misuse the Service.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-rose-900/50 bg-rose-950/20">
                      <h4 className="font-bold text-rose-300 text-sm mb-1">5. Clinical Disclaimer and Emergency Situations</h4>
                      <p className="text-slate-300">
                        SereneAI / Neuraliso is for informational and self-help purposes only. It does not provide medical advice, professional diagnosis, or treatment recommendations. Always seek professional medical or mental health care for emergencies, suicidal ideation, self-harm, or any condition requiring urgent attention.
                      </p>
                      <p className="text-rose-300 font-semibold mt-1.5">
                        🚨 If you believe you or someone else is in immediate danger, call your local emergency number (such as 988 in the US/Canada or 112 in India/Europe) or contact local mental health crisis resources.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">6. AI Content and Limitations</h4>
                      <p className="text-slate-300">
                        The Service may generate or personalize content using AI. We strive for accuracy but cannot guarantee completeness, suitability, or correctness. Do not rely solely on AI-generated content for making important medical, legal, financial, or safety decisions.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">7. Intellectual Property</h4>
                      <p className="text-slate-300">
                        All intellectual property rights in SereneAI / Neuraliso, including software, design, text, graphics, and trademarks, are owned or licensed by us. You may use Content solely for personal, non-commercial use. You retain ownership of content you submit, granting us a worldwide, royalty-free license to use, modify, and display that content to operate and improve the Service.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">8. User Content and Moderation</h4>
                      <p className="text-slate-300">
                        You are responsible for any content you create or upload. We may review, remove, or restrict content that violates these Terms or is otherwise inappropriate. We are not responsible for user-submitted content and do not endorse it.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">9. Payment and Subscriptions</h4>
                      <p className="text-slate-300">
                        Certain features may be offered on a paid subscription basis. Subscription terms, pricing, renewal, and cancellation policies will be set out at the point of purchase. All fees are non-refundable except where required by law or expressly stated otherwise.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">10. Privacy</h4>
                      <p className="text-slate-300">
                        Our Privacy Policy explains how we collect, use, and share personal information. By using the Service, you agree to that policy. We use reasonable security measures to protect data but cannot guarantee absolute security.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">11. Limitation of Liability</h4>
                      <p className="text-slate-300">
                        To the maximum extent permitted by law, SereneAI / Neuraliso and its affiliates are not liable for indirect, special, incidental, consequential, or punitive damages arising from your use of the Service. Our total liability for direct damages will not exceed the amounts paid by you in the prior 12 months, except where prohibited by law.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">12. Indemnification</h4>
                      <p className="text-slate-300">
                        You agree to indemnify, defend, and hold harmless SereneAI / Neuraliso, its officers, employees, and partners from claims, damages, liabilities, costs, and expenses arising from your violation of these Terms or your use of the Service.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">13. Termination</h4>
                      <p className="text-slate-300">
                        We may suspend or terminate your access for violations of these Terms or for other business reasons, with or without notice. Upon termination, your rights under these Terms end, but accrued rights and obligations survive.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">14. Third-Party Links and Services</h4>
                      <p className="text-slate-300">
                        The Service may contain links to third-party websites, apps, or resources. We are not responsible for the content or practices of third parties. Use of third-party services is subject to their own terms and privacy policies.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">15. Changes to Terms</h4>
                      <p className="text-slate-300">
                        We may modify these Terms. We will provide notice of material changes and, where required, obtain consent. Continued use after changes means you accept the revised Terms.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">16. Governing Law and Dispute Resolution</h4>
                      <p className="text-slate-300">
                        These Terms are governed by the laws applicable where SereneAI / Neuraliso is hosted and operates. For disputes, parties should first attempt to resolve issues through informal negotiation or our support channel.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">17. Severability and Waiver</h4>
                      <p className="text-slate-300">
                        If any provision is held invalid, the remainder of these Terms remains effective. Failure to enforce a right does not waive that right.
                      </p>
                    </section>

                    <section className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-white text-sm text-cyan-300 mb-1">18. Contact Information</h4>
                      <p className="text-slate-300">
                        For questions, support, or to report concerns, please contact us at:
                      </p>
                      <div className="mt-2 font-mono text-[11px] text-teal-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                        Email: support@sereneai.example <br />
                        In-App Support: Available via the mascot AI assistant and help menu
                      </div>
                    </section>
                  </div>
                </div>
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
