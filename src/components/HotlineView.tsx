import React from "react";
import { HotlineIcon } from "./Icons";
import { HotlineContact } from "../types";

export const HotlineView: React.FC = () => {
  const hotlines: HotlineContact[] = [
    {
      name: "988 Suicide & Crisis Lifeline",
      phone: "988",
      description: "Immediate 24/7, free, confidential physical or mental support anywhere in the US and Canada. Voice call or text.",
      isText: true,
      link: "https://988lifeline.org"
    },
    {
      name: "Crisis Text Line",
      phone: "Text 'HOME' to 741741",
      description: "Connect with a trained professional crisis volunteer 24/7 for support via anonymous text message.",
      isText: true,
      link: "https://www.crisistextline.org"
    },
    {
      name: "Befrienders Worldwide International Directory",
      phone: "Search Local Helpline",
      description: "A comprehensive network of helpline safety hotlines operational across 40 countries outside North America.",
      isText: false,
      link: "https://www.befrienders.org"
    },
    {
      name: "National Domestic Violence Hotline",
      phone: "1-800-799-7233",
      description: "Confidential immediate help for individuals seeking domestic security solutions, safety plans, and shelter referrals.",
      isText: false,
      link: "https://www.thehotline.org"
    },
    {
      name: "The Trevor Project",
      phone: "1-866-488-7386",
      description: "Dedicated suicide prevention & intervention safety services for LGBTQ+ teenagers and young adults world-wide.",
      isText: true,
      link: "https://www.thetrevorproject.org"
    }
  ];

  const handleCallSimulation = (name: string, phone: string) => {
    // Elegant system call popup simulator safely inside iframe limits
    alert(`[Neuraliso Dialing Link] Simulating hotkey dispatch to: ${name} (${phone}).\nIn a real-world smartphone, your dialing screen triggers automatically.`);
  };

  return (
    <div id="hotline-view-container" className="pb-24 space-y-6 max-w-xl mx-auto px-1 animate-fade-in">
      
      {/* Header Info */}
      <div className="text-center space-y-2 mt-4">
        <span className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
          <HotlineIcon size={28} />
        </span>
        <h2 className="text-3xl font-serif italic text-dark-text pt-1">Resources & Crisis Assistance</h2>
        <p className="text-xs text-muted-text max-w-md mx-auto">
          These international, completely free, and confidential crisis lines are monitored continuously by certified wellness first-responders. Touch any provider button below.
        </p>
      </div>

      {/* Directory cards */}
      <div className="space-y-4">
        {hotlines.map((contact, idx) => (
          <div
            key={idx}
            id={`hotline-card-${idx}`}
            className="wellness-card p-5 border bg-white flex flex-col justify-between space-y-4 hover:border-amber-200 transition-all"
          >
            <div className="space-y-1.5">
              <div className="flex justify-between items-start">
                <h4 className="font-sans font-bold text-dark-text text-sm leading-tight max-w-[80%]">
                  {contact.name}
                </h4>
                {contact.isText && (
                  <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                    Supports SMS / Chat
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-text leading-relaxed">
                {contact.description}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2 w-full pt-1">
              <button
                id={`simulate-link-btn-${idx}`}
                onClick={() => handleCallSimulation(contact.name, contact.phone)}
                className="flex-1 text-center font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 py-2.5 rounded-full hover:scale-101 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                📞 {contact.phone}
              </button>

              {contact.link && (
                <a
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer referrer"
                  className="flex-1 text-center font-bold text-xs bg-ivory-bg hover:bg-soft-green/30 text-primary-sage border border-soft-green/20 py-2.5 rounded-full hover:scale-101 active:scale-95 transition-all flex items-center justify-center gap-1.5 decoration-none"
                >
                  🔗 Visit Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-light-mint border rounded-2xl text-[10px] text-primary-sage/90 text-center leading-relaxed">
        <strong>Remember:</strong> Reaching out is an act of extreme courage and resilience. You do not have to carry your storms in silence. Supportive voices are ready to hold space for you.
      </div>
    </div>
  );
};
