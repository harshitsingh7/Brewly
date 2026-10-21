import React, { useState, useRef } from 'react';
import { AcademicLevel, Subject, SolverResult, SolverStep } from '../types';
import { solveProblem, verifySolution, getTokensRemaining, getSolveCountToday } from '../services/api';
import { sound } from '../services/sound';

interface SolverViewProps {
  onAskFollowUp: (problemContext: string) => void;
  onMakeFlashcards: (content: string, title: string) => void;
  onOpenPricing: () => void;
  prefilledPrompt?: string;
}

export const SolverView: React.FC<SolverViewProps> = ({
  onAskFollowUp,
  onMakeFlashcards,
  onOpenPricing,
  prefilledPrompt = '',
}) => {
  const [subject, setSubject] = useState<Subject>('Math');
  const [level, setLevel] = useState<AcademicLevel>('College');
  const [prompt, setPrompt] = useState(prefilledPrompt);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'solve' | 'simpler' | 'alternative'>('solve');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<SolverResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects: Subject[] = ['Math', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Essay'];
  const levels: AcademicLevel[] = ['Middle school', 'High school', 'College', 'Graduate'];

  // Handle image upload
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      setImageBase64(b64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const executeSolve = async (mode: 'normal' | 'simpler' | 'alternative' = 'normal') => {
    if (!prompt.trim() && !imageBase64) {
      setError('Please type your problem or upload an image.');
      return;
    }

    const remaining = getTokensRemaining();
    if (remaining <= 0) {
      setError('Your 10,000 testing token grant has been utilized. Tap Free Refill to restore 10,000 tokens instantly.');
      onOpenPricing();
      return;
    }

    setLoading(true);
    setLoadingMode(mode === 'simpler' ? 'simpler' : mode === 'alternative' ? 'alternative' : 'solve');
    setError(null);

    try {
      const res = await solveProblem({
        prompt: prompt.trim(),
        imageBase64: imageBase64 || undefined,
        mimeType,
        subject,
        level,
        mode,
        previousSolution: currentResult ? currentResult.steps : undefined,
      });

      setCurrentResult(res);
      sound.playGentleChime();

      // Save to localStorage history
      try {
        const historyRaw = localStorage.getItem('brewly_history_solves');
        const list: SolverResult[] = historyRaw ? JSON.parse(historyRaw) : [];
        localStorage.setItem('brewly_history_solves', JSON.stringify([res, ...list.slice(0, 29)]));
      } catch (e) {}

      // Trigger automatic accuracy verification pass
      runVerification(res);
    } catch (err: any) {
      if (err.isTokenDepleted) {
        onOpenPricing();
      }
      setError(err?.message || 'Error occurred while solving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runVerification = async (targetResult: SolverResult) => {
    setVerifying(true);
    try {
      const vRes = await verifySolution({
        problem: targetResult.prompt || 'Problem from image',
        proposed_solution: targetResult.steps,
        final_answer: targetResult.final_answer,
        subject: targetResult.subject,
        level: targetResult.level,
      });

      setCurrentResult((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          verification: {
            verified: vRes.verified,
            verified_answer: vRes.verified_answer,
            discrepancy_note: vRes.discrepancy_note,
            checked: true,
          },
        };
        // update history
        try {
          const historyRaw = localStorage.getItem('brewly_history_solves');
          const list: SolverResult[] = historyRaw ? JSON.parse(historyRaw) : [];
          const updatedList = list.map((item) => (item.id === updated.id ? updated : item));
          localStorage.setItem('brewly_history_solves', JSON.stringify(updatedList));
        } catch (e) {}
        return updated;
      });
    } catch (err) {
      console.warn('Verification check could not complete:', err);
    } finally {
      setVerifying(false);
    }
  };

  // Sample prompt chips for quick instant testing
  const loadSample = (sampleSubject: Subject, text: string) => {
    setSubject(sampleSubject);
    setPrompt(text);
    setImagePreview(null);
    setImageBase64(null);
    setError(null);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top ritual bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
            Study Ritual
          </span>
          <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
            Homework Problem Solver
          </h2>
        </div>
      </div>

      {/* Level Selector Chips */}
      <div className="mb-4">
        <label className="font-label-caps text-[11px] text-[#534439] uppercase tracking-wider block mb-2 font-semibold">
          Academic Depth
        </label>
        <div className="flex flex-wrap gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                sound.playSoftTap();
                setLevel(lvl);
              }}
              className={`px-3 py-1.5 rounded-full font-label-md text-[12px] transition-all cursor-pointer ${
                level === lvl
                  ? 'bg-[#EFE6DA] border border-[#C27A3E] text-[#2B1D14] font-bold'
                  : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/70 hover:text-[#2B1D14]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Chips */}
      <div className="mb-4">
        <label className="font-label-caps text-[11px] text-[#534439] uppercase tracking-wider block mb-2 font-semibold">
          Subject Field
        </label>
        <div className="flex flex-wrap gap-2">
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => {
                sound.playSoftTap();
                setSubject(sub);
              }}
              className={`px-3 py-1.5 rounded-full font-label-md text-[12px] transition-all cursor-pointer ${
                subject === sub
                  ? 'bg-[#EFE6DA] border border-[#C27A3E] text-[#2B1D14] font-bold'
                  : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/70 hover:text-[#2B1D14]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Input Card */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] mb-4">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe your ${subject} problem, equation, or paste homework question here...`}
          className="w-full bg-transparent text-[#2B1D14] placeholder-[#2B1D14]/40 font-body-md text-[14px] leading-relaxed resize-none focus:outline-none"
        />

        {/* Uploaded Image Preview */}
        {imagePreview && (
          <div className="relative mt-2 mb-3 rounded-xl overflow-hidden border border-[#E8E0D5] bg-[#EFE6DA]/40 max-h-48 flex items-center justify-center p-2">
            <img src={imagePreview} alt="Problem scan" className="max-h-44 object-contain rounded-lg" />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setImageBase64(null);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FAF7F2]/90 border border-[#E8E0D5] text-[#2B1D14] flex items-center justify-center hover:bg-[#FAF7F2]"
              aria-label="Remove image"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Bottom Actions inside input card */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8E0D5] mt-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageFile(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[12px] text-[#2B1D14] hover:border-[#C27A3E] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#8A4C13]">photo_camera</span>
              <span>{imagePreview ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {/* Drag & drop helper text */}
            <span className="hidden sm:inline font-body-sm text-[11px] text-[#534439]/70">
              or drag &amp; drop an image
            </span>
          </div>

          {prompt && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="text-[12px] text-[#534439] hover:text-[#2B1D14] underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick samples drawer */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-[11px]">
        <span className="font-label-caps text-[#534439] uppercase shrink-0">Try:</span>
        <button
          type="button"
          onClick={() => loadSample('Math', 'Find the derivative of f(x) = (3x^2 + 5x) * e^(2x)')}
          className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/80 hover:border-[#C27A3E] shrink-0"
        >
          Calculus Derivative
        </button>
        <button
          type="button"
          onClick={() => loadSample('Physics', 'A 2.5 kg projectile is launched at 30° with v0 = 45 m/s. Find max height and range neglecting air resistance.')}
          className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/80 hover:border-[#C27A3E] shrink-0"
        >
          Projectile Motion
        </button>
        <button
          type="button"
          onClick={() => loadSample('Chemistry', 'Balance the redox reaction in acidic solution: MnO4- + Fe2+ -> Mn2+ + Fe3+')}
          className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/80 hover:border-[#C27A3E] shrink-0"
        >
          Redox Balancing
        </button>
        <button
          type="button"
          onClick={() => loadSample('Economics', 'Given demand Qd = 120 - 4P and supply Qs = 20 + 6P, find market equilibrium price and quantity, then calculate consumer surplus.')}
          className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/80 hover:border-[#C27A3E] shrink-0"
        >
          Supply &amp; Demand
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#BA1A1A] text-[#BA1A1A] text-[13px] mb-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Primary Solve Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => executeSolve('normal')}
        className="w-full h-12 rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-60 mb-6"
      >
        {loading && loadingMode === 'solve' ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin"></span>
            <span>Solving step by step...</span>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            <span>Solve Step by Step</span>
          </>
        )}
      </button>

      {/* Solution Display Card */}
      {currentResult && (
        <div className="flex flex-col gap-4 animate-in fade-in-50 duration-300">
          <article className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5]">
            {/* Header info with Accuracy badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8E0D5] mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#EFE6DA] text-[#8A4C13] font-label-caps text-[11px] font-bold">
                  {currentResult.subject} · {currentResult.level}
                </span>
                {currentResult.confidence && (
                  <span className="text-[11px] text-[#534439]">Confidence: {currentResult.confidence}</span>
                )}
              </div>

              {/* Accuracy Check Badge */}
              <div>
                {verifying ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE6DA] text-[#534439] text-[11px] font-medium">
                    <span className="w-2.5 h-2.5 border border-[#8A4C13] border-t-transparent rounded-full animate-spin"></span>
                    <span>Checking accuracy...</span>
                  </span>
                ) : currentResult.verification?.checked ? (
                  currentResult.verification.verified ? (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE6DA] border border-[#C27A3E] text-[#8A4C13] font-label-caps text-[11px] font-bold"
                      title={currentResult.verification.discrepancy_note}
                    >
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <span>VERIFIED</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#BA1A1A] text-[#BA1A1A] font-label-caps text-[11px] font-bold"
                      title={currentResult.verification.discrepancy_note}
                    >
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span>DOUBLE-CHECK THIS</span>
                    </span>
                  )
                ) : null}
              </div>
            </div>

            {/* Discrepancy note banner if verification failed */}
            {currentResult.verification?.checked && !currentResult.verification.verified && (
              <div className="mb-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#BA1A1A] text-[12px] text-[#BA1A1A]">
                <strong className="block font-semibold mb-0.5">Auditor Note:</strong>
                {currentResult.verification.discrepancy_note}
              </div>
            )}

            {/* Synopsis */}
            {currentResult.summary && (
              <p className="font-body-md text-body-md text-[#534439] italic mb-4">
                "{currentResult.summary}"
              </p>
            )}

            {/* Numbered Steps List */}
            <div className="flex flex-col gap-4 mb-6">
              {currentResult.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <div className="w-7 h-7 rounded-full bg-[#EFE6DA] text-[#8A4C13] font-label-md text-[13px] font-bold flex items-center justify-center shrink-0 border border-[#E8E0D5]">
                    {step.step_number || idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline-sm text-[15px] text-[#2B1D14] mb-1 font-semibold">
                      {step.title}
                    </h4>
                    <p className="font-body-md text-[14px] text-[#2B1D14]/90 leading-relaxed whitespace-pre-wrap">
                      {step.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlighted Final Answer Box */}
            <div className="p-4 rounded-xl bg-[#EFE6DA] border-2 border-[#C27A3E] mb-4">
              <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase tracking-wider font-bold block mb-1">
                Final Answer
              </span>
              <div className="font-display text-[18px] text-[#2B1D14] font-semibold leading-snug">
                {currentResult.final_answer}
              </div>
              {currentResult.key_takeaway && (
                <div className="mt-2 pt-2 border-t border-[#E8E0D5] text-[12px] text-[#534439]">
                  <strong className="font-semibold text-[#8A4C13]">Key principle:</strong> {currentResult.key_takeaway}
                </div>
              )}
            </div>

            {/* Required Action Buttons: "Explain simpler", "Show another method", "Ask follow-up" */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => executeSolve('simpler')}
                className="h-11 px-3 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A3E] font-label-md text-[12px] text-[#2B1D14] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {loading && loadingMode === 'simpler' ? (
                  <span className="w-3.5 h-3.5 border border-[#8A4C13] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[17px] text-[#8A4C13]">lightbulb</span>
                )}
                <span>Explain simpler</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => executeSolve('alternative')}
                className="h-11 px-3 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A3E] font-label-md text-[12px] text-[#2B1D14] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {loading && loadingMode === 'alternative' ? (
                  <span className="w-3.5 h-3.5 border border-[#8A4C13] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[17px] text-[#8A4C13]">alt_route</span>
                )}
                <span>Show another method</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAskFollowUp(
                    `I am studying this ${currentResult.subject} problem: "${currentResult.prompt || currentResult.summary}". The answer was "${currentResult.final_answer}". Could you help explain the intuition or test me on it?`
                  )
                }
                className="h-11 px-3 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] hover:border-[#C27A3E] font-label-md text-[12px] text-[#8A4C13] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">forum</span>
                <span>Ask follow-up</span>
              </button>
            </div>

            {/* Extra Bridge: Make Flashcards & Quiz from this solution */}
            <div className="mt-3 pt-3 border-t border-[#E8E0D5] flex justify-end">
              <button
                type="button"
                onClick={() =>
                  onMakeFlashcards(
                    `Problem: ${currentResult.prompt}\nSolution steps: ${currentResult.steps.map((s) => s.title + ': ' + s.explanation).join('\n')}\nFinal Answer: ${currentResult.final_answer}`,
                    `${currentResult.subject}: ${currentResult.summary.slice(0, 30)}`
                  )
                }
                className="font-label-md text-[12px] text-[#8A4C13] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">style</span>
                <span>Turn this solution into Flashcards &amp; Quiz &rarr;</span>
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
