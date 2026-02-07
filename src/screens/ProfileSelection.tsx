import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ScreenType, Profession, Experience } from '@/types/game';

interface ProfileSelectionProps {
  onNavigate: (screen: ScreenType) => void;
  profile: { profession: Profession | null; experience: Experience | null; country: string };
  onUpdateProfile: (updates: { profession?: Profession | null; experience?: Experience | null; country?: string }) => void;
  onStartGame: () => void;
  playSelectionSound: () => void;
  playStartSound: () => void;
}

const professions: { value: Profession; label: string; icon: string }[] = [
  { value: 'doctor', label: 'Doctor', icon: '🩺' },
  { value: 'dietitian', label: 'Dietitian', icon: '🥗' },
  { value: 'nurse', label: 'Nurse', icon: '💉' },
  { value: 'pharmacist', label: 'Pharmacist', icon: '💊' },
  { value: 'other', label: 'Other', icon: '👤' }
];

const experiences: { value: Experience; label: string }[] = [
  { value: '<2', label: '< 2' },
  { value: '2-5', label: '2–5' },
  { value: '5-10', label: '5–10' },
  { value: '10-20', label: '10–20' },
  { value: '20+', label: '20+' }
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe"
];

// Live stats for ticker
const liveStats = [
  "Dietitians: 82% accuracy on timing questions",
  "Average game time: 4 minutes 20 seconds",
  "Most challenging: Access selection questions",
  "Safety questions: Highest pass rate"
];

