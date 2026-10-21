import React, { useState, useEffect } from 'react';
import { StudyDeck, Flashcard, QuizQuestion } from '../types';
import { generateFlashcardsAndQuiz } from '../services/api';
import { sound } from '../services/sound';

interface FlashcardsQuizViewProps {
  initialContent?: string;
  initialTitle?: string;
}

export const FlashcardsQuizView: React.FC<FlashcardsQuizViewProps> = ({
  initialContent = '',
  initialTitle = '',
}) => {
  const [mode, setMode] = useState<'flashcards' | 'quiz' | 'create'>('flashcards');
  const [deck, setDeck] = useState<StudyDeck | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [quizFinished, setQuizFinished] = useState(false);

  // Generator form
  const [topicPrompt, setTopicPrompt] = useState(initialContent);
  const [deckTitle, setDeckTitle] = useState(initialTitle || 'Calculus & Physics Foundations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default sample deck on initial mount if none loaded
  useEffect(() => {
    if (initialContent) {
      setTopicPrompt(initialContent);
      setDeckTitle(initialTitle || 'Custom Study Deck');
      handleGenerate(initialContent, initialTitle || 'Custom Study Deck');
    } else {
      // Load standard starter deck matching editorial theme
      const sampleDeck: StudyDeck = {
        id: 'sample_deck_1',
        title: 'Foundations of Science & Analysis',
        subject: 'General Science',
        timestamp: Date.now(),
        flashcards: [
          {
            front: 'What is the Fundamental Theorem of Calculus?',
            back: 'It links the concept of differentiating a function with the concept of integrating a function, demonstrating they are inverse processes of each other.',
          },
          {
            front: 'What is Entropy in Thermodynamics?',
            back: 'A measure of the molecular disorder or randomness of a system, governed by the Boltzmann relation S = k · ln(Ω).',
          },
          {
            front: 'Explain the role of ATP Synthase in Cellular Respiration.',
            back: 'A membrane-bound rotary enzyme that harnesses the electrochemical proton gradient across the inner mitochondrial membrane to synthesize ATP from ADP and Pi.',
          },
          {
            front: 'State the Law of Conservation of Momentum.',
            back: 'In an isolated system devoid of net external forces, the total vector momentum remains invariant before and after collisions (P_initial = P_final).',
          },
          {
            front: 'What constitutes Opportunity Cost in microeconomics?',
            back: 'The value of the next highest-valued alternative forgone when a decision is made to allocate scarce resources.',
          },
        ],
        quiz: [
          {
            question: 'Which condition guarantees that heat exchange Q = 0 in a thermodynamic process?',
            options: [
              'Adiabatic insulation',
              'Isothermal equilibrium',
              'Isobaric expansion',
              'Isochoric containment',
            ],
            correct_index: 0,
            explanation:
              'An adiabatic process by definition occurs with zero thermal energy transfer between the system and its surroundings (Q = 0).',
          },
          {
            question: 'What is the derivative of f(x) = ln(x^2 + 1)?',
            options: ['2x / (x^2 + 1)', '1 / (x^2 + 1)', '2 / x', 'x / (x^2 + 1)'],
            correct_index: 0,
            explanation:
              'By the chain rule: d/dx[ln(u)] = (1/u) * u\'. Here u = x^2 + 1, so u\' = 2x, yielding 2x / (x^2 + 1).',
          },
          {
            question: 'Which organelle is the primary site of eukaryotic ATP generation via oxidative phosphorylation?',
            options: ['Mitochondria', 'Golgi apparatus', 'Ribosome', 'Endoplasmic reticulum'],
            correct_index: 0,
            explanation:
              'Mitochondria contain the electron transport chain complexes and ATP synthase along the folded cristae.',
          },
        ],
      };
      setDeck(sampleDeck);
    }
  }, [initialContent]);

  const handleGenerate = async (contentOverride?: string, titleOverride?: string) => {
    const content = contentOverride || topicPrompt;
    if (!content.trim()) {
      setError('Please provide study material or notes to generate flashcards.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generated = await generateFlashcardsAndQuiz({
        content,
        title: titleOverride || deckTitle || 'Study Deck',
      });

      setDeck(generated);
      setCardIndex(0);
      setIsFlipped(false);
      setQuizIndex(0);
      setSelectedAnswers({});
      setQuizFinished(false);
      setMode('flashcards');
      sound.playGentleChime();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate flashcards and quiz.');
    } finally {
      setLoading(false);
    }
  };

  const currentCard: Flashcard | undefined = deck?.flashcards[cardIndex];
  const totalCards = deck?.flashcards.length || 0;
  const progressPercent = totalCards > 0 ? ((cardIndex + 1) / totalCards) * 100 : 0;

  const currentQuizItem: QuizQuestion | undefined = deck?.quiz[quizIndex];
  const totalQuestions = deck?.quiz.length || 0;

  const handleNextCard = () => {
    if (cardIndex < totalCards - 1) {
      setCardIndex((prev) => prev + 1);
      setIsFlipped(false);
      sound.playSoftTap();
    }
  };

  const handlePrevCard = () => {
    if (cardIndex > 0) {
      setCardIndex((prev) => prev - 1);
      setIsFlipped(false);
      sound.playSoftTap();
    }
  };

  const handleSelectQuizOption = (optionIndex: number) => {
    if (selectedAnswers[quizIndex] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [quizIndex]: optionIndex }));

    const isCorrect = optionIndex === currentQuizItem?.correct_index;
    if (isCorrect) {
      sound.playGentleChime();
    } else {
      sound.playSoftTap();
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex < totalQuestions - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      sound.playGentleChime();
    }
  };

  const calculateScore = () => {
    if (!deck) return { correct: 0, total: 0 };
    let correct = 0;
    deck.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) {
        correct++;
      }
    });
    return { correct, total: deck.quiz.length };
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
            Active Recall
          </span>
          <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
            Flashcards &amp; Practice Quiz
          </h2>
        </div>
      </div>

      {/* Mode Switcher Pill */}
      <div className="w-full flex justify-center mb-6">
        <div className="inline-flex items-center p-1 rounded-full bg-[#EBE8E3] border border-[#E8E0D5]">
          <button
            type="button"
            onClick={() => {
              sound.playSoftTap();
              setMode('flashcards');
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              mode === 'flashcards'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Flashcards
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playSoftTap();
              setMode('quiz');
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              mode === 'quiz'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Practice Quiz
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playSoftTap();
              setMode('create');
            }}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-[#8A4C13] text-[#FAF7F2] font-semibold'
                : 'text-[#534439] hover:text-[#2B1D14]'
            }`}
          >
            Create New
          </button>
        </div>
      </div>

      {/* 1. FLASHCARDS MODE */}
      {mode === 'flashcards' && currentCard && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Deck title & Card counter badge */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-label-caps text-[#534439] uppercase font-bold tracking-wider truncate max-w-[200px]">
              {deck?.title}
            </span>
            <span className="font-label-caps px-2.5 py-0.5 rounded-full bg-[#EFE6DA] text-[#8A4C13] font-bold border border-[#E8E0D5]">
              {cardIndex + 1} / {totalCards}
            </span>
          </div>

          {/* Hairline Progress Bar styled exactly to design system */}
          <div className="w-full h-1 bg-[#E8E0D5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C27A3E] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Flashcard with Flip */}
          <div
            onClick={() => {
              setIsFlipped(!isFlipped);
              sound.playSoftTap();
            }}
            className="w-full min-h-[260px] p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A3E] transition-all cursor-pointer flex flex-col justify-between select-none relative"
          >
            {/* Top indicator */}
            <div className="flex items-center justify-between w-full">
              <span className="font-label-caps text-[10px] text-[#534439] uppercase font-semibold">
                {isFlipped ? 'Answer / Explanation' : 'Concept / Question'}
              </span>
              <span className="material-symbols-outlined text-[#8A4C13] text-[18px]">
                {isFlipped ? 'sync' : 'touch_app'}
              </span>
            </div>

            {/* Centered content */}
            <div className="my-auto text-center py-4">
              {!isFlipped ? (
                <h3 className="font-headline-md text-[20px] text-[#2B1D14] leading-relaxed font-semibold">
                  {currentCard.front}
                </h3>
              ) : (
                <p className="font-body-md text-[15px] text-[#2B1D14] leading-relaxed font-normal">
                  {currentCard.back}
                </p>
              )}
            </div>

            {/* Bottom flip hint */}
            <div className="text-center font-body-sm text-[11px] text-[#534439]/70">
              Tap card to flip
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={cardIndex === 0}
              onClick={handlePrevCard}
              className="flex-1 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A3E] text-[#2B1D14] font-label-md text-[13px] flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFlipped(!isFlipped);
                sound.playSoftTap();
              }}
              className="h-12 px-4 rounded-2xl bg-[#EFE6DA] border border-[#E8E0D5] text-[#8A4C13] font-label-md text-[13px] flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Flip</span>
            </button>

            <button
              type="button"
              disabled={cardIndex === totalCards - 1}
              onClick={handleNextCard}
              className="flex-1 h-12 rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-md text-[13px] flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PRACTICE QUIZ MODE */}
      {mode === 'quiz' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {quizFinished ? (
            /* Quiz Score Summary */
            <article className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] text-center flex flex-col items-center">
              <span className="w-14 h-14 rounded-full bg-[#EFE6DA] border border-[#C27A3E] flex items-center justify-center text-[#8A4C13] mb-3">
                <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
              </span>

              <h3 className="font-headline-md text-[22px] text-[#2B1D14] font-semibold mb-1">
                Quiz Completed
              </h3>
              <p className="font-body-md text-[14px] text-[#534439] mb-4">
                You scored{' '}
                <strong className="text-[#8A4C13] font-bold text-[18px]">
                  {calculateScore().correct} / {calculateScore().total}
                </strong>
              </p>

              <div className="w-full h-1 bg-[#E8E0D5] rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-[#C27A3E]"
                  style={{
                    width: `${(calculateScore().correct / (calculateScore().total || 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setQuizIndex(0);
                    setSelectedAnswers({});
                    setQuizFinished(false);
                  }}
                  className="flex-1 h-12 rounded-2xl bg-[#8A4C13] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center cursor-pointer"
                >
                  Retake Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setMode('flashcards')}
                  className="flex-1 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] text-[#2B1D14] font-label-lg text-label-lg flex items-center justify-center cursor-pointer"
                >
                  Review Cards
                </button>
              </div>
            </article>
          ) : currentQuizItem ? (
            /* Question Item */
            <article className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5] mb-4 text-xs">
                <span className="font-label-caps text-[#8A4C13] uppercase font-bold tracking-wider">
                  Question {quizIndex + 1} of {totalQuestions}
                </span>
                <span className="text-[#534439]">Practice Assessment</span>
              </div>

              <h3 className="font-headline-sm text-[16px] text-[#2B1D14] font-semibold leading-relaxed mb-5">
                {currentQuizItem.question}
              </h3>

              {/* Options */}
              <div className="flex flex-col gap-2.5 mb-6">
                {currentQuizItem.options.map((opt, optIdx) => {
                  const isAnswered = selectedAnswers[quizIndex] !== undefined;
                  const isSelected = selectedAnswers[quizIndex] === optIdx;
                  const isCorrect = optIdx === currentQuizItem.correct_index;

                  let styleClass = 'bg-[#FAF7F2] border-[#E8E0D5] text-[#2B1D14] hover:border-[#C27A3E]';
                  if (isAnswered) {
                    if (isCorrect) {
                      styleClass = 'bg-[#EFE6DA] border-2 border-[#C27A3E] text-[#2B1D14] font-semibold';
                    } else if (isSelected) {
                      styleClass = 'bg-[#FAF7F2] border-2 border-[#BA1A1A] text-[#BA1A1A]';
                    } else {
                      styleClass = 'bg-[#FAF7F2] border-[#E8E0D5] text-[#2B1D14]/50';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectQuizOption(optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${styleClass}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center font-label-md text-[12px] font-bold text-[#8A4C13] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="font-body-md text-[14px] leading-snug flex-1">{opt}</span>
                      {isAnswered && isCorrect && (
                        <span className="material-symbols-outlined text-[#8A4C13] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <span className="material-symbols-outlined text-[#BA1A1A] text-[20px]">cancel</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {selectedAnswers[quizIndex] !== undefined && (
                <div className="p-3.5 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] text-[13px] text-[#2B1D14] mb-4 animate-in fade-in-50">
                  <strong className="block font-semibold text-[#8A4C13] mb-1">
                    {selectedAnswers[quizIndex] === currentQuizItem.correct_index ? 'Correct!' : 'Review Reasoning:'}
                  </strong>
                  {currentQuizItem.explanation}
                </div>
              )}

              {/* Next Question Trigger */}
              {selectedAnswers[quizIndex] !== undefined && (
                <button
                  type="button"
                  onClick={handleNextQuizQuestion}
                  className="w-full h-12 rounded-2xl bg-[#8A4C13] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{quizIndex < totalQuestions - 1 ? 'Next Question' : 'View Final Score'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              )}
            </article>
          ) : null}
        </div>
      )}

      {/* 3. CREATE NEW DECK MODE */}
      {mode === 'create' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5]">
            <label className="font-label-caps text-[11px] text-[#534439] uppercase tracking-wider block mb-1 font-semibold">
              Deck Title
            </label>
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry Reactions"
              className="w-full h-11 px-3 rounded-xl bg-transparent border border-[#E8E0D5] focus:border-[#C27A3E] text-[14px] text-[#2B1D14] mb-4 focus:outline-none"
            />

            <label className="font-label-caps text-[11px] text-[#534439] uppercase tracking-wider block mb-1 font-semibold">
              Source Material / Notes / Problem Text
            </label>
            <textarea
              rows={5}
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              placeholder="Paste study chapter, key formulas, or lecture notes here. Brewly will automatically extract high-yield flashcards and quiz questions."
              className="w-full bg-transparent text-[#2B1D14] placeholder-[#2B1D14]/40 font-body-md text-[13px] leading-relaxed resize-none border border-[#E8E0D5] rounded-xl p-3 focus:outline-none focus:border-[#C27A3E]"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#BA1A1A] text-[#BA1A1A] text-[13px]">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={loading || !topicPrompt.trim()}
            onClick={() => handleGenerate()}
            className="w-full h-12 rounded-2xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-lg text-label-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin"></span>
                <span>Generating Deck &amp; Quiz...</span>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">style</span>
                <span>Generate Study Deck &amp; Quiz</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
