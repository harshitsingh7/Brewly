---
name: Warm Artisanal Editorial
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#534439'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#857468'
  outline-variant: '#d8c2b5'
  surface-tint: '#8d4f16'
  primary: '#8a4c13'
  on-primary: '#ffffff'
  primary-container: '#a7642a'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb780'
  secondary: '#635e54'
  on-secondary: '#ffffff'
  secondary-container: '#eae1d5'
  on-secondary-container: '#69645a'
  tertiary: '#006673'
  on-tertiary: '#ffffff'
  tertiary-container: '#008091'
  on-tertiary-container: '#f8feff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc4'
  primary-fixed-dim: '#ffb780'
  on-primary-fixed: '#2f1400'
  on-primary-fixed-variant: '#6f3800'
  secondary-fixed: '#eae1d5'
  secondary-fixed-dim: '#cec5ba'
  on-secondary-fixed: '#1f1b14'
  on-secondary-fixed-variant: '#4b463d'
  tertiary-fixed: '#9fefff'
  tertiary-fixed-dim: '#74d4e6'
  on-tertiary-fixed: '#001f24'
  on-tertiary-fixed-variant: '#004e59'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a focused, calm, and contemplative space modeled after a quiet artisanal café. It serves as an intimate mobile AI study companion, transforming study sessions from stressful, utilitarian grinds into deliberate, focused rituals. 

The aesthetic is strictly minimalist and warm editorial:
- Generous breathing room and uncluttered compositions that lower cognitive load.
- Tactile warmth delivered through organic cream and espresso contrast without resorting to faux skeuomorphism.
- Purely flat depth relying on crisp hairline borders rather than heavy drop shadows.
- Elegant, measured typography marrying classic editorial serif headlines with utilitarian, ultra-legible body text.

## Colors

The palette is strictly restricted to five deliberate tones. No outside colors, tinted semantic variations (such as standard green/red alerts), or linear/radial gradients are permitted.

- **Background Cream (`#FAF7F2`)**: The foundational canvas for all views, sheets, and elevated overlays.
- **Text Espresso (`#2B1D14`)**: Used for all levels of text, primary icons, and structural emphasis. Secondary text is rendered using lower opacity (65%) of this tone rather than introducing an auxiliary gray.
- **Caramel Accent (`#C27A3E`)**: The singular interactive accent. Reserved for primary actions, active indicator states, progress indicators, and focal study interactions.
- **Latte Secondary (`#EFE6DA`)**: Used for soft structural fills, unselected segment badges, subtle card backdrops, and active message container tiers.
- **Hairline Border (`#E8E0D5`)**: Used at precisely 1px thickness to define bounds, divide content, and shape components without visual clutter.

## Typography

Typography establishes an editorial atmosphere:
- **Headings & Titles**: `Playfair Display` brings literary craftsmanship and dignity to study milestones, subject banners, and prompt titles.
- **Body, UI & Meta**: `Inter` handles all dense reading experiences, chat dialogs, flashcard prompts, and utilitarian interactions, ensuring crystalline legibility at compact scales.
- **Letter Spacing**: Display headings feature slightly tighter tracking to maintain cohesion. Uppercase category labels (`label-caps`) employ deliberate letter-spacing (`0.08em`) for quiet elegance.

## Layout & Spacing

The layout is built mobile-first, prioritizing ergonomic vertical scanning and airy composition:
- **Margins**: A fixed canvas side margin of `24px` (`1.5rem`) applies to all primary viewports, ensuring content never crowds screen edges.
- **Vertical Rhythm**: Generous whitespace separates modules. Study sections, conversation switches, and flashcard stacks utilize `space-xl` (`40px`) margins to prevent visual clutter.
- **Grid Structure**: A flexible 4-column layout for mobile interfaces with a `16px` gutter. Layout shifts on larger canvases (tablets or desktop companion views) expand max container widths to `640px` centered, retaining the intimate mobile reading column format.

## Elevation & Depth

Visual hierarchy is communicated strictly through surface tone and boundary definition—never drop shadows.

- **Flat Architecture**: All drop shadows, blurs, and skeuomorphic gradients are disabled (`box-shadow: none`).
- **Hairline Framing**: Structural separation is achieved via `1px solid #E8E0D5`.
- **Tonal Contrast**: Depth layers are established by stacking:
  - Base canvas: `#FAF7F2` (Cream)
  - Resting cards and secondary groupings: `#EFE6DA` (Latte) or `#FAF7F2` encased in `#E8E0D5` hairline borders.
  - Active focal states: Framed using `#C27A3E` hairline outlines or solid `#C27A3E` fills for primary triggers.

## Shapes

The design system maintains a unified curvature:
- **Standard Corner Radius**: `16px` (`1rem`) applied universally to cards, modal sheets, input containers, flashcard modules, and chat bubbles.
- **Pill Exceptions**: Small tags, filter chips, and primary action buttons utilize full pill radii (`9999px`) to create organic, inviting tap targets that contrast against the structured `16px` card modules.

## Components

### Buttons
- **Primary**: Solid Caramel (`#C27A3E`) background, Cream (`#FAF7F2`) text, Inter semi-bold, 16px corner radius or pill-shaped, height 48px, horizontal padding 24px. No border.
- **Secondary / Subdued**: Latte (`#EFE6DA`) background, Espresso (`#2B1D14`) text, 1px `#E8E0D5` border.
- **Tertiary / Ghost**: Transparent background, Espresso (`#2B1D14`) text with subtle underline or standalone icon.

### Chips & Badges
- **Inactive**: Background `#FAF7F2`, border 1px solid `#E8E0D5`, text Espresso (`#2B1D14`) at 65% opacity.
- **Selected**: Background `#EFE6DA`, border 1px solid `#C27A3E`, text Espresso (`#2B1D14`) bold.

### Input Fields
- Height 52px, background `#FAF7F2`, 16px radius, border 1px solid `#E8E0D5`.
- Text in Espresso (`#2B1D14`), placeholder in Espresso at 40% opacity.
- Focus state: Border color changes to `#C27A3E` (1px, crisp, no glow).

### Cards & Modules
- Background `#FAF7F2` or `#EFE6DA`, border 1px solid `#E8E0D5`, radius 16px, padding 20px. 
- Headers inside cards use `Playfair Display` (`headline-sm`).

### Checkboxes & Radios
- Box/circle of 20px with 1px border `#E8E0D5`.
- Checked state: Filled with `#C27A3E` featuring a Cream (`#FAF7F2`) checkmark or center pip.

### AI Study Companion Custom Components
- **AI Dialogue Bubbles**: 
  - AI Responses: Latte (`#EFE6DA`) fill, no border, 16px radius with bottom-left corner tightened to 4px.
  - User Prompts: Cream (`#FAF7F2`) fill, 1px solid `#E8E0D5`, 16px radius with bottom-right corner tightened to 4px.
- **Flashcard Deck**: 16px radius, Cream (`#FAF7F2`) surface, 1px solid `#E8E0D5` border, centered `Playfair Display` prompt, with card count pill badge anchored at top right.
- **Study Timer / Progress**: Hairline progress tracks in `#E8E0D5` filled smoothly with Caramel (`#C27A3E`).