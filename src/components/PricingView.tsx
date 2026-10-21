import React, { useState } from 'react';
import { isProUser, setProStatus, getSolveCountToday } from '../services/api';
import { sound } from '../services/sound';

interface PricingViewProps {
  onBack?: () => void;
  onPlanChanged?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onBack, onPlanChanged }) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(isProUser());
  const solveCount = getSolveCountToday();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    sound.playGentleChime();
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleStartTrial = () => {
    setProStatus(true);
    setIsPro(true);
    onPlanChanged?.();
    showToast('☕ 7-Day trial activated! Welcome to Brewly Espresso Pro.');
  };

  const handleRevertToFree = () => {
    setProStatus(false);
    setIsPro(false);
    onPlanChanged?.();
    showToast('Switched back to Brewly Drip (Free Plan).');
  };

  const handleVerifyStudent = () => {
    showToast('Student discount code applied: 20% off with verified .edu email.');
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Editorial Intro Section */}
      <section className="flex flex-col text-center pt-3 pb-6">
        <div className="inline-flex items-center justify-center gap-1.5 mx-auto mb-2.5 px-3 py-1 rounded-full bg-secondary-container text-on-surface">
          <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_cafe
          </span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
            Study Ritual Upgrades
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">
          Brew Smarter with <span className="italic font-normal">Brewly Pro</span>
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
          Unlimited step-by-step solutions, voice notes, and 24/7 AI tutoring.
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
              <span className="font-label-md text-label-md text-on-surface font-medium">Calm, undistracted AI companion</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant bg-[#FAF7F2]/80 px-2 py-0.5 rounded-full">
              Quiet Focus
            </span>
          </div>
        </div>
      </div>

      {/* Minimalist Billing Toggle */}
      <div className="w-full flex justify-center mb-7">
        <div className="inline-flex items-center p-1 rounded-full bg-surface-container-high" style={{ border: '1px solid #E8E0D5' }}>
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
              billing === 'monthly'
                ? 'bg-primary text-on-primary font-semibold shadow-none'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5 ${
              billing === 'yearly'
                ? 'bg-primary text-on-primary font-semibold shadow-none'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Yearly</span>
            <span
              className={`font-label-caps text-[10px] leading-tight px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                billing === 'yearly' ? 'bg-[#FAF7F2] text-primary' : 'bg-secondary-container text-on-surface'
              }`}
            >
              Save 30%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Stack */}
      <div className="flex flex-col gap-6">
        {/* Pro Tier Card (Caramel Highlighted) */}
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
              MOST POPULAR · 7-DAY FREE TRIAL
            </span>
          </div>

          {/* Header & Price */}
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-headline-md text-headline-md text-on-surface">Brewly Espresso Pro</h3>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-display text-display text-on-surface font-semibold tracking-tight">
              {billing === 'yearly' ? '$8.99' : '$12.99'}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">/ month</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
            {billing === 'yearly' ? 'Billed annually at $79/year (Save $28.88)' : 'Billed monthly · Cancel anytime before renewal'}
          </p>

          {/* Hairline divider */}
          <div className="w-full h-px mb-5" style={{ backgroundColor: '#E8E0D5' }}></div>

          {/* Pro Features List */}
          <ul className="flex flex-col gap-3.5 mb-7">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-body-md text-body-md text-on-surface font-medium leading-snug">
                Unlimited instant homework solutions
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
                Unlimited lecture voice notes &amp; summaries
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

          {/* Primary Action Button */}
          {isPro ? (
            <div className="flex flex-col gap-2">
              <div className="w-full h-12 rounded-2xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span>Pro Membership Active</span>
              </div>
              <button
                type="button"
                onClick={handleRevertToFree}
                className="text-xs text-center text-on-surface-variant hover:text-primary transition-colors underline pt-1"
              >
                Switch back to Free tier for testing
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartTrial}
              className="w-full h-12 rounded-2xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">local_cafe</span>
              <span>Start 7-Day Free Trial</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-2 mt-3 text-center">
            <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">No charge today · Cancel anytime in 1 tap</span>
          </div>
        </article>

        {/* Free Tier Card */}
        <article className="flex flex-col p-5 rounded-2xl bg-surface" style={{ border: '1px solid #E8E0D5' }}>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Brewly Drip</h3>
            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
              BASIC
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">$0</span>
            <span className="font-body-md text-body-md text-on-surface-variant">/ month</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            Gentle everyday study essentials to stay on track.
          </p>

          {/* Daily Quota Counter Banner */}
          <div className="mb-4 px-3 py-2 rounded-xl bg-surface-container flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Today's Solves:</span>
            <span className={`font-semibold ${solveCount >= 5 ? 'text-red-700' : 'text-primary'}`}>
              {solveCount} / 5 used
            </span>
          </div>

          {/* Hairline divider */}
          <div className="w-full h-px mb-4" style={{ backgroundColor: '#E8E0D5' }}></div>

          {/* Free Features List */}
          <ul className="flex flex-col gap-3 mb-6">
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">5 homework solutions per day</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">Basic step-by-step explanations</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">2 audio notes per week</span>
            </li>
            <li className="flex items-start gap-2.5 opacity-55">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">close</span>
              <span className="font-body-md text-body-md text-on-surface-variant leading-snug line-through">
                Unlimited follow-ups
              </span>
            </li>
            <li className="flex items-start gap-2.5 opacity-55">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">close</span>
              <span className="font-body-md text-body-md text-on-surface-variant leading-snug line-through">
                Instant exam-prep quizzes
              </span>
            </li>
          </ul>

          {/* Current Plan Button */}
          <button
            type="button"
            disabled={!isPro}
            onClick={handleRevertToFree}
            className={`w-full h-12 rounded-2xl font-label-lg text-label-lg flex items-center justify-center transition-all ${
              !isPro
                ? 'bg-secondary-container text-on-surface opacity-85 cursor-default'
                : 'bg-surface text-primary border border-hairline hover:bg-secondary-container'
            }`}
            style={{ border: '1px solid #E8E0D5' }}
          >
            {!isPro ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </article>
      </div>

      {/* Student Discount Callout Module */}
      <section className="mt-6 p-4 rounded-2xl bg-surface-container-low flex items-center gap-3.5" style={{ border: '1px solid #E8E0D5' }}>
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-primary">
          <span className="material-symbols-outlined text-[20px]">school</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-headline-sm text-[15px] text-on-surface leading-tight">Student Academic Perk</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
            Extra 20% off with any verified .edu email address.
          </p>
        </div>
        <button
          type="button"
          onClick={handleVerifyStudent}
          className="px-3 py-1.5 rounded-full bg-surface font-label-md text-label-md text-primary font-medium shrink-0 hover:bg-secondary-container transition-colors"
          style={{ border: '1px solid #E8E0D5' }}
        >
          Verify
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
            <span className="material-symbols-outlined text-[15px] text-primary">restart_alt</span> Cancel anytime
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" style={{ backgroundColor: '#D8C2B5' }}></span>
          <span className="flex items-center gap-1 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[15px] text-primary">bolt</span> Instant setup
          </span>
        </div>
        <p className="font-body-sm text-[12px] text-on-surface-variant opacity-80 mt-1 max-w-xs">
          Student discount available with verified .edu email. Prices shown in USD. Terms &amp; Privacy apply.
        </p>
      </footer>

      {/* Micro-interaction Toast Notification */}
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