function StepBadge({ step, completed }: { step: number; completed: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center justify-center w-8 h-8 rounded-full text-[16px] font-semibold mr-3
        transition-all duration-300
        ${completed
          ? 'bg-green text-white'
          : 'bg-blue text-white'
        }
      `}
    >
      {completed ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        step
      )}
    </span>
  );
}

export function ProfileSelection({
  profile,
  onUpdateProfile,
  onStartGame,
  playSelectionSound,
  playStartSound
}: ProfileSelectionProps) {
  const [countryInput, setCountryInput] = useState(profile.country);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const canStart = useMemo(() => {
    return profile.profession !== null && profile.experience !== null;
  }, [profile.profession, profile.experience]);

  const professionDone = profile.profession !== null;
  const experienceDone = profile.experience !== null;

  const filteredCountries = useMemo(() => {
    if (!countryInput.trim()) return [];
    const query = countryInput.toLowerCase();
    return COUNTRIES.filter(c => c.toLowerCase().includes(query)).slice(0, 6);
  }, [countryInput]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleProfessionSelect = useCallback((prof: Profession) => {
    playSelectionSound();
    onUpdateProfile({ profession: prof });
  }, [onUpdateProfile, playSelectionSound]);

  const handleExperienceSelect = useCallback((exp: Experience) => {
    playSelectionSound();
    onUpdateProfile({ experience: exp });
  }, [onUpdateProfile, playSelectionSound]);

  const handleCountryInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountryInput(value);
    setShowSuggestions(value.trim().length > 0);
    setHighlightedIndex(-1);
    // Only update profile if it's an exact match or empty
    const exactMatch = COUNTRIES.find(c => c.toLowerCase() === value.toLowerCase());
    onUpdateProfile({ country: exactMatch || value });
  }, [onUpdateProfile]);

  const handleSelectCountry = useCallback((country: string) => {
    playSelectionSound();
    setCountryInput(country);
    onUpdateProfile({ country });
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  }, [onUpdateProfile, playSelectionSound]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredCountries.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < filteredCountries.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : filteredCountries.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectCountry(filteredCountries[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [showSuggestions, filteredCountries, highlightedIndex, handleSelectCountry]);

  const handleStart = useCallback(() => {
    if (!canStart) return;
    playStartSound();
    onStartGame();
  }, [canStart, playStartSound, onStartGame]);

  return (
    <div className="screen bg-blue-extralight">
      {/* Header */}
      <div className="px-10 py-8 border-b border-grey-light bg-white/50">
        <h2 className="heading-2 text-blue">SET UP YOUR PROFILE</h2>
        <p className="text-[20px] text-grey-extradark mt-1">
          Tell us about yourself to personalise your experience
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-10 py-6 overflow-auto">
        {/* Profession Section */}
        <div className="w-full max-w-[1000px]">
          <label className="caption flex items-center mb-4 uppercase tracking-wider">
            <StepBadge step={1} completed={professionDone} />
            YOUR PROFESSION
          </label>
          <div className="flex flex-wrap justify-center gap-4">
            {professions.map((prof) => (
              <button
                key={prof.value}
                onClick={() => handleProfessionSelect(prof.value)}
                className={`
                  flex items-center gap-3 px-8 h-[72px] rounded-2xl text-[22px] font-medium
                  transition-all duration-200 ease-out
                  ${profile.profession === prof.value
                    ? 'bg-green/20 border-2 border-green text-black scale-[1.03] shadow-[0_4px_16px_rgba(100,220,180,0.3)]'
                    : 'bg-white border-2 border-grey-light hover:border-blue-light hover:-translate-y-0.5 hover:shadow-card'
                  }
                `}
              >
                <span className="text-[28px]">{prof.icon}</span>
                {prof.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="w-full max-w-[800px]">
          <label className="caption flex items-center mb-4 uppercase tracking-wider">
            <StepBadge step={2} completed={experienceDone} />
            YEARS IN PRACTICE
          </label>
          <div className="flex flex-wrap justify-center gap-4">
            {experiences.map((exp) => (
              <button
                key={exp.value}
                onClick={() => handleExperienceSelect(exp.value)}
                className={`
                  w-[120px] h-[56px] rounded-full text-[22px] font-medium
                  transition-all duration-200 ease-out
                  ${profile.experience === exp.value
                    ? 'bg-green/20 border-2 border-green text-black scale-[1.03] shadow-[0_4px_16px_rgba(100,220,180,0.3)]'
                    : 'bg-white border-2 border-grey-light hover:border-blue-light hover:-translate-y-0.5 hover:shadow-card'
                  }
                `}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Country Section */}
        <div className="w-full max-w-[600px]">
          <label className="caption flex items-center mb-4 uppercase tracking-wider">
            <StepBadge step={3} completed={!!profile.country && COUNTRIES.includes(profile.country)} />
            YOUR COUNTRY <span className="text-grey-dark ml-2 normal-case text-[16px]">(optional)</span>
          </label>
          <div className="relative">
            <div className="relative">
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 text-grey-dark pointer-events-none"
                width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={countryInput}
                onChange={handleCountryInputChange}
                onFocus={() => countryInput.trim() && setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="
                  w-full h-[64px] bg-white border-2 border-grey-light rounded-2xl
                  pl-14 pr-6 text-[22px] font-normal
                  focus:border-blue focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,125,185,0.1)]
                  transition-all duration-200
                "
                placeholder="Start typing your country..."
                autoComplete="off"
              />
              {countryInput && (
                <button
                  onClick={() => {
                    setCountryInput('');
                    onUpdateProfile({ country: '' });
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-grey-light hover:bg-grey-dark text-grey-extradark hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredCountries.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-grey-light rounded-2xl shadow-card-hover overflow-hidden z-50"
              >
                {filteredCountries.map((country, idx) => {
                  const query = countryInput.toLowerCase();
                  const matchStart = country.toLowerCase().indexOf(query);
                  const before = country.slice(0, matchStart);
                  const match = country.slice(matchStart, matchStart + countryInput.length);
                  const after = country.slice(matchStart + countryInput.length);

                  return (
                    <button
                      key={country}
                      data-suggestion
                      onClick={() => handleSelectCountry(country)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`
                        w-full text-left px-6 py-4 text-[20px] transition-colors duration-100
                        flex items-center gap-3
                        ${idx === highlightedIndex ? 'bg-blue-extralight' : 'hover:bg-blue-extralight'}
                        ${idx < filteredCountries.length - 1 ? 'border-b border-grey-light' : ''}
                      `}
                    >
                      <svg
                        className="text-grey-dark flex-shrink-0"
                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>
                        {before}<strong className="text-blue">{match}</strong>{after}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results message */}
            {showSuggestions && countryInput.trim().length > 0 && filteredCountries.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-grey-light rounded-2xl shadow-card-hover overflow-hidden z-50">
                <div className="px-6 py-4 text-[18px] text-grey-extradark">
                  No matching country found
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-6 flex flex-col items-center gap-3 border-t border-grey-light bg-white/30">
        {!canStart && (
          <p className="text-[16px] text-grey-extradark">
            Select your profession and experience to continue
          </p>
        )}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`
            w-[360px] h-[72px] rounded-full text-[28px] font-semibold text-white
            transition-all duration-200
            ${canStart
              ? 'bg-orange hover:scale-105 shadow-button animate-pulse-scale'
              : 'bg-grey-dark opacity-50 cursor-not-allowed'
            }
          `}
        >
          START GAME
        </button>
      </div>

      {/* Stats Ticker */}
      <div className="h-[44px] bg-black/5 flex items-center overflow-hidden">
        <div className="stats-ticker flex items-center gap-16 text-grey-extradark text-[16px]">
          {liveStats.map((stat, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-blue rounded-full" />
              {stat}
            </span>
          ))}
          {liveStats.map((stat, i) => (
            <span key={`dup-${i}`} className="flex items-center gap-3 whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-blue rounded-full" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
