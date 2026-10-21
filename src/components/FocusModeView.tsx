import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/sound';

export const FocusModeView: React.FC = () => {
  const WORK_SECONDS = 25 * 60;
  const BREAK_SECONDS = 5 * 60;

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(sound.getIsAmbientPlaying());

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            sound.playGentleChime();
            if (mode === 'work') {
              setCompletedSessions((c) => c + 1);
              setMode('break');
              return BREAK_SECONDS;
            } else {
              setMode('work');
              return WORK_SECONDS;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const toggleTimer = () => {
    sound.playSoftTap();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sound.playSoftTap();
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? WORK_SECONDS : BREAK_SECONDS);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    sound.playSoftTap();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_SECONDS : BREAK_SECONDS);
  };

  const toggleSound = () => {
    const active = sound.toggleAmbientCafe();
    setIsAmbientPlaying(active);
  };

  const formatDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'work' ? WORK_SECONDS : BREAK_SECONDS;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col w-full pb-10 items-center text-center">
      <div className="mb-6">
        <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
          Quiet Focus
        </span>
        <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
          Pomodoro Study Ritual
        </h2>
        <p className="font-body-sm text-[13px] text-[#534439] mt-0.5">
          25 minutes of undistracted deliberate study, followed by a 5-minute calm break.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex items-center p-1 rounded-full bg-[#EBE8E3] border border-[#E8E0D5] mb-8">
        <button
          type="button"
          onClick={() => switchMode('work')}
          className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
            mode === 'work'
              ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
              : 'text-[#534439] hover:text-[#2B1D14]'
          }`}
        >
          Study Ritual (25m)
        </button>
        <button
          type="button"
          onClick={() => switchMode('break')}
          className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
            mode === 'break'
              ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
              : 'text-[#534439] hover:text-[#2B1D14]'
          }`}
        >
          Quiet Rest (5m)
        </button>
      </div>

      {/* Large Timer Display */}
      <div className="relative w-64 h-64 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex flex-col items-center justify-center p-6 mb-8 select-none">
        {/* Subtle decorative progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            className="stroke-[#E8E0D5]"
            strokeWidth="2"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            className="stroke-[#C27A3E] transition-all duration-500 ease-linear"
            strokeWidth="3.5"
            strokeDasharray="289"
            strokeDashoffset={289 - (289 * progressPercent) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase font-bold tracking-widest mb-1">
          {mode === 'work' ? 'Deep Work' : 'Quiet Pause'}
        </span>
        <div className="font-display text-[52px] text-[#2B1D14] font-semibold tracking-tight leading-none">
          {formatDisplay(timeLeft)}
        </div>
        <span className="font-body-sm text-[12px] text-[#534439] mt-2">
          Rituals Completed: {completedSessions}
        </span>
      </div>

      {/* Hairline Progress Bar matching design system specs */}
      <div className="w-full max-w-xs h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-[#C27A3E] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          type="button"
          onClick={resetTimer}
          className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[#534439] hover:text-[#2B1D14] flex items-center justify-center cursor-pointer transition-colors"
          title="Reset timer"
        >
          <span className="material-symbols-outlined text-[20px]">restart_alt</span>
        </button>

        <button
          type="button"
          onClick={toggleTimer}
          className="h-14 px-8 rounded-full bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-lg text-[16px] flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
          <span>{isRunning ? 'Pause Ritual' : 'Begin Ritual'}</span>
        </button>

        <button
          type="button"
          onClick={toggleSound}
          className={`w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
            isAmbientPlaying
              ? 'bg-[#EFE6DA] border-[#C27A3E] text-[#8A4C13]'
              : 'bg-[#FAF7F2] border-[#E8E0D5] text-[#534439]'
          }`}
          title={isAmbientPlaying ? 'Mute ambient cafe sound' : 'Play quiet cafe background sound'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isAmbientPlaying ? 'volume_up' : 'volume_off'}
          </span>
        </button>
      </div>

      {/* Ambient Sound Notice */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFE6DA] text-[#534439] text-xs">
        <span className="w-2 h-2 rounded-full bg-[#C27A3E] animate-pulse"></span>
        <span>
          {isAmbientPlaying
            ? 'Quiet artisanal cafe background hum playing'
            : 'Tap speaker icon for soothing background cafe noise'}
        </span>
      </div>
    </div>
  );
};
