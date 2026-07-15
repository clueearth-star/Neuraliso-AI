import React, { useState } from "react";

interface EnterprisePortalProps {
  onBack: () => void;
}

export const EnterprisePortal: React.FC<EnterprisePortalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "governance">("overview");
  const [campaignLaunched, setCampaignLaunched] = useState<string | null>(null);

  // Aggregated team statistics (Simulated Anonymous Aggregated Data)
  const departments = [
    { name: "Engineering / Dev", employees: 42, avgWellness: 68, risk: "High", trend: "Declining", action: "Triggering Burnout Guard" },
    { name: "Design & UX", employees: 15, avgWellness: 79, risk: "Low", trend: "Stable", action: "Standard Support" },
    { name: "Product Management", employees: 12, avgWellness: 72, risk: "Medium", trend: "Improving", action: "Focus Workshop" },
    { name: "Sales & Marketing", employees: 30, avgWellness: 65, risk: "High", trend: "Declining", action: "Trigger Breathing Break Alert" },
    { name: "Customer Operations", employees: 25, avgWellness: 71, risk: "Medium", trend: "Stable", action: "PMR Somatic Campaign" },
  ];

  const launches = [
    { id: "mindfulness", name: "Mandatory Deep Breathing Campaign", desc: "Broadcasts a gentle desktop alert inviting employees to complete a 4-7-8 breathing session." },
    { id: "cbt-basics", name: "CBT Reframing Mind Stretch", desc: "Launches an optional cognitive reframing deck challenge inside workers' portals." },
    { id: "acoustic-recovery", name: "Acoustic Focus Alchemy", desc: "Distributes customized solfeggio focus soundtracks to active workspace streams." }
  ];

  const handleLaunchCampaign = (name: string) => {
    setCampaignLaunched(name);
    setTimeout(() => {
      setCampaignLaunched(null);
    }, 5000);
  };

  return (
    <div className="max-w-xl mx-auto my-6 animate-fade-in space-y-6 px-1">
      
      {/* 🏢 CORPORATE BAR HEADER */}
      <div className="wellness-card p-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[9px] font-mono tracking-widest bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded uppercase font-bold">
              Secure Enterprise Portal
            </span>
            <h2 className="text-2xl font-serif italic font-bold">Neuraliso Org Command</h2>
            <p className="text-xs text-slate-300 max-w-sm pt-1 leading-snug">
              Aggregated team metrics and burnout mitigation levers. All individual data points are rigorously anonymized.
            </p>
          </div>
          <button
            onClick={onBack}
            className="text-[10px] text-teal-300 hover:text-teal-100 border border-teal-500/35 px-2.5 py-1 rounded-full font-mono transition-all font-bold cursor-pointer"
          >
            ← Exit Portal
          </button>
        </div>

        {/* Aggregate organizational health indexes */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-5 mt-6 text-center">
          <div>
            <span className="text-xl font-bold font-mono text-teal-400">71 / 100</span>
            <span className="text-[9px] text-slate-400 block tracking-tight">Org Wellness Score</span>
          </div>
          <div>
            <span className="text-xl font-bold font-mono text-amber-500">2 Departments</span>
            <span className="text-[9px] text-slate-400 block tracking-tight">At Elevated Stress</span>
          </div>
          <div>
            <span className="text-xl font-bold font-mono text-emerald-400">124 active</span>
            <span className="text-[9px] text-slate-400 block tracking-tight">Coping Interventions</span>
          </div>
        </div>
      </div>

      {/* PORTAL TAB CONTROL */}
      <div className="flex bg-white/65 p-1 rounded-2xl border border-slate-200 shadow-sm font-sans text-xs">
        {[
          { id: "overview", label: "📊 Org Insights" },
          { id: "campaigns", label: "📣 Campaigns Launcher" },
          { id: "governance", label: "🔒 Privacy Governance" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 text-center rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: INSIGHTS OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="wellness-card p-5 bg-white border space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>⚠️</span>
              <span>Burnout Risk Indicators & Team Trends</span>
            </h3>
            
            <p className="text-xs text-muted-text leading-relaxed">
              Organized departmentally, this dashboard flags micro-teams suffering from continuous sleep depletion or high self-reported overload prior to critical attrition points.
            </p>

            <div className="space-y-3 pt-2">
              {departments.map((dept, i) => (
                <div key={i} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{dept.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono italic">{dept.employees} head count (Anonymous metrics)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dept.risk === "High" ? "bg-red-50 text-red-700 border border-red-100" :
                      dept.risk === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-green-50 text-green-700 border border-green-100"
                    }`}>
                      {dept.risk} Risk of Frictional Burnout
                    </span>
                  </div>

                  {/* Wellness dynamic slider scale bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-muted-text">
                      <span>Vitality Indicator: {dept.avgWellness}/100</span>
                      <span className={dept.trend === "Declining" ? "text-red-500 font-bold font-sans" : "text-emerald-600"}>
                        {dept.trend === "Declining" ? "↘ Trend: Declining" : "↗ Trend: Stable/Up"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          dept.avgWellness < 70 ? "bg-red-500" : dept.avgWellness < 75 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${dept.avgWellness}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-600">
                    <span>Recommending Action: {dept.action}</span>
                    <button
                      onClick={() => handleLaunchCampaign(dept.action)}
                      className="text-[9px] bg-slate-900 border border-slate-800 font-sans font-bold text-white px-2 py-1 rounded hover:bg-slate-800"
                    >
                      Deploy Lever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick recommendations box */}
          <div className="p-4 bg-teal-50 border border-teal-150 rounded-2xl text-xs text-teal-900 leading-normal font-sans italic space-y-1.5 text-center">
            <span className="font-bold text-teal-900 block not-italic uppercase text-[10px] tracking-wide">💡 HR Clinical Coping Guidelines</span>
            "We detected an elevated cortisol surge pattern on Friday afternoons in Dev teams. We suggest deploying the 'Acoustic Focus Alchemy' channel to developers to help them log off peacefully without cognitive static."
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAMPAIGN LAUNCHER */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {campaignLaunched && (
            <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-2xl text-xs font-medium text-emerald-800 leading-snug animate-bounce text-center">
              🎉 Organizational Wellness campaign deployed: <strong>"{campaignLaunched}"</strong> is now displaying in targeted employee spaces!
            </div>
          )}

          <div className="wellness-card p-5 bg-white border space-y-4">
            <h3 className="text-sm font-bold text-slate-800">📣 Org-Wide Resilience Interventions</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Launch targeted campaigns to proactively combat executive pressure spikes when employee logs start showing trends of anxiety or workload burden.
            </p>

            <div className="space-y-3 pt-2">
              {launches.map((ln) => (
                <div key={ln.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{ln.name}</span>
                    <p className="text-[11px] text-muted-text mt-1 leading-relaxed">{ln.desc}</p>
                  </div>
                  <button
                    onClick={() => handleLaunchCampaign(ln.name)}
                    className="w-full bg-teal-800 text-white font-bold font-sans py-2 text-xs rounded-xl hover:bg-teal-900 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Deploy Organizational Trigger Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMPLIANCE PRIVACY GUARANTEE */}
      {activeTab === "governance" && (
        <div className="wellness-card p-5 bg-white border space-y-4 text-slate-850">
          <h3 className="text-sm font-bold text-slate-800">🔐 Privacy Governance Affirmation</h3>
          <p className="text-xs leading-relaxed text-slate-650 space-y-2">
            This enterprise dashboard compiles aggregated indices only. Individual journal logs, personal CBT thoughts, emotional responses, or chat history details can NEVER be unlocked by corporate admins. Neuraliso protects compliance at a foundational cryptographic level.
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl text-[10px] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span>GDPR/CCPA Compliance:</span>
              <span className="text-emerald-600 font-bold">VERIFIED CODES ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>E2EE Journals:</span>
              <span className="text-emerald-600 font-bold">ENCRYPTED AT REST</span>
            </div>
            <div className="flex justify-between">
              <span>Minimal Aggregate Threshold:</span>
              <span className="text-emerald-600 font-bold">&gt;= 5 employee logs</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 py-3 block cursor-pointer"
      >
        ← Return to Main Settings
      </button>

    </div>
  );
};
