import type { Question } from '@/types/game';

export const questionBank: Question[] = [
  {
    id: "timing_001",
    type: "single",
    theme: "timing",
    title: "When to start?",
    difficulty: "medium",
    context: {
      patient: "68-year-old female, ICU Day 2, post-major abdominal surgery",
      details: ["Ventilated", "Hemodynamically stable", "No vasopressors", "No EN started"],
      visual: "timeline_surgery_day2"
    },
    options: [
      { 
        id: "A", 
        text: "Wait for bowel sounds to return", 
        score: 0, 
        correct: false,
        rationale: "Bowel sounds are not required to start EN."
      },
      { 
        id: "B", 
        text: "Start now with post-pyloric access", 
        score: 100, 
        correct: true,
        rationale: "Early EN within 24-48h reduces infections 40%."
      },
      { 
        id: "C", 
        text: "Start now with gastric access", 
        score: 100, 
        correct: true,
        rationale: "Gastric feeding is appropriate if aspiration risk is low."
      },
      { 
        id: "D", 
        text: "Wait until extubated", 
        score: 0, 
        correct: false,
        rationale: "Delaying EN increases infectious complications."
      }
    ],
    optimalAnswer: "B",
    learningPoint: "ESPN 2021: Start EN within 24-48h if hemodynamically stable. Bowel sounds not required.",
    shockStat: "40% of ICU patients are underfed by Day 3",
    resource: "early_en_timing_card",
    professionSplit: { doctor: 0.45, dietitian: 0.82, nurse: 0.58, pharmacist: 0.61, other: 0.50 }
  },
  
  {
    id: "access_001",
    type: "drag_anatomy",
    theme: "access",
    title: "Optimal placement",
    difficulty: "medium",
    context: {
      patient: "65-year-old male, ventilated, high aspiration risk, gastric feeding failing",
      details: ["Residuals >400ml", "Mild distension", "No diarrhea"],
      visual: "anatomy_torso"
    },
    items: [
      { id: "ng", name: "NG Tube", correct: false, zone: "gastric" },
      { id: "nj", name: "NJ Tube", correct: true, zone: "post-pyloric" },
      { id: "peg", name: "PEG", correct: false, zone: "gastric" },
      { id: "iv", name: "Parenteral", correct: false, zone: "parenteral" }
    ],
    optimalAnswer: "nj",
    learningPoint: "Post-pyloric feeding reduces aspiration pneumonia 40% in high-risk ventilated patients.",
    shockStat: "NG tubes placed in 60% when post-pyloric indicated",
    resource: "access_decision_algorithm",
    professionSplit: { doctor: 0.52, dietitian: 0.75, nurse: 0.48, pharmacist: 0.55, other: 0.45 }
  },
  
  {
    id: "tolerance_001",
    type: "multi",
    theme: "tolerance",
    title: "GI intolerance management",
    difficulty: "medium",
    context: {
      patient: "70-year-old female, EN at goal rate, developing intolerance",
      details: ["Residuals 400ml", "Mild abdominal distension", "No fever, WBC normal"],
      visual: "symptoms_panel"
    },
    options: [
      { id: "A", text: "Hold feeds and reassess in 24h", score: 0, correct: false, rationale: "Unnecessary interruption" },
      { id: "B", text: "Increase prokinetic agent", score: 50, correct: true, rationale: "First-line intervention" },
      { id: "C", text: "Switch to post-pyloric feeding", score: 50, correct: true, rationale: "If prokinetics fail" },
      { id: "D", text: "Reduce rate by 50% and reassess", score: 0, correct: false, rationale: "Not first step" },
      { id: "E", text: "Initiate parenteral nutrition", score: 0, correct: false, rationale: "Too aggressive" }
    ],
    correctCombination: ["B", "C"],
    optimalAnswer: "B+C",
    learningPoint: "Stepwise approach: prokinetics first, then post-pyloric if persists. Avoid unnecessary PN.",
    shockStat: "Unnecessary PN increases infection risk 2.5x",
    resource: "tolerance_management_card",
    professionSplit: { doctor: 0.38, dietitian: 0.71, nurse: 0.62, pharmacist: 0.45, other: 0.40 }
  },
  
  {
    id: "safety_001",
    type: "speed",
    theme: "safety",
    title: "Refeeding syndrome",
    timeLimit: 10,
    difficulty: "hard",
    context: {
      patient: "58-year-old female, anorexia nervosa, BMI 16",
      details: ["No intake 10 days", "Starting EN today", "K+ 3.8, Phos 2.9, Mg 1.8"],
      visual: "lab_values"
    },
    options: [
      { id: "A", text: "Start EN at goal rate immediately", score: 0, correct: false, rationale: "Dangerous" },
      { id: "B", text: "Give thiamine 200-300mg IV first", score: 100, correct: true, rationale: "Critical first step" },
      { id: "C", text: "Check prealbumin level first", score: 0, correct: false, rationale: "Not priority" },
      { id: "D", text: "Start TPN instead of EN", score: 0, correct: false, rationale: "Wrong approach" }
    ],
    optimalAnswer: "B",
    learningPoint: "Thiamine BEFORE dextrose prevents Wernicke's. Phosphate monitoring q12h first 72h.",
    shockStat: "Refeeding syndrome mortality up to 70% if unrecognized",
    resource: "refeeding_safety_checklist",
    professionSplit: { doctor: 0.65, dietitian: 0.78, nurse: 0.42, pharmacist: 0.81, other: 0.50 }
  },
  
  {
    id: "transition_001",
    type: "sequence",
    theme: "transition",
    title: "Weaning protocol",
    difficulty: "medium",
    context: {
      patient: "72-year-old male, recovering, ready for weaning",
      details: ["Awake, alert", "Following commands", "Minimal vent support"],
      visual: "recovery_timeline"
    },
    items: [
      { id: "reduce", text: "Reduce tube feeding rate", order: 1 },
      { id: "swallow", text: "Swallow assessment", order: 0 },
      { id: "oral", text: "Oral diet trial", order: 2 },
      { id: "remove", text: "Remove feeding tube", order: 3 }
    ],
    correctOrder: ["swallow", "reduce", "oral", "remove"],
    optimalAnswer: "swallow,reduce,oral,remove",
    learningPoint: "Swallow assessment BEFORE oral trial prevents aspiration. Structured weaning reduces tube days 30%.",
    shockStat: "Average tube retention 2 days longer than necessary",
    resource: "weaning_protocol_card",
    professionSplit: { doctor: 0.48, dietitian: 0.69, nurse: 0.55, pharmacist: 0.35, other: 0.40 }
  }
];

export function selectRandomQuestions(count: number): typeof questionBank {
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
