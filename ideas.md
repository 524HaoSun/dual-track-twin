# Dual-Track Digital Twin — Design Brainstorm

## Three Stylistic Approaches

### Approach A: Precision Lab
A clinical, data-first aesthetic inspired by scientific instruments and research dashboards. Monochrome base with surgical teal accents, tight grid, and micro-typography.
**Probability:** 0.08

### Approach B: Airy Analytics (CHOSEN)
Light, bright, premium — the brief's own words. Stripe/Linear/Vercel DNA: generous whitespace, crisp hairline cards, one focal teal accent, gold reserved for the single most important callout per screen. Data density creates visual interest, not decoration.
**Probability:** 0.06

### Approach C: Blueprint
Dark navy background, glowing teal lines, grid-paper texture — evokes architectural drawings and digital-twin visualisations.
**Probability:** 0.03

---

## Chosen Approach: Airy Analytics

### Design Movement
Post-Stripe dashboard minimalism — data-forward, typographically precise, airy but information-dense.

### Core Principles
1. Every pixel earns its place: no decorative chrome, visual interest comes from data.
2. One gold focal point per screen — never two.
3. Teal is the data colour; navy is the structure colour; slate is the commentary colour.
4. Cards float on the page via layered shadows, not borders alone.

### Colour Philosophy
- Background: `#F7F9FC` — soft off-white with a cool undertone, never pure white
- Card: `#FFFFFF` with `rgba(0,0,0,0.04)` shadow stack
- Navy `#0A2540` — primary text, structural elements
- Slate `#64748B` — secondary text, axis labels, captions
- Teal `#00A6A6` — primary data lines, active nav, buttons
- Gold `#C9A227` — single focal highlight per screen (gap callout, inject button, key insight)
- Red `#E0685A`, Amber `#E3A93C`, Green `#5FA86B` — ranking dots only (muted, not alarming)
- Border: `#E6EBF2` hairline

### Layout Paradigm
Left nav rail (56px wide, icon-only) + top bar (48px) + main content area. The left rail creates an asymmetric anchor. Content cards use a 12-column grid with deliberate negative space. No full-bleed hero sections — everything is contained in cards.

### Signature Elements
1. Teal area-gradient under line charts (opacity 0.12 → 0) — the brand's visual fingerprint
2. Gold callout chips that float above chart divergence zones
3. Step indicator "Step N of 3" in the top bar for act screens

### Interaction Philosophy
Interactions confirm data, not entertain. Hover highlights reveal precise values. Animations narrate the story (band narrowing, line convergence) rather than decorate.

### Animation
- Line draw-on: 600ms ease-out, left to right
- Number roll-up: 400ms ease-out counting animation
- Band narrowing: 500ms ease-in-out width transition
- Scenario switch: 250ms cross-fade
- Card entrance: 200ms stagger, scale(0.97)→scale(1) + opacity 0→1
- Play cursor: linear sweep across 168 hours

### Typography System
- Display / KPI numbers: Inter 700, 2.25rem, navy
- Section headings: Inter 600, 1rem, navy
- Body / labels: Inter 400, 0.875rem, slate
- Captions / footnotes: Inter 400, 0.75rem, slate/60

### Brand Essence
Real model results, honestly presented — for researchers who know the difference between CV-RMSE and MAPE.
Adjectives: Precise, Trustworthy, Illuminating

### Brand Voice
Headlines are factual, not promotional. CTAs are verbs, not promises.
Examples: "Inject measured data" / "Why is energy higher than designed?"
Banned: "Welcome to our platform" / "Get started today"

### Wordmark & Logo
A small teal building outline (two overlapping rectangles — solid operational + dashed ghost design twin) connected by a single gold link line. No text in the mark.

### Signature Brand Colour
Teal `#00A6A6` — the colour of calibrated truth.
