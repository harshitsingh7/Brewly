import React, { useState, useEffect } from 'react';
import { getTokensRemaining, refillFreeTokens, INITIAL_FREE_TOKEN_GRANT, getSolveCountToday } from '../services/api';
import { sound } from '../services/sound';

interface PricingViewProps {
  onBack?: () => void;
  onPlanChanged?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onPlanChanged }) => {
  const [tokensRemaining, setTokensRemaining] = useState(getTokensRemaining());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const solveCount = getSolveCountToday();

  useEffect(() => {
    const handleUpdate = () => {
      setTokensRemaining(getTokensRemaining());
    };
    window.addEventListener('brewly-tokens-updated', handleUpdate);
    return () => window.removeEventListener('brewly-tokens-updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    sound.playGentleChime();
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRefill = () => {
    const refilled = refillFreeTokens(INITIAL_FREE_TOKEN_GRANT);
    setTokensRemaining(refilled);
    onPlanChanged?.();
    showToast('✨ 10,000 Free Tokens granted! Enjoy unrestricted testing.');
  };

  const tokenPercent = Math.min(100, Math.max(0, (tokensRemaining / INITIAL_FREE_TOKEN_GRANT) * 100));

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Editorial Intro Section */}
      <section className="flex flex-col text-center pt-3 pb-6">
        <div className="inline-flex items-center justify-center gap-1.5 mx-auto mb-2.5 px-3 py-1 rounded-full bg-secondary-container text-on-surface">
          <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_cafe
          </span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
            Study Testing Grant
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">
          Brew Smarter with <span className="italic font-normal">Free Access</span>
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
          10,000 complimentary AI tokens provided for testing. Payments removed—everything is free.
        </p>
      </section>

      {/* Editorial Atmospheric Vignette */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-6 bg-surface-container-low" style={{ border: '1px solid #E8E0D5' }}>
        <div
          className="bg-cover bg-center w-full h-32 opacity-90"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAcpCMtqwuaDUhY1AmwOdfIUfrMZy2kTfcDh_h-2JzBnhTdVSmU3SVGqdprok0zUFxkGNXeQf8njVz_SNGFIPUkwDW7OoVBrSU1OTF6KzWHfdgoq6esrhOrwa6a2p0H4f1sAuKiaPaqdBSzRSIbnYpODFeDHOUOlFdwAJ4ts7M6J0-uf_jiRRF5eTCW0LD3jTXs_SZD4PqdNC3Y84Y2BAIa7Zo_N3iWJmxDsXZJW9ojPZj31gOOxm2D')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/40 to-transparent flex items-end p-3.5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C27A3E] animate-pulse"></span>
              <span className="font-label-md text-label-md text-on-surface font-medium">Free testing mode active</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant bg-[#FAF7F2]/80 px-2 py-0.5 rounded-full">
              Full Access Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* Token Balance Live Status Card */}
      <div className="flex flex-col gap-6">
        {/* Pro / Free Testing Card (Caramel Highlighted) */}
        <article className="relative flex flex-col p-6 rounded-2xl bg-secondary-container" style={{ border: '2px solid #C27A3E' }}>
          {/* Pill Badge */}
          <div
            className="self-start mb-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest"
            style={{ border: '1px solid #C27A3E' }}
          >
            <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold tracking-wider">
              COMPLIMENTARY TESTING GRANT · 10K TOKENS
            </span>
          </div>

          {/* Header & Token Balance */}
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-headline-md text-headline-md text-on-surface">Brewly Testing Grant</h3>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-display text-display text-on-surface font-semibold tracking-tight">
              {tokensRemaining.toLocaleString()}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">/ 10,000 tokens remaining</span>
          </div>

          {/* Token Progress Bar */}
          <div className="w-full h-2 bg-[#FAF7F2] rounded-full overflow-hidden mb-2 mt-1 border border-[#E8E0D5]">
            <div
              className="h-full bg-[#C27A3E] transition-all duration-300"
              style={{ width: `${tokenPercent}%` }}
            />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
            Unlimited free refills for testing. No payment info or credit card needed.
          </p>

          {/* Hairline divider */}
          <div className="w-full h-px mb-5" style={{ backgroundColor: '#E8E0D5' }}></div>

          {/* Unlocked Features List */}
          <ul className="flex flex-col gap-3.5 mb-7">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-body-md text-body-md text-on-surface font-medium leading-snug">
                Unlimited homework solutions (No daily 5-solve limit)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Deep step-by-step &amp; “Explain Simpler” modes
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Unlimited lecture voice notes &amp; AI summaries
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                24/7 conversational tutor with personalized feedback
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Auto-generated study decks &amp; exam quizzes
              </span>
            </li>
          </ul>

          {/* Primary Action: Free Refill */}
          <button
            type="button"
            onClick={handleRefill}
            className="w-full h-12 rounded-2xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            <span>Refill 10,000 Free Tokens</span>
          </button>

          <div className="flex items-center justify-center gap-2 mt-3 text-center">
            <span className="material-symbols-outlined text-[14px] text-primary">lock_open</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              100% Free · No payment required · Instant reset
            </span>
          </div>
        </article>

        {/* System Specs Card */}
        <article className="flex flex-col p-5 rounded-2xl bg-surface" style={{ border: '1px solid #E8E0D5' }}>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Testing Environment</h3>
            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container text-primary font-bold">
              FREE TIER
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">$0</span>
            <span className="font-body-md text-body-md text-on-surface-variant">/ unrestricted</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            Total solves performed today: {solveCount} (Unlimited allowed).
          </p>

          <div className="w-full h-px mb-4" style={{ backgroundColor: '#E8E0D5' }}></div>

          <ul className="flex flex-col gap-3 mb-4">
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Gemini 3.8 Flash API enabled
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Multimodal photo problem scanning
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Independent AI accuracy verification
              </span>
            </li>
          </ul>
        </article>
      </div>

      {/* Campus Perk Callout Module */}
      <section className="mt-6 p-4 rounded-2xl bg-surface-container-low flex items-center gap-3.5" style={{ border: '1px solid #E8E0D5' }}>
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-primary">
          <span className="material-symbols-outlined text-[20px]">school</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-headline-sm text-[15px] text-on-surface leading-tight">Campus Testing Edition</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
            All features are complimentary for students, tutors, and reviewers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast('Student access confirmed. Full test grant active!')}
          className="px-3 py-1.5 rounded-full bg-surface font-label-md text-label-md text-primary font-medium shrink-0 hover:bg-secondary-container transition-colors"
          style={{ border: '1px solid #E8E0D5' }}
        >
          Active
        </button>
      </section>

      {/* Visual Delight / Testimonial Whisper */}
      <div className="mt-8 p-5 rounded-2xl bg-surface text-center flex flex-col items-center" style={{ border: '1px solid #E8E0D5' }}>
        <div className="flex items-center gap-1 text-primary mb-2">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </div>
        <p className="font-headline-sm italic text-body-md text-on-surface mb-2 max-w-xs">
          “It feels like sitting across from a patient, brilliant friend at my favorite coffee spot.”
        </p>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
          Clara M. · Bioengineering sophomore
        </span>
      </div>

      {/* Trust Footer */}
      <footer className="mt-8 mb-2 flex flex-col items-center text-center gap-2">
        <div className="flex items-center justify-center gap-4 text-on-surface-variant">
          <span className="flex items-center gap-1 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[15px] text-primary">verified_user</span> 256-bit safe
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" style={{ backgroundColor: '#D8C2B5' }}></span>
          <span className="flex items-center gap-1 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[15px] text-primary">all_inclusive</span> Free testing
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" style={{ backgroundColor: '#D8C2B5' }}></span>
          <span className="flex items-center gap-1 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[15px] text-primary">bolt</span> Instant setup
          </span>
        </div>
        <p className="font-body-sm text-[12px] text-on-surface-variant opacity-80 mt-1 max-w-xs">
          Free academic evaluation edition. Powered by Gemini API with 10k token grant.
        </p>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto p-4 rounded-xl text-[#FAF7F2] bg-[#31302D] flex items-center justify-between z-50 transition-all duration-300"
          style={{ border: '1px solid #857468' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#FFDCC4] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="font-body-md text-body-md text-[#F3F0EB]">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#F3F0EB] opacity-70 hover:opacity-100 p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
