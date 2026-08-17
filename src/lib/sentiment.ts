// Browser-based local sentiment and emotion extraction engine for Neuraliso
// Runs 100% in browser memory with 0 network requests.

export interface SentimentAnalysisResult {
  score: number; // -1.0 (negative) to +1.0 (positive)
  label: "Negative" | "Neutral" | "Positive";
  confidence: number; // 0 to 100%
  suggestedTags: string[];
  detectedEmotions: Array<{ name: string; score: number }>;
  summary: string;
  executionMode: string;
}

const POSITIVE_WORDS: Record<string, number> = {
  happy: 3, joy: 4, joyful: 4, great: 3, wonderful: 4, amazing: 4, excellent: 4,
  calm: 3, relaxed: 3, peaceful: 4, serene: 3, tranquil: 3, grateful: 4, thankful: 4,
  blessed: 3, hopeful: 3, optimistic: 3, bright: 2, good: 2, nice: 2, love: 4,
  content: 3, rested: 3, energised: 3, energized: 3, proud: 3, safe: 3, relieved: 3,
  inspired: 4, delighted: 4, cheerful: 3, smile: 2, laughing: 3, accomplish: 3
};

const NEGATIVE_WORDS: Record<string, number> = {
  sad: -3, unhappy: -3, depressed: -4, gloomy: -3, heartbroken: -4, crying: -3,
  anxious: -4, anxiety: -4, worry: -3, worried: -3, panic: -5, scared: -4, fear: -4,
  dread: -4, uneasy: -3, restless: -3, stressed: -4, stress: -4, pressure: -3,
  overwhelmed: -4, swamped: -3, burden: -3, tired: -2, exhausted: -4, fatigued: -3,
  burnout: -5, drained: -4, hopeless: -5, hurt: -3, angry: -4, frustrated: -3,
  lonely: -4, helpless: -4, terrible: -4, awful: -4, hate: -4, nervous: -3
};

const EMOTION_TAG_RULES: Record<string, string[]> = {
  Anxious: ["anxious", "anxiety", "worry", "worried", "nervous", "panic", "scared", "fear", "dread", "uneasy", "restless", "on edge", "overthinking", "tense"],
  Stressed: ["stressed", "stress", "pressure", "deadline", "workload", "overworked", "burden", "busy", "hectic", "rush", "demanding", "frustrated"],
  Tired: ["tired", "exhausted", "sleepy", "fatigued", "burnout", "drained", "no energy", "weary", "sluggish", "insomnia"],
  Overwhelmed: ["overwhelmed", "too much", "swamped", "drowning", "can't cope", "breaking point", "chaos", "heavy", "helpless"],
  Happy: ["happy", "joy", "excited", "great", "wonderful", "amazing", "cheerful", "delighted", "content", "upbeat", "smile", "laugh", "proud"],
  Calm: ["calm", "peaceful", "relaxed", "serene", "tranquil", "quiet", "grounded", "still", "rested", "soothed", "easy", "safe"],
  Grateful: ["grateful", "thankful", "blessed", "appreciation", "appreciate", "kindness", "good day", "lucky", "valued"],
  Hopeful: ["hopeful", "optimistic", "looking forward", "promising", "better", "faith", "bright", "encouraged", "inspired"]
};

export function analyzeSentiment(text: string): SentimentAnalysisResult {
  const mode = "100% Client-Side Local Browser NLP Engine (Zero Data Sent)";
  if (!text || !text.trim()) {
    return {
      score: 0,
      label: "Neutral",
      confidence: 100,
      suggestedTags: [],
      detectedEmotions: [],
      summary: "Type a short reflection to trigger local sentiment tag suggestions.",
      executionMode: mode,
    };
  }

  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = cleanText.split(/\s+/).filter(Boolean);

  let totalScore = 0;
  let wordCount = 0;
  const tagScores: Record<string, number> = {};

  // Initialize tag scores
  Object.keys(EMOTION_TAG_RULES).forEach((tag) => {
    tagScores[tag] = 0;
  });

  // Evaluate words & phrases
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check pos/neg lexicons
    if (POSITIVE_WORDS[word]) {
      totalScore += POSITIVE_WORDS[word];
      wordCount++;
    } else if (NEGATIVE_WORDS[word]) {
      totalScore += NEGATIVE_WORDS[word];
      wordCount++;
    }

    // Check emotion tag rules
    Object.entries(EMOTION_TAG_RULES).forEach(([tag, keywords]) => {
      if (keywords.includes(word)) {
        tagScores[tag] += 2;
      }
    });

    // Check 2-word n-grams (e.g., "too much", "on edge", "no energy")
    if (i < words.length - 1) {
      const bigram = `${word} ${words[i + 1]}`;
      Object.entries(EMOTION_TAG_RULES).forEach(([tag, keywords]) => {
        if (keywords.includes(bigram)) {
          tagScores[tag] += 3;
        }
      });
    }
  }

  // Calculate normalized sentiment score (-1 to 1)
  const maxPossible = Math.max(wordCount * 4, 1);
  const normalizedScore = Math.max(-1, Math.min(1, totalScore / maxPossible));

  let label: "Negative" | "Neutral" | "Positive" = "Neutral";
  if (normalizedScore > 0.15) label = "Positive";
  else if (normalizedScore < -0.15) label = "Negative";

  // Select top suggested tags
  const sortedTags = Object.entries(tagScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  // If no explicit keyword matched but overall sentiment is positive/negative, suggest defaults
  const suggestedTags = [...sortedTags];
  if (suggestedTags.length === 0) {
    if (label === "Negative") suggestedTags.push("Stressed", "Overwhelmed");
    else if (label === "Positive") suggestedTags.push("Calm", "Happy");
  }

  const detectedEmotions = Object.entries(tagScores)
    .filter(([_, score]) => score > 0)
    .map(([name, score]) => ({ name, score }));

  // Generate summary
  let summary = "Balanced, calm reflection tone.";
  if (suggestedTags.includes("Anxious") || suggestedTags.includes("Overwhelmed")) {
    summary = "⚡ Local NLP: Elevated anxiety or stress markers detected in journal text.";
  } else if (suggestedTags.includes("Tired")) {
    summary = "⚡ Local NLP: Fatigue or energy depletion detected in entry.";
  } else if (label === "Positive") {
    summary = "⚡ Local NLP: Positive valence & uplifting tone detected.";
  } else if (label === "Negative") {
    summary = "⚡ Local NLP: Mild negative sentiment detected.";
  }

  const confidence = Math.min(95, Math.max(60, words.length * 8));

  return {
    score: Number(normalizedScore.toFixed(2)),
    label,
    confidence,
    suggestedTags: suggestedTags.slice(0, 4),
    detectedEmotions,
    summary,
    executionMode: mode,
  };
}
