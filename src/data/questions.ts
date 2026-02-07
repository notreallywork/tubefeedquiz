import type { Question } from '@/types/game';

export const questionBank: Question[] = [
  {
    id: "timing_001",
    type: "single",
    theme: "timing",
    title: "The 48-Hour Window",
    difficulty: "medium",
    context: {
      patient: "52-year-old male, ICU Day 1, post-emergency laparotomy for perforated diverticulitis",
      details: ["Ventilated, sedated", "Hemodynamically stable on low-dose noradrenaline", "Abdomen closed, no ongoing peritonitis", "BMI 22, no recent weight loss"],
      visual: "timeline_surgery_day1"
    },
    options: [
      {
        id: "A",
        text: "Wait for bowel sounds and passage of flatus before starting EN",
        score: 0,
        correct: false,
        rationale: "Bowel sounds and flatus are not prerequisites for EN. This outdated practice delays nutrition and worsens outcomes."
      },
      {
        id: "B",
        text: "Start low-dose trophic EN within 24–48 hours",
        score: 100,
        correct: true,
        rationale: "ESPEN and ASPEN guidelines recommend early EN within 24–48h in haemodynamically stable patients to maintain gut integrity and reduce infections."
      },
      {
        id: "C",
        text: "Begin parenteral nutrition immediately — the gut needs rest after surgery",
        score: 0,
        correct: false,
        rationale: "PN is not first-line when the GI tract is functional. 'Gut rest' after surgery is largely a myth for most patients."
      },
      {
        id: "D",
        text: "Delay all nutrition support until vasopressors are fully weaned",
        score: 0,
        correct: false,
        rationale: "Low-dose vasopressors with stable haemodynamics are not a contraindication to starting EN. Only high/escalating doses warrant caution."
      }
    ],
    optimalAnswer: "B",
    learningPoint: "ESPEN 2019 & ASPEN 2016: Start EN within 24–48h in haemodynamically stable ICU patients. Bowel sounds are NOT required. Low-dose vasopressors are not a contraindication.",
    shockStat: "Delayed EN initiation increases ICU-acquired infections by up to 40%",
    resource: "early_en_timing_card",
    professionSplit: { doctor: 0.48, dietitian: 0.79, nurse: 0.55, pharmacist: 0.58, other: 0.45 }
  },

  {
    id: "access_001",
    type: "drag_anatomy",
    theme: "access",
    title: "Pick Your Route",
    difficulty: "medium",
    context: {
      patient: "78-year-old female, ventilated, recurrent aspiration pneumonia on NG feeds",
      details: ["High gastric residual volumes (>500 mL repeatedly)", "Failed prokinetic therapy", "Expected to need EN for 4+ weeks", "Poor gastric motility on imaging"],
      visual: "anatomy_torso"
    },
    items: [
      { id: "ng", name: "Nasogastric (NG)", correct: false, zone: "gastric" },
      { id: "nj", name: "Nasojejunal (NJ)", correct: false, zone: "post-pyloric" },
      { id: "peg-j", name: "PEG-J", correct: true, zone: "post-pyloric" },
      { id: "tpn", name: "Parenteral Nutrition", correct: false, zone: "parenteral" }
    ],
    optimalAnswer: "peg-j",
    learningPoint: "When EN is needed >4 weeks with persistent gastric intolerance, a PEG-J provides reliable post-pyloric access. NJ tubes are a good bridge but not ideal long-term. PN is a last resort when the gut is truly non-functional.",
    shockStat: "Aspiration risk drops ~40% with post-pyloric vs gastric feeding in high-risk patients",
    resource: "access_decision_algorithm",
    professionSplit: { doctor: 0.44, dietitian: 0.72, nurse: 0.40, pharmacist: 0.50, other: 0.38 }
  },

  {
    id: "tolerance_001",
    type: "multi",
    theme: "tolerance",
    title: "Reading the Signs",
    difficulty: "medium",
    context: {
      patient: "66-year-old male, EN via NG tube at goal rate (65 mL/h) for 3 days post-stroke",
      details: ["Gastric residual volume 280 mL", "Mild abdominal distension, soft on palpation", "1 episode of vomiting this morning", "Passing flatus, no diarrhoea"],
      visual: "symptoms_panel"
    },
    options: [
      { id: "A", text: "Stop EN completely and switch to PN", score: 0, correct: false, rationale: "This is an overreaction. GI symptoms should trigger stepwise management, not immediate PN." },
      { id: "B", text: "Start or optimise prokinetic therapy (e.g. metoclopramide)", score: 50, correct: true, rationale: "Prokinetics are a first-line intervention for gastroparesis and high residuals." },
      { id: "C", text: "Reduce the feed rate and elevate the head of bed to ≥30°", score: 50, correct: true, rationale: "Rate reduction with head-of-bed elevation reduces aspiration risk while maintaining some enteral intake." },
      { id: "D", text: "Ignore it — a single vomit and GRV <500 mL is not concerning", score: 0, correct: false, rationale: "While GRV <500 mL alone may not warrant stopping feeds, vomiting is a clinical sign that requires intervention." },
      { id: "E", text: "Request urgent surgical review for possible bowel obstruction", score: 0, correct: false, rationale: "The abdomen is soft with flatus. Obstruction is unlikely — this is feeding intolerance, not a surgical emergency." }
    ],
    correctCombination: ["B", "C"],
    optimalAnswer: "B+C",
    learningPoint: "Stepwise approach to EN intolerance: 1) head-of-bed elevation, 2) reduce rate, 3) prokinetics, 4) consider post-pyloric access. Stopping EN entirely should be a last resort.",
    shockStat: "Unnecessary EN interruptions account for ~20% of caloric deficit in ICU patients",
    resource: "tolerance_management_card",
    professionSplit: { doctor: 0.40, dietitian: 0.74, nurse: 0.60, pharmacist: 0.42, other: 0.38 }
  },

  {
    id: "safety_001",
    type: "speed",
    theme: "safety",
    title: "Refeeding Red Alert",
    timeLimit: 10,
    difficulty: "hard",
    context: {
      patient: "45-year-old female, BMI 14.5, admitted with severe anorexia nervosa",
      details: ["Negligible oral intake for 18 days", "Phosphate 0.71 mmol/L (low)", "Potassium 3.2 mmol/L (low-normal)", "EN about to be initiated"],
      visual: "lab_values"
    },
    options: [
      { id: "A", text: "Start EN at full target rate to restore nutrition quickly", score: 0, correct: false, rationale: "Extremely dangerous. Aggressive feeding in a severely malnourished patient triggers fatal refeeding syndrome." },
      { id: "B", text: "Give IV thiamine and correct electrolytes BEFORE starting low-rate EN", score: 100, correct: true, rationale: "Thiamine must be given before any dextrose/carbohydrate to prevent Wernicke's encephalopathy. Electrolytes must be corrected first." },
      { id: "C", text: "Check prealbumin and wait for dietitian review before any intervention", score: 0, correct: false, rationale: "Prealbumin is an acute-phase reactant and unreliable here. The clinical picture is clear — this patient needs immediate electrolyte correction and cautious feeding." },
      { id: "D", text: "Start PN instead — it has a lower refeeding risk than EN", score: 0, correct: false, rationale: "Refeeding syndrome occurs with ANY route of nutrition, including PN. The route doesn't change the metabolic risk." }
    ],
    optimalAnswer: "B",
    learningPoint: "NICE refeeding guidelines: Give thiamine BEFORE carbohydrate. Correct phosphate, potassium and magnesium. Start EN at 10 kcal/kg/day (max ~20 kcal/kg/day) and advance slowly over 4–7 days. Monitor electrolytes every 12h for the first 72h.",
    shockStat: "Refeeding syndrome has a mortality rate up to 34% when unrecognised",
    resource: "refeeding_safety_checklist",
    professionSplit: { doctor: 0.55, dietitian: 0.82, nurse: 0.38, pharmacist: 0.75, other: 0.42 }
  },

  {
    id: "transition_001",
    type: "sequence",
    theme: "transition",
    title: "From Tube to Table",
    difficulty: "medium",
    context: {
      patient: "71-year-old female, Day 12 post-stroke, improving swallow function",
      details: ["Alert, following commands", "Speech pathology reports improving swallow on assessment", "Currently on NG feeds at goal rate", "Tolerating feeds well, gaining weight"],
      visual: "recovery_timeline"
    },
    items: [
      { id: "swallow", text: "Formal swallow assessment by speech pathology", order: 0 },
      { id: "texture", text: "Begin texture-modified oral diet with EN at full rate", order: 1 },
      { id: "reduce", text: "Reduce EN rate as oral intake increases (monitor intake)", order: 2 },
      { id: "remove", text: "Cease EN and remove NG tube when oral intake meets ≥75% of needs", order: 3 }
    ],
    correctOrder: ["swallow", "texture", "reduce", "remove"],
    optimalAnswer: "swallow,texture,reduce,remove",
    learningPoint: "Safe EN weaning: formal swallow assessment first, then overlap oral + EN, then reduce EN as oral intake increases, then remove tube only when oral meets ≥75% of estimated needs consistently. Premature tube removal is a leading cause of readmission for malnutrition.",
    shockStat: "Patients weaned from EN without a structured protocol have 2x higher rates of inadequate intake at discharge",
    resource: "weaning_protocol_card",
    professionSplit: { doctor: 0.42, dietitian: 0.73, nurse: 0.50, pharmacist: 0.35, other: 0.38 }
  }
];

export function selectRandomQuestions(count: number): typeof questionBank {
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
