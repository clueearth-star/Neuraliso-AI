import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Heart, 
  Bookmark, 
  Sparkles, 
  Activity, 
  Users, 
  Flame, 
  Zap, 
  Compass,
  ArrowRight,
  Award,
  BookOpen,
  HelpCircle,
  Share2,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Eye,
  HeartHandshake
} from "lucide-react";

interface ReelSomaticTheme {
  id: number;
  title: string;
  themeType: "ocean" | "rain" | "forest" | "snow" | "meditation" | "breathing" | "affirmation" | "focus" | "sleep" | "anxiety" | "challenge" | "cinematic" | "narrative" | "vagus" | "closure";
  subtitle: string;
  guideName: string;
  duration: string;
  likes: string;
  shares: string;
  accentColor: string; // Tailwind color name
  bgGradient: string; // full gradient classes
  visualPattern: "wave" | "expand" | "bilateral" | "particles" | "fluid";
  soundTheme: "oceanScale" | "rainScale" | "forestScale" | "snowScale" | "meditationScale" | "breathingScale" | "affirmationScale" | "focusScale" | "sleepScale" | "anxietyScale" | "chimeScale" | "organicScale" | "narratorScale" | "vagusScale" | "bowlScale";
  recommendationReason: string;
  narrativeCaptions: string[];
  scientificBase: string;
}

interface ReliefStationViewProps {
  userProfile?: any;
  onUpdateProfile?: (fields: any) => void;
}

