// Mental health assessment indicators and their weights
export const MENTAL_HEALTH_STAGES = {
  NORMAL: 'Normal',
  DEPRESSION: 'Depression',
  SUICIDAL: 'Suicidal',
  ANXIETY: 'Anxiety',
  STRESS: 'Stress',
  BIPOLAR: 'Bi-Polar',
  PERSONALITY_DISORDER: 'Personality Disorder',
};

// Assessment questions mapped to potential indicators
export const ASSESSMENT_QUESTIONS = [
  {
    id: 'mood',
    questions: [
      "How would you describe your mood lately?",
      "Have you been feeling down or hopeless?",
      "Do you find yourself experiencing extreme mood swings?"
    ],
    indicators: {
      DEPRESSION: ['down', 'hopeless', 'sad', 'empty', 'worthless'],
      ANXIETY: ['worried', 'nervous', 'anxious', 'panic', 'fear'],
      BIPOLAR: ['extreme', 'swings', 'high', 'low', 'intense'],
      NORMAL: ['good', 'okay', 'fine', 'alright', 'balanced']
    }
  },
  {
    id: 'sleep',
    questions: [
      "How has your sleep been recently?",
      "Do you have trouble falling asleep or staying asleep?",
      "How many hours do you typically sleep?"
    ],
    indicators: {
      DEPRESSION: ['oversleep', 'cant sleep', 'insomnia', 'tired'],
      ANXIETY: ['restless', 'racing thoughts', 'wake up', 'worried'],
      STRESS: ['irregular', 'disturbed', 'less', 'difficulty']
    }
  },
  {
    id: 'thoughts',
    questions: [
      "Have you had any thoughts of harming yourself?",
      "Do you often feel overwhelmed by your thoughts?",
      "How do you see your future?"
    ],
    indicators: {
      SUICIDAL: ['harm', 'death', 'end', 'pain', 'hopeless'],
      ANXIETY: ['overwhelmed', 'racing', 'worry', 'panic'],
      PERSONALITY_DISORDER: ['unstable', 'intense', 'empty', 'confused']
    }
  }
];

// Function to analyze text for mental health indicators
export const analyzeResponse = (text, questionId) => {
  const relevantQuestion = ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
  if (!relevantQuestion) return null;

  const scores = {};
  const textLower = text.toLowerCase();

  Object.entries(relevantQuestion.indicators).forEach(([stage, keywords]) => {
    scores[stage] = keywords.reduce((score, keyword) => {
      return score + (textLower.includes(keyword) ? 1 : 0);
    }, 0);
  });

  return scores;
};

// Function to aggregate scores and determine mental health stage
export const determineMentalHealthStage = (scores) => {
  let maxScore = 0;
  let primaryStage = MENTAL_HEALTH_STAGES.NORMAL;

  Object.entries(scores).forEach(([stage, score]) => {
    if (score > maxScore) {
      maxScore = score;
      primaryStage = stage;
    }
  });

  return {
    primaryStage,
    score: maxScore,
    confidence: maxScore > 0 ? (maxScore / Object.keys(scores).length) : 0
  };
};
