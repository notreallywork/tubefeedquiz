import { useEffect, useCallback, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { AttractMode } from '@/screens/AttractMode';
import { ProfileSelection } from '@/screens/ProfileSelection';
import { QuestionScreen } from '@/screens/QuestionScreen';
import { RevealModal } from '@/screens/RevealModal';
import { ResultsScreen } from '@/screens/ResultsScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import type { Answer } from '@/types/game';

function App() {
  const {
    state,
    navigateTo,
    updateProfile,
    startGame,
    startQuestion,
    submitAnswer,
    nextQuestion,
    saveToLeaderboard,
    getLeaderboard,
    calculateRank
  } = useGameState();

  const {
    initAudio,
    startAmbient,
    stopAmbient,
    playStartSound,
    playSelectionSound,
    playCorrectSound,
    playPartialSound,
    playIncorrectSound,
    playTimerTick,
    playTimerExpire,
    playScoreReveal,
    playLeaderboardFanfare,
    playConfirmSound
  } = useAudio(state.soundEnabled);

  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  // Start ambient sound on attract mode
  useEffect(() => {
    if (state.currentScreen === 'attract') {
      startAmbient();
    } else {
      stopAmbient();
    }
  }, [state.currentScreen, startAmbient, stopAmbient]);

  // Handle answer submission
  const handleSubmitAnswer = useCallback((selected: string | string[], confidence: number) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    const timeSpent = Date.now() - state.questionStartTime;
    
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

    setCurrentAnswer(answer);
    submitAnswer(selected, confidence);
    setShowReveal(true);
  }, [state.questions, state.currentQuestionIndex, state.questionStartTime, submitAnswer]);

  // Handle continue from reveal
  const handleContinueFromReveal = useCallback(() => {
    setShowReveal(false);
    setCurrentAnswer(null);
    
    if (state.currentQuestionIndex >= state.questions.length - 1) {
      navigateTo('results');
    } else {
      nextQuestion();
      startQuestion();
    }
  }, [state.currentQuestionIndex, state.questions.length, navigateTo, nextQuestion, startQuestion]);

  // Render current screen
  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'attract':
        return (
          <AttractMode
            onNavigate={navigateTo}
            onInitAudio={initAudio}
            playStartSound={playStartSound}
          />
        );

      case 'profile':
        return (
          <ProfileSelection
            onNavigate={navigateTo}
            profile={state.player}
            onUpdateProfile={updateProfile}
            onStartGame={startGame}
            playSelectionSound={playSelectionSound}
            playStartSound={playStartSound}
          />
        );

      case 'question': {
        const currentQuestion = state.questions[state.currentQuestionIndex];
        if (!currentQuestion) return null;
        
        return (
          <QuestionScreen
            question={currentQuestion}
            questionNumber={state.currentQuestionIndex + 1}
            totalQuestions={state.questions.length}
            onSubmitAnswer={handleSubmitAnswer}
            onNext={handleContinueFromReveal}
            playSelectionSound={playSelectionSound}
            playConfirmSound={playConfirmSound}
            playTimerTick={playTimerTick}
            playTimerExpire={playTimerExpire}
          />
        );
      }

      case 'results':
        return (
          <ResultsScreen
            totalScore={state.totalScore}
            maxScore={state.questions.length * 100}
            answers={state.answers}
            questions={state.questions}
            onNavigate={navigateTo}
            playScoreReveal={playScoreReveal}
          />
        );

      case 'leaderboard':
        return (
          <LeaderboardScreen
            onNavigate={navigateTo}
            playerProfession={state.player.profession}
            totalScore={state.totalScore}
            getLeaderboard={getLeaderboard}
            saveToLeaderboard={saveToLeaderboard}
            calculateRank={calculateRank}
            playLeaderboardFanfare={playLeaderboardFanfare}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="game-container">
      {renderScreen()}
      
      {/* Reveal Modal */}
      {showReveal && currentAnswer && state.questions[state.currentQuestionIndex] && (
        <RevealModal
          question={state.questions[state.currentQuestionIndex]}
          answer={currentAnswer}
          playerProfession={state.player.profession}
          onContinue={handleContinueFromReveal}
          playCorrectSound={playCorrectSound}
          playPartialSound={playPartialSound}
          playIncorrectSound={playIncorrectSound}
        />
      )}
    </div>
  );
}

export default App;
