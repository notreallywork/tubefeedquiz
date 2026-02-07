import { useState, useCallback, useRef } from 'react';
import type { 
  GameState, 
  ScreenType, 
  PlayerProfile, 
  Profession, 
  Answer 
} from '@/types/game';
import { questionBank } from '@/data/questions';

const STORAGE_KEYS = {
  leaderboard: 'ntc_leaderboard',
  playerHistory: 'ntc_history',
  settings: 'ntc_settings'
};

const initialState: GameState = {
  currentScreen: 'attract',
  player: {
    profession: null,
    experience: null,
    institution: ''
  },
  questions: [],
  currentQuestionIndex: 0,
  questionStartTime: 0,
  answers: [],
  totalScore: 0,
  sessionStartTime: 0,
  playerRank: null,
  soundEnabled: true,
  autoAdvanceDelay: 8000
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  const stateRef = useRef(state);
  
  // Keep ref in sync for audio callbacks
  stateRef.current = state;

  const navigateTo = useCallback((screen: ScreenType) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  const updateProfile = useCallback((updates: Partial<PlayerProfile>) => {
    setState(prev => ({
      ...prev,
      player: { ...prev.player, ...updates }
    }));
  }, []);

  const startGame = useCallback(() => {
    // Shuffle and select 5 questions
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 5);
    
    setState(prev => ({
      ...prev,
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      answers: [],
      totalScore: 0,
      sessionStartTime: Date.now(),
      questionStartTime: Date.now(),
      currentScreen: 'question'
    }));
  }, []);

  const startQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      questionStartTime: Date.now()
    }));
  }, []);

  const submitAnswer = useCallback((selected: string | string[], confidence: number) => {
    const currentQuestion = stateRef.current.questions[stateRef.current.currentQuestionIndex];
    if (!currentQuestion) return;

    const timeSpent = Date.now() - stateRef.current.questionStartTime;
    
    // Calculate score
    let score = 0;
    if (currentQuestion.type === 'single' || currentQuestion.type === 'speed') {
      const option = currentQuestion.options?.find(o => o.id === selected);
      score = option?.score || 0;
    } else if (currentQuestion.type === 'multi') {
      const selectedArray = Array.isArray(selected) ? selected : [selected];
      const correctCombo = currentQuestion.correctCombination || [];
      const correctCount = selectedArray.filter(s => correctCombo.includes(s)).length;
      score = correctCount === correctCombo.length && selectedArray.length === correctCombo.length 
        ? 100 
        : correctCount * 50;
    } else if (currentQuestion.type === 'sequence') {
      const selectedArray = Array.isArray(selected) ? selected : [];
      const correctOrder = currentQuestion.correctOrder || [];
      let correctPositions = 0;
      selectedArray.forEach((item, idx) => {
        if (item === correctOrder[idx]) correctPositions++;
      });
      score = correctPositions * 25;
    } else if (currentQuestion.type === 'drag_anatomy') {
      score = selected === currentQuestion.optimalAnswer ? 100 : 0;
    }

    const answer: Answer = {
      questionId: currentQuestion.id,
      selected,
      confidence,
      timeSpent,
      score,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      answers: [...prev.answers, answer],
      totalScore: prev.totalScore + score
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestionIndex >= prev.questions.length - 1) {
        return { ...prev, currentScreen: 'results' };
      }
      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        questionStartTime: Date.now()
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  const toggleSound = useCallback(() => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  // Leaderboard functions
  const saveToLeaderboard = useCallback((entry: { initials: string; score: number; profession: Profession | null; timestamp: number }) => {
    if (!entry.profession) return;
    
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.leaderboard) || '[]');
    leaderboard.push({
      ...entry,
      profession: entry.profession
    });
    leaderboard.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(leaderboard.slice(0, 100)));
  }, []);

  const getLeaderboard = useCallback((tab: 'today' | 'profession' | 'yourRank' = 'today') => {
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.leaderboard) || '[]');
    
    if (tab === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      return leaderboard.filter((e: { timestamp: number }) => new Date(e.timestamp).setHours(0, 0, 0, 0) === today);
    }
    
    if (tab === 'profession' && state.player.profession) {
      return leaderboard.filter((e: { profession: string }) => e.profession === state.player.profession);
    }
    
    return leaderboard;
  }, [state.player.profession]);

  const calculateRank = useCallback(() => {
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.leaderboard) || '[]');
    const rank = leaderboard.findIndex((e: { score: number }) => e.score <= state.totalScore) + 1;
    return rank || leaderboard.length + 1;
  }, [state.totalScore]);

  return {
    state,
    navigateTo,
    updateProfile,
    startGame,
    startQuestion,
    submitAnswer,
    nextQuestion,
    resetGame,
    toggleSound,
    saveToLeaderboard,
    getLeaderboard,
    calculateRank
  };
}
