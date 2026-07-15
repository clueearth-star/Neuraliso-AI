import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, RefreshCw, Compass, Heart, Eye } from "lucide-react";

interface OracleCard {
  id: number;
  title: string;
  category: "Vision" | "Warmth" | "Alignment";
  icon: any;
  backColor: string;
  quote: string;
  exercise: string;
}

interface OracleDeckProps {
  onJournalWithCard?: (note: string) => void;
}

export const OracleDeck: React.FC<OracleDeckProps> = ({ onJournalWithCard }) => {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isReshuffling, setIsReshuffling] = useState<boolean>(false);
  const [seedOffset, setSeedOffset] = useState<number>(0);

  const cards: OracleCard[] = [
    {
      id: 1,
      title: "The Observer Node",
      category: "Vision",
      icon: Eye,
      backColor: "from-amber-600 via-amber-500 to-yellow-400",
      quote: "What feels like a permanent physical cage is merely a passing weather formation. Let yourself observe the clouds without becoming the rain.",
      exercise: "Look at three solid items in your line of sight. Name their weights and ages. In doing so, you pull your neural network away from emotional escalation."
    },
    {
      id: 2,
      title: "The Compassionate Core",
      category: "Warmth",
      icon: Heart,
      backColor: "from-rose-600 via-rose-500 to-amber-400",
      quote: "You have been holding up a heavy sky for so long. Give yourself five solid minutes of absolute, guilt-free rest. The world will wait.",
      exercise: "Place both hands on your chest, take a slow count-five inhalation, and whisper: 'I am allowed to move at my own pace.'"
    },
    {
      id: 3,
      title: "The Whispering Sage",
      category: "Alignment",
      icon: Compass,
      backColor: "from-emerald-700 via-emerald-500 to-amber-400",
      quote: "Every storm carries with it nutrient rain. Your current challenge is cultivating deep internal resilience and alignment.",
      exercise: "Close your eyes and breathe into your stomach. Visualize yourself as an ancient oak tree with roots reaching deep into the solid earth."
    }
  ];

  // Curated premium quote libraries triggered by reshuffling offsets
  const auxiliaryQuotes = [
    [
      "Failure is merely an interactive system feedback. It contains no moral judgment of your soul.",
      "Write down the single task that makes your stomach sink. Break it down into three laughably minor actions."
    ],
    [
      "Your critical inner voice is just a confused protector. Thank it for trying to keep you safe, then ask it to step back.",
      "Gently place cool water on your eyelids. Feel the physical shift as your body's mammalian dive reflex triggers a heartbeat slow-down."
    ],
    [
      "You do not have to conquer the summit before evening. Healing is an iterative chain of gentle mornings.",
      "Write down one item you are holding onto that is no longer serving your peace, and mentally release it into the ether."
    ]
  ];

  const handleCardClick = (id: number) => {
    if (selectedCardId === id) {
      setSelectedCardId(null); // Deselect/Flip back
    } else {
      setSelectedCardId(id);
    }
  };

  const reshuffleDeck = () => {
    setIsReshuffling(true);
    setSelectedCardId(null);
    setTimeout(() => {
      setSeedOffset((prev) => (prev + 1) % 2);
      setIsReshuffling(false);
    }, 850);
  };

  return (
    <div id="gold-oracle-reflection-deck" className="wellness-card p-6 relative overflow-hidden bg-gradient-to-tr from-white to-amber-50/10">
      
      {/* Background radial gold glow decoration */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-200/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-5">
        {/* Header section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50/80 border border-amber-200/50 text-amber-600 rounded-2xl">
              <Sparkles className="w-5 h-5 animate-pulse-slow" />
            </span>
            <div>
              <h3 className="font-serif italic font-bold text-dark-text text-lg leading-tight">Wisdom Oracle Deck</h3>
              <p className="text-[10px] text-muted-text uppercase tracking-wide font-mono">Premium Golden Reflection Therapy</p>
            </div>
          </div>
          
          <button
            onClick={reshuffleDeck}
            disabled={isReshuffling}
            className="p-2 font-semibold text-xs text-primary-sage hover:text-deep-sage tracking-tight active:scale-95 transition-all flex items-center gap-1.5 neu-btn rounded-xl"
          >
            <RefreshCw className={`w-3 h-3 ${isReshuffling ? "animate-spin" : ""}`} />
            <span>Reshuffle</span>
          </button>
        </div>

        <p className="text-[11px] text-muted-text leading-relaxed">
          Gently hover or click an exquisite gold-foil tarot card below. Let our physics-animated oracle cards draw therapeutic CBT wisdom and physical grounding exercises for your day.
        </p>

        {/* Oracle physical deck list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          {cards.map((card) => {
            const isFlipped = selectedCardId === card.id;
            const CardIcon = card.icon;
            
            // Get active text based on reshuffling offset seed
            const finalQuote = seedOffset === 0 ? card.quote : auxiliaryQuotes[card.id - 1][0];
            const finalExercise = seedOffset === 0 ? card.exercise : auxiliaryQuotes[card.id - 1][1];

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="h-72 cursor-pointer relative perspective"
              >
                <motion.div
                  className="w-full h-full duration-700 preserve-3d relative"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.65, ease: "easeInOut" }}
                >
                  
                  {/* CARD FRONT: GOLD FOIL SUITE LAYOUT */}
                  <div className="absolute inset-0 backface-hidden rounded-[20px] p-5 flex flex-col justify-between border-2 border-amber-300 shadow-[6px_6px_16px_var(--neu-shadow)] bg-gradient-to-br from-slate-900 via-slate-800 to-black text-amber-100 overflow-hidden">
                    {/* Golden sparkles layer */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(217,119,6,0.15),transparent)] pointer-events-none" />
                    
                    {/* Top frame line */}
                    <div className="flex justify-between items-center border-b border-amber-300/30 pb-2">
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold">XII NEURALISO Oracle</span>
                      <span className="text-amber-500 text-xs">✦</span>
                    </div>

                    {/* Center decorative gold pattern */}
                    <div className="flex flex-col items-center justify-center space-y-3.5 my-auto">
                      <div className={`p-4 rounded-full border border-amber-400/40 bg-gradient-to-tr ${card.backColor} text-white shadow-lg shadow-amber-500/20`}>
                        <CardIcon size={26} className="text-amber-100 animate-pulse-slow" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase block font-bold">
                        {card.category}
                      </span>
                    </div>

                    {/* Footer decoration */}
                    <div className="border-t border-amber-300/30 pt-2 text-center">
                      <h4 className="font-serif italic font-bold tracking-wide text-xs text-amber-300">
                        {card.title}
                      </h4>
                      <p className="text-[8px] text-amber-500/80 font-mono mt-0.5 uppercase">Tap to reveal wisdom</p>
                    </div>
                  </div>

                  {/* CARD BACK: REVEALED WISDOM & REFLECTION */}
                  <div className="absolute inset-0 backface-hidden rounded-[20px] p-5 flex flex-col justify-between border-2 border-amber-200 shadow-[inset_0_0_12px_rgba(217,119,6,0.1)] bg-amber-50 text-dark-text rotateY-180 overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-amber-200 pb-1.5">
                      <span className="text-[9px] font-mono text-amber-800 font-bold uppercase tracking-widest">{card.category} Assessment</span>
                      <span className="text-[10px] font-serif italic font-bold text-amber-800">No. {card.id}</span>
                    </div>

                    {/* Quote text display */}
                    <div className="my-auto space-y-2.5">
                      <p className="text-xs font-serif italic text-slate-800 leading-relaxed pt-2">
                        "{finalQuote}"
                      </p>
                      
                      <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50 text-[10px] leading-relaxed">
                        <span className="font-bold text-amber-800 uppercase block font-mono text-[9px] mb-1">
                          🪷 Therapeutic Assignment:
                        </span>
                        <p className="text-slate-600">{finalExercise}</p>
                      </div>
                      {onJournalWithCard && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent flipping back
                            const entryDraft = `Reflecting on the card "${card.title}" (${card.category}):\n"${finalQuote}"\n\nTherapeutic exercise note: ${finalExercise}`;
                            onJournalWithCard(entryDraft);
                          }}
                          className="w-full mt-2 py-1.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold rounded-xl text-[9px] uppercase tracking-wide transition-all shadow-sm active:scale-95 text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          ✍️ Log to My Journal
                        </button>
                      )}
                    </div>

                    {/* Tap back anchor */}
                    <div className="text-center pt-2 border-t border-amber-200 text-[8px] text-muted-text font-mono uppercase">
                      Tap anywhere to flip card back
                    </div>
                  </div>

                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Premium footer stamp */}
        <p className="text-[9px] text-muted-text/80 text-center uppercase tracking-wider font-mono">
          👑 Private Wellness Vault Access Guaranteed
        </p>

      </div>
    </div>
  );
};