export const ReliefStationView: React.FC<ReliefStationViewProps> = ({ userProfile, onUpdateProfile }) => {
  // Navigation & States
  const [showSanctuaryIntro, setShowSanctuaryIntro] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [resonancePower, setResonancePower] = useState<number>(0.7);
  const [userMood, setUserMood] = useState<string>("stressed"); // stressed, anxious, sad, fatigued, restless
  
  // Engagement and Game mechanics
  const [calmXP, setCalmXP] = useState<number>(() => userProfile?.calmXP ?? 120);
  const [currentStreak, setCurrentStreak] = useState<number>(() => userProfile?.currentStreak ?? 5);
  const [milestonesMet, setMilestonesMet] = useState<string[]>(() => userProfile?.milestonesMet ?? ["Core Breathing"]);

  useEffect(() => {
    if (onUpdateProfile && userProfile) {
      if (
        calmXP !== userProfile.calmXP ||
        currentStreak !== userProfile.currentStreak ||
        JSON.stringify(milestonesMet) !== JSON.stringify(userProfile.milestonesMet)
      ) {
        onUpdateProfile({ calmXP, currentStreak, milestonesMet });
      }
    }
  }, [calmXP, currentStreak, milestonesMet, onUpdateProfile, userProfile]);

  const [showXPToast, setShowXPToast] = useState<boolean>(false);
  const [xpToastMsg, setXpToastMsg] = useState<string>("");
  const [activeSeekers, setActiveSeekers] = useState<number>(2451);
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({});
  const [savedReels, setSavedReels] = useState<Record<number, boolean>>({});
  
  // Breathing timeline state
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathTimer, setBreathTimer] = useState<number>(4); // cycle duration tracker

  // Micro-interactions and floating particles
  const [particleBlobs, setParticleBlobs] = useState<{ id: number; left: number; size: number; delay: number }[]>([]);
  const [activeTab, setActiveTab] = useState<"viewer" | "achievements" | "customLab">("viewer");

  // Quiet Brain Sleep Timer States (Feature #7)
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number>(0);
  const [sleepTimerActive, setSleepTimerActive] = useState<boolean>(false);

  // Breathing Pace Presets States (Feature #8)
  const [breathingPreset, setBreathingPreset] = useState<"default" | "box" | "sleep" | "resonant" | "focus">("default");

  // Solfeggio Tuner States (Feature #9) and Ambient Sound Mixer (Feature #10)
  const [solfeggioFreq, setSolfeggioFreq] = useState<number>(432);
  const [solfeggioVolume, setSolfeggioVolume] = useState<number>(0.4);
  const [oceanVolume, setOceanVolume] = useState<number>(0.3);
  const [rainVolume, setRainVolume] = useState<number>(0.3);

  // Web Audio Nodes for live mixer play
  const liveSolfeggioOscRef = useRef<OscillatorNode | null>(null);
  const liveSolfeggioOsc2Ref = useRef<OscillatorNode | null>(null);
  const liveSolfeggioGainRef = useRef<GainNode | null>(null);
  const liveOceanSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const liveOceanGainRef = useRef<GainNode | null>(null);
  const liveRainSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const liveRainGainRef = useRef<GainNode | null>(null);
  
  // Web Audio Context References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Track active sound nodes in a list so we can crossfade them cleanly
  const activeSynthesizersRef = useRef<Map<number, {
    gainNode: GainNode;
    oscillators: any[];
    intervals: any[];
  }>>(new Map());

  // Visual parameters
  const [visualPulseScale, setVisualPulseScale] = useState<number>(1.0);
  const [bilateralXOffset, setBilateralXOffset] = useState<number>(0);

  // 15 Exquisite Relief Reels covering all specified options
  const reels: ReelSomaticTheme[] = [
    {
      id: 1,
      title: "Deep Pacific Breakers",
      themeType: "ocean",
      subtitle: "Breathe in harmony with the eternal tides",
      guideName: "Dr. Clara Winters, Somatic Director",
      duration: "25s",
      likes: "18.3K",
      shares: "6.2K",
      accentColor: "sky-400",
      bgGradient: "from-slate-950 via-sky-950/40 to-slate-950",
      visualPattern: "wave",
      soundTheme: "oceanScale",
      recommendationReason: "Recommended because you felt Stressed today • Promotes high parasympathetic activity",
      narrativeCaptions: [
        "Inhale: Feel the cool sea foam expanding inside.",
        "Exhale: Let the heavy thoughts wash back to the depths.",
        "The ocean has done this for millions of years. Rest here."
      ],
      scientificBase: "Filtered white-noise swells mimic slow 0.1Hz breathing cycles, triggering cardiovascular resonance."
    },
    {
      id: 2,
      title: "Alpine Rainforest Canopy",
      themeType: "rain",
      subtitle: "Midnight downpour over dense moss foundations",
      guideName: "Marcus Vance, Sound Therapist",
      duration: "30s",
      likes: "24.5K",
      shares: "8.1K",
      accentColor: "emerald-400",
      bgGradient: "from-slate-950 via-emerald-950/45 to-slate-950",
      visualPattern: "particles",
      soundTheme: "rainScale",
      recommendationReason: "We suggested this because you enjoyed Rain Therapy yesterday",
      narrativeCaptions: [
        "Each drop absorbing a trace of your active cognitive burden.",
        "Listen to the high water clicks clearing mental static.",
        "You are fully covered by the ancient pine shelter."
      ],
      scientificBase: "High-transient moisture acoustics masks chaotic domestic sounds, boosting attention rest values."
    },
    {
      id: 3,
      title: "Redwood Moss Sanctuary",
      themeType: "forest",
      subtitle: "Walking barefoot upon thousands of years of soil",
      guideName: "Aethelgard High Well-being",
      duration: "22s",
      likes: "15.9K",
      shares: "3.4K",
      accentColor: "green-400",
      bgGradient: "from-slate-950 via-green-950/40 to-slate-950",
      visualPattern: "fluid",
      soundTheme: "forestScale",
      recommendationReason: "Perfect for down-regulating heart-rate variance based on high-pressure metrics",
      narrativeCaptions: [
        "Slow your walking pace right down.",
        "Listen to the gentle bird whistles high above.",
        "Your roots extend deeper than any daily temporary concern."
      ],
      scientificBase: "Algorithmic forest ambience and birdcalls reduce cortisol and restore depleted cognitive reserves."
    },
    {
      id: 4,
      title: "Silent Snowdrift Solitude",
      themeType: "snow",
      subtitle: "Absorb the absolute sound dampening of frozen wilderness",
      guideName: "Elena Rostova, Bio-therapeutic Lead",
      duration: "28s",
      likes: "12.8K",
      shares: "2.9K",
      accentColor: "blue-200",
      bgGradient: "from-slate-950 via-cyan-950/30 to-slate-950",
      visualPattern: "particles",
      soundTheme: "snowScale",
      recommendationReason: "Recommended for high brain chatter • Simulates sensory-deprivation calm",
      narrativeCaptions: [
        "Behold the millions of crystals slowly drifting.",
        "The snow blanket absorbs all physical pressure.",
        "Your mind is allowed to stay beautifully cold and still."
      ],
      scientificBase: "Simulated absorption and resonant bells decelerate rapid motor control chatter in the prefrontal cortex."
    },
    {
      id: 5,
      title: "Golden Singing Bowl Sanctuary",
      themeType: "meditation",
      subtitle: "Allow the Tibetan metallic harmonics to ring fully",
      guideName: "Lama Tenzin, Mindfulness Advisor",
      duration: "20s",
      likes: "21.6K",
      shares: "9.3K",
      accentColor: "amber-400",
      bgGradient: "from-slate-950 via-amber-950/50 to-slate-950",
      visualPattern: "expand",
      soundTheme: "bowlScale",
      recommendationReason: "Contains 528Hz Solfeggio • Perfect frequency translation to stabilize the heart rate",
      narrativeCaptions: [
        "Let the high ringing tone sweep straight through the pressure.",
        "Your forehead softens. Let the muscles behind your eyes melt.",
        "Vibrate in total harmony with pure geometric resonance."
      ],
      scientificBase: "Metallic overtone decay induces steady alpha brainwave generation (8-12Hz) for light awareness."
    },
    {
      id: 6,
      title: "6-Second Vagus Pacemaker",
      themeType: "breathing",
      subtitle: "Stabilize cardiac speed with 4-4-6 somatic pacing",
      guideName: "Zenith Neurological Labs",
      duration: "30s",
      likes: "32.4K",
      shares: "12.5K",
      accentColor: "rose-400",
      bgGradient: "from-slate-950 via-rose-950/45 to-slate-950",
      visualPattern: "expand",
      soundTheme: "breathingScale",
      recommendationReason: "Recommended because your recent logs indicate elevated somatic distress",
      narrativeCaptions: [
        "Inhale deep into your stomach as the orb expands.",
        "Hold with a calm chest, feeling your centers rest.",
        "Exhale fully, blowing all the air out of your body."
      ],
      scientificBase: "A prolonged exhalation (6 seconds) stimulates the vagus nerve, initiating acetylcholine relief."
    },
    {
      id: 7,
      title: "Radical Acceptance Matrix",
      themeType: "affirmation",
      subtitle: "Unburden yourself of what lies beyond today's power",
      guideName: "Dr. Clara Winters, Somatic Director",
      duration: "18s",
      likes: "19.2K",
      shares: "7.1K",
      accentColor: "violet-400",
      bgGradient: "from-slate-950 via-violet-950/40 to-slate-950",
      visualPattern: "fluid",
      soundTheme: "affirmationScale",
      recommendationReason: "Recommended to mitigate active guilt and cognitive looping",
      narrativeCaptions: [
        "What is done is done, and it was the best you could render.",
        "You do not need to fix everything tonight.",
        "You are already worthy of this breath, with no prerequisites."
      ],
      scientificBase: "Cognitive reframing paired with high-frequency microtones reduces threat reactivity in the amygdala."
    },
    {
      id: 8,
      title: "The Zero-Gravity Study Shield",
      themeType: "focus",
      subtitle: "Alpha-binaural locks to clear toxic workplace friction",
      guideName: "Marcus Vance, Sound Therapist",
      duration: "25s",
      likes: "14.3K",
      shares: "4.8K",
      accentColor: "indigo-400",
      bgGradient: "from-slate-950 via-indigo-950/45 to-slate-950",
      visualPattern: "wave",
      soundTheme: "focusScale",
      recommendationReason: "Optimized for study, coding, and restoring deep-attention levels",
      narrativeCaptions: [
        "Your deep focus is a sacred boundary.",
        "All ambient noise is pushed away outside this bubble.",
        "Allow the differential 10Hz tone to guide your flow."
      ],
      scientificBase: "10Hz alpha binaural entrainment coordinates parietal networks, reducing external distractions."
    },
    {
      id: 9,
      title: "Night Voyage to Orion",
      themeType: "sleep",
      subtitle: "Deep-delta sleep preparations with distant ocean wind",
      guideName: "Elena Rostova, Bio-therapeutic Lead",
      duration: "30s",
      likes: "28.9K",
      shares: "15.4K",
      accentColor: "fuchsia-400",
      bgGradient: "from-slate-950 via-fuchsia-950/30 to-slate-950",
      visualPattern: "particles",
      soundTheme: "sleepScale",
      recommendationReason: "We suggested this because sleep hours are close on your local time",
      narrativeCaptions: [
        "Unclench your jaw. Let your tongue fall away from your teeth.",
        "Let your hips sink deeply. Let the gravity do all the work.",
        "There is nothing more to analyze. Your shift is complete."
      ],
      scientificBase: "1.5Hz delta wave brain alignment prepares the sleep spindles for slow-wave restorative cycles (N3)."
    },
    {
      id: 10,
      title: "Bilateral Brain Ring Cleanse",
      themeType: "anxiety",
      subtitle: "EMDR-calibrated panning to break active panic peaks",
      guideName: "Zenith Neurological Labs",
      duration: "20s",
      likes: "35.1K",
      shares: "11.2K",
      accentColor: "teal-400",
      bgGradient: "from-slate-950 via-teal-950/45 to-slate-950",
      visualPattern: "bilateral",
      soundTheme: "anxietyScale",
      recommendationReason: "Recommended for rapid somatic de-escalation of acute panic or fear",
      narrativeCaptions: [
        "Follow the teal glowing dot with your eyes only.",
        "Keep your head still. Listen to the sound shift left-to-right.",
        "Let your autonomic system re-coordinate your stability."
      ],
      scientificBase: "Alternating bilateral audio and saccadic eye movements rapidly decrease traumatic hyper-arousal."
    },
    {
      id: 11,
      title: "Sensory Grounding Ritual (5-4-3-2-1)",
      themeType: "challenge",
      subtitle: "Escape the mental labyrinth through your five senses",
      guideName: "Lama Tenzin, Mindfulness Advisor",
      duration: "24s",
      likes: "17.4K",
      shares: "5.6K",
      accentColor: "green-300",
      bgGradient: "from-slate-950 via-emerald-900/30 to-slate-950",
      visualPattern: "fluid",
      soundTheme: "chimeScale",
      recommendationReason: "Brings racing future-oriented anxiety back into immediate physical parameters",
      narrativeCaptions: [
        "Look around: Name one physical object near you.",
        "Feel: Notice the exact surface underneath your fingertips.",
        "Listen: Focus on the continuous organic hum playing now."
      ],
      scientificBase: "Shifts neurotransmission from executive brain networks processing worry into physical somatic sensory cortexes."
    },
    {
      id: 12,
      title: "Glacial Aurora Flight over Fjord",
      themeType: "cinematic",
      subtitle: "Breathe with the slow moving light on high altitude peaks",
      guideName: "Marcus Vance, Sound Therapist",
      duration: "26s",
      likes: "20.1K",
      shares: "6.8K",
      accentColor: "cyan-400",
      bgGradient: "from-slate-950 via-cyan-950/40 to-slate-950",
      visualPattern: "wave",
      soundTheme: "organicScale",
      recommendationReason: "Recommended to restore vision tracking fatigue and expand neural spaciousness",
      narrativeCaptions: [
        "Watch the auroral ribbons twist above the quiet blue snow.",
        "Inhale the clean, ancient arctic atmosphere.",
        "There are massive spaces of stillness surrounding you."
      ],
      scientificBase: "Spacious visual panning evokes the 'Awe effect', triggering a natural release of stress-mitigating dopamine."
    },
    {
      id: 13,
      title: "The Heart-Handshake Story",
      themeType: "narrative",
      subtitle: "A reminder of quiet resilience under dark cloud covers",
      guideName: "Aethelgard High Well-being",
      duration: "30s",
      likes: "16.5K",
      shares: "4.7K",
      accentColor: "peach-400",
      bgGradient: "from-slate-950 via-amber-900/30 to-slate-950",
      visualPattern: "expand",
      soundTheme: "narratorScale",
      recommendationReason: "Recommended for restoring emotional warmth and soothing a sad mood profile",
      narrativeCaptions: [
        "An old oak tree loses its leaves every autumn.",
        "But it does not worry. It trusts the cycle of renewal.",
        "You, too, will grow beautiful new leaves in spring."
      ],
      scientificBase: "Narrative relaxation triggers oxytocin loops and replaces acute performance anxiety with hope."
    },
    {
      id: 14,
      title: "Thermal Vagus Cord Cooling",
      themeType: "vagus",
      subtitle: "Trigger the mammalian dive reflex for instant heart safety",
      guideName: "Dr. Clara Winters, Somatic Director",
      duration: "20s",
      likes: "22.3K",
      shares: "8.9K",
      accentColor: "sky-300",
      bgGradient: "from-slate-950 via-sky-900/35 to-slate-950",
      visualPattern: "wave",
      soundTheme: "vagusScale",
      recommendationReason: "Recommended to rapidly down-regulate biological panic and over-breathing spikes",
      narrativeCaptions: [
        "In your mind, touch cold spring water with both hands.",
        "Slowly feel the ice cool your cheeks and chest.",
        "Observe the heart rate instantly drop and find steady rest."
      ],
      scientificBase: "Cranial temperature proxies stimulate the trigeminal pathway, rapidly triggering peaceful bradycardia."
    },
    {
      id: 15,
      title: "Twilight Closure Session",
      themeType: "closure",
      subtitle: "Politely seal off your dynamic cognitive work workspace",
      guideName: "Lama Tenzin, Mindfulness Advisor",
      duration: "30s",
      likes: "25.4K",
      shares: "12.8K",
      accentColor: "amber-300",
      bgGradient: "from-slate-950 via-orange-950/30 to-slate-950",
      visualPattern: "fluid",
      soundTheme: "chimeScale",
      recommendationReason: "Perfect evening divider to guarantee high quality sleep waves",
      narrativeCaptions: [
        "Whisper: 'My effort today is completed.'",
        "Pardon your unfinished tasks. They will wait for tomorrow.",
        "Put your focus to bed first. Deep peace, restful traveller."
      ],
      scientificBase: "Completing symbolic cognitive cycles overrides the Zeigarnik effect, preventing evening stress."
    }
  ];

  // Particle systems generation
  useEffect(() => {
    const list = Array.from({ length: 15 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 6
    }));
    setParticleBlobs(list);
  }, []);

  // Update active seekers continuously to represent active community warmth
  useEffect(() => {
    const tracker = setInterval(() => {
      setActiveSeekers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(tracker);
  }, []);

  const getPresetDurations = () => {
    switch (breathingPreset) {
      case "box": return { inhale: 4, hold: 4, exhale: 4 };
      case "sleep": return { inhale: 4, hold: 7, exhale: 8 };
      case "resonant": return { inhale: 5, hold: 0, exhale: 5 };
      case "focus": return { inhale: 3, hold: 1, exhale: 3 };
      default: return { inhale: 4, hold: 4, exhale: 6 };
    }
  };

  // Synchronize Breath cycle clock perfectly with visual scaling and synthesizer pitch
  useEffect(() => {
    const du = getPresetDurations();
    const cycleInterval = setInterval(() => {
      setBreathTimer((prev) => {
        if (breathPhase === "Inhale") {
          if (prev <= 1) {
            if (du.hold > 0) {
              setBreathPhase("Hold");
              return du.hold;
            } else {
              setBreathPhase("Exhale");
              return du.exhale;
            }
          }
          return prev - 1;
        } else if (breathPhase === "Hold") {
          if (prev <= 1) {
            setBreathPhase("Exhale");
            return du.exhale;
          }
          return prev - 1;
        } else { // Exhale
          if (prev <= 1) {
            // Give calmness XP upon ending a full breath cycle!
            setCalmXP((xp) => {
              const nextXp = xp + 15;
              triggerXPToast(`✦ Breathing cycle completed (+15 Calmness XP!)`);
              return nextXp;
            });
            setBreathPhase("Inhale");
            return du.inhale;
          }
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(cycleInterval);
  }, [breathPhase, breathingPreset]);

  // Handle visual pulses matching breathing cycles
  useEffect(() => {
    let internalTimer = 0;
    const pulseInterval = setInterval(() => {
      internalTimer += 0.05;
      
      // Map breathing phase to target scale
      let baseScale = 1.0;
      if (breathPhase === "Inhale") {
        // Grow from 0.9 to 1.3
        const progress = (4 - breathTimer) / 4;
        baseScale = 0.9 + progress * 0.45;
      } else if (breathPhase === "Hold") {
        baseScale = 1.35 + Math.sin(internalTimer * 1.5) * 0.035; // gentle hum wobble
      } else {
        // Shrink from 1.35 to 0.9
        const progress = (6 - breathTimer) / 6;
        baseScale = 1.35 - progress * 0.45;
      }
      setVisualPulseScale(baseScale);

      // EMDR Bilateral panning animation
      setBilateralXOffset(Math.sin(internalTimer * 3.5) * 85);
    }, 50);

    return () => clearInterval(pulseInterval);
  }, [breathPhase, breathTimer]);

  // Audio activation and crossfading trigger
  useEffect(() => {
    if (isPlaying && !showSanctuaryIntro) {
      triggerActiveSynthesizer(activeIndex);
    } else {
      fadeAllSynthesizers();
    }
  }, [activeIndex, isPlaying, isMuted, resonancePower, showSanctuaryIntro]);

  // Clean-up sounds when leaving component
  useEffect(() => {
    return () => {
      activeSynthesizersRef.current.forEach((val) => {
        val.oscillators.forEach((osc) => {
          try { osc.stop(); } catch(e){}
        });
        val.intervals.forEach((interval) => {
          clearInterval(interval);
        });
      });
      activeSynthesizersRef.current.clear();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      stopLiveMixerSound();
    };
  }, []);

  // Sleep Timer countdown Effect (Feature #7)
  useEffect(() => {
    if (!sleepTimerActive || sleepTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setSleepTimerSeconds((prev) => {
        if (prev <= 1) {
          setSleepTimerActive(false);
          setIsPlaying(false);
          if (audioCtxRef.current && masterGainRef.current) {
            const now = audioCtxRef.current.currentTime;
            masterGainRef.current.gain.cancelScheduledValues(now);
            masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
            masterGainRef.current.gain.linearRampToValueAtTime(0.001, now + 4.0);
          }
          stopLiveMixerSound();
          triggerXPToast("💤 Sleep Timer finished. Soundscapes faded for restful sleep.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerActive, sleepTimerSeconds]);

  // Start or dynamically update live custom sound nodes (Feature #9 & Feature #10)
  const syncLiveMixerSounds = () => {
    initWebAudio();
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // A. Solfeggio Osc setup
    if (!liveSolfeggioGainRef.current) {
      liveSolfeggioGainRef.current = ctx.createGain();
      liveSolfeggioGainRef.current.connect(master);
    }
    liveSolfeggioGainRef.current.gain.setValueAtTime(isMuted ? 0 : solfeggioVolume * 0.35, ctx.currentTime);

    // If oscillator doesn't exist, create it
    if (!liveSolfeggioOscRef.current) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(solfeggioFreq, ctx.currentTime);
      osc.connect(liveSolfeggioGainRef.current);
      osc.start();
      liveSolfeggioOscRef.current = osc;

      // Unison oscillator for wider choral thickness
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(solfeggioFreq * 1.002, ctx.currentTime);
      osc2.connect(liveSolfeggioGainRef.current);
      osc2.start();
      liveSolfeggioOsc2Ref.current = osc2;
    } else {
      // Glide frequency smoothly
      liveSolfeggioOscRef.current.frequency.exponentialRampToValueAtTime(solfeggioFreq, ctx.currentTime + 0.5);
      if (liveSolfeggioOsc2Ref.current) {
        liveSolfeggioOsc2Ref.current.frequency.exponentialRampToValueAtTime(solfeggioFreq * 1.002, ctx.currentTime + 0.5);
      }
    }

    // B. Ocean Swells noise synthesis setup
    if (!liveOceanGainRef.current) {
      liveOceanGainRef.current = ctx.createGain();
      liveOceanGainRef.current.connect(master);
    }
    liveOceanGainRef.current.gain.setValueAtTime(isMuted ? 0 : oceanVolume * 0.35, ctx.currentTime);

    if (!liveOceanSourceRef.current) {
      // Build custom procedural pink-ish heavy lowpass wash
      const bufferSize = 4 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // rescale
        b6 = white * 0.115926;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      source.connect(filter);
      filter.connect(liveOceanGainRef.current);
      source.start();
      liveOceanSourceRef.current = source;

      // Low frequency automation interval for ocean tide movement
      const interval = setInterval(() => {
        if (!audioCtxRef.current || !liveOceanGainRef.current) return;
        const now = audioCtxRef.current.currentTime;
        const tide = 0.5 + Math.sin(now * 0.25) * 0.35; // tidal surge
        liveOceanGainRef.current.gain.linearRampToValueAtTime(isMuted ? 0 : oceanVolume * 0.35 * tide, now + 1.8);
      }, 2000);
      (window as any).oceanTideInterval = interval;
    }

    // C. Rain hum noise synthesis setup
    if (!liveRainGainRef.current) {
      liveRainGainRef.current = ctx.createGain();
      liveRainGainRef.current.connect(master);
    }
    liveRainGainRef.current.gain.setValueAtTime(isMuted ? 0 : rainVolume * 0.35, ctx.currentTime);

    if (!liveRainSourceRef.current) {
      // Build distinct white rain sound
      const bufferSize = 3 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.0, ctx.currentTime);
      source.connect(filter);
      filter.connect(liveRainGainRef.current);
      source.start();
      liveRainSourceRef.current = source;
    }
  };

  const stopLiveMixerSound = () => {
    try {
      if (liveSolfeggioOscRef.current) {
        liveSolfeggioOscRef.current.stop();
        liveSolfeggioOscRef.current = null;
      }
      if (liveSolfeggioOsc2Ref.current) {
        liveSolfeggioOsc2Ref.current.stop();
        liveSolfeggioOsc2Ref.current = null;
      }
      if (liveOceanSourceRef.current) {
        liveOceanSourceRef.current.stop();
        liveOceanSourceRef.current = null;
      }
      if (liveRainSourceRef.current) {
        liveRainSourceRef.current.stop();
        liveRainSourceRef.current = null;
      }
      if ((window as any).oceanTideInterval) {
        clearInterval((window as any).oceanTideInterval);
      }
    } catch (e) {}
  };

  // Sound mixer trigger Reactive binding
  useEffect(() => {
    if (activeTab === "customLab" && isPlaying) {
      syncLiveMixerSounds();
    } else {
      stopLiveMixerSound();
    }
  }, [activeTab, isPlaying, isMuted, solfeggioFreq, solfeggioVolume, oceanVolume, rainVolume]);

  const triggerXPToast = (msg: string) => {
    setXpToastMsg(msg);
    setShowXPToast(true);
    setTimeout(() => {
      setShowXPToast(false);
    }, 3000);
  };

  const initWebAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
      
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : 0.6, audioCtxRef.current.currentTime);
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const fadeAllSynthesizers = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    activeSynthesizersRef.current.forEach((val, idx) => {
      const now = ctx.currentTime;
      try {
        val.gainNode.gain.cancelScheduledValues(now);
        val.gainNode.gain.setValueAtTime(val.gainNode.gain.value, now);
        val.gainNode.gain.linearRampToValueAtTime(0.001, now + 1.2);
        
        // Schedule physical cutoff stop and removal
        setTimeout(() => {
          val.oscillators.forEach((osc) => {
            try { osc.stop(); } catch(e){}
          });
          val.intervals.forEach((i) => clearInterval(i));
          activeSynthesizersRef.current.delete(idx);
        }, 1300);
      } catch (err) {}
    });
  };

  const triggerActiveSynthesizer = (index: number) => {
    initWebAudio();
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    // 1. Smoothly fade out other indexes
    activeSynthesizersRef.current.forEach((val, key) => {
      if (key !== index) {
        const now = ctx.currentTime;
        try {
          val.gainNode.gain.cancelScheduledValues(now);
          val.gainNode.gain.setValueAtTime(val.gainNode.gain.value, now);
          val.gainNode.gain.linearRampToValueAtTime(0.001, now + 1.2);
          
          setTimeout(() => {
            if (activeSynthesizersRef.current.get(key) === val) {
              val.oscillators.forEach((osc) => {
                try { osc.stop(); } catch(e){}
              });
              val.intervals.forEach((i) => clearInterval(i));
              activeSynthesizersRef.current.delete(key);
            }
          }, 1300);
        } catch (e) {}
      }
    });

    // 2. If already playing this index, just make sure volume is aligned and return
    if (activeSynthesizersRef.current.has(index)) {
      const current = activeSynthesizersRef.current.get(index);
      if (current) {
        const now = ctx.currentTime;
        const targetVol = isMuted ? 0 : resonancePower * 0.55;
        current.gainNode.gain.cancelScheduledValues(now);
        current.gainNode.gain.setValueAtTime(current.gainNode.gain.value, now);
        current.gainNode.gain.linearRampToValueAtTime(targetVol, now + 1.0);
      }
      return;
    }

    // 3. Create fresh synthesizer nodes for index
    const activeReel = reels[index];
    const itemGain = ctx.createGain();
    itemGain.gain.setValueAtTime(0.001, ctx.currentTime);
    itemGain.connect(master);

    const oscTrackList: any[] = [];
    const intervalTrackList: any[] = [];

    const now = ctx.currentTime;

    // Helper: Build procedural noise helper
    const makeNoiseSource = (filteredFreq: number, QVal: number, filterType: "lowpass" | "bandpass") => {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filteredFreq, ctx.currentTime);
      filter.Q.setValueAtTime(QVal, ctx.currentTime);

      noiseNode.connect(filter);
      return { source: noiseNode, filterNode: filter };
    };

    // Synthesizer architecture matching user requirements precisely
    switch (activeReel.soundTheme) {
      case "oceanScale": {
        // Swelling Ocean Waves + slow chords on electric pine piano
        const noise = makeNoiseSource(450, 1.5, "lowpass");
        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.35, now);
        noise.filterNode.connect(waveGain).connect(itemGain);
        noise.source.start(now);
        oscTrackList.push(noise.source);

        // LFO that models rolling sea tides
        const tideLFO = ctx.createOscillator();
        tideLFO.frequency.setValueAtTime(0.08, now); // 12 seconds full tide swell
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(300, now);
        tideLFO.connect(lfoGain).connect(noise.filterNode.frequency);
        tideLFO.start(now);
        oscTrackList.push(tideLFO);

        // Slow ambient minor 9th and major 7th chord swells (Pacific vibe)
        const chordPitches = [110, 165, 220, 275, 330]; // A Major 7 chord layout
        chordPitches.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          
          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.05, now);
          
          // Pitch wobble to simulate oceanic warm wind drifting
          const wobble = ctx.createOscillator();
          wobble.frequency.setValueAtTime(0.1 + idx * 0.03, now);
          const wobbleGain = ctx.createGain();
          wobbleGain.gain.value = 1.5;
          wobble.connect(wobbleGain).connect(osc.frequency);
          wobble.start(now);
          oscTrackList.push(wobble);

          osc.connect(oscGain).connect(itemGain);
          osc.start(now);
          oscTrackList.push(osc);
        });
        break;
      }

      case "rainScale": {
        // High frequency raindops (subtle noise bandpass pops)
        const rainNoise = makeNoiseSource(2500, 4.0, "bandpass");
        const rainGainNode = ctx.createGain();
        rainGainNode.gain.setValueAtTime(0.2, now);
        rainNoise.filterNode.connect(rainGainNode).connect(itemGain);
        rainNoise.source.start(now);
        oscTrackList.push(rainNoise.source);

        // Dynamic occasional distant thunder rumbles
        const triggerThunder = () => {
          if (!audioCtxRef.current) return;
          const thunderOsc = ctx.createOscillator();
          thunderOsc.type = "triangle";
          thunderOsc.frequency.setValueAtTime(45, ctx.currentTime);
          
          const tFilter = ctx.createBiquadFilter();
          tFilter.type = "lowpass";
          tFilter.frequency.setValueAtTime(65, ctx.currentTime);
          
          const tGain = ctx.createGain();
          tGain.gain.setValueAtTime(0.001, ctx.currentTime);
          tGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 1.0);
          tGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
          
          thunderOsc.connect(tFilter).connect(tGain).connect(itemGain);
          thunderOsc.start();
          setTimeout(() => {
            try { thunderOsc.stop(); } catch(e){}
          }, 5000);
        };

        // Trigger thunder immediately and then once every 12 seconds
        triggerThunder();
        const thunderInterval = setInterval(triggerThunder, 12000);
        intervalTrackList.push(thunderInterval);

        // Binaural relaxation waves (Theta Sleep Bridge 150Hz Left, 156Hz Right)
        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.value = 150;
        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.value = 156;

        const pL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const binauralGain = ctx.createGain();
        binauralGain.gain.value = 0.25;

        if (pL && pR) {
          pL.pan.value = -1;
          pR.pan.value = 1;
          oscL.connect(pL).connect(binauralGain);
          oscR.connect(pR).connect(binauralGain);
        } else {
          oscL.connect(binauralGain);
          oscR.connect(binauralGain);
        }
        binauralGain.connect(itemGain);
        oscL.start();
        oscR.start();
        oscTrackList.push(oscL, oscR);
        break;
      }

      case "forestScale": {
        // Gentle tree canopy rustles (Brown-like noise with sweeping filter value)
        const foliage = makeNoiseSource(150, 0.8, "lowpass");
        const folGain = ctx.createGain();
        folGain.gain.setValueAtTime(0.2, now);
        foliage.filterNode.connect(folGain).connect(itemGain);
        foliage.source.start(now);
        oscTrackList.push(foliage.source);

        // Sweeping foliage wind
        const windLfo = ctx.createOscillator();
        windLfo.frequency.setValueAtTime(0.15, now);
        const wlfoGain = ctx.createGain();
        wlfoGain.gain.setValueAtTime(100, now);
        windLfo.connect(wlfoGain).connect(foliage.filterNode.frequency);
        windLfo.start(now);
        oscTrackList.push(windLfo);

        // Algorithmic high birds chirping
        const chirpChimes = () => {
          if (!audioCtxRef.current) return;
          const osc1 = ctx.createOscillator();
          osc1.type = "sine";
          const carrier = 1400 + Math.random() * 800;
          osc1.frequency.setValueAtTime(carrier, ctx.currentTime);
          
          // chirp envelope
          const cGain = ctx.createGain();
          cGain.gain.setValueAtTime(0.001, ctx.currentTime);
          cGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
          cGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

          // Fast chirp sweep down
          osc1.frequency.exponentialRampToValueAtTime(carrier * 0.6, ctx.currentTime + 0.3);

          osc1.connect(cGain).connect(itemGain);
          osc1.start();
          setTimeout(() => {
            try { osc1.stop(); } catch(e){}
          }, 500);
        };

        const chirpInterval = setInterval(chirpChimes, 3500);
        intervalTrackList.push(chirpInterval);

        // Sage green backing chords (Warm organic woodwinds)
        const roots = [220, 261.6, 329.6, 392]; // Am7 layout
        roots.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);
          
          const scaleFilter = ctx.createBiquadFilter();
          scaleFilter.type = "lowpass";
          scaleFilter.frequency.setValueAtTime(320, now);

          const scaleGain = ctx.createGain();
          scaleGain.gain.setValueAtTime(0.12, now);

          osc.connect(scaleFilter).connect(scaleGain).connect(itemGain);
          osc.start(now);
          oscTrackList.push(osc);
        });
        break;
      }

      case "snowScale": {
        // Cold frozen dry wind (resonant bandpass noise filter)
        const wind = makeNoiseSource(800, 3.2, "bandpass");
        const wGain = ctx.createGain();
        wGain.gain.setValueAtTime(0.18, now);
        wind.filterNode.connect(wGain).connect(itemGain);
        wind.source.start(now);
        oscTrackList.push(wind.source);

        // Wind speed slow swells
        const swellLfo = ctx.createOscillator();
        swellLfo.frequency.setValueAtTime(0.2, now);
        const sgain = ctx.createGain();
        sgain.gain.setValueAtTime(400, now);
        swellLfo.connect(sgain).connect(wind.filterNode.frequency);
        swellLfo.start(now);
        oscTrackList.push(swellLfo);

        // Ice crystal bell ring triggers
        const ringCrystal = () => {
          if (!audioCtxRef.current) return;
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1500 + Math.random() * 1200, ctx.currentTime);
          
          const ringGainOn = ctx.createGain();
          ringGainOn.gain.setValueAtTime(0.04, ctx.currentTime);
          ringGainOn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
          
          osc.connect(ringGainOn).connect(itemGain);
          osc.start();
          setTimeout(() => {
            try { osc.stop(); } catch(e){}
          }, 3100);
        };

        const crystalInterval = setInterval(ringCrystal, 4200);
        intervalTrackList.push(crystalInterval);
        break;
      }

      case "bowlScale": {
        // Singing Bowls: complex non-harmonic frequencies (multi-oscillator metallic rub)
        const bowlFundamentals = [218, 327, 436, 545, 654];
        bowlFundamentals.forEach((pitch, order) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          // Add random human detune
          osc.frequency.setValueAtTime(pitch + (Math.random() * 1.5 - 0.75), now);
          
          const bowlGain = ctx.createGain();
          const baseV = 0.28 / (order + 1.2);
          bowlGain.gain.setValueAtTime(baseV, now);

          // Breathe LFO cycle for rub swell modulation
          const breatheMod = ctx.createOscillator();
          breatheMod.frequency.setValueAtTime(0.1 + order * 0.03, now);
          const breatheGain = ctx.createGain();
          breatheGain.gain.setValueAtTime(baseV * 0.55, now);
          breatheMod.connect(breatheGain).connect(bowlGain.gain);
          breatheMod.start(now);
          oscTrackList.push(breatheMod);

          osc.connect(bowlGain).connect(itemGain);
          osc.start(now);
          oscTrackList.push(osc);
        });

        // 528Hz Solfeggio backdrop
        const osc528 = ctx.createOscillator();
        osc528.type = "sine";
        osc528.frequency.setValueAtTime(528, now);
        const gain528 = ctx.createGain();
        gain528.gain.setValueAtTime(0.12, now);
        osc528.connect(gain528).connect(itemGain);
        osc528.start(now);
        oscTrackList.push(osc528);
        break;
      }

      case "breathingScale": {
        // Harmonic warm chords shifting pitch during Inhale/Exhale phase changes
        const chordBasePitches = [110, 165, 220, 275]; // Grounding Major drone
        chordBasePitches.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          const scaleGain = ctx.createGain();
          scaleGain.gain.setValueAtTime(0.14, now);

          // Modulator that sweeps volume syncing with Inhale & Exhale state
          const mod = ctx.createOscillator();
          mod.frequency.setValueAtTime(0.1, now);
          const mg = ctx.createGain();
          mg.gain.setValueAtTime(0.08, now);
          mod.connect(mg).connect(scaleGain.gain);
          mod.start(now);
          oscTrackList.push(mod);

          osc.connect(scaleGain).connect(itemGain);
          osc.start(now);
          oscTrackList.push(osc);
        });

        // Delicate chime trigger on breath phase swap
        const triggerChime = () => {
          if (!audioCtxRef.current) return;
          const chime = ctx.createOscillator();
          chime.type = "sine";
          chime.frequency.setValueAtTime(987.77, ctx.currentTime); // high B note
          const cg = ctx.createGain();
          cg.gain.setValueAtTime(0.06, ctx.currentTime);
          cg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
          chime.connect(cg).connect(itemGain);
          chime.start();
          setTimeout(() => {
            try { chime.stop(); } catch(e){}
          }, 3200);
        };

        // Trigger chime on component change
        triggerChime();
        break;
      }

      case "anxietyScale": {
        // EMDR Bilateral alternating sound (slowly sweeping Left to Right and back)
        const leftOsc = ctx.createOscillator();
        leftOsc.type = "sine";
        leftOsc.frequency.setValueAtTime(130, now); // heavy calming frequency

        const rightOsc = ctx.createOscillator();
        rightOsc.type = "sine";
        rightOsc.frequency.setValueAtTime(130.5, now); // slight beat frequency

        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const outputGain = ctx.createGain();
        outputGain.gain.setValueAtTime(0.38, now);

        if (pannerL && pannerR) {
          leftOsc.connect(pannerL).connect(outputGain);
          rightOsc.connect(pannerR).connect(outputGain);
          
          leftOsc.start(now);
          rightOsc.start(now);
          oscTrackList.push(leftOsc, rightOsc);

          // Automated bilateral panner sweep LFO (every 4 seconds)
          const sweepLfo = ctx.createOscillator();
          sweepLfo.frequency.setValueAtTime(0.25, now);
          
          const sweepGainL = ctx.createGain();
          sweepGainL.gain.setValueAtTime(1.0, now);
          sweepLfo.connect(sweepGainL).connect(pannerL.pan);

          const sweepGainR = ctx.createGain();
          sweepGainR.gain.setValueAtTime(-1.0, now);
          sweepLfo.connect(sweepGainR).connect(pannerR.pan);

          sweepLfo.start(now);
          oscTrackList.push(sweepLfo);
        } else {
          leftOsc.connect(outputGain);
          rightOsc.connect(outputGain);
          leftOsc.start(now);
          rightOsc.start(now);
          oscTrackList.push(leftOsc, rightOsc);
        }
        outputGain.connect(itemGain);
        break;
      }

      case "sleepScale": {
        // Delta waves (warm low fundamentals at 80Hz, offset by 1.5Hz for deep sleep entrainment)
        const deepOscL = ctx.createOscillator();
        deepOscL.type = "sine";
        deepOscL.frequency.setValueAtTime(80, now);

        const deepOscR = ctx.createOscillator();
        deepOscR.type = "sine";
        deepOscR.frequency.setValueAtTime(81.5, now); // 1.5Hz sleep gap

        const lPan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const rPan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const sleepG = ctx.createGain();
        sleepG.gain.setValueAtTime(0.42, now);

        if (lPan && rPan) {
          lPan.pan.value = -1;
          rPan.pan.value = 1;
          deepOscL.connect(lPan).connect(sleepG);
          deepOscR.connect(rPan).connect(sleepG);
        } else {
          deepOscL.connect(sleepG);
          deepOscR.connect(sleepG);
        }
        sleepG.connect(itemGain);
        deepOscL.start(now);
        deepOscR.start(now);
        oscTrackList.push(deepOscL, deepOscR);

        // Add soft evening wind gusts
        const nocturnalWind = makeNoiseSource(190, 0.6, "lowpass");
        const nwg = ctx.createGain();
        nwg.gain.setValueAtTime(0.12, now);
        nocturnalWind.filterNode.connect(nwg).connect(itemGain);
        nocturnalWind.source.start(now);
        oscTrackList.push(nocturnalWind.source);
        break;
      }

      case "focusScale": {
        // 10Hz Alpha focus generator (binaural 140Hz L / 150Hz R)
        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.setValueAtTime(140, now);

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.setValueAtTime(150, now);

        const focusPanL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const focusPanR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const focusGainNode = ctx.createGain();
        focusGainNode.gain.setValueAtTime(0.35, now);

        if (focusPanL && focusPanR) {
          focusPanL.pan.value = -1;
          focusPanR.pan.value = 1;
          oscL.connect(focusPanL).connect(focusGainNode);
          oscR.connect(focusPanR).connect(focusGainNode);
        } else {
          oscL.connect(focusGainNode);
          oscR.connect(focusGainNode);
        }
        focusGainNode.connect(itemGain);
        oscL.start(now);
        oscR.start(now);
        oscTrackList.push(oscL, oscR);

        // Cozy ambient background low piano resonance chords
        const studyPitches = [220, 261.6, 293.7, 349.2]; // F major chords
        studyPitches.forEach((freq) => {
          const droneOsc = ctx.createOscillator();
          droneOsc.type = "triangle";
          droneOsc.frequency.setValueAtTime(freq, now);
          
          const dFilter = ctx.createBiquadFilter();
          dFilter.type = "lowpass";
          dFilter.frequency.setValueAtTime(240, now);

          const dG = ctx.createGain();
          dG.gain.setValueAtTime(0.08, now);

          droneOsc.connect(dFilter).connect(dG).connect(itemGain);
          droneOsc.start(now);
          oscTrackList.push(droneOsc);
        });
        break;
      }

      default: {
        // Default warm solfeggio chords + chimes
        const droneFrequencies = [110, 165, 220, 330];
        droneFrequencies.forEach((pitch) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(pitch, now);
          const dGain = ctx.createGain();
          dGain.gain.setValueAtTime(0.12, now);
          osc.connect(dGain).connect(itemGain);
          osc.start(now);
          oscTrackList.push(osc);
        });

        const triggerChimeCycle = () => {
          if (!audioCtxRef.current) return;
          const chimeOsc = ctx.createOscillator();
          chimeOsc.type = "sine";
          chimeOsc.frequency.setValueAtTime(500 + Math.random() * 600, ctx.currentTime);
          const cg = ctx.createGain();
          cg.gain.setValueAtTime(0.05, ctx.currentTime);
          cg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
          chimeOsc.connect(cg).connect(itemGain);
          chimeOsc.start();
          setTimeout(() => {
            try { chimeOsc.stop(); } catch(e){}
          }, 2700);
        };

        const intervalId = setInterval(triggerChimeCycle, 2900);
        intervalTrackList.push(intervalId);
        break;
      }
    }

    // 4. Trigger gradual fade IN of local gain channel
    const targetMainVolume = isMuted ? 0 : resonancePower * 0.55;
    itemGain.gain.cancelScheduledValues(now);
    itemGain.gain.setValueAtTime(0.001, now);
    itemGain.gain.linearRampToValueAtTime(targetMainVolume, now + 1.4);

    // Save playing nodes for future index change crossfades
    activeSynthesizersRef.current.set(index, {
      gainNode: itemGain,
      oscillators: oscTrackList,
      intervals: intervalTrackList
    });
  };

  const handleNextReel = () => {
    setActiveIndex((prev) => {
      const nextIndex = (prev + 1) % reels.length;
      // Increment calmness XP when navigating or exploring new reels
      awardXP(10, `Explored: ${reels[nextIndex].title}`);
      return nextIndex;
    });
  };

  const handlePrevReel = () => {
    setActiveIndex((prev) => {
      const prevIndex = (prev - 1 + reels.length) % reels.length;
      awardXP(5, `Navigated to ${reels[prevIndex].title}`);
      return prevIndex;
    });
  };

  const awardXP = (amount: number, reason: string) => {
    setCalmXP((prev) => {
      const nextXp = prev + amount;
      triggerXPToast(`+${amount} Calmness XP (${reason})`);
      
      // Unlock new milestones dynamically
      if (nextXp >= 150 && !milestonesMet.includes("Vagus Initiate")) {
        setMilestonesMet((m) => [...m, "Vagus Initiate"]);
        triggerXPToast("🏆 Milestone Reached: 'Vagus Initiate' Unlocked!");
      }
      if (nextXp >= 250 && !milestonesMet.includes("Acoustic Zen Master")) {
        setMilestonesMet((m) => [...m, "Acoustic Zen Master"]);
        triggerXPToast("🏆 Milestone Reached: 'Acoustic Zen Master' Saved!");
      }
      return nextXp;
    });
  };

  const togglePlaybackState = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      awardXP(15, "Sanctuary Sound Engine Activated");
    } else {
      setIsPlaying(false);
    }
  };

  const toggleMutedState = () => {
    setIsMuted(!isMuted);
    awardXP(5, isMuted ? "Audio Unmuted" : "Somatic Silenced");
  };

  const toggleLikeReel = (id: number) => {
    setLikedReels((prev) => {
      const wasLiked = prev[id];
      const nextVal = !wasLiked;
      if (nextVal) {
        awardXP(15, "Reel saved in Heart Locker");
      }
      return { ...prev, [id]: nextVal };
    });
  };

  const toggleSaveReel = (id: number) => {
    setSavedReels((prev) => {
      const wasSaved = prev[id];
      const nextVal = !wasSaved;
      if (nextVal) {
        awardXP(15, "Mindfulness vault secured");
      }
      return { ...prev, [id]: nextVal };
    });
  };

  const handleEnterSanctuary = () => {
    setShowSanctuaryIntro(false);
    setIsPlaying(true);
    initWebAudio();
    awardXP(20, "Sanctuary Sacred Threshold Crossed");
  };

  const handleMoodSelect = (mood: string) => {
    setUserMood(mood);
    awardXP(10, `Autonomic alignment matched to: ${mood.toUpperCase()}`);
    
    // Jump user directly to the reel type recommended for this mood
    let matchedIndex = 0;
    if (mood === "anxious") {
      matchedIndex = 9; // EMDR Bilateral brain ring to break panic
    } else if (mood === "sad") {
      matchedIndex = 12; // Narrative oak story for emotional warmth
    } else if (mood === "fatigued") {
      matchedIndex = 7; // Focus study alpha shield to restore charge
    } else if (mood === "restless") {
      matchedIndex = 5; // Box breathing vagus pacemaker (index 5)
    } else {
      matchedIndex = 0; // standard ocean waves
    }
    setActiveIndex(matchedIndex);
  };

  const activeReel = reels[activeIndex];

  return (
    <div className="relative w-full max-w-xl mx-auto px-1 animate-fade-in text-slate-100 font-sans h-[82vh] flex flex-col">
      
      {/* FLOATING XP NOTIFICATION TOAST */}
      {showXPToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold py-2 px-4 rounded-full shadow-2xl flex items-center gap-2">
            <Sparkles size={12} className="text-amber-400 animate-spin-slow" />
            <span>{xpToastMsg}</span>
          </div>
        </div>
      )}

      {/* SANCTUARY ENTRY SPLASH SCREEN */}
      {showSanctuaryIntro ? (
        <div className="absolute inset-0 z-40 flex flex-col justify-between p-6 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.95)_0%,rgba(2,6,23,1)_100%)] border border-slate-800/80 overflow-hidden shadow-2xl">
          
          {/* Subtle liquid blob drift */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

          {/* Floating particle network background */}
          <div className="absolute inset-0 pointer-events-none">
            {particleBlobs.map((p) => (
              <div 
                key={p.id}
                style={{
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  top: `-${p.size}px`,
                  animation: `bounce ${4 + p.delay}s infinite linear`,
                  animationDelay: `${p.delay}s`,
                }}
                className="absolute bg-sky-500/15 rounded-full"
              />
            ))}
          </div>

          <div className="text-center pt-8 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest animate-pulse">
              <Compass size={11} />
              <span>Sanctuary Channel</span>
            </span>
            <h1 className="font-serif italic text-3xl font-extrabold text-slate-100 tracking-tight mt-6 leading-tight">
              Relief Reels
            </h1>
            <p className="text-slate-400 text-xs mt-2 font-mono">
              Replace Mindless Scrolling with Mindful Recovery
            </p>
          </div>

          {/* SACRED NEUROSCIENCE QUOTE CELL */}
          <div className="my-auto text-center z-10 px-4 py-8 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-2xl">
            <p className="text-lg font-serif italic text-amber-100 font-semibold leading-relaxed tracking-wide animate-pulse-slow">
              "Take a moment. Breathe. You are safe here."
            </p>
            <div className="w-16 h-[1px] bg-amber-500/30 mx-auto my-4" />
            <p className="text-[11px] text-slate-400 leading-normal max-w-sm mx-auto">
              You are entering an algorithmic safe haven modeled with biharmonic frequencies, vagal breathing loops, and somatic eye tracking triggers.
            </p>
          </div>

          {/* INTERACTIVE ENTRANCE PORT */}
          <div className="text-center pb-8 z-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Users size={11} className="text-sky-400 animate-pulse" />
              <span>{activeSeekers} Seekers Calming Together Live</span>
            </div>

            <button
              onClick={handleEnterSanctuary}
              className="group relative flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-400 text-slate-950 hover:from-amber-400 hover:to-rose-300 font-bold text-sm uppercase tracking-widest rounded-full transition-all duration-300 active:scale-95 shadow-xl shadow-amber-500/20 border border-amber-300/30 font-sans"
            >
              <span>Enter Sanctuary</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
            <span className="text-[9px] text-slate-500 font-mono lowercase">headphones highly recommended for binaural pan alignment</span>
          </div>

        </div>
      ) : null}

      {/* HEADER CONTROLS (Glass Shelf) */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-2xl p-3 flex flex-col gap-2.5 shadow-xl mb-2 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-amber-500/20 to-rose-500/10 text-amber-400 rounded-xl">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <span>Relief Reels</span>
                <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono font-extrabold px-1.5 py-0.2 rounded">
                  SERENITY Sound ENGINE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {activeIndex + 1}/{reels.length} • {activeReel.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nav Swappers */}
            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setActiveTab("viewer")}
                className={`py-1 px-3.5 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider transition-all ${
                  activeTab === "viewer"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`py-1 px-3.5 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider transition-all flex items-center gap-1 ${
                  activeTab === "achievements"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Award size={10} />
                <span>Streaks ({calmXP} XP)</span>
              </button>
            </div>

            {/* Muted Switcher */}
            <button
              onClick={toggleMutedState}
              className={`p-2 rounded-xl transition-all active:scale-90 border ${
                isMuted
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>

        {/* AUTONOMIC ALIGNMENT FILTER DROPDOWN */}
        <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 text-[10px]">
          <span className="text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Target Emotion:</span>
          </span>
          <div className="flex items-center gap-1.5">
            {["stressed", "anxious", "sad", "fatigued"].map((item) => (
              <button
                key={item}
                onClick={() => handleMoodSelect(item)}
                className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wide transition-all border ${
                  userMood === item
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "achievements" ? (
        /* ACCREDITED ACHIEVEMENTS PORTAL (Healthy engagement scorecard) */
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-3xl p-5 flex-1 overflow-y-auto space-y-4">
          <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5">
            <Award className="w-10 h-10 text-amber-400 mx-auto animate-bounce mb-2" />
            <h4 className="font-serif italic font-bold text-slate-100 text-base">Your Autonomic Recovery Hub</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              You earn Calmness XP for every breath cycle completed and reel explored. No vanity likes, no cognitive competition.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[9px] text-slate-400 block uppercase">Continuous Zen Streak</span>
              <span className="text-xl font-bold text-amber-300 block mt-1">{currentStreak} Days</span>
              <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">Consecutive somatic pauses logged</span>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[9px] text-slate-400 block uppercase">Calmness Points</span>
              <span className="text-xl font-bold text-emerald-400 block mt-1">{calmXP} XP</span>
              <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">Rewards unlocked from respiratory flow</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Milestones Unlocked</span>
            {milestonesMet.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                <CheckCircle size={14} className="text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-100 block">{item}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Credential authorized under neurological calm score</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2.5 p-3 bg-slate-900/30 border border-slate-800/60 rounded-xl opacity-60">
              <Award size={14} className="text-slate-500" />
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Vagal Alchemist Badge (Lock)</span>
                <span className="text-[8px] text-slate-500 font-mono">Requires 300 Calmness XP to authorize neurological tier</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("viewer")}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
          >
            Return to Sanctuary Channel
          </button>
        </div>
      ) : activeTab === "customLab" ? (
        /* CUSTOM SOMATIC LAB PANEL (Features 7, 8, 9, 10) */
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-3xl p-5 flex-1 overflow-y-auto space-y-5">
          <div className="text-center py-4 bg-gradient-to-br from-amber-500/10 to-emerald-500/5 rounded-2xl border border-slate-900">
            <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-300 font-mono tracking-widest uppercase rounded">acoustic alchemy</span>
            <h4 className="font-serif italic font-bold text-slate-100 text-base mt-1.5">Somatic Tuning Laboratory</h4>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
              Design a customized neuro-auditory relief field. Blend natural procedural washes with Solfeggio frequencies and synchronized breath.
            </p>
          </div>

          {/* Interactive Play/Pause Master switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-slate-100 block">Synthesizer Status</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {isPlaying ? "● TRANSMITTING AUDIO WAVE" : "○ SYNTHESIZER SUSPENDED"}
              </span>
            </div>
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                awardXP(10, "Custom lab play toggled");
              }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wide rounded-full transition-all cursor-pointer ${
                isPlaying 
                  ? "bg-rose-500 text-white" 
                  : "bg-emerald-500 text-slate-950"
              }`}
            >
              {isPlaying ? "Mute Waves" : "Activate Waves"}
            </button>
          </div>

          {/* FEATURE 7: SLEEP TIMER COMPONENT */}
          <div className="space-y-3 p-4 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>💤</span>
                <span>Quiet Brain Sleep Timer</span>
              </span>
              {sleepTimerActive && (
                <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 font-mono text-sky-400 font-bold animate-pulse rounded">
                  FADING IN: {Math.floor(sleepTimerSeconds / 60)}:{(sleepTimerSeconds % 60).toString().padStart(2, "0")}
                </span>
              )}
            </div>
            
            <p className="text-[9.5px] text-slate-400 leading-relaxed font-mono">
              Select an auto-fade countdown. Once reached, Neuraliso will smoothly taper gains to zero to promote restful REM cycles.
            </p>

            <div className="grid grid-cols-5 gap-1">
              {[0, 15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    if (mins === 0) {
                      setSleepTimerActive(false);
                      setSleepTimerSeconds(0);
                    } else {
                      setSleepTimerSeconds(mins * 60);
                      setSleepTimerActive(true);
                      setIsPlaying(true);
                      triggerXPToast(`💤 Sleep timer engaged for ${mins} minutes`);
                    }
                  }}
                  className={`py-1.5 rounded-lg text-[10px] font-mono transition-all border ${
                    (mins === 0 && !sleepTimerActive) || (sleepTimerActive && sleepTimerSeconds === mins * 60)
                      ? "bg-sky-500/20 text-sky-300 border-sky-400/40 font-bold"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {mins === 0 ? "Off" : `${mins}m`}
                </button>
              ))}
            </div>
          </div>

          {/* FEATURE 8: CUSTOM BREATHING PACING PRESETS */}
          <div className="space-y-3 p-4 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>🌬️</span>
                <span>Respiratory Preset Driver</span>
              </span>
              <span className="text-[9.5px] font-mono text-amber-400 uppercase">
                ACTIVE PHASE: {breathPhase} ({breathTimer}s)
              </span>
            </div>

            <p className="text-[9.5px] text-slate-400 leading-relaxed font-mono">
              Switch respiratory loops. Physical expansion alters heart rate variability pathways instantly.
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "default", name: "Default Calm (4s-4s-6s)" },
                { id: "box", name: "Box Breathing (4s-4s-4s)" },
                { id: "sleep", name: "4-7-8 Deep Sleep (4s-7s-8s)" },
                { id: "resonant", name: "Resonant Harmony (5s-5s)" },
                { id: "focus", name: "Focus Activation (3s-1s-3s)" }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setBreathingPreset(p.id as any);
                    setBreathPhase("Inhale");
                    const targetFirst = p.id === "resonant" ? 5 : 4;
                    setBreathTimer(targetFirst);
                    triggerXPToast(`🌬️ Switched to ${p.name}`);
                  }}
                  className={`p-2 rounded-xl text-[10px] text-left transition-all border block ${
                    breathingPreset === p.id 
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/50 font-bold"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* FEATURE 9: SOLFEGGIO FREQUENCY TUNERS */}
          <div className="space-y-3 p-4 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
            <span className="text-xs font-bold text-slate-100 block">
              🧬 Solfeggio Natural Tuner Override
            </span>
            <p className="text-[9.5px] text-slate-400 leading-relaxed font-mono">
              Override standard scales with exact natural resonance frequencies known to harmonize neurological feedback loops.
            </p>

            <div className="grid grid-cols-1 gap-1.5">
              {[
                { freq: 396, label: "396 Hz - Detach Guilt & Panic" },
                { freq: 432, label: "432 Hz - Cosmic Organic Grounding" },
                { freq: 528, label: "528 Hz - Solace Heart & Transformation" },
                { freq: 639, label: "639 Hz - Harmonic Relationship Resonance" },
                { freq: 852, label: "852 Hz - Intuitive Sensory Awareness" }
              ].map((sf) => (
                <button
                  key={sf.freq}
                  onClick={() => {
                    setSolfeggioFreq(sf.freq);
                    triggerXPToast(`🧬 Tuned transducer to ${sf.freq} Hz frequency`);
                  }}
                  className={`p-2 rounded-xl text-[10px] text-left transition-all border flex justify-between items-center ${
                    solfeggioFreq === sf.freq
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/50 font-bold"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{sf.label}</span>
                  {solfeggioFreq === sf.freq && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* FEATURE 10: AMBIENT SOUNDS LAYER MIXER */}
          <div className="space-y-3 p-4 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
            <span className="text-xs font-bold text-slate-100 block">
              🎚️ Acoustic Layer Mixer Sliders
            </span>
            <p className="text-[9.5px] text-slate-400 leading-relaxed font-mono">
              Independently shape each therapeutic node level to align with your sensory needs.
            </p>

            <div className="space-y-3.5 pt-1">
              {/* Solfeggio slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-emerald-400">Solfeggio Resonance Volume</span>
                  <span className="text-slate-200">{Math.round(solfeggioVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={solfeggioVolume * 100}
                  onChange={(e) => setSolfeggioVolume(Number(e.target.value) / 100)}
                  className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer p-0 m-0"
                />
              </div>

              {/* Ocean slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-sky-400">Ocean Tide Waves Volume</span>
                  <span className="text-slate-200">{Math.round(oceanVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={oceanVolume * 100}
                  onChange={(e) => setOceanVolume(Number(e.target.value) / 100)}
                  className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer p-0 m-0"
                />
              </div>

              {/* Rain slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-blue-400">Ambient Rain Droplets Volume</span>
                  <span className="text-slate-200">{Math.round(rainVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rainVolume * 100}
                  onChange={(e) => setRainVolume(Number(e.target.value) / 100)}
                  className="w-full accent-blue-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer p-0 m-0"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("viewer")}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl hover:opacity-95 transition-all"
          >
            Enter Neuraliso Feed View
          </button>
        </div>
      ) : (
        /* INSTAGRAM-STYLE SMOOTH SLIDING REEL FRAME */
        <div 
          id="reels-frame" 
          className="flex-1 relative overflow-hidden flex flex-col justify-between p-5 rounded-[28px] border border-slate-900 transition-all duration-700 shadow-2xl relative"
          style={{
            background: `radial-gradient(circle at top, rgba(15,23,42,0.3) 0%, rgba(2,6,23,0.95) 100%), linear-gradient(135deg, ${activeReel.bgGradient.includes("sky") ? "#071c2f" : activeReel.bgGradient.includes("emerald") ? "#032817" : activeReel.bgGradient.includes("green") ? "#042c16" : activeReel.bgGradient.includes("rose") ? "#290c12" : activeReel.bgGradient.includes("violet") ? "#1a082c" : activeReel.bgGradient.includes("indigo") ? "#0a0c2c" : activeReel.bgGradient.includes("fuchsia") ? "#2c0429" : activeReel.bgGradient.includes("teal") ? "#03241b" : "#0d1b2a"})`
          }}
        >
          {/* Dynamic soft light background blur blob */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

          {/* LIQUID GLASS ORB FLOATS UP */}
          <div className="absolute top-1/4 right-[15%] w-32 h-32 rounded-full pointer-events-none blur-3xl opacity-30 mix-blend-screen bg-sky-500/30 animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-[15%] w-32 h-32 rounded-full pointer-events-none blur-3xl opacity-30 mix-blend-screen bg-indigo-500/30 animate-pulse-slow" />

          {/* REELS TICKER PROGRESS SECTIONS */}
          <div className="w-full flex gap-1 z-10">
            {reels.map((s, idx) => (
              <div 
                key={s.id} 
                onClick={() => {
                  setActiveIndex(idx);
                  awardXP(5, "Tapped slide index");
                }}
                className={`h-[3px] flex-1 rounded-full cursor-pointer transition-all ${
                  idx === activeIndex 
                    ? `bg-${activeReel.accentColor || 'amber-400'} scale-y-125 shadow-lg` 
                    : idx < activeIndex 
                    ? "bg-slate-700/80" 
                    : "bg-slate-800/40"
                }`} 
              />
            ))}
          </div>

          {/* RECOMMENDATION AI EXPLAIN LABEL */}
          <div className="z-10 mt-2 bg-slate-950/60 border border-slate-900 px-3 py-1.5 rounded-full flex items-center justify-between gap-2 shadow-2xl backdrop-blur-md">
            <span className="text-[10px] text-slate-300 font-medium truncate flex items-center gap-1">
              <Sparkles size={11} className={`text-${activeReel.accentColor || 'amber-400'} animate-pulse`} />
              <span>{activeReel.recommendationReason}</span>
            </span>
            <span className="shrink-0 text-[8px] bg-sky-500/20 text-sky-300 font-mono font-extrabold px-1.5 py-0.2 rounded uppercase">
              AI MATCHED
            </span>
          </div>

          {/* MAIN THERAPEUTIC VISUAL MATRIX */}
          <div className="relative flex-1 flex flex-col items-center justify-center z-10 py-4 my-auto">
            
            {/* Visual Back Pulsing Halo */}
            <div 
              style={{ transform: `scale(${visualPulseScale * 1.05})` }} 
              className={`absolute w-52 h-52 sm:w-56 sm:h-56 rounded-full blur-2xl opacity-15 bg-gradient-to-tr transition-all duration-300 ${
                activeReel.themeType === "ocean" ? "from-sky-500 to-cyan-300" :
                activeReel.themeType === "rain" ? "from-emerald-500 to-teal-300" :
                activeReel.themeType === "forest" ? "from-green-500 to-emerald-300" :
                activeReel.themeType === "snow" ? "from-sky-300 to-blue-200" :
                activeReel.themeType === "meditation" ? "from-amber-500 to-amber-300" :
                activeReel.themeType === "breathing" ? "from-rose-500 to-coral-300" :
                "from-violet-500 to-indigo-300"
              }`} 
            />

            {/* HIGH-FIDELITY CUSTOM THERAPEUTIC RENDERING BLOCKS */}
            <div className="relative flex items-center justify-center w-52 h-52 sm:w-56 sm:h-56">

              {/* Pattern A: Expanding & Glowing Box Breath Orb */}
              {activeReel.visualPattern === "expand" && (
                <div 
                  style={{ transform: `scale(${visualPulseScale * 0.95})` }}
                  className="w-40 h-40 rounded-full border border-white/10 flex flex-col items-center justify-center text-center bg-slate-900/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden group"
                >
                  {/* Rotating Glass Layer */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08)_0%,transparent_100%)] pointer-events-none" />
                  <div className="absolute inset-1 rounded-full border border-dashed border-white/5 animate-spin-slow pointer-events-none" />
                  
                  <Flame size={24} className={`text-${activeReel.accentColor || 'amber-400'} animate-pulse mb-1`} />
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">{breathPhase}</span>
                  <span className="text-xl font-serif font-bold italic text-slate-100 mt-1">{breathTimer}s</span>
                  <span className="text-[8px] text-slate-500 font-mono tracking-normal leading-tight mt-1.5 px-3 uppercase">Sync respiratory volume</span>
                </div>
              )}

              {/* Pattern B: EMDR Saccadic Bilateral Slider beam */}
              {activeReel.visualPattern === "bilateral" && (
                <div className="w-full h-24 bg-slate-900/60 border border-slate-800/80 rounded-[22px] p-4 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl relative">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-mono tracking-widest border-b border-slate-900 pb-1.5">
                    <span>L Hemispheric</span>
                    <span className="text-teal-400">R Hemispheric</span>
                  </div>
                  <div className="relative w-full h-8 bg-slate-950 rounded-full flex items-center justify-center px-4 mt-2">
                    <div className="absolute left-[6%] right-[6%] h-[1.5px] bg-slate-800" />
                    <div 
                      style={{ transform: `translateX(${bilateralXOffset}px)` }}
                      className="w-5 h-5 rounded-full bg-teal-400 shadow-xl shadow-teal-400/80 transition-all duration-75 relative z-10 flex items-center justify-center"
                    >
                      <span className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="text-[8px] text-slate-500 font-mono text-center uppercase mt-1">Keep head still • Track green pulse</div>
                </div>
              )}

              {/* Pattern C: Fluid Sine-Wave Ripples */}
              {activeReel.visualPattern === "wave" && (
                <div className="w-full h-36 flex items-center justify-center gap-1.5 bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/60 relative">
                  {Array.from({ length: 14 }).map((_, idx) => {
                    const h = Math.abs(Math.sin((visualPulseScale * 12) + idx * 0.35)) * 55 + 6;
                    return (
                      <div 
                        key={idx} 
                        style={{ height: `${h}px` }} 
                        className={`w-1.5 rounded-full bg-gradient-to-t from-${activeReel.accentColor || 'sky-400'} to-indigo-500 opacity-80`} 
                      />
                    );
                  })}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-slate-400 font-mono uppercase tracking-widest bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-900">
                    Somatic Float Resonance
                  </div>
                </div>
              )}

              {/* Pattern D: Dynamic Particle Dust Storms */}
              {activeReel.visualPattern === "particles" && (
                <div className="relative w-40 h-40 rounded-full ring-1 ring-white/10 flex items-center justify-center bg-slate-950/60 backdrop-blur-2xl overflow-hidden shadow-2xl">
                  {/* Falling Crystals inside frame */}
                  <div className="absolute inset-0 pointer-events-none">
                    {particleBlobs.slice(0, 8).map((p) => {
                      const speed = 2 + (p.delay % 4);
                      return (
                        <div 
                          key={p.id}
                          style={{
                            left: `${(p.left % 80) + 10}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            top: `-${p.size}px`,
                            animation: `bounce ${speed}s infinite linear`,
                            animationDelay: `${p.delay}s`,
                          }}
                          className={`absolute bg-${activeReel.accentColor || 'blue-200'}/35 rounded-full`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-center z-10 px-4">
                    <Sparkles className={`w-6 h-6 mx-auto mb-1 text-${activeReel.accentColor || 'blue-200'} animate-pulse`} />
                    <span className="text-[10px] text-slate-300 font-mono block uppercase">Interactive Calm</span>
                    <span className="text-xs text-slate-400 mt-0.5 block italic leading-none">Crystal Rainfall</span>
                  </div>
                </div>
              )}

              {/* Pattern E: Gooey Melting Glow Liquid (CSS layout) */}
              {activeReel.visualPattern === "fluid" && (
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div 
                    style={{ transform: `scale(${visualPulseScale * 1.15}) rotate(${visualPulseScale * 45}deg)` }}
                    className="absolute w-36 h-36 rounded-[40%] bg-gradient-to-tr from-emerald-500/20 to-indigo-500/10 blur-md border border-emerald-500/20 animate-spin-slow" 
                  />
                  <div 
                    style={{ transform: `scale(${visualPulseScale * 0.9})` }}
                    className="absolute w-28 h-28 rounded-full border border-white/10 bg-slate-950/80 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-3 shadow-2xl relative z-10"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute top-4" />
                    <span className="text-[9px] text-slate-400 uppercase font-mono tracking-widest mt-3">Fluid Balance</span>
                    <span className="text-xs font-serif italic font-semibold text-emerald-100 mt-1 block">Root Chamber</span>
                  </div>
                </div>
              )}

            </div>

            {/* LIVE TELEPROMPTER NARRATOR TEXT CUES */}
            <div className="w-full max-w-sm px-4 mt-auto">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900/80 shadow-2xl space-y-2 text-center select-none backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500/80 to-rose-400/80 h-[2px] w-full" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <BookOpen size={9} />
                    <span>Mindful Teleprompt</span>
                  </span>
                  <span>Guide Voice Synthesis</span>
                </div>

                {/* Captions loop matching active index timeline */}
                <p className="text-[11.5px] text-slate-100 font-serif leading-relaxed italic px-2 py-1 select-none animate-fade-in">
                  {breathPhase === "Inhale" && activeReel.narrativeCaptions[0]}
                  {breathPhase === "Hold" && activeReel.narrativeCaptions[1]}
                  {breathPhase === "Exhale" && activeReel.narrativeCaptions[2]}
                </p>

                <div className="pt-2 border-t border-white/5 text-[9px] text-slate-400 leading-relaxed italic flex items-start gap-1 justify-between text-left">
                  <span className="font-bold text-amber-400 shrink-0 uppercase tracking-wide">Mechanic:</span>
                  <span>{activeReel.scientificBase}</span>
                </div>
              </div>
            </div>

          </div>

          {/* LOWER META CARD BLOCK & UTILITY DRAWER */}
          <div className="flex items-end justify-between gap-3 mt-auto z-10 pt-2 border-t border-slate-900/60">
            
            {/* Left Column: Creator Identity & Subtitles */}
            <div className="space-y-1.5 max-w-[68%] text-left">
              <span className={`inline-flex items-center gap-1 text-[9px] text-${activeReel.accentColor || 'amber-400'} bg-${activeReel.accentColor || 'amber-500'}/10 font-mono font-bold border border-${activeReel.accentColor || 'amber-500'}/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider`}>
                {activeReel.duration} Somatic Reel
              </span>
              <h4 className="text-base font-serif italic font-extrabold text-slate-100 leading-tight">
                {activeReel.title}
              </h4>
              <p className="text-xs text-slate-300 leading-snug">
                {activeReel.subtitle}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeReel.guideName}</span>
              </div>
            </div>

            {/* Right Column: Interaction Rack */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              
              {/* Play / Pause Primary trigger button */}
              <button
                onClick={togglePlaybackState}
                className={`p-2.5 rounded-full transition-all active:scale-75 ${
                  isPlaying 
                    ? `bg-slate-800 text-white border border-slate-700` 
                    : `bg-${activeReel.accentColor || 'amber-400'} text-slate-950 font-extrabold shadow-lg`
                }`}
              >
                {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="black" />}
              </button>

              {/* Heart Locker (Like with custom particle flash) */}
              <button
                onClick={() => toggleLikeReel(activeReel.id)}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
              >
                <div className={`p-2.5 rounded-full transition-all active:scale-75 border ${
                  likedReels[activeReel.id] 
                    ? "bg-rose-500 border-rose-500/30 text-white shadow-lg shadow-rose-500/20" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}>
                  <Heart size={16} fill={likedReels[activeReel.id] ? "currentColor" : "none"} />
                </div>
                <span className="text-[9px] text-slate-400 font-bold font-mono">
                  {likedReels[activeReel.id] ? "Saved" : activeReel.likes}
                </span>
              </button>

              {/* Solace Vault (Save) */}
              <button
                onClick={() => toggleSaveReel(activeReel.id)}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
              >
                <div className={`p-2.5 rounded-full transition-all active:scale-75 border ${
                  savedReels[activeReel.id] 
                    ? `bg-${activeReel.accentColor || 'amber-400'} border-amber-500/30 text-slate-950 shadow-lg` 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}>
                  <Bookmark size={16} fill={savedReels[activeReel.id] ? "currentColor" : "none"} />
                </div>
                <span className="text-[9px] text-slate-400 font-bold font-mono">
                  {savedReels[activeReel.id] ? "Vaulted" : activeReel.shares}
                </span>
              </button>

              {/* Wheel Sliders / Navigation Hooks */}
              <div className="flex flex-col gap-1.5 mt-1">
                <button 
                  onClick={handlePrevReel}
                  className="p-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-full transition-all active:scale-75"
                  title="Swipe up"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  onClick={handleNextReel}
                  className="p-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-full transition-all active:scale-75"
                  title="Swipe down"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* FOOTER STATS SEAL */}
      <div className="pt-2 pb-1 text-center shrink-0 flex items-center justify-center gap-1.5 text-[8.5px] text-slate-500 font-mono uppercase">
        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
        <span>Your privacy matters. We keep your data safe.</span>
      </div>

    </div>
  );
};
