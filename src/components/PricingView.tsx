import React, { useState, useEffect } from 'react';
import {
  getTokensRemaining,
  refillFreeTokens,
  INITIAL_FREE_TOKEN_GRANT,
  getSolveCountToday,
  getCustomApiKey,
  setCustomApiKey,
  validateCustomApiKey,
} from '../services/api';
import { sound } from '../services/sound';

interface PricingViewProps {
  onBack?: () => void;
  onPlanChanged?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onPlanChanged }) => {
  const [tokensRemaining, setTokensRemaining] = useState(getTokensRemaining());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const solveCount = getSolveCountToday();

  // Custom API key state
  const [apiKeyInput, setApiKeyInput] = useState(getCustomApiKey());
  const [currentKey, setCurrentKey] = useState(getCustomApiKey());
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [showKeyText, setShowKeyText] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTokensRemaining(getTokensRemaining());
    };
    const handleKeyUpdate = () => {
      const activeKey = getCustomApiKey();
      setCurrentKey(activeKey);
      setApiKeyInput(activeKey);
    };
    window.addEventListener('brewly-tokens-updated', handleUpdate);
    window.addEventListener('brewly-api-key-updated', handleKeyUpdate);
    return () => {
      window.removeEventListener('brewly-tokens-updated', handleUpdate);
      window.removeEventListener('brewly-api-key-updated', handleKeyUpdate);
    };
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

  const handleSaveAndTestKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setCustomApiKey('');
      setCurrentKey('');
      setKeyFeedback({ success: true, message: 'Reverted to shared server key with multi-model fallback.' });
      showToast('Switched to shared server key with multi-model fallback.');
      return;
    }

    setIsValidatingKey(true);
    setKeyFeedback(null);
    try {
      const res = await validateCustomApiKey(trimmed);
      if (res.valid) {
        setCustomApiKey(trimmed);
        setCurrentKey(trimmed);
        setKeyFeedback({ success: true, message: res.message || 'Key connected and verified successfully!' });
        showToast('✨ Google AI Studio Key verified and connected!');
      } else {
        setKeyFeedback({ success: false, message: res.message || 'Verification failed. Please check key.' });
      }
    } catch (e: any) {
      setKeyFeedback({ success: false, message: e?.message || 'Verification failed.' });
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    setCustomApiKey('');
    setCurrentKey('');
    setKeyFeedback(null);
    showToast('Removed custom key. Reverted to shared server key.');
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

        {/* Google AI Studio Free API Key Card (Launch & Testing Key Manager) */}
        <article className="flex flex-col p-6 rounded-2xl bg-surface" style={{ border: '1.5px solid #E8E0D5' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">vpn_key</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Google AI Studio API Key</h3>
            </div>
            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-secondary-container text-primary font-bold">
              100% FREE
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            Connect your own free API key from Google AI Studio. This gives you private, unrestricted rate limits (15 RPM free, high daily quota) so your website tests never run into shared 429 limits.
          </p>

          {/* Current Status Badge */}
          <div className="p-3 rounded-xl mb-4 bg-surface-container-low flex items-center justify-between border border-[#E8E0D5]">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  currentKey ? 'bg-emerald-600 animate-pulse' : 'bg-[#C27A3E]'
                }`}
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {currentKey ? 'Personal AI Studio Key Active' : 'Shared Server Key Active'}
                </span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  {currentKey
                    ? 'Using your dedicated Google AI Studio quota (15 RPM free)'
                    : 'Auto-fallback chain across 4 Gemini models (gemini-2.5-flash priority)'}
                </span>
              </div>
            </div>
            {currentKey && (
              <span className="font-label-caps text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                CONNECTED
              </span>
            )}
          </div>

          {/* Input & Action */}
          <div className="flex flex-col gap-2.5 mb-3">
            <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between">
              <span>API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-[12px] inline-flex items-center gap-1 font-medium"
              >
                <span>Get free key at aistudio.google.com</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </label>

            <div className="relative flex items-center">
              <input
                type={showKeyText ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste AIzaSy... (leave blank for server default)"
                className="w-full h-11 px-3.5 pr-20 rounded-xl bg-surface-container text-on-surface font-mono text-[13px] border border-[#E8E0D5] focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKeyText(!showKeyText)}
                className="absolute right-2 px-2 py-1 text-on-surface-variant hover:text-on-surface text-[12px] rounded"
                title={showKeyText ? 'Hide key' : 'Show key'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showKeyText ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Key Validation Feedback */}
          {keyFeedback && (
            <div
              className={`p-2.5 rounded-xl text-body-sm text-[13px] mb-3 flex items-center gap-2 ${
                keyFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {keyFeedback.success ? 'check_circle' : 'warning'}
              </span>
              <span>{keyFeedback.message}</span>
            </div>
          )}

          {/* Button actions */}
          <div className="flex items-center gap-2.5 mt-1">
            <button
              type="button"
              disabled={isValidatingKey}
              onClick={handleSaveAndTestKey}
              className="flex-1 h-10 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isValidatingKey ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  <span>Validating Key...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[17px]">check</span>
                  <span>Connect &amp; Test Key</span>
                </>
              )}
            </button>

            {currentKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="h-10 px-3.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md border border-[#E8E0D5] flex items-center gap-1 cursor-pointer"
                title="Revert to shared server key"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-primary">info</span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">
              Keys are stored privately in your browser session. Free tier requires no credit card.
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
                Gemini 2.5 Flash + Flash Lite + 3.8 Flash multi-model fallback
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Auto-resilient 429 quota handling (Zero crashes)
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Multimodal photo problem scanning &amp; canvas compression
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
              <span className="font-body-md text-body-md text-on-surface leading-snug">
                Independent AI accuracy verification badge
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
