import React, { useState, useEffect, useRef } from 'react';
import { AcademicLevel, ChatMessage, Subject } from '../types';
import { sendChatMessage } from '../services/api';
import { sound } from '../services/sound';

interface TutorChatViewProps {
  initialPrompt?: string;
}

export const TutorChatView: React.FC<TutorChatViewProps> = ({ initialPrompt = '' }) => {
  const [level, setLevel] = useState<AcademicLevel>('College');
  const [subject, setSubject] = useState<Subject>('Math');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const levels: AcademicLevel[] = ['Middle school', 'High school', 'College', 'Graduate'];
  const subjects: Subject[] = ['Math', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Essay'];

  // Load chat session from localStorage or initialize with warm greeting
  useEffect(() => {
    try {
      const raw = localStorage.getItem('brewly_tutor_chat_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {}

    // Initial greeting if history is empty
    setMessages([
      {
        id: 'msg_init',
        role: 'assistant',
        content: `Welcome to your study ritual ☕. I am your calm companion here to unpack challenging theories, derive formulas step-by-step, or test your intuition. What subject are we working through today?`,
        timestamp: Date.now(),
        follow_ups: [
          'Can you explain the intuition behind eigenvalues?',
          'Help me understand supply elasticity in Economics.',
        ],
      },
    ]);
  }, []);

  // Handle incoming initial prompt from Solver or Reader
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      if (messages.length > 0) {
        localStorage.setItem('brewly_tutor_chat_history', JSON.stringify(messages));
      }
    } catch (e) {}
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);
    sound.playSoftTap();

    try {
      const res = await sendChatMessage({
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        level,
        subject,
      });

      const tutorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: res.reply,
        timestamp: Date.now(),
        follow_ups: res.follow_ups,
      };

      setMessages((prev) => [...prev, tutorMsg]);
      sound.playGentleChime();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `I encountered a momentary pause. Please try asking again. (${err?.message || 'Connection error'})`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const freshGreeting: ChatMessage = {
      id: 'msg_init_' + Date.now(),
      role: 'assistant',
      content: 'Conversation cleared. What topic or problem would you like to explore next?',
      timestamp: Date.now(),
      follow_ups: [
        'How does thermodynamic entropy work?',
        'Help me outline an essay on renewable energy.',
      ],
    };
    setMessages([freshGreeting]);
    try {
      localStorage.removeItem('brewly_tutor_chat_history');
    } catch (e) {}
    sound.playSoftTap();
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Header controls: Level and Subject chips */}
      <div className="flex flex-col gap-2.5 pb-3 mb-3 border-b border-[#E8E0D5]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-[#534439] uppercase tracking-wider font-semibold">
            Tutor Level: {level}
          </span>
          <button
            type="button"
            onClick={handleClearHistory}
            className="text-[11px] text-[#534439] hover:text-[#BA1A1A] underline"
          >
            Clear Conversation
          </button>
        </div>

        {/* Level pills */}
        <div className="flex flex-wrap gap-1.5">
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                sound.playSoftTap();
                setLevel(lvl);
              }}
              className={`px-2.5 py-1 rounded-full font-label-md text-[11px] transition-all cursor-pointer ${
                level === lvl
                  ? 'bg-[#EFE6DA] border border-[#C27A3E] text-[#2B1D14] font-bold'
                  : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14]/70'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Subject selector */}
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                sound.playSoftTap();
                setSubject(s);
              }}
              className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase transition-all cursor-pointer ${
                subject === s
                  ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                  : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#534439]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Message Dialogue Stream styled strictly to Image 3 specs */}
      <div className="flex flex-col gap-4 min-h-[340px] max-h-[500px] overflow-y-auto pr-1 mb-4">
        {messages.map((msg, idx) => {
          const isAI = msg.role === 'assistant';
          const isLatestAI = isAI && idx === messages.length - 1;

          return (
            <div key={msg.id} className="flex flex-col gap-2">
              <div
                className={`max-w-[88%] p-4 text-[14px] leading-relaxed select-text ${
                  isAI
                    ? 'self-start bg-[#EFE6DA] text-[#2B1D14] rounded-2xl rounded-bl-xs' // AI bubble spec
                    : 'self-end bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14] rounded-2xl rounded-br-xs' // User bubble spec
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[10px] opacity-60 text-right mt-1.5 font-sans">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Adaptive Follow-up Question Chips for the latest AI response */}
              {isLatestAI && msg.follow_ups && msg.follow_ups.length > 0 && !loading && (
                <div className="self-start flex flex-col gap-1.5 mt-1 ml-1 max-w-[90%]">
                  <span className="font-label-caps text-[10px] text-[#534439] uppercase font-semibold">
                    Suggested Explorations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.follow_ups.map((followUp, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        onClick={() => handleSendMessage(followUp)}
                        className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#C27A3E] text-[#8A4C13] hover:bg-[#EFE6DA] font-label-md text-[12px] text-left transition-colors cursor-pointer"
                      >
                        {followUp} &rarr;
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="self-start bg-[#EFE6DA] text-[#2B1D14] rounded-2xl rounded-bl-xs p-3.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8A4C13] animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-[#8A4C13] animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#8A4C13] animate-bounce [animation-delay:0.4s]"></span>
            <span className="font-body-sm text-[12px] text-[#534439] ml-1">Brewly is reflecting...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field matching Component Specs: Height 52px, 16px radius, 1px border #E8E0D5, focus #C27A3E */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a question or request a simpler breakdown..."
          className="flex-1 h-[52px] px-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] focus:border-[#C27A3E] text-[14px] text-[#2B1D14] placeholder-[#2B1D14]/40 focus:outline-none transition-colors"
        />
        <button
          type="button"
          disabled={loading || !inputText.trim()}
          onClick={() => handleSendMessage()}
          className="h-[52px] w-[52px] rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 transition-colors"
          aria-label="Send message"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
};
