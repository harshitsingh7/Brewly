import React, { useState } from 'react';
import { WritingResult, AcademicLevel } from '../types';
import { generateWritingHelp } from '../services/api';
import { sound } from '../services/sound';

export const WritingAssistantView: React.FC = () => {
  const [task, setTask] = useState<'outline' | 'draft' | 'grammar'>('outline');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [style, setStyle] = useState('Academic Scholarly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WritingResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (task === 'outline' && !topic.trim()) {
      setError('Please provide an essay topic or research question.');
      return;
    }
    if ((task === 'draft' || task === 'grammar') && !text.trim()) {
      setError('Please provide text or draft paragraphs to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generateWritingHelp({
        task,
        topic: topic.trim(),
        text: text.trim(),
        style,
      });

      setResult(data);
      sound.playGentleChime();
    } catch (err: any) {
      setError(err?.message || 'Writing assistant generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string, idx?: number) => {
    navigator.clipboard.writeText(content);
    if (idx !== undefined) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    sound.playSoftTap();
  };

  const loadSamplePrompt = () => {
    if (task === 'outline') {
      setTopic('The Ethical and Societal Implications of Artificial Intelligence in Medical Diagnosis');
    } else if (task === 'draft') {
      setText(
        'While machine learning algorithms demonstrate diagnostic accuracy comparable to board-certified radiologists in identifying thoracic pathologies, clinical deployment poses complex liability and epistemic challenges.'
      );
    } else {
      setText(
        'A lot of people think that AI is gonna replace doctors completely in the next few years, but really there is tons of reasons why human doctors are still super needed.'
      );
    }
    setError(null);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="mb-4">
        <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
          Scholar's Desk
        </span>
        <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
          Writing Companion &amp; Rhetoric
        </h2>
        <p className="font-body-sm text-[13px] text-[#534439] mt-0.5">
          Formulate structured essay outlines, craft persuasive drafts, and polish sentence clarity.
        </p>
      </div>

      {/* Task Selector Pill */}
      <div className="w-full flex justify-center mb-6">
        <div className="inline-flex items-center p-1 rounded-full bg-[#EBE8E3] border border-[#E8E0D5]">
          <button
            type="button"
            onClick={() => {
              setTask('outline');
              setResult(null);
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              task === 'outline'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Essay Outline
          </button>
          <button
            type="button"
            onClick={() => {
              setTask('draft');
              setResult(null);
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              task === 'draft'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Draft Help
          </button>
          <button
            type="button"
            onClick={() => {
              setTask('grammar');
              setResult(null);
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              task === 'grammar'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Grammar &amp; Clarity
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] mb-4">
        {task === 'outline' ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-caps text-[11px] text-[#534439] uppercase font-semibold">
                Essay Topic or Inquiry
              </label>
              <button
                type="button"
                onClick={loadSamplePrompt}
                className="text-[11px] text-[#8A4C13] hover:underline"
              >
                Load Sample Topic
              </button>
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The impact of renewable subsidies on grid resilience"
              className="w-full h-11 px-3.5 rounded-xl bg-transparent border border-[#E8E0D5] focus:border-[#C27A3E] text-[14px] text-[#2B1D14] focus:outline-none mb-3"
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-caps text-[11px] text-[#534439] uppercase font-semibold">
                {task === 'draft' ? 'Paragraph or Concept to Expand' : 'Draft Text to Refine'}
              </label>
              <button
                type="button"
                onClick={loadSamplePrompt}
                className="text-[11px] text-[#8A4C13] hover:underline"
              >
                Load Sample Draft
              </button>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste sentence or paragraph here..."
              className="w-full bg-transparent text-[#2B1D14] placeholder-[#2B1D14]/40 font-body-md text-[13px] leading-relaxed resize-none focus:outline-none mb-2"
            />
          </div>
        )}

        {/* Style tone picker */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D5]">
          <span className="font-label-caps text-[11px] text-[#534439] uppercase font-semibold">Tone:</span>
          <div className="flex gap-1.5">
            {['Academic Scholarly', 'Persuasive', 'Analytical', 'Concise'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${
                  style === s
                    ? 'bg-[#EFE6DA] border border-[#C27A3E] text-[#8A4C13] font-bold'
                    : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#534439]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#BA1A1A] text-[#BA1A1A] text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleGenerate}
        className="w-full h-12 rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-60 mb-6"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin"></span>
            <span>Composing guidance...</span>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">draw</span>
            <span>
              {task === 'outline'
                ? 'Generate Structured Essay Outline'
                : task === 'draft'
                ? 'Expand & Polish Draft'
                : 'Check Grammar & Academic Clarity'}
            </span>
          </>
        )}
      </button>

      {/* Output Results */}
      {result && (
        <div className="flex flex-col gap-4 animate-in fade-in-50 duration-300">
          <article className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5] mb-3">
              <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase font-bold tracking-wider">
                Writing Directive
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    result.polished_text ||
                      result.sections?.map((s) => s.heading + '\n' + s.summary).join('\n\n') ||
                      ''
                  )
                }
                className="font-label-md text-[11px] text-[#8A4C13] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>Copy All</span>
              </button>
            </div>

            <h3 className="font-headline-md text-[19px] text-[#2B1D14] font-semibold mb-3">
              {result.thesis_or_title}
            </h3>

            {/* Sections (Outline) */}
            {result.sections && result.sections.length > 0 && (
              <div className="flex flex-col gap-3.5 mb-5">
                {result.sections.map((sec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                    <h4 className="font-headline-sm text-[15px] text-[#8A4C13] font-semibold mb-1">
                      {sec.heading}
                    </h4>
                    <p className="font-body-md text-[13px] text-[#2B1D14] leading-relaxed mb-2">
                      {sec.summary}
                    </p>
                    {sec.tips && (
                      <div className="text-[11px] text-[#534439] bg-[#EFE6DA] px-2.5 py-1 rounded-lg">
                        <strong>Editorial tip:</strong> {sec.tips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Polished Rewrite */}
            {result.polished_text && (
              <div className="mb-5 p-4 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5]">
                <span className="font-label-caps text-[11px] text-[#8A4C13] font-bold block mb-1 uppercase">
                  Polished Scholarly Draft
                </span>
                <p className="font-body-md text-[14px] text-[#2B1D14] leading-relaxed whitespace-pre-wrap">
                  {result.polished_text}
                </p>
              </div>
            )}

            {/* Side-by-side Grammar & Clarity suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <h4 className="font-headline-sm text-[15px] text-[#2B1D14] font-semibold mb-2">
                  Clarity &amp; Rhetorical Enhancements
                </h4>
                <div className="flex flex-col gap-2.5">
                  {result.suggestions.map((sug, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="line-through text-[#BA1A1A]">{sug.original}</span>
                        <span className="material-symbols-outlined text-[#8A4C13] text-[16px]">arrow_forward</span>
                        <span className="font-semibold text-[#8A4C13]">{sug.revised}</span>
                      </div>
                      <p className="text-[11px] text-[#534439] mt-1">{sug.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      )}
    </div>
  );
};
