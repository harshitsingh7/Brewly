import React, { useState, useEffect } from 'react';
import { SolverResult, StudyNote } from '../types';
import { sound } from '../services/sound';

interface HistoryViewProps {
  onSelectSolve: (solve: SolverResult) => void;
  onSelectNote: (note: StudyNote) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectSolve, onSelectNote }) => {
  const [filter, setFilter] = useState<'all' | 'solves' | 'notes'>('all');
  const [solves, setSolves] = useState<SolverResult[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);

  useEffect(() => {
    try {
      const sRaw = localStorage.getItem('brewly_history_solves');
      if (sRaw) setSolves(JSON.parse(sRaw));

      const nRaw = localStorage.getItem('brewly_saved_notes');
      if (nRaw) setNotes(JSON.parse(nRaw));
    } catch (e) {}
  }, []);

  const handleClearAll = () => {
    if (confirm('Clear all study history and notes?')) {
      localStorage.removeItem('brewly_history_solves');
      localStorage.removeItem('brewly_saved_notes');
      setSolves([]);
      setNotes([]);
      sound.playSoftTap();
    }
  };

  const hasAnyItems = solves.length > 0 || notes.length > 0;

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
            Study Archive
          </span>
          <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
            Recent Solves &amp; Notes
          </h2>
        </div>
        {hasAnyItems && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[12px] text-[#BA1A1A] hover:underline cursor-pointer"
          >
            Clear Archive
          </button>
        )}
      </div>

      {/* Filter pill switcher */}
      <div className="w-full flex justify-center mb-6">
        <div className="inline-flex items-center p-1 rounded-full bg-[#EBE8E3] border border-[#E8E0D5]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full font-label-md text-[12px] transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            All Items ({solves.length + notes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('solves')}
            className={`px-3 py-1.5 rounded-full font-label-md text-[12px] transition-all cursor-pointer ${
              filter === 'solves'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Solves ({solves.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('notes')}
            className={`px-3 py-1.5 rounded-full font-label-md text-[12px] transition-all cursor-pointer ${
              filter === 'notes'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Notes ({notes.length})
          </button>
        </div>
      </div>

      {!hasAnyItems ? (
        <div className="p-10 text-center rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] text-[#534439]">
          <span className="material-symbols-outlined text-[36px] text-[#C27A3E] mb-2">history</span>
          <p className="font-headline-sm text-[16px] text-[#2B1D14]">Your study archive is fresh</p>
          <p className="font-body-sm text-[13px] text-[#534439] mt-1 max-w-xs mx-auto">
            Homework solutions and recorded lecture notes will automatically be archived here for easy retrieval.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Solves */}
          {(filter === 'all' || filter === 'solves') &&
            solves.map((item) => (
              <article
                key={item.id}
                onClick={() => onSelectSolve(item)}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A3E] transition-all cursor-pointer flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#EFE6DA] text-[#8A4C13] font-label-caps text-[10px] font-bold">
                      {item.subject}
                    </span>
                    <span className="text-[#534439] text-[11px]">{item.level}</span>
                  </div>
                  <span className="text-[11px] text-[#534439]">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-headline-sm text-[15px] text-[#2B1D14] font-semibold line-clamp-1">
                  {item.prompt || item.summary}
                </h4>

                <div className="text-[12px] text-[#8A4C13] font-medium line-clamp-1">
                  Answer: {item.final_answer}
                </div>
              </article>
            ))}

          {/* Notes */}
          {(filter === 'all' || filter === 'notes') &&
            notes.map((note) => (
              <article
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A3E] transition-all cursor-pointer flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-[#EFE6DA] text-[#8A4C13] font-label-caps text-[10px] font-bold">
                    {note.subject} Note
                  </span>
                  <span className="text-[11px] text-[#534439]">
                    {new Date(note.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-headline-sm text-[15px] text-[#2B1D14] font-semibold line-clamp-1">
                  {note.title}
                </h4>

                <p className="text-[12px] text-[#534439] line-clamp-1">
                  {note.summary}
                </p>
              </article>
            ))}
        </div>
      )}
    </div>
  );
};
