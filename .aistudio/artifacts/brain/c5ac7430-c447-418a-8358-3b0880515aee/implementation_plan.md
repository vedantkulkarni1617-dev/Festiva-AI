# Festiva AI — Your Smart Celebration Planner

Festiva AI is an intelligent, full-stack celebration and event-planning SaaS platform that transforms ideas into comprehensive, personalized event plans with date-aware timelines, dynamic budget allocations, interactive vendor checklists, creative themes, and an event-aware AI assistant powered by Google Gemini.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your preferences from Phase 1, the following core specifications are confirmed:
> - **Primary Demo Showcase**: Grand Wedding Celebration preset loaded by default for instant judge exploration without requiring an API key.
> - **Default Currency & Localization**: USD (`$`) default with a multi-currency switcher supporting EUR (`€`), GBP (`£`), INR (`₹`), CAD (`C$`), and AUD (`A$`).
> - **Primary View Layout**: High-density tabbed workspace featuring dedicated modules: Event Overview & Plan, Smart Budget Planner, Date-Aware Timeline, Vendor Checklist, Creative Theme Studio, and Event-Aware AI Assistant.

---

## 1. Overview & Core Concept

- **What It Does**: Festiva AI allows event hosts, couples, festival organizers, corporate planners, and families to specify event parameters (type, date, guest count, budget, themes, dietary constraints, style preferences) and instantly generates tailored, production-ready event plans. Users can dynamically fine-tune budgets, check off vendor milestones, explore creative themes and menus, converse with an event-aware AI assistant, and export print-ready PDFs and CSVs.
- **Target Audience / Persona**: Wedding couples, anniversary hosts, birthday organizers, university cultural heads, and corporate event managers needing professional event coordination without expensive agency fees.
- **Key Value**: Replaces scattered spreadsheets and notes with an integrated, intelligent planner that recalculates budgets dynamically, schedules milestones backwards from the event date, and provides creative styling inspiration.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Landing & Multi-Event Management**:
   - Welcome view with high-level KPI metrics (upcoming events, total budgets, pending checklist tasks).
   - "Load Competition Demo" instant button (pre-populating the Grand Wedding Celebration).
   - "Create New Event" wizard with robust field validation and progress indicator.
2. **Event Workspace (Tabbed Dashboard)**:
   - **Header & Event Bar**: Event title, countdown timer (`D-XX Days`), guest badge, budget status bar, and quick export actions (Print/PDF, CSV, Share).
   - **Tab 1: AI Master Plan**: Event overview, venue criteria, catering concepts, entertainment options, guest experience flow, and contingency/risk management.
   - **Tab 2: Smart Budget Planner**: Interactive visual category distribution (SVG donut and bar breakdown), total budget vs. planned expenses vs. remaining buffer, real-time reallocation inputs, over-budget warnings, and custom category addition.
   - **Tab 3: Preparation Timeline**: Chronological phase scheduling (Weeks Before, Final Month, Final Week, Eve of Event, Event Day) with priority flags, date calculations, completion toggles, and custom task injection.
   - **Tab 4: Vendor Checklist**: Categorized vendor tracking (Venues, Catering, Photography, Floral & Decor, Music/DJ, Invitations, Transport) with status indicators (Uncontacted, Shortlisted, Quoted, Booked), notes, and deadlines.
   - **Tab 5: Creative Theme Studio**: Color swatches with HEX codes, decoration concepts, dress codes, invitation copy generator, activity guides, and social media captions.
   - **Tab 6: AI Event Assistant**: Contextual conversation drawer with recommended prompt chips ("How can I reduce catering costs by 15%?", "Rain contingency plan?", "Fun icebreaker games for our guest count").

### Visual Identity & Theme
- **Aesthetic Direction**: Premium celebration SaaS with an editorial, celebratory mood. Clean white canvas with indigo structural surfaces and warm coral accents.
- **Palette**:
  - Neutral Canvas: Crisp white (`#FFFFFF`) and slate tints (`#F8FAFC`, `#F1F5F9`).
  - Structural Brand: Deep Indigo (`#4338CA` / `#312E81`) and Royal Purple (`#6366F1` / `#7C3AED`).
  - Warm Celebration Accent: Coral / Rose (`#F43F5E` / `#FB7185` / `#FDA4AF`).
  - Semantic Status: Emerald (`#10B981`) for completed/nominal, Amber (`#F59E0B`) for approaching/caution, Ruby (`#EF4444`) for budget deficits.
- **Typography & Hierarchy**:
  - Display / Hero: `Plus Jakarta Sans` / `Outfit` font stack for geometric elegance.
  - Body Prose: Crisp `Plus Jakarta Sans` / `system-ui` with balanced line-heights.
  - Data & Metrics: `tabular-nums font-mono` for all currencies, percentages, and counters.
