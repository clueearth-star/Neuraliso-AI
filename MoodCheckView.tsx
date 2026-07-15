import React, { useState } from "react";
import { JournalEntry } from "../types";
import { SadMoodIcon, AnxiousMoodIcon, OverwhelmedMoodIcon, LonelyMoodIcon } from "./Icons";

interface MoodCheckViewProps {
  onSaveEntry: (entry: JournalEntry) => void;
  onNavigate: (view: any) => void;
}

export const MoodCheckView: React.FC<MoodCheckViewProps> = ({ onSaveEntry, onNavigate }) => {
  const [selectedMood, setSelectedMood] = useState<"sad" | "anxious" | "overwhelmed" | "lonely" | "neutral" | "happy" | null>(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [personalNote, setPersonalNote] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Feature #15: CBT Thought Record Journal Template states
  const [journalTemplate, setJournalTemplate] = useState<"classic" | "cbt">("classic");
  const [cbtSituation, setCbtSituation] = useState("");
  const [cbtAutomaticThoughts, setCbtAutomaticThoughts] = useState("");
  const [cbtEmotions, setCbtEmotions] = useState("");
  const [cbtEvidenceFor, setCbtEvidenceFor] = useState("");
  const [cbtEvidenceAgainst, setCbtEvidenceAgainst] = useState("");
  const [cbtRationalAlternative, setCbtRationalAlternative] = useState("");

  const moodDetails = {
    sad: {
      label: "Gentle / Sad",
      icon: <SadMoodIcon size={40} className="text-blue-500" />,
      themeColor: "border-blue-200 bg-blue-50/40 text-blue-900",
      encouragement: "It is okay to not be okay. Healing is not a linear climb; today is simply a gentle rest day.",
      duration: "10 mins",
      benefits: "Serotonin restoration & cortisol stabilization",
      plan: ["Open curtains for direct sunlight", "Drink a large glass of refreshing water", "Listen to a comforting ambient audio track"]
    },
    anxious: {
      label: "Uneasy / Anxious",
      icon: <AnxiousMoodIcon size={40} className="text-amber-500 animate-pulse-slow" />,
      themeColor: "border-amber-200 bg-amber-50/40 text-amber-900",
      encouragement: "Your anxiety is an emergency alarm, not a prophecy. You are safe in this physical moment.",
      duration: "15 mins",
      benefits: "Vagus nerve stimulation & autonomic balance",
      plan: ["Perform cold water face splash routine", "Complete 3 cycles of 4-7-8 breathing", "Take a short, silent physical walk outside"]
    },
    overwhelmed: {
      label: "Scattered / Overwhelmed",
      icon: <OverwhelmedMoodIcon size={40} className="text-red-500" />,
      themeColor: "border-red-200 bg-red-50/40 text-red-900",
      encouragement: "Close your eyes. You do not have to conquer the mountain. Just focus on your next single breath.",
      duration: "8 mins",
      benefits: "Prefrontal cortex regulation & cognitive cooling",
      plan: ["Write down the single most urgent task", "Stretch your neck and drop your shoulders", "Unclench your jaw and write one raw thought down"]
    },
    lonely: {
      label: "Isolated / Lonely",
      icon: <LonelyMoodIcon size={40} className="text-purple-500" />,
      themeColor: "border-purple-200 bg-purple-50/40 text-purple-900",
      encouragement: "You are not alone in feeling lonely. Your solitude can be a sanctuary to nourish your self-parenting.",
      duration: "20 mins",
      benefits: "Oxytocin trigger & social brain calibration",
      plan: ["Send a tiny supportive message to someone", "Watch a comforting movie scene or comfort show", "Open windows and check community discussions online"]
    },
    neutral: {
      label: "Balanced / Neutral",
      icon: <span className="text-3xl">😐</span>,
      themeColor: "border-gray-200 bg-gray-50/40 text-gray-900",
      encouragement: "Appreciate the quiet beauty of ordinary balance. Every steady day builds a resilient nervous system base.",
      duration: "5 mins",
      benefits: "Mindfulness anchoring & peace observation",
      plan: ["Take 3 conscious quiet deep sighs", "Water a plant or look at sky colors", "Type down one sensory gratitude item in note"]
    },
    happy: {
      label: "Radiant / Joyful",
      icon: <span className="text-3xl">🌸</span>,
      themeColor: "border-green-200 bg-green-50/40 text-green-900",
      encouragement: "Savor this warmth fully. Fill your emotional cup so it overflows for rainy days to come.",
      duration: "5 mins",
      benefits: "Dopamine integration & neuroplastic feedback",
      plan: ["Doodle or dance for half a minute", "Log this cheerful moment to reflect on later", "Share a quiet smile with yourself in the mirror"]
    }
  };

  const handleSave = () => {
    if (!selectedMood) return;

    let compiledNote = personalNote;
    if (journalTemplate === "cbt") {
      compiledNote = `
🧠 [CBT THOUGHT RECORD]
• Situation: ${cbtSituation || "N/A"}
• Automatic Negative Thoughts: ${cbtAutomaticThoughts || "N/A"}
• Associated Emotions: ${cbtEmotions || "N/A"}
• Support Evidence: ${cbtEvidenceFor || "N/A"}
• Disconfirming Evidence: ${cbtEvidenceAgainst || "N/A"}
• Rational Reframe Mantra: ${cbtRationalAlternative || "N/A"}
      `.trim();
    }

    const currentPlan = moodDetails[selectedMood].plan;
    const newEntry: JournalEntry = {
      id: "entry-" + Date.now(),
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      mood: selectedMood,
      stress: 10 - energyLevel, // Inverse estimation representation
      energy: energyLevel,
      note: compiledNote,
      actionPlan: currentPlan
    };

    onSaveEntry(newEntry);
    setSavedSuccess(true);
    setTimeout(() => {
      onNavigate("home");
    }, 2200);
  };

  return (
    <div id="mood-check-view" className="pb-24 space-y-6 max-w-xl mx-auto px-1 animate-fade-in">
      
      {/* SUCCESS OVERLAY */}
      {savedSuccess ? (
        <div id="saved-success-feedback" className="wellness-card p-10 text-center space-y-5">
          <span className="text-4xl animate-bounce inline-block">✨</span>
          <h3 className="text-2xl font-serif italic text-deep-sage">Wellness Log Anchored</h3>
          <p className="text-sm text-muted-text max-w-xs mx-auto leading-relaxed">
            Your current emotional state, energy metric, and action steps have been securely recorded in local storage database. Let's head home to look at your insights.
          </p>
          <div className="w-12 h-1 bg-primary-sage/35 rounded-full mx-auto animate-pulse" />
        </div>
      ) : (
        <>
          {/* Welcome Screen */}
          <div className="text-center space-y-1 mt-4">
            <h2 className="text-3xl font-serif italic text-dark-text">How are you feeling?</h2>
            <p className="text-xs text-muted-text">
              Select the emotional frequency that matches your internal weather right now.
            </p>
          </div>

          {/* Grid of Mood Cards */}
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(moodDetails) as Array<keyof typeof moodDetails>).map((tempMood) => {
              const details = moodDetails[tempMood];
              const isSelected = selectedMood === tempMood;

              return (
                <button
                  key={tempMood}
                  id={`mood-check-card-${tempMood}`}
                  onClick={() => setSelectedMood(tempMood)}
                  className={`p-4 rounded-[28px] text-left flex flex-col justify-between items-start h-36 transition-all duration-300 ${
                    isSelected 
                      ? "neu-inset text-dark-text scale-95 border-2 border-primary-sage/40" 
                      : "neu-flat-sm text-dark-text hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="p-2 neu-inset-sm shrink-0">
                      {details.icon}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-primary-sage px-2.5 py-0.5 neu-inset-sm">
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-text font-mono tracking-tight block">FREQUENCY</span>
                    <span className="font-semibold text-sm text-dark-text mt-0.5 block">{details.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* DYNAMIC PLAN GENERATOR SECTION */}
          {selectedMood && (
            <div id="dynamic-action-plan-generator" className="wellness-card p-6 space-y-5 animate-slide-up">
              
              {/* Encouragement header */}
              <div className="p-4 neu-inset">
                <h4 className="font-serif italic text-sm font-semibold mb-1 text-primary-sage">Compassion Prescription</h4>
                <p className="text-xs leading-relaxed font-sans text-dark-text/90">{moodDetails[selectedMood].encouragement}</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 neu-inset font-sans">
                <div>
                  <span className="text-muted-text block">Suggested Practice:</span>
                  <span className="font-semibold text-dark-text">{moodDetails[selectedMood].duration} duration</span>
                </div>
                <div>
                  <span className="text-muted-text block">Biological Benefit:</span>
                  <span className="font-semibold text-dark-text">{moodDetails[selectedMood].benefits}</span>
                </div>
              </div>

              {/* Action plan checklist */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-dark-text block">Actionable Rebalancing Checklist:</span>
                <div className="space-y-3">
                  {moodDetails[selectedMood].plan.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 neu-inset-sm text-xs text-dark-text">
                      <span className="bg-primary-sage text-white w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="leading-tight pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Energy Meter slider */}
              <div className="space-y-3 border-t border-soft-green/15 pt-4">
                <label className="text-xs font-bold text-dark-text flex justify-between items-center">
                  <span>How is your physical energy level?</span>
                  <span className="font-mono text-primary-sage font-bold">{energyLevel}/10</span>
                </label>
                <div className="px-1">
                  <input
                    id="energy-range-input"
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-text font-mono">
                  <span>1 (Exhausted)</span>
                  <span>10 (Energetic)</span>
                </div>
              </div>

              {/* Personal Reflection Note */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-dark-text flex justify-between items-center">
                  <span>Reflection Pattern:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      id="use-classic-journal-btn"
                      onClick={() => setJournalTemplate("classic")}
                      className={`text-[9px] px-2 py-1 font-mono uppercase rounded font-bold transition-all ${
                        journalTemplate === "classic"
                          ? "bg-primary-sage text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Classic diary
                    </button>
                    <button
                      type="button"
                      id="use-cbt-journal-btn"
                      onClick={() => setJournalTemplate("cbt")}
                      className={`text-[9px] px-2 py-1 font-mono uppercase rounded font-bold transition-all ${
                        journalTemplate === "cbt"
                          ? "bg-primary-sage text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      CBT Thought Record
                    </button>
                  </div>
                </label>

                {journalTemplate === "classic" ? (
                  <textarea
                    id="moodcheck-notes"
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="Record an honest thought, a raw gratitude, or describe the clouds..."
                    className="w-full p-3.5 neu-field text-xs placeholder-muted-text h-24 text-dark-text resize-none"
                  />
                ) : (
                  <div className="space-y-3.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl animate-fade-in text-left">
                    <span className="text-[9.5px] bg-teal-50 text-teal-900 border border-teal-100 p-2 rounded block leading-normal font-serif italic mb-2">
                       "Cognitive Behavioral Therapy helps identify automatic stress filters. Fill out this guided record to dismantle negative thought spirals step-by-step."
                    </span>
                    
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-700 block uppercase">1. The Triggering Situation:</span>
                      <input
                        id="cbt-input-situation"
                        type="text"
                        placeholder="e.g., Left on read, project delay noticed..."
                        value={cbtSituation}
                        onChange={(e) => setCbtSituation(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-sage bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-700 block uppercase">2. Automatic Negative Thought:</span>
                      <textarea
                        id="cbt-input-thought"
                        placeholder="What mean thing is your brain saying? 'I am completely useless and incompetent.'"
                        value={cbtAutomaticThoughts}
                        onChange={(e) => setCbtAutomaticThoughts(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-lg h-14 resize-none focus:outline-none focus:ring-1 focus:ring-primary-sage bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-700 block uppercase">3. Associated Emotions:</span>
                      <input
                        id="cbt-input-emotions"
                        type="text"
                        placeholder="e.g., Intense panic, heavy shame, deep worry..."
                        value={cbtEmotions}
                        onChange={(e) => setCbtEmotions(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-sage bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-semibold text-slate-700 block uppercase">4. Evidence For Thought:</span>
                        <textarea
                          id="cbt-input-evidence-for"
                          placeholder="What objective facts support it?"
                          value={cbtEvidenceFor}
                          onChange={(e) => setCbtEvidenceFor(e.target.value)}
                          className="w-full p-2 text-[10px] border border-slate-200 rounded-lg h-12 resize-none focus:outline-none focus:ring-1 focus:ring-primary-sage bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-semibold text-slate-700 block uppercase">5. Evidence Against Thought:</span>
                        <textarea
                          id="cbt-input-evidence-against"
                          placeholder="What facts contradict this?"
                          value={cbtEvidenceAgainst}
                          onChange={(e) => setCbtEvidenceAgainst(e.target.value)}
                          className="w-full p-2 text-[10px] border border-slate-200 rounded-lg h-12 resize-none focus:outline-none focus:ring-1 focus:ring-primary-sage bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <span className="text-[10px] font-bold text-slate-700 block uppercase">6. Rational Reframe Mantra:</span>
                      <textarea
                        id="cbt-input-reframe"
                        placeholder="Write a balanced perspective. 'This is one setback. I am practicing and learning.'"
                        value={cbtRationalAlternative}
                        onChange={(e) => setCbtRationalAlternative(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-lg h-14 resize-none focus:outline-none focus:ring-1 focus:ring-primary-sage bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Save button */}
              <button
                id="save-wellness-checkin-btn"
                onClick={handleSave}
                className="w-full bg-primary-sage text-white py-3.5 rounded-full font-bold shadow-md shadow-primary-sage/10 hover:bg-deep-sage transition-all active:scale-95 text-xs text-center"
              >
                Log Check-In & Activate Action Plan ✨
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
