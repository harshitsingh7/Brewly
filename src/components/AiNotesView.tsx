import React, { useState, useEffect, useRef } from 'react';
import { StudyNote, Subject } from '../types';
import { processNotes } from '../services/api';
import { sound } from '../services/sound';

interface AiNotesViewProps {
  onMakeFlashcards: (content: string, title: string) => void;
}

export const AiNotesView: React.FC<AiNotesViewProps> = ({ onMakeFlashcards }) => {
  const [activeTab, setActiveTab] = useState<'record' | 'saved'>('record');
  const [subject, setSubject] = useState<Subject>('Biology');
  const [transcriptText, setTranscriptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Saved notes state
  const [savedNotes, setSavedNotes] = useState<StudyNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const subjects: Subject[] = ['Math', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Essay'];

  // Load saved notes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('brewly_saved_notes');
      if (raw) {
        setSavedNotes(JSON.parse(raw));
      }
    } catch (e) {}
  }, []);

  const saveNoteToHistory = (note: StudyNote) => {
    const updated = [note, ...savedNotes.filter((n) => n.id !== note.id)];
    setSavedNotes(updated);
    try {
      localStorage.setItem('brewly_saved_notes', JSON.stringify(updated));
    } catch (e) {}
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
    try {
      localStorage.setItem('brewly_saved_notes', JSON.stringify(updated));
    } catch (e) {}
  };

  // Start live audio recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // stop mic tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      sound.playSoftTap();

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError('Microphone access denied or unavailable in this environment. You can paste a transcript or upload an audio file below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      sound.playGentleChime();
    }
  };

  // Process note from audio or text
  const handleGenerateNotes = async () => {
    if (!audioBlob && !transcriptText.trim()) {
      setError('Please record audio, upload an audio file, or paste your transcript.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let b64: string | undefined = undefined;
      let mimeType = 'audio/webm';

      if (audioBlob) {
        b64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
      }

      const note = await processNotes({
        audioBase64: b64,
        mimeType,
        transcriptText: transcriptText.trim() || undefined,
        subject,
      });

      setSelectedNote(note);
      saveNoteToHistory(note);
      sound.playGentleChime();
    } catch (err: any) {
      setError(err?.message || 'Failed to process lecture notes.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleTranscript = () => {
    setTranscriptText(
      `Welcome to today's bioengineering lecture on cellular feedback loops. Remember that biological homeostasis depends on negative feedback mechanisms to stabilize deviations from a set point. For instance, in blood glucose regulation, when concentrations elevate postprandial, beta cells in the islets of Langerhans secrete insulin. This stimulates cellular uptake and glycogen synthesis in hepatocytes, returning plasma glucose back to nominal baseline (around 90 mg/dL). Conversely, hypoglycemia triggers alpha cells to release glucagon, accelerating glycogenolysis. Positive feedback loops, while rare, amplify changes until a climactic threshold is met, such as during oxytocin surge in parturition or action potential depolarization via voltage-gated sodium channels. For the exam, understand the Bode plot phase margins of these biological control systems and how delay parameters can induce systemic oscillations.`
    );
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
            Lecture Capture
          </span>
          <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
            AI Lecture Notes &amp; Voice Scribe
          </h2>
        </div>
      </div>

      {/* Pill switcher between Record/Create and Saved Notes list */}
      <div className="w-full flex justify-center mb-6">
        <div className="inline-flex items-center p-1 rounded-full bg-[#EBE8E3] border border-[#E8E0D5]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('record');
              setSelectedNote(null);
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              activeTab === 'record'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Record &amp; Scribe
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            <span>Saved Notes</span>
            <span className="bg-[#FAF7F2] text-[#8A4C13] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {savedNotes.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        /* Saved notes list */
        <div className="flex flex-col gap-3">
          {savedNotes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] text-[#534439]">
              <span className="material-symbols-outlined text-[36px] text-[#C27A3E] mb-2">folder_open</span>
              <p className="font-headline-sm text-[16px] text-[#2B1D14]">No saved notes yet</p>
              <p className="font-body-sm text-[13px] text-[#534439] mt-1">
                Record a lecture or paste a transcript to save your first editorial study note.
              </p>
            </div>
          ) : (
            savedNotes.map((note) => (
              <article
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setActiveTab('record');
                }}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A3E] transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-caps text-[10px] uppercase font-bold text-[#8A4C13] bg-[#EFE6DA] px-2 py-0.5 rounded-full">
                      {note.subject}
                    </span>
                    <span className="font-body-sm text-[11px] text-[#534439]">
                      {new Date(note.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-[15px] text-[#2B1D14] font-semibold truncate">
                    {note.title}
                  </h4>
                  <p className="font-body-sm text-[13px] text-[#534439] truncate mt-0.5">
                    {note.summary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => deleteNote(note.id, e)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#534439] hover:text-[#BA1A1A] hover:bg-[#FAF7F2] shrink-0"
                  title="Delete Note"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </article>
            ))
          )}
        </div>
      ) : (
        /* Record and scribe view */
        <div className="flex flex-col gap-4">
          {/* Subject selector */}
          <div className="flex flex-wrap gap-2 mb-1">
            {subjects.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`px-3 py-1 rounded-full font-label-md text-[12px] transition-all cursor-pointer ${
                  subject === s
                    ? 'bg-[#EFE6DA] border border-[#C27A3E] text-[#2B1D14] font-bold'
                    : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/70'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Voice Recording Module */}
          <div className="p-5 rounded-2xl bg-[#EFE6DA] border border-[#E8E0D5] flex flex-col items-center text-center">
            <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase tracking-wider font-semibold mb-2">
              Audio Recording Scribe
            </span>

            {isRecording ? (
              <div className="flex flex-col items-center my-3">
                <div className="relative flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full bg-[#8A4C13]/20 animate-ping absolute"></span>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-[#8A4C13] text-[#FAF7F2] flex items-center justify-center shadow-none cursor-pointer relative z-10"
                    aria-label="Stop recording"
                  >
                    <span className="material-symbols-outlined text-[28px]">stop</span>
                  </button>
                </div>
                <div className="font-display text-[22px] text-[#2B1D14] font-semibold mt-3">
                  {formatTime(recordingSeconds)}
                </div>
                <span className="font-body-sm text-[12px] text-[#534439] mt-0.5">
                  Listening to lecture... Tap to finish
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center my-3">
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-[#FAF7F2] border-2 border-[#C27A3E] text-[#8A4C13] flex items-center justify-center hover:bg-[#FAF7F2] transition-transform active:scale-95 cursor-pointer"
                  aria-label="Start recording"
                >
                  <span className="material-symbols-outlined text-[28px]">mic</span>
                </button>
                <div className="font-label-md text-[14px] text-[#2B1D14] font-semibold mt-2">
                  Tap to Record Live Lecture
                </div>
                <span className="font-body-sm text-[12px] text-[#534439] mt-0.5">
                  Automatic transcription &amp; editorial summary
                </span>
              </div>
            )}

            {/* Playback or uploaded audio */}
            {audioUrl && !isRecording && (
              <div className="w-full mt-3 pt-3 border-t border-[#E8E0D5] flex items-center justify-between">
                <audio controls src={audioUrl} className="h-8 w-full max-w-xs" />
                <button
                  type="button"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                  }}
                  className="text-xs text-[#534439] hover:text-[#BA1A1A] ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Or Paste Transcript Box */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-[11px] text-[#534439] uppercase font-semibold">
                Or Paste / Edit Transcript
              </span>
              <button
                type="button"
                onClick={loadSampleTranscript}
                className="text-[11px] text-[#8A4C13] hover:underline"
              >
                Load Sample Bio Lecture
              </button>
            </div>
            <textarea
              rows={4}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste lecture transcript or speaking notes here..."
              className="w-full bg-transparent text-[#2B1D14] placeholder-[#2B1D14]/40 font-body-md text-[13px] leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#BA1A1A] text-[#BA1A1A] text-[13px]">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            disabled={loading || (!audioBlob && !transcriptText.trim())}
            onClick={handleGenerateNotes}
            className="w-full h-12 rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin"></span>
                <span>Crafting Editorial Notes...</span>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
                <span>Generate Clean Notes &amp; Summary</span>
              </>
            )}
          </button>

          {/* Result Note Card */}
          {selectedNote && (
            <article className="mt-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5] mb-4">
                <span className="font-label-caps text-[11px] text-[#8A4C13] uppercase font-bold tracking-wider">
                  {selectedNote.subject} Lecture Note
                </span>
                <span className="text-[11px] text-[#534439]">
                  {new Date(selectedNote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="font-headline-md text-[20px] text-[#2B1D14] font-semibold mb-3">
                {selectedNote.title}
              </h3>

              {/* Summary */}
              <div className="mb-5">
                <h4 className="font-headline-sm text-[15px] text-[#2B1D14] mb-2 font-semibold">
                  Executive Summary
                </h4>
                <p className="font-body-md text-[14px] text-[#2B1D14] leading-relaxed whitespace-pre-wrap">
                  {selectedNote.summary}
                </p>
              </div>

              {/* Takeaways */}
              <div className="mb-5">
                <h4 className="font-headline-sm text-[15px] text-[#2B1D14] mb-2 font-semibold">
                  Key Takeaways
                </h4>
                <ul className="flex flex-col gap-2">
                  {selectedNote.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[#8A4C13] text-[18px] shrink-0 mt-0.5">
                        check
                      </span>
                      <span className="font-body-md text-[14px] text-[#2B1D14] leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Transcript Accordion */}
              {selectedNote.transcript && (
                <details className="p-3 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] text-[13px] text-[#2B1D14] mb-4">
                  <summary className="font-semibold text-[#8A4C13] cursor-pointer">
                    Full Lecture Transcript
                  </summary>
                  <p className="mt-2 text-[#2B1D14]/90 whitespace-pre-wrap leading-relaxed">
                    {selectedNote.transcript}
                  </p>
                </details>
              )}

              {/* Bridge to Flashcards */}
              <div className="pt-3 border-t border-[#E8E0D5] flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onMakeFlashcards(
                      `Note: ${selectedNote.title}\nSummary: ${selectedNote.summary}\nTakeaways: ${selectedNote.takeaways.join('; ')}`,
                      selectedNote.title
                    )
                  }
                  className="font-label-md text-[12px] text-[#8A4C13] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">style</span>
                  <span>Turn this note into Flashcards &amp; Quiz &rarr;</span>
                </button>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
};
