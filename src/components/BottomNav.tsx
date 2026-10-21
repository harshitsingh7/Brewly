import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { sound } from '../services/sound';

interface BottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const [showToolsSheet, setShowToolsSheet] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    sound.playSoftTap();
    onSelectTab(tab);
    setShowToolsSheet(false);
  };

  const isMoreActive = ['focus', 'calculator', 'writing', 'history', 'doubt'].includes(currentTab);

  return (
    <>
      {/* Sub-tools drawer sheet when "Tools" is tapped */}
      {showToolsSheet && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowToolsSheet(false)}
        >
          <div
            className="w-full max-w-xl bg-[#FAF7F2] rounded-t-2xl p-5 border-t border-[#E8E0D5] pb-24 shadow-none animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E8E0D5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8A4C13] text-[20px]">widgets</span>
                <h3 className="font-headline-sm text-[16px] text-[#2B1D14]">Study Companion Tools</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowToolsSheet(false)}
                className="text-[#534439] hover:text-[#2B1D14] p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Featured: Doubt Lounge with Tea & Whiteboard */}
              <button
                type="button"
                onClick={() => handleTabClick('doubt')}
                className={`col-span-2 p-3 rounded-xl border flex items-center gap-3 transition-colors text-left ${
                  currentTab === 'doubt'
                    ? 'bg-[#EFE6DA] border-2 border-[#C27A3E]'
                    : 'bg-[#FAF7F2] border border-[#E8E0D5] hover:bg-[#EFE6DA]/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#EFE6DA] border border-[#C27A3E] flex items-center justify-center text-[#8A4C13] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">local_cafe</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-[13px] text-[#2B1D14] font-semibold">Spill the Doubt &amp; Whiteboard</span>
                    <span className="bg-[#FAF7F2] text-[#8A4C13] text-[9px] px-1.5 py-0.2 rounded-full font-bold border border-[#C27A3E] uppercase">
                      Tea ☕ &amp; Prof 🎓
                    </span>
                  </div>
                  <div className="text-[11px] text-[#534439]">Sarcastic gossip or academic whiteboard teaching with live pen</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTabClick('focus')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors text-left ${
                  currentTab === 'focus'
                    ? 'bg-[#EFE6DA] border-[#C27A3E]'
                    : 'bg-[#FAF7F2] border-[#E8E0D5] hover:bg-[#EFE6DA]/50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center text-[#8A4C13] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                </div>
                <div>
                  <div className="font-label-md text-[13px] text-[#2B1D14] font-semibold">Focus Mode</div>
                  <div className="text-[11px] text-[#534439]">25/5 Pomodoro &amp; Sound</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('calculator')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors text-left ${
                  currentTab === 'calculator'
                    ? 'bg-[#EFE6DA] border-[#C27A3E]'
                    : 'bg-[#FAF7F2] border-[#E8E0D5] hover:bg-[#EFE6DA]/50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center text-[#8A4C13] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                </div>
                <div>
                  <div className="font-label-md text-[13px] text-[#2B1D14] font-semibold">Scientific Calc</div>
                  <div className="text-[11px] text-[#534439]">Formulas &amp; Functions</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('writing')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors text-left ${
                  currentTab === 'writing'
                    ? 'bg-[#EFE6DA] border-[#C27A3E]'
                    : 'bg-[#FAF7F2] border-[#E8E0D5] hover:bg-[#EFE6DA]/50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center text-[#8A4C13] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">draw</span>
                </div>
                <div>
                  <div className="font-label-md text-[13px] text-[#2B1D14] font-semibold">Writing Desk</div>
                  <div className="text-[11px] text-[#534439]">Outlines &amp; Grammar</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('history')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors text-left ${
                  currentTab === 'history'
                    ? 'bg-[#EFE6DA] border-[#C27A3E]'
                    : 'bg-[#FAF7F2] border-[#E8E0D5] hover:bg-[#EFE6DA]/50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center text-[#8A4C13] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">history_edu</span>
                </div>
                <div>
                  <div className="font-label-md text-[13px] text-[#2B1D14] font-semibold">Study History</div>
                  <div className="text-[11px] text-[#534439]">Saved Solves &amp; Notes</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8E0D5] pb-safe"
        aria-label="Study Navigation"
      >
        <div className="max-w-xl mx-auto h-16 px-1 flex items-center justify-around">
          {/* 1. Solver */}
          <button
            type="button"
            onClick={() => handleTabClick('solver')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'solver' ? 'text-[#8A4C13]' : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentTab === 'solver' ? "'FILL' 1" : "'FILL' 0" }}
            >
              auto_awesome
            </span>
            <span className="font-label-caps text-[10px] tracking-normal mt-0.5">Solver</span>
          </button>

          {/* 2. Reader */}
          <button
            type="button"
            onClick={() => handleTabClick('reader')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'reader' ? 'text-[#8A4C13]' : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentTab === 'reader' ? "'FILL' 1" : "'FILL' 0" }}
            >
              menu_book
            </span>
            <span className="font-label-caps text-[10px] tracking-normal mt-0.5">Reader</span>
          </button>

          {/* 3. Notes */}
          <button
            type="button"
            onClick={() => handleTabClick('notes')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'notes' ? 'text-[#8A4C13]' : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentTab === 'notes' ? "'FILL' 1" : "'FILL' 0" }}
            >
              mic
            </span>
            <span className="font-label-caps text-[10px] tracking-normal mt-0.5">Notes</span>
          </button>

          {/* 4. Decks & Quiz */}
          <button
            type="button"
            onClick={() => handleTabClick('flashcards')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'flashcards' ? 'text-[#8A4C13]' : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentTab === 'flashcards' ? "'FILL' 1" : "'FILL' 0" }}
            >
              style
            </span>
            <span className="font-label-caps text-[10px] tracking-normal mt-0.5">Decks</span>
          </button>

          {/* 5. Tutor */}
          <button
            type="button"
            onClick={() => handleTabClick('tutor')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'tutor' ? 'text-[#8A4C13]' : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentTab === 'tutor' ? "'FILL' 1" : "'FILL' 0" }}
            >
              forum
            </span>
            <span className="font-label-caps text-[10px] tracking-normal mt-0.5">Tutor</span>
          </button>

          {/* 6. More Tools */}
          <button
            type="button"
            onClick={() => setShowToolsSheet(!showToolsSheet)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              isMoreActive ? 'text-[#8A4C13]' : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isMoreActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              widgets
            </span>
            <span className="font-label-caps text-[10px] tracking-normal mt-0.5">Tools</span>
          </button>

          {/* 7. Pro / Pricing */}
          <button
            type="button"
            onClick={() => handleTabClick('pricing')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'pricing'
                ? 'text-[#8A4C13]'
                : 'text-[#C27A3E] hover:text-[#8A4C13]'
            }`}
          >
            <div className="relative">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: currentTab === 'pricing' ? "'FILL' 1" : "'FILL' 0" }}
              >
                stars
              </span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C27A3E]"></span>
            </div>
            <span className="font-label-caps text-[10px] tracking-normal mt-0.5 font-bold">Free</span>
          </button>
        </div>
      </nav>
    </>
  );
};
