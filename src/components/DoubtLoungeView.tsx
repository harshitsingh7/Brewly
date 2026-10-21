import React, { useState, useEffect, useRef } from 'react';
import { DoubtExplanation, WhiteboardItem } from '../types';
import { explainDoubt } from '../services/api';
import { sound } from '../services/sound';

interface DoubtLoungeViewProps {
  onAskFollowUp: (prompt: string) => void;
  onMakeFlashcards: (content: string, title: string) => void;
}

export const DoubtLoungeView: React.FC<DoubtLoungeViewProps> = ({
  onAskFollowUp,
  onMakeFlashcards,
}) => {
  const [doubtText, setDoubtText] = useState('');
  const [teachingMode, setTeachingMode] = useState<'tea' | 'professional'>('tea');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<DoubtExplanation | null>(null);

  // Live Whiteboard animation states
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penPosition, setPenPosition] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const whiteboardRef = useRef<HTMLDivElement>(null);
  const drawingTimerRef = useRef<any>(null);

  // Sample doubts for quick instant testing
  const sampleDoubts = [
    {
      label: 'Why can’t we divide by 0?',
      doubt: 'Why is dividing by zero undefined in math? What actually happens?',
      subject: 'Math',
    },
    {
      label: 'Entropy Drama',
      doubt: 'Why does entropy always increase in the universe? Why cannot things just stay tidy?',
      subject: 'Physics',
    },
    {
      label: 'Schrödinger’s Cat',
      doubt: 'Is Schrödinger’s Cat actually alive and dead at the same time or is that just a joke?',
      subject: 'Physics',
    },
    {
      label: 'Supply & Demand Feud',
      doubt: 'Why does raising prices reduce demand? Why does the Federal Reserve raise interest rates to slow the economy?',
      subject: 'Economics',
    },
    {
      label: 'Mitochondria Beef',
      doubt: 'Why do mitochondria have their own DNA? Did they invade our cells?',
      subject: 'Biology',
    },
  ];

  // Trigger whiteboard step drawing animation
  useEffect(() => {
    if (explanation && explanation.whiteboard_items.length > 0) {
      setIsDrawing(true);
      setActiveStepIndex(0);

      if (drawingTimerRef.current) clearInterval(drawingTimerRef.current);

      let current = 0;
      drawingTimerRef.current = setInterval(() => {
        current += 1;
        if (current < explanation.whiteboard_items.length) {
          setActiveStepIndex(current);
          sound.playSoftTap();
          // Animate pen tip coordinates
          setPenPosition({
            x: 20 + ((current * 25) % 60),
            y: 40 + current * 45,
          });
        } else {
          setIsDrawing(false);
          sound.playGentleChime();
          clearInterval(drawingTimerRef.current);
        }
      }, 1100);
    }

    return () => {
      if (drawingTimerRef.current) clearInterval(drawingTimerRef.current);
    };
  }, [explanation]);

  // Handle SpeechSynthesis audio narration
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window) || !explanation) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(explanation.teaching_speech);

    if (teachingMode === 'tea') {
      utterance.pitch = 1.15;
      utterance.rate = 1.05;
    } else {
      utterance.pitch = 0.95;
      utterance.rate = 0.95;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleExplain = async (overrideMode?: 'tea' | 'professional') => {
    const modeToUse = overrideMode || teachingMode;
    if (!doubtText.trim()) {
      setError('Please type a student doubt or select one from the suggestions below.');
      return;
    }

    setLoading(true);
    setError(null);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const data = await explainDoubt({
        doubt: doubtText.trim(),
        mode: modeToUse,
      });

      setExplanation(data);
      sound.playGentleChime();
    } catch (err: any) {
      setError(err?.message || 'Failed to explain doubt.');
    } finally {
      setLoading(false);
    }
  };

  const selectSample = (sample: { doubt: string; label: string }) => {
    setDoubtText(sample.doubt);
    setError(null);
    sound.playSoftTap();
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Editorial Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE6DA] text-[#2B1D14] mb-2">
          <span className="material-symbols-outlined text-[15px] text-[#8A4C13]" style={{ fontVariationSettings: "'FILL' 1" }}>
            emoji_objects
          </span>
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-[#534439] font-semibold">
            Interactive Doubt Studio
          </span>
        </div>
        <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
          Spill the Doubt &amp; Live Whiteboard
        </h2>
        <p className="font-body-sm text-[13px] text-[#534439] mt-0.5">
          Ask any stubborn doubt. Learn through sarcastic gossip (<strong>Tea ☕</strong>) or rigorous academic instruction (<strong>Professional 🎓</strong>) with real-time whiteboard drawings.
        </p>
      </div>

      {/* Mode Switcher Pill: Tea vs Professional */}
      <div className="w-full flex justify-center mb-5">
        <div className="inline-flex items-center p-1 rounded-full bg-[#EBE8E3] border border-[#E8E0D5]">
          <button
            type="button"
            onClick={() => {
              sound.playSoftTap();
              setTeachingMode('tea');
              if (explanation && explanation.mode !== 'tea') {
                handleExplain('tea');
              }
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer flex items-center gap-1.5 ${
              teachingMode === 'tea'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold shadow-none'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">local_cafe</span>
            <span>Spill The Tea ☕</span>
            <span className="bg-[#FAF7F2] text-[#8A4C13] text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
              Sarcastic Gossip
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playSoftTap();
              setTeachingMode('professional');
              if (explanation && explanation.mode !== 'professional') {
                handleExplain('professional');
              }
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer flex items-center gap-1.5 ${
              teachingMode === 'professional'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold shadow-none'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">school</span>
            <span>Professional 🎓</span>
            <span className="bg-[#FAF7F2] text-[#8A4C13] text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
              Professor
            </span>
          </button>
        </div>
      </div>

      {/* Doubt Input Container */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] mb-4">
        <label className="font-label-caps text-[11px] text-[#534439] uppercase tracking-wider block mb-1.5 font-semibold">
          What is your doubt or concept?
        </label>
        <textarea
          rows={3}
          value={doubtText}
          onChange={(e) => setDoubtText(e.target.value)}
          placeholder={
            teachingMode === 'tea'
              ? 'e.g. Why does negative times negative equal positive? Who started this beef? Spill the tea!'
              : 'e.g. Explain the physical mechanism behind the second law of thermodynamics and entropy.'
          }
          className="w-full bg-transparent text-[#2B1D14] placeholder-[#2B1D14]/40 font-body-md text-[14px] leading-relaxed resize-none focus:outline-none"
        />

        <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D5] mt-2">
          <span className="font-body-sm text-[11px] text-[#534439]">
            Mode: {teachingMode === 'tea' ? '☕ Gossip & Sarcastic Hot Takes' : '🎓 Elite Academic Professor'}
          </span>
          {doubtText && (
            <button
              type="button"
              onClick={() => {
                setDoubtText('');
                setExplanation(null);
              }}
              className="text-[12px] text-[#534439] hover:text-[#2B1D14] underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick sample chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-[11px]">
        <span className="font-label-caps text-[#534439] uppercase shrink-0">Try Doubts:</span>
        {sampleDoubts.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => selectSample(s)}
            className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/80 hover:border-[#C27A3E] shrink-0 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#BA1A1A] text-[#BA1A1A] text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* Teach Me Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleExplain()}
        className="w-full h-12 rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-60 mb-6"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin"></span>
            <span>
              {teachingMode === 'tea' ? 'Brewing the drama & drawing board...' : 'Formulating lecture & schematics...'}
            </span>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">
              {teachingMode === 'tea' ? 'local_cafe' : 'history_edu'}
            </span>
            <span>
              {teachingMode === 'tea' ? 'Spill the Tea & Sketch on Whiteboard' : 'Teach Professionally on Whiteboard'}
            </span>
          </>
        )}
      </button>

      {/* Output Screen */}
      {explanation && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
          {/* 1. LIVE WHITEBOARD CANVAS */}
          <div
            ref={whiteboardRef}
            className="relative w-full rounded-2xl bg-[#FFFFFF] border-2 border-[#E8E0D5] p-5 shadow-none overflow-hidden select-none"
            style={{ minHeight: '340px' }}
          >
            {/* Whiteboard Header with status & stylus indicator */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E0D5]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C27A3E] animate-pulse"></span>
                <span className="font-label-caps text-[11px] text-[#8A4C13] font-bold tracking-wider uppercase">
                  Live Teacher Whiteboard
                </span>
                <span className="font-headline-sm text-[14px] text-[#2B1D14] font-semibold truncate max-w-[180px]">
                  · {explanation.whiteboard_title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isDrawing ? (
                  <span className="inline-flex items-center gap-1 font-label-caps text-[10px] text-[#8A4C13] bg-[#EFE6DA] px-2 py-0.5 rounded-full font-bold">
                    <span className="material-symbols-outlined text-[13px] animate-spin">edit</span>
                    <span>Drawing live...</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawing(true);
                      setActiveStepIndex(0);
                    }}
                    className="font-label-caps text-[10px] text-[#534439] hover:text-[#8A4C13] bg-[#FAF7F2] border border-[#E8E0D5] px-2 py-0.5 rounded-full cursor-pointer"
                  >
                    Replay Sketch
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Live Stylus Pen Tip */}
            {isDrawing && (
              <div
                className="absolute pointer-events-none transition-all duration-700 ease-out z-20 flex items-center gap-1"
                style={{
                  top: `${penPosition.y}px`,
                  left: `${penPosition.x}%`,
                }}
              >
                <div className="w-7 h-7 rounded-full bg-[#8A4C13] text-[#FAF7F2] flex items-center justify-center shadow-md rotate-45 transform">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </div>
                <span className="text-[10px] font-sans font-bold bg-[#2B1D14] text-[#FAF7F2] px-1.5 py-0.5 rounded-md opacity-90 shadow-sm whitespace-nowrap">
                  Teacher Drawing
                </span>
              </div>
            )}

            {/* Drawn Items on Whiteboard */}
            <div className="flex flex-col gap-3.5 relative z-10">
              {explanation.whiteboard_items.map((item, idx) => {
                const isDrawn = idx <= activeStepIndex || !isDrawing;
                if (!isDrawn) return null;

                const isHighlight = item.kind === 'highlight' || item.kind === 'doodle_note';
                const isFormula = item.kind === 'formula';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all duration-500 animate-in fade-in-50 slide-in-from-left-2 ${
                      isHighlight
                        ? 'bg-[#EFE6DA] border-[#C27A3E]'
                        : isFormula
                        ? 'bg-[#FAF7F2] border-2 border-[#8A4C13]'
                        : 'bg-[#FAF7F2] border-[#E8E0D5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[16px]">{item.sketch_symbol || '✏️'}</span>
                        <span className="font-headline-sm text-[14px] text-[#2B1D14] font-semibold">
                          {item.title}
                        </span>
                      </div>
                      <span className="font-label-caps text-[10px] text-[#534439] bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E8E0D5]">
                        Step {item.step || idx + 1}
                      </span>
                    </div>

                    <div
                      className={`text-[13px] leading-relaxed ${
                        isFormula
                          ? 'font-mono font-semibold text-[#8A4C13] bg-[#FFFFFF] p-2 rounded-lg border border-[#E8E0D5] mt-1.5'
                          : 'text-[#2B1D14]/90'
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Whiteboard Marker Tray */}
            <div className="mt-5 pt-3 border-t border-[#E8E0D5] flex items-center justify-between text-xs text-[#534439]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8A4C13]"></span>
                <span className="w-2 h-2 rounded-full bg-[#C27A3E]"></span>
                <span className="w-2 h-2 rounded-full bg-[#534439]"></span>
                <span className="text-[11px] font-sans">Artisanal Board Chalk &amp; Ink</span>
              </div>
              <span className="font-label-caps text-[10px] text-[#534439]">
                {explanation.whiteboard_items.length} Nodes Rendered
              </span>
            </div>
          </div>

          {/* 2. TEACHING SPEECH & MONOLOGUE */}
          <article
            className={`p-5 rounded-2xl border ${
              teachingMode === 'tea'
                ? 'bg-[#EFE6DA] border-[#C27A3E]'
                : 'bg-[#FAF7F2] border-[#E8E0D5]'
            }`}
          >
            {/* Header with audio voice toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5] mb-4">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase font-bold tracking-wider">
                  {explanation.verdict_badge}
                </span>
                <span className="text-[11px] text-[#534439]">
                  · {teachingMode === 'tea' ? 'The Sarcastic Tea' : 'The Lecture'}
                </span>
              </div>

              {/* Text-To-Speech Listen Button */}
              {'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`px-3 py-1 rounded-full font-label-md text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold animate-pulse'
                      : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14] hover:border-[#C27A3E]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isSpeaking ? 'stop' : 'volume_up'}
                  </span>
                  <span>{isSpeaking ? 'Pause Audio' : 'Listen to Tutor'}</span>
                </button>
              )}
            </div>

            {/* Sarcastic / Professional Speech Body */}
            <div className="font-body-md text-[14px] text-[#2B1D14] leading-relaxed whitespace-pre-wrap mb-5">
              {explanation.teaching_speech}
            </div>

            {/* Bottom Line Verdict Box */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] mb-4">
              <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase font-bold block mb-1">
                {teachingMode === 'tea' ? 'The Unfiltered Bottom Line 💅' : 'Essential Takeaway 📜'}
              </span>
              <p className="font-headline-sm text-[15px] text-[#2B1D14] font-semibold italic">
                "{explanation.verdict_summary}"
              </p>
            </div>

            {/* Bridges to Tutor Chat & Flashcards */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E8E0D5]">
              <button
                type="button"
                onClick={() =>
                  onAskFollowUp(
                    `We were discussing this doubt: "${doubtText}". Tutor explained it in ${teachingMode} mode. Could we test my understanding with a practice problem?`
                  )
                }
                className="font-label-md text-[12px] text-[#8A4C13] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">forum</span>
                <span>Continue conversation in Tutor Chat &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onMakeFlashcards(
                    `Doubt: ${doubtText}\nKey Concept: ${explanation.verdict_summary}\nSpeech: ${explanation.teaching_speech.slice(0, 500)}`,
                    `Doubt: ${explanation.whiteboard_title}`
                  )
                }
                className="font-label-md text-[12px] text-[#8A4C13] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">style</span>
                <span>Generate Flashcards from this doubt &rarr;</span>
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
