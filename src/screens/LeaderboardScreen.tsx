import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ScreenType, Profession, LeaderboardEntry } from '@/types/game';

interface LeaderboardScreenProps {
  onNavigate: (screen: ScreenType) => void;
  playerProfession: Profession | null;
  totalScore: number;
  getLeaderboard: (tab: 'today' | 'profession' | 'yourRank') => LeaderboardEntry[];
  saveToLeaderboard: (entry: { initials: string; score: number; profession: Profession | null; timestamp: number }) => void;
  calculateRank: () => number;
  playLeaderboardFanfare: () => void;
}

const tabs = [
  { id: 'today' as const, label: 'TODAY' },
  { id: 'profession' as const, label: 'BY PROFESSION' },
  { id: 'yourRank' as const, label: 'YOUR RANK' }
];

function getInitials(profession: string): string {
  const map: Record<string, string> = {
    doctor: 'DR',
    dietitian: 'DT',
    nurse: 'RN',
    pharmacist: 'PH',
    other: 'OT'
  };
  return map[profession] || '??';
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function LeaderboardScreen({ 
  onNavigate, 
  playerProfession,
  totalScore,
  getLeaderboard,
  saveToLeaderboard,
  calculateRank,
  playLeaderboardFanfare
}: LeaderboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'profession' | 'yourRank'>('today');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [hasSaved, setHasSaved] = useState(false);

  // Save to leaderboard on mount
  useEffect(() => {
    if (!hasSaved && playerProfession) {
      saveToLeaderboard({
        initials: getInitials(playerProfession),
        score: totalScore,
        profession: playerProfession,
        timestamp: Date.now()
      });
      setHasSaved(true);
      
      // Play fanfare if top 10
      const rank = calculateRank();
      if (rank <= 10) {
        playLeaderboardFanfare();
      }
    }
  }, [hasSaved, playerProfession, totalScore, saveToLeaderboard, calculateRank, playLeaderboardFanfare]);

  // Load leaderboard data
  useEffect(() => {
    const data = getLeaderboard(activeTab);
    
    // Mark current player
    const rank = calculateRank();
    const markedData = data.map((entry, idx) => ({
      ...entry,
      isCurrentPlayer: idx === rank - 1 && entry.score === totalScore
    }));
    
    setEntries(markedData.slice(0, 10));
  }, [activeTab, getLeaderboard, calculateRank, totalScore]);

  const handleDone = useCallback(() => {
    onNavigate('attract');
  }, [onNavigate]);

  const rank = useMemo(() => calculateRank(), [calculateRank]);
  const totalPlayers = entries.length;

  return (
    <div className="screen bg-blue-extralight overflow-auto">
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <h2 className="heading-2 text-blue">LEADERBOARD</h2>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-0 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-8 py-4 text-[24px] transition-all duration-200
              ${activeTab === tab.id 
                ? 'text-blue font-semibold border-b-[3px] border-blue' 
                : 'text-grey-extradark hover:text-blue-light'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-10 pb-8">
        {activeTab === 'yourRank' ? (
          // Your Rank View
          <div className="text-center space-y-8">
            <div className="bg-white rounded-2xl shadow-card p-12">
              <p className="text-[48px] text-blue font-semibold mb-4">
                You ranked #{rank} of {totalPlayers || 1} today
              </p>
              <p className="text-[24px] text-grey-extradark">
                Better than {Math.round((1 - rank / (totalPlayers || 1)) * 100)}% of {playerProfession}s
              </p>
            </div>
            
            {/* QR Code placeholder */}
            <div className="bg-white rounded-2xl shadow-card p-8">
              <p className="text-[24px] font-medium mb-4">Challenge a colleague</p>
              <div className="w-[200px] h-[200px] bg-black mx-auto rounded-xl flex items-center justify-center">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {/* Simple QR code pattern */}
                  <rect x="10" y="10" width="40" height="40" fill="white"/>
                  <rect x="110" y="10" width="40" height="40" fill="white"/>
                  <rect x="10" y="110" width="40" height="40" fill="white"/>
                  <rect x="20" y="20" width="20" height="20" fill="black"/>
                  <rect x="120" y="20" width="20" height="20" fill="black"/>
                  <rect x="20" y="120" width="20" height="20" fill="black"/>
                  <rect x="25" y="25" width="10" height="10" fill="white"/>
                  <rect x="125" y="25" width="10" height="10" fill="white"/>
                  <rect x="25" y="125" width="10" height="10" fill="white"/>
                  {/* Random pattern */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <rect 
                      key={i}
                      x={60 + (i % 5) * 12}
                      y={50 + Math.floor(i / 5) * 12}
                      width="8"
                      height="8"
                      fill="white"
                    />
                  ))}
                </svg>
              </div>
              <p className="text-[18px] text-grey-extradark mt-4">
                Scan to play on your phone
              </p>
            </div>
          </div>
        ) : (
          // Table View
          <div className="w-full max-w-[1000px] bg-white rounded-2xl shadow-card overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-grey-extralight border-b border-grey-light">
              <span className="text-[20px] text-grey-extradark uppercase tracking-wider">RANK</span>
              <span className="text-[20px] text-grey-extradark uppercase tracking-wider">INITIALS</span>
              <span className="text-[20px] text-grey-extradark uppercase tracking-wider">SCORE</span>
              <span className="text-[20px] text-grey-extradark uppercase tracking-wider">PROFESSION</span>
              <span className="text-[20px] text-grey-extradark uppercase tracking-wider">TIME</span>
            </div>

            {/* Data Rows */}
            {entries.map((entry, idx) => {
              const isTop3 = idx < 3;
              const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1;
              
              return (
                <div 
                  key={idx}
                  className={`
                    grid grid-cols-5 gap-4 px-6 py-4 border-b border-grey-light items-center
                    ${entry.isCurrentPlayer ? 'bg-green/20 border-l-4 border-l-green' : 'hover:bg-blue-extralight'}
                    transition-colors
                  `}
                >
                  <span className={`
                    text-[28px] 
                    ${isTop3 ? 'font-bold' : 'font-medium text-grey-extradark'}
                  `}>
                    {rankIcon}
                  </span>
                  <span className="text-[24px] font-medium">
                    {entry.isCurrentPlayer ? 'YOU' : entry.initials}
                  </span>
                  <span className={`
                    text-[28px] 
                    ${isTop3 ? 'font-bold' : 'font-normal'}
                  `}>
                    {entry.score}
                  </span>
                  <span className="text-[24px] capitalize">{entry.profession}</span>
                  <span className="text-[20px] text-grey-extradark">{formatTime(entry.timestamp)}</span>
                </div>
              );
            })}

            {entries.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[24px] text-grey-extradark">No entries yet today!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Done Button */}
      <div className="px-10 py-8 flex justify-center">
        <button
          onClick={handleDone}
          className="btn-blue w-[280px] h-[72px]"
        >
          DONE
        </button>
      </div>
    </div>
  );
}
