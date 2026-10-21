import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/api';
import { sound } from '../services/sound';

interface SmartReaderViewProps {
  onMakeFlashcards: (content: string, title: string) => void;
}

interface DocAnalysis {
  title: string;
  reading_time: string;
  executive_summary: string;
  key_points: string[];
  discussion_questions?: string[];
}

interface QAItem {
  question: string;
  answer: string;
}

export const SmartReaderView: React.FC<SmartReaderViewProps> = ({ onMakeFlashcards }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState('application/pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<DocAnalysis | null>(null);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileMime(file.type || 'application/pdf');

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = () => {
        setText(reader.result as string);
        setFileBase64(null);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !fileBase64) {
      setError('Please paste text or upload a document/PDF.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeDocument({
        text: text.trim(),
        fileBase64: fileBase64 || undefined,
        mimeType: fileMime,
      });

      setAnalysis(data);
      sound.playGentleChime();
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze document.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionInput.trim() || !analysis) return;
    const q = questionInput.trim();
    setQuestionInput('');
    setQaLoading(true);

    try {
      const data = await analyzeDocument({
        text: text || analysis.executive_summary,
        fileBase64: fileBase64 || undefined,
        mimeType: fileMime,
        question: q,
      });

      setQaList((prev) => [...prev, { question: q, answer: data.answer || 'No answer found.' }]);
      sound.playSoftTap();
    } catch (err: any) {
      setQaList((prev) => [
        ...prev,
        { question: q, answer: 'Could not process question on this document. ' + (err?.message || '') },
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  const loadSampleText = () => {
    setText(
      `Photosynthesis and cellular respiration form an interrelated carbon-energy cycle in the biosphere. While photosynthesis converts light energy, water, and carbon dioxide into oxygen and carbohydrates (such as glucose) within the chloroplasts of autotrophic organisms, cellular respiration metabolizes glucose and oxygen into carbon dioxide, water, and usable adenosine triphosphate (ATP) inside eukaryotic mitochondria. The light-dependent reactions of photosynthesis split water molecules via photolysis at photosystem II, releasing molecular oxygen and generating a proton gradient across the thylakoid membrane that drives ATP synthesis and NADPH production. In the light-independent Calvin cycle, the enzyme RuBisCO fixes CO2 into 3-phosphoglycerate, which is phosphorylated and reduced into glyceraldehyde-3-phosphate. Conversely, cellular respiration consists of glycolysis, the citric acid cycle (Krebs cycle), and oxidative phosphorylation through the electron transport chain, yielding approximately 30 to 32 ATP per oxidized glucose molecule.`
    );
    setFileName(null);
    setFileBase64(null);
    setError(null);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="mb-4">
        <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
          Reading Ritual
        </span>
        <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
          Smart Reader &amp; Synthesizer
        </h2>
        <p className="font-body-sm text-[13px] text-[#534439] mt-0.5">
          Paste textbook excerpts, articles, or upload a PDF to extract key takeaways and interrogate the text.
        </p>
      </div>

      {/* Input container */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] mb-4">
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lecture excerpts, reading chapters, or research paper sections here..."
          className="w-full bg-transparent text-[#2B1D14] placeholder-[#2B1D14]/40 font-body-md text-[14px] leading-relaxed resize-none focus:outline-none"
        />

        {fileName && (
          <div className="mt-2 mb-2 p-2.5 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="material-symbols-outlined text-[18px] text-[#8A4C13]">description</span>
              <span className="font-medium text-[#2B1D14] truncate">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFileName(null);
                setFileBase64(null);
              }}
              className="text-[#534439] hover:text-[#2B1D14]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E8E0D5] mt-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[12px] text-[#2B1D14] hover:border-[#C27A3E] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#8A4C13]">upload_file</span>
              <span>Upload PDF / Text</span>
            </button>
            <button
              type="button"
              onClick={loadSampleText}
              className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] text-[11px] text-[#534439] hover:border-[#C27A3E]"
            >
              Load Sample Excerpt
            </button>
          </div>

          {(text || fileName) && (
            <button
              type="button"
              onClick={() => {
                setText('');
                setFileName(null);
                setFileBase64(null);
                setAnalysis(null);
                setQaList([]);
              }}
              className="text-[12px] text-[#534439] hover:text-[#2B1D14] underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#BA1A1A] text-[#BA1A1A] text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleAnalyze}
        className="w-full h-12 rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-60 mb-6"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin"></span>
            <span>Synthesizing Document...</span>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            <span>Summarize &amp; Extract Key Takeaways</span>
          </>
        )}
      </button>

      {/* Analysis Output */}
      {analysis && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
          {/* Header Card */}
          <article className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5] mb-3">
              <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase font-bold tracking-wider">
                Document Digest
              </span>
              <span className="font-label-caps text-[11px] text-[#534439] bg-[#EFE6DA] px-2.5 py-0.5 rounded-full">
                {analysis.reading_time || '5 min read'}
              </span>
            </div>

            <h3 className="font-headline-md text-[20px] text-[#2B1D14] font-semibold mb-3">
              {analysis.title}
            </h3>

            {/* Executive Summary */}
            <div className="font-body-md text-[14px] text-[#2B1D14] leading-relaxed mb-5 whitespace-pre-wrap">
              {analysis.executive_summary}
            </div>

            {/* Key Points */}
            <div className="mb-5">
              <h4 className="font-headline-sm text-[15px] text-[#2B1D14] mb-3 font-semibold">
                Core Key Takeaways
              </h4>
              <ul className="flex flex-col gap-2.5">
                {analysis.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#8A4C13] text-[18px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span className="font-body-md text-[14px] text-[#2B1D14] leading-snug">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Discussion prompts */}
            {analysis.discussion_questions && analysis.discussion_questions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] mb-4">
                <span className="font-label-caps text-[11px] text-[#8A4C13] font-bold block mb-1 uppercase">
                  Seminar Questions &amp; Inquiry
                </span>
                <ul className="list-disc list-inside text-[13px] text-[#2B1D14]/90 space-y-1">
                  {analysis.discussion_questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bridge to Flashcards */}
            <div className="pt-2 border-t border-[#E8E0D5] flex justify-end">
              <button
                type="button"
                onClick={() =>
                  onMakeFlashcards(
                    `Document: ${analysis.title}\nSummary: ${analysis.executive_summary}\nKey points: ${analysis.key_points.join('; ')}`,
                    analysis.title
                  )
                }
                className="font-label-md text-[12px] text-[#8A4C13] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">style</span>
                <span>Create Flashcard Deck from this reading &rarr;</span>
              </button>
            </div>
          </article>

          {/* "Ask this document" Q&A Section */}
          <article className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#8A4C13] text-[20px]">quiz</span>
              <h3 className="font-headline-sm text-[16px] text-[#2B1D14] font-semibold">
                Ask this document
              </h3>
            </div>
            <p className="font-body-sm text-[12px] text-[#534439] mb-4">
              Query the source text directly to clarify complex sections, definitions, or citations.
            </p>

            {/* Q&A Thread */}
            {qaList.length > 0 && (
              <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto">
                {qaList.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="self-end max-w-[85%] p-3 rounded-2xl rounded-br-xs bg-[#FAF7F2] border border-[#E8E0D5] text-[13px] text-[#2B1D14]">
                      <strong>Q:</strong> {item.question}
                    </div>
                    <div className="self-start max-w-[85%] p-3.5 rounded-2xl rounded-bl-xs bg-[#EFE6DA] text-[13px] text-[#2B1D14] leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ask input bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="e.g. How does photolysis generate ATP?"
                className="flex-1 h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] focus:border-[#C27A3E] text-[13px] text-[#2B1D14] placeholder-[#2B1D14]/40 focus:outline-none"
              />
              <button
                type="button"
                disabled={qaLoading || !questionInput.trim()}
                onClick={handleAskQuestion}
                className="h-11 px-4 rounded-xl bg-[#8A4C13] text-[#FAF7F2] font-label-md text-[13px] flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {qaLoading ? (
                  <span className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Ask'
                )}
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
