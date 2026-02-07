import { useState, useCallback, useMemo } from 'react';
import type { ScreenType, Profession, Experience } from '@/types/game';

interface ProfileSelectionProps {
  onNavigate: (screen: ScreenType) => void;
  profile: { profession: Profession | null; experience: Experience | null; institution: string };
  onUpdateProfile: (updates: { profession?: Profession | null; experience?: Experience | null; institution?: string }) => void;
  onStartGame: () => void;
  playSelectionSound: () => void;
  playStartSound: () => void;
}

const professions: { value: Profession; label: string }[] = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'dietitian', label: 'Dietitian' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'other', label: 'Other' }
];

const experiences: { value: Experience; label: string }[] = [
  { value: '<2', label: '< 2' },
  { value: '2-5', label: '2–5' },
  { value: '5-10', label: '5–10' },
  { value: '10-20', label: '10–20' },
  { value: '20+', label: '20+' }
];

// Live stats for ticker
const liveStats = [
  "Dietitians: 82% accuracy on timing questions",
  "Average game time: 4 minutes 20 seconds",
  "Most challenging: Access selection questions",
  "Safety questions: Highest pass rate"
];

export function ProfileSelection({ 
  profile, 
  onUpdateProfile, 
  onStartGame,
  playSelectionSound,
  playStartSound
}: ProfileSelectionProps) {
  const [localInstitution, setLocalInstitution] = useState(profile.institution);

  const canStart = useMemo(() => {
    return profile.profession !== null && profile.experience !== null;
  }, [profile.profession, profile.experience]);

  const handleProfessionSelect = useCallback((prof: Profession) => {
    playSelectionSound();
    onUpdateProfile({ profession: prof });
  }, [onUpdateProfile, playSelectionSound]);

  const handleExperienceSelect = useCallback((exp: Experience) => {
    playSelectionSound();
    onUpdateProfile({ experience: exp });
  }, [onUpdateProfile, playSelectionSound]);

  const handleInstitutionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    setLocalInstitution(value);
    onUpdateProfile({ institution: value });
  }, [onUpdateProfile]);

  const handleStart = useCallback(() => {
    if (!canStart) return;
    playStartSound();
    onStartGame();
  }, [canStart, playStartSound, onStartGame]);

  return (
    <div className="screen bg-blue-extralight">
      {/* Header */}
      <div className="px-10 py-10 border-b-2 border-grey-light">
        <h2 className="heading-2 text-blue">SELECT YOUR PROFILE</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12 px-10 py-8 overflow-auto">
        {/* Profession Section */}
        <div className="w-full max-w-[1000px]">
          <label className="caption block mb-4 uppercase tracking-wider">YOUR PROFESSION</label>
          <div className="flex flex-wrap justify-center gap-6">
            {professions.map((prof) => (
              <button
                key={prof.value}
                onClick={() => handleProfessionSelect(prof.value)}
                className={`
                  w-[200px] h-20 rounded-xl text-[24px] font-normal
                  transition-all duration-200 ease-out
                  ${profile.profession === prof.value
                    ? 'bg-green border-2 border-green scale-105 shadow-[0_4px_16px_rgba(100,220,180,0.4)]'
                    : 'bg-white border-2 border-grey-light hover:border-blue-light hover:-translate-y-0.5 hover:shadow-card'
                  }
                `}
              >
                {prof.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="w-full max-w-[800px]">
          <label className="caption block mb-4 uppercase tracking-wider">YEARS IN PRACTICE</label>
          <div className="flex flex-wrap justify-center gap-6">
            {experiences.map((exp) => (
              <button
                key={exp.value}
                onClick={() => handleExperienceSelect(exp.value)}
                className={`
                  w-[120px] h-[60px] rounded-[30px] text-[24px] font-normal
                  transition-all duration-200 ease-out
                  ${profile.experience === exp.value
                    ? 'bg-green border-2 border-green scale-105 shadow-[0_4px_16px_rgba(100,220,180,0.4)]'
                    : 'bg-white border-2 border-grey-light hover:border-blue-light hover:-translate-y-0.5 hover:shadow-card'
                  }
                `}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Institution Section */}
        <div className="w-full max-w-[600px]">
          <label className="caption block mb-4 uppercase tracking-wider">
            INSTITUTION CODE (optional, 3 letters)
          </label>
          <input
            type="text"
            value={localInstitution}
            onChange={handleInstitutionChange}
            maxLength={3}
            pattern="[A-Za-z]{3}"
            className="
              w-[400px] h-20 bg-white border-2 border-grey-light rounded-xl
              px-6 text-[28px] font-normal uppercase
              focus:border-blue focus:outline-none
              transition-colors duration-200
            "
            placeholder="ABC"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-8 flex justify-center border-t-2 border-grey-light">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`
            w-[400px] h-20 rounded-full text-[32px] font-semibold text-white
            transition-all duration-200
            ${canStart 
              ? 'bg-orange hover:scale-105 animate-pulse-scale' 
              : 'bg-grey-dark opacity-50 cursor-not-allowed'
            }
          `}
        >
          START GAME
        </button>
      </div>

      {/* Stats Ticker */}
      <div className="h-[50px] bg-black/10 flex items-center overflow-hidden">
        <div className="stats-ticker flex items-center gap-16 text-grey-extradark text-[18px]">
          {liveStats.map((stat, i) => (
            <span key={i} className="flex items-center gap-4 whitespace-nowrap">
              <span className="w-2 h-2 bg-blue rounded-full" />
              {stat}
            </span>
          ))}
          {liveStats.map((stat, i) => (
            <span key={`dup-${i}`} className="flex items-center gap-4 whitespace-nowrap">
              <span className="w-2 h-2 bg-blue rounded-full" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
