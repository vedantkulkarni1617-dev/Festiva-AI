# Festiva AI — Your Smart Celebration Planner

> Intelligent, full-stack event-planning platform powered by Google Gemini AI, featuring date-aware timelines, dynamic budget allocations, interactive vendor checklists, creative theme generation, and an event-aware AI assistant.

Built for the **Developer Competition Showcase**.

---

## 🌟 Highlights & Key Capabilities

1. **Smart Event Creation**:
   - Comprehensive event intake: Category (Wedding, Birthday, Anniversary, College Festival, Corporate, Community), Guest Count, Budget, Location, Date, Venue Preference, Dietary Constraints, and Special Requests.
   - Robust form validation with helpful error messages.
   - One-click presets: *Grand Wedding Celebration (Showcase Demo)*, *30th Birthday Sunset Soirée*, *Tech Innovation Gala*, and *Spring Cultural Carnival*.

2. **Gemini-Powered AI Event Planner**:
   - Generates personalized event overviews, recommended decor atmospheres, venue selection criteria, catering ideas, entertainment flows, and risk contingency plans.
   - Strict server-side API execution using `@google/genai` with `gemini-flash-latest`.
   - Clear cost labeling as estimates; zero fabricated vendor availability.
   - Built-in offline curated blueprint engine when testing without an API key.

3. **Smart Budget Planner**:
   - Interactive SVG Donut Chart with live category hover tooltips and dynamic percentage distribution.
   - Covers Venue, Catering, Decor, Photography, Entertainment, Invitations, Transportation, and Contingency.
   - Inline editing for instant budget recalculation.
   - Over-budget warnings when expenses exceed targets.
   - Ability to add custom expense categories.
   - Export budget spreadsheet as CSV.

4. **Date-Aware Preparation Timeline**:
   - Automatically maps tasks backward from the scheduled event date.
   - Phased milestones: *Several Weeks Before*, *Month Before*, *Final Week*, *Day Before*, *Event Day*.
   - Filter by status (*All*, *Pending*, *Completed*, *High Priority*).
   - Dynamic task completion with celebratory confetti when all milestones are finished.
   - Add, edit, or delete custom tasks.

5. **Categorized Vendor Checklist**:
   - Tracks Venues, Caterers, Decorators, Photographers, Videographers, Entertainment, Florists, Transportation, Invitations, and Other Services.
   - Status tracking: *Researching*, *Contacted*, *Quoted*, *Booked*, *Declined*.
   - Direct status updates, contact details, quotes, and notes.
   - Export vendor checklist as CSV.

6. **AI Theme & Creative Studio**:
   - Tailored color palettes with one-click HEX code copying.
   - Tone-switchable invitation copy generator (*Formal*, *Modern*, *Playful*) with one-click copy.
   - Dress code styling advice, interactive games/activities, culinary pairings, and social media captions.
   - Generate fresh theme variations on demand.

7. **Contextual AI Event Assistant**:
   - Conversational assistant with full event grounding (guest count, budget, pending tasks, booked vendors, special requests).
   - Quick-prompt chips for instant answers (budget trimming, rain contingencies, icebreaker games, pending deadlines).
   - Clearly distinguishes between saved event facts and generated suggestions.

8. **Export & Sharing**:
   - Printable document layout (`@media print` stylesheet) with browser PDF export.
   - CSV export for Budget and Vendor checklists.
   - Copy clean text summaries to clipboard for messaging.
   - Complete JSON backup export and restore.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TSX, Google GenAI SDK (`@google/genai`).
- **AI Models**: Google Gemini (`gemini-flash-latest`).
- **Persistence**: Clean repository abstraction (`StorageService`) backed by `localStorage` with automated migration.
- **Fonts**: Plus Jakarta Sans, JetBrains Mono (tabular figures).

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+ installed
- npm or bun

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd festiva-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and configure your Gemini API Key:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```
> **Note**: Even without a Gemini API Key, the application runs fully in **Demo / Showcase Mode**, allowing judges and users to explore the Grand Wedding preset, interactive budget charts, timelines, vendor checklists, and export features.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

### Build the Application
```bash
npm run build
```
This produces an optimized Vite bundle in the `dist/` directory.

### Start the Production Server
```bash
npm run start
```

---

## 🔒 Security & Privacy

- All Gemini API calls are strictly encapsulated in server-side routes (`/api/gemini/*`).
- No API keys or secrets are ever exposed in client-side bundles or headers.
- User celebration plans and contact details are stored in client-side storage without collecting unnecessary personal data.