- **Spatial Discipline & Anti-Slop Principles**:
  - Zero unboxed pill badges or badge sandwiches; metadata separated by typographic dots (`·`).
  - No decorative pulsing dots, fake telemetry tickers, or arbitrary innovation scorecards.
  - Generous padding, single-elevation card hierarchy with hairline borders (`border-slate-200`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Gemini API via Express API Proxy**:
  - *Chosen Approach*: Node.js/Express server middleware hosting `/api/gemini/plan`, `/api/gemini/themes`, and `/api/gemini/chat` endpoints using the modern `@google/genai` SDK with `gemini-flash-latest`.
  - *Why*: Complies with AI Studio security guidelines (API keys never exposed to the client bundle). Provides structured JSON schema enforcement and robust fallback handling.
- **Decision 2: Storage Abstraction Layer with LocalStorage & Demo Fixtures**:
  - *Chosen Approach*: Clean repository interface (`StorageService`) backed by `localStorage` with automated schema migration and JSON import/export.
  - *Why*: Allows instant offline and unauthenticated judge review without database hurdles while preserving data persistently across sessions.
- **Decision 3: Zero-Dependency SVG Donut and Bar Visualizations**:
  - *Chosen Approach*: Custom React-based responsive SVG donut charts and segmented progress bars with interactive tooltips and category highlights.
  - *Why*: Guarantees 100% React 19 compatibility, avoids heavy bundle bloat, and provides pixel-perfect color coordination with the theme.
- **Decision 4: Multi-Currency Dynamic Formatter**:
  - *Chosen Approach*: Global currency state supporting USD, EUR, GBP, INR, and CAD with real-time formatting across all budget cards and timeline tables.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Festiva AI Frontend                             │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │     Top Header        │  │     Global Event Context / State      │  │
│  │ (Brand, Event Switch, │  │ (Active Event, Currency, Search,      │  │
│  │  Demo Mode, New Event)│  │  StorageService sync, Notification)   │  │
│  └───────────┬───────────┘  └──────────────────┬────────────────────┘  │
│              │                                 │                       │
│  ┌───────────┴─────────────────────────────────┴────────────────────┐  │
│  │                     Tabbed Workspace                             │  │
│  │ ┌──────────────┬──────────────┬──────────────┬────────────────┐  │  │
│  │ │ 1. Overview  │ 2. Budget    │ 3. Timeline  │ 4. Vendors     │  │  │
│  │ ├──────────────┼──────────────┼──────────────┼────────────────┤  │  │
│  │ │ 5. Themes    │ 6. Assistant │ 7. Export    │ 8. Settings    │  │  │
│  │ └──────────────┴──────────────┴──────────────┴────────────────┘  │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ HTTP API Requests
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Express Server Backend                            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ /api/gemini/plan      -> Structured Comprehensive Event Blueprint │  │
│  │ /api/gemini/themes    -> Theme, Palette, Copy & Activity Ideas   │  │
│  │ /api/gemini/assistant -> Contextual Event Q&A & Recommendations  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ @google/genai SDK
│                                     ▼
│                        Google Gemini Models                            │
│                      ('gemini-flash-latest')                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model Entities
- **`EventRecord`**: ID, title, category, date, location, guestCount, budget, currency, themeStyle, venueType, dietaryNotes, specialRequests, planningStyle, createdAt, updatedAt.
- **`BudgetPlan`**: TotalBudget, plannedSpend, categories (`[{ id, name, estimated, actual, percentage, notes }]`).
- **`TimelineSchedule`**: Phases (`[{ id, name, tasks: [{ id, title, description, deadlineDaysBefore, calculatedDate, priority, completed }] }]`).
- **`VendorChecklist`**: Categories (`[{ id, category, vendors: [{ id, name, role, status, estimatedCost, notes, deadline }] }]`).
- **`ThemePackage`**: Name, description, colorPalette (`[{ name, hex }]`), decorConcepts, dressCode, invitationWording, activities, menuHighlights, socialCaptions.
- **`ChatMessage`**: ID, role (`user` | `assistant` | `system`), content, timestamp, suggestedActions.

### Interactive Component & State Mapping
- **`EventModal`**: Validates inputs, handles submit, triggers AI plan creation with loading spinner and failure recovery.
- **`BudgetTracker`**: Computes totals dynamically, highlights deviations, supports instant category inline edits, additions, and deletions.
- **`TimelineBoard`**: Calculates exact dates using `eventDate - deadlineDaysBefore`, filters by phase/priority, toggles completion with persistent storage.
- **`VendorTracker`**: Updates vendor status with direct dropdown controls, allows adding vendor notes and estimated quotes.
- **`AssistantPanel`**: Passes active event JSON as grounding context to Gemini for instant answers and optimization advice.
- **`ExportActions`**: Generates clean print stylesheets (`@media print`), downloads formatted CSV for budget and vendors, and copies plans to clipboard.
