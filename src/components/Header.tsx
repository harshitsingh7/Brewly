import React from 'react';
import { ActiveTab } from '../types';
import { getSolveCountToday, isProUser } from '../services/api';

interface HeaderProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  canGoBack?: boolean;
  onBack?: () => void;
  titleOverride?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  canGoBack = false,
  onBack,
  titleOverride,
}) => {
  const isPro = isProUser();
  const solveCount = getSolveCountToday();

  const getTabTitle = (tab: ActiveTab): string => {
    if (titleOverride) return titleOverride;
    switch (tab) {
      case 'solver':
        return 'Homework Solver';
      case 'reader':
        return 'Smart Reader';
      case 'notes':
        return 'Lecture Notes';
      case 'flashcards':
        return 'Study Decks & Quiz';
      case 'tutor':
        return 'Tutor Dialogue';
      case 'writing':
        return 'Writing Companion';
      case 'focus':
        return 'Quiet Focus';
      case 'calculator':
        return 'Scientific Calc';
      case 'history':
        return 'Study Archive';
      case 'pricing':
        return 'Ritual Upgrades';
      default:
        return 'Brewly';
    }
  };

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#E8E0D5]">
      <div className="max-w-xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canGoBack && onBack ? (
            <button
              aria-label="Go back"
              onClick={onBack}
              className="min-w-[40px] min-h-[40px] -ml-2 flex items-center justify-center text-[#2B1D14] hover:text-[#8A4C13] transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#EFE6DA] flex items-center justify-center text-[#8A4C13] shrink-0 border border-[#E8E0D5]">
              <span className="material-symbols-outlined text-[18px]">local_cafe</span>
            </div>
          )}
          <h1 className="font-headline-sm text-[18px] text-[#2B1D14] tracking-tight leading-none font-semibold truncate">
            {getTabTitle(currentTab)}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Quota or Pro status badge */}
          {isPro ? (
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="px-2.5 py-1 rounded-full bg-[#EFE6DA] border border-[#C27A3E] text-[#8A4C13] font-label-caps text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span>PRO</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[#534439] hover:border-[#C27A3E] font-label-caps text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C27A3E]"></span>
              <span>{solveCount}/5 FREE</span>
            </button>
          )}

          {/* User profile avatar matching design */}
          <button
            type="button"
            onClick={() => onNavigate('pricing')}
            className="w-8 h-8 rounded-full bg-[#8A4C13] flex items-center justify-center shrink-0 text-[#FAF7F2] cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Profile and subscription"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
