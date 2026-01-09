# Figma Prototype Brief

## Project: Stock Watchlist (Interactive Live Application)

### Goals
- Mobile + Desktop web app to track stocks with notes and live quotes.
- Clear UX, accessible design, and gamified engagement (badges/streaks).
- Deploy front-end to GitHub Pages; backend to server (Render).

### Figma File Structure (Pages)
1. Cover: Project overview and brand
2. Design Tokens: Colors, typography, spacing, shadows, radii
3. Components: Buttons, inputs, toasts, toggles, table/list items
4. Mobile Wireframes: Low-fi → High-fi
5. Desktop Wireframes: Low-fi → High-fi
6. Prototype: Linked interactive frames for key flows

### Frames & Layout
- Mobile frames: 390×844 (iPhone 12/13/14)
- Desktop frames: 1440×900
- Grids: 4pt spacing base; 12-column desktop grid, 4-6 column mobile
- Typography: Tailwind-like scale (text-xs → text-3xl)

### Design Tokens (Tailwind-aligned)
- Primary: blue-600, Hover blue-700
- Success: green-600
- Danger: red-600
- Neutral: gray-50 / gray-100 / gray-600 / gray-900
- Background: white
- Radius: 6px and 8px
- Shadows: sm and md for elevation

### Core Components (Variants)
- Button: primary / outline / danger (default, hover, disabled)
- Input: text field with label + helper text + error
- Toggle: on/off
- Select: interval select (15s/30s/60s)
- Badge: live (blue), simulated (gray)
- Toast: info / success / error
- List Item: stock symbol + name + meta (price, change, time)
- Modal: edit notes
- Tabs (optional): watchlist / achievements / settings

### Key Screens (Mobile & Desktop)
1. Home (Watchlist)
   - Header, controls: Live Quotes, Auto-refresh, Interval, Force fresh
   - List of stocks with live/simulated badges, price, change, updated time
   - Actions: Edit notes, Delete
   - Empty state
2. Add Stock
   - Form: symbol, name, notes
   - Validation and success toast
3. Stock Detail (optional)
   - Expanded view: recent changes, provider source, notes
4. Achievements (gamification)
   - Badges for actions (add stock, daily check-in, streaks)
   - Progress indicators
5. Settings
   - Preferences: default live mode, refresh interval
   - About & links
6. Onboarding (optional)
   - 2–3 intro slides highlighting features

### Interaction Flows (Prototype)
- Toggle Live vs Simulated affects badges and content
- Auto-refresh and interval selection (represent as status text)
- Add, Edit, Delete stock → toast feedback and list update
- Achievements: unlock badge on first add; streak counter increment on refresh

### Accessibility Notes
- Contrast: meet WCAG AA (≥ 4.5:1 for text)
- Focus order: logical tabbing through interactive elements
- Focus visible styles on buttons/links/inputs
- Semantic structure: headings, lists, landmarks

### Assets & Icons
- Consider Heroicons (outline) for edit/delete/settings

### Handoff to Code
- Export color styles and text styles; define components with autolayout
- Provide redlines: spacing, font sizes, colors
- Annotate interactions in Prototype page

### Deliverables
- Figma link (view permissions)
- Preview: Prototype flow covering Home → Add Stock → Edit Notes → Achievements → Settings

### Notes for Submission
- README will include Figma URL, GitHub Pages URL, and Render live URL.
- Keep example data neutral; real watchlist JSON is local-only.
