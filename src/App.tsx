/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveTab, SolverResult, StudyNote } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PricingView } from './components/PricingView';
import { SolverView } from './components/SolverView';
import { SmartReaderView } from './components/SmartReaderView';
import { AiNotesView } from './components/AiNotesView';
import { FlashcardsQuizView } from './components/FlashcardsQuizView';
import { WritingAssistantView } from './components/WritingAssistantView';
import { TutorChatView } from './components/TutorChatView';
import { FocusModeView } from './components/FocusModeView';
import { CalculatorView } from './components/CalculatorView';
import { HistoryView } from './components/HistoryView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('solver');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('solver');

  // Inter-tool handoff states
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string>('');
  const [deckInitialContent, setDeckInitialContent] = useState<string>('');
  const [deckInitialTitle, setDeckInitialTitle] = useState<string>('');
  const [solverPrefillPrompt, setSolverPrefillPrompt] = useState<string>('');

  const switchTab = (tab: ActiveTab) => {
    setPreviousTab(activeTab);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskFollowUpFromSolver = (problemContext: string) => {
    setTutorInitialPrompt(problemContext);
    switchTab('tutor');
  };

  const handleMakeFlashcardsFromAnywhere = (content: string, title: string) => {
    setDeckInitialContent(content);
    setDeckInitialTitle(title);
    switchTab('flashcards');
  };

  const handleSendToSolverFromCalc = (expression: string) => {
    setSolverPrefillPrompt(expression);
    switchTab('solver');
  };

  const handleSelectSolveFromHistory = (solve: SolverResult) => {
    setSolverPrefillPrompt(solve.prompt);
    switchTab('solver');
  };

  const handleSelectNoteFromHistory = (_note: StudyNote) => {
    switchTab('notes');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B1D14] flex flex-col font-body-md antialiased selection:bg-[#EFE6DA] selection:text-[#8A4C13]">
      {/* Editorial Sticky Header */}
      <Header
        currentTab={activeTab}
        onNavigate={switchTab}
        canGoBack={activeTab === 'pricing' || activeTab !== 'solver'}
        onBack={() => switchTab(previousTab === activeTab ? 'solver' : previousTab)}
      />

      {/* Main Study Column - strictly constrained to max 640px for intimate reading column */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 md:px-6 pt-4 pb-24">
        {activeTab === 'solver' && (
          <SolverView
            onAskFollowUp={handleAskFollowUpFromSolver}
            onMakeFlashcards={handleMakeFlashcardsFromAnywhere}
            onOpenPricing={() => switchTab('pricing')}
            prefilledPrompt={solverPrefillPrompt}
          />
        )}

        {activeTab === 'reader' && (
          <SmartReaderView onMakeFlashcards={handleMakeFlashcardsFromAnywhere} />
        )}

        {activeTab === 'notes' && (
          <AiNotesView onMakeFlashcards={handleMakeFlashcardsFromAnywhere} />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsQuizView
            initialContent={deckInitialContent}
            initialTitle={deckInitialTitle}
          />
        )}

        {activeTab === 'tutor' && (
          <TutorChatView initialPrompt={tutorInitialPrompt} />
        )}

        {activeTab === 'writing' && <WritingAssistantView />}

        {activeTab === 'focus' && <FocusModeView />}

        {activeTab === 'calculator' && (
          <CalculatorView onSendToSolver={handleSendToSolverFromCalc} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            onSelectSolve={handleSelectSolveFromHistory}
            onSelectNote={handleSelectNoteFromHistory}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingView
            onBack={() => switchTab(previousTab)}
            onPlanChanged={() => {}}
          />
        )}
      </main>

      {/* Persistent Bottom Study Navigation */}
      <BottomNav currentTab={activeTab} onSelectTab={switchTab} />
    </div>
  );
}
