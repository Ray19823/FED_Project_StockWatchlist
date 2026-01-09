# Hi-Fidelity Spec — Desktop

## Frame & Grid
- Frame: 1440×1024, background `#F5F5F5` (gray-100)
- Grid: 12 columns, 80px gutters, 1200px max content width centered
- Spacing scale: 4px base (4, 8, 12, 16, 24, 32)

## Design Tokens (align to Tailwind)
- Colors: blue-600 (#2563EB), blue-700 (#1D4ED8), green-600 (#16A34A), red-600 (#DC2626), gray-50/100/600/900
- Radii: 6px for controls, 8px for cards
- Shadows: sm (0 1 2 / 0.08), md (0 4 12 / 0.12)
- Typography:
  - Title: 28–32px, semibold
  - Section: 18–20px, semibold
  - Body: 14–16px, regular
  - Meta: 12–14px, regular

## Page Structure
- Header (stack vertically):
  - App Title: "Stock Watchlist" (32px, semibold)
  - Subtitle: one-line description (14px, gray-600)
- Controls Row (horizontal, wrap on small widths):
  - Toggle: Live Quotes
  - Toggle: Auto-refresh
  - Select: Interval [15s, 30s, 60s]
  - Checkbox: Force fresh (dev)
  - Button: Refresh
  - Form group (Add Stock): symbol, name, notes, Add button
- Content: Watchlist list

## Components
- Card (List Item)
  - Container: 100% width, 8px radius, gray-50 background, 1px border gray-200, padding 16–20px, shadow-sm
  - Header row: left block (title + meta) and right block (buttons)
    - Title: `SYMBOL — Name` (18–20px, semibold)
    - Meta (14px, gray-600): Price, change (+/-, colored), Updated time, badges
      - Badge "live": blue-600 text, text-xs
      - Badge "simulated": gray-600 text, text-xs
    - Buttons: Edit Notes (outline blue), Delete (outline red)
  - Notes: label + content (14px), escape HTML
  - Inline Edit: text input + Save (primary) + Cancel (outline)

- Form Inputs
  - Label: 12px, gray-600
  - Input: 14–16px, 6px radius, 1px border gray-300, focus ring blue-600
  - Helper/error: 12px, gray-600/red-600

- Buttons
  - Primary: blue-600 bg, white text, hover blue-700, 6px radius, 14–16px
  - Outline: 1px colored border, white bg, colored text, hover subtle tint
  - Danger: red-600 border/text; hover red-50 bg

- Toast
  - Card: white bg, 8px radius, border gray-200/green-200/red-200, shadow-md, top-right fixed
  - Content: 14px; auto-dismiss ~1.7s

## Interactions
- Toggle Live: updates badges and content source
- Auto-refresh: starts/stops interval; reflect status subtly (toast or badge)
- Refresh: shows toast; updates times and data
- Edit Notes: opens inline row; Save persists and reloads list
- Delete: confirm, then remove, toast success

## Accessibility
- Minimum contrast AA; focus visible outlines; logical tab order
- Buttons/inputs have accessible labels; badge text is descriptive

## Prototype Links
- From Home: connect controls and list items to states
- Link Add Stock to success toast and refreshed list
- Add flows to Achievements/Settings (optional tabs)
