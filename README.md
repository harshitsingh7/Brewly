# Brewly - Artisanal AI Study Companion

Brewly is a calm, focused AI study companion designed around a minimalist, warm editorial aesthetic inspired by an intimate artisanal study café.

## Features

1. **Homework Problem Solver**: Text input and camera photo upload with subjects (Math, Physics, Chemistry, Biology, Economics, Essay), step-by-step numbered solutions, highlighted final answers, and actions: "Explain simpler", "Show another method", and "Ask follow-up".
2. **Academic Level Adaptation**: Adapt explanations to Middle School, High School, College, or Graduate depth.
3. **Accuracy Check**: Automated second-pass verification with "Verified" or "Double-check this" badges and discrepancy notes.
4. **Smart Reader**: Synthesize long textbooks or uploaded PDFs, extract key takeaways, and engage in interactive document Q&A.
5. **AI Lecture Notes & Scribe**: Live audio recording, file upload, or transcript pasting with editorial summaries, bulleted takeaways, and study questions.
6. **Flashcards & Practice Quiz**: Interactive flip cards with hairline progress bars, plus multiple-choice quizzes with instant feedback and scoring.
7. **Writing Assistant**: Formulate structured essay outlines, draft paragraphs, and polish academic grammar and clarity.
8. **Tutor Chat**: Conversational tutor with persistent session history, adaptive follow-up suggestions, and level adaptation.
9. **Focus Mode**: 25/5 Pomodoro ritual with Web Audio sound chimes and quiet background cafe ambient hum.
10. **Scientific Calculator**: Keypad with trigonometric functions, exponents, roots, logarithms, and direct bridge to the Solver.
11. **Study History**: LocalStorage archive of all previous solves and lecture notes.
12. **Pricing & Ritual Upgrades**: Free tier testing grant with 10k free tokens, instant refills, student discount verification, and 7-day trial simulation.
13. **Spill The Doubt Lounge & Live Whiteboard**: Submit any academic doubt and learn either through **"Spill the Tea ☕💅"** (sarcastic gossip and drama breakdown) or **"Professional 🎓📜"** (distinguished lecture), accompanied by a **live animated teacher whiteboard** with moving pen stylus, step-by-step schematics, formulas, doodle notes, and audio narration.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment configuration:
   Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY="your-api-key-here"
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Build for production:
   ```bash
   npm run build
   npm start
   ```
