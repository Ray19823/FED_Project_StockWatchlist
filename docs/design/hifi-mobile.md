# Hi-Fidelity Spec — Mobile

## Frame & Grid
- Frame: 390×844 (iPhone 13)
- Grid: 4–6 columns, 16px gutters, content edge padding 16px
- Spacing scale: 4px base (4, 8, 12, 16, 24, 32)

## Design Tokens (Tailwind aligned)
- Same tokens as desktop; ensure size/spacing scaled appropriately
- Typography:
  - Title: 24–28px, semibold
  - Section: 16–18px, semibold
  - Body: 14–16px
  - Meta: 12–14px

## Page Structure
- Header:
  - App Title
  - Subtitle (wraps to 2 lines if needed)
- Controls (2-row stack):
  - Row 1: Live Quotes toggle, Auto-refresh toggle
  - Row 2: Interval select, Force fresh, Refresh button (full-width on small screens)
- Add Stock Form: stacked inputs (Symbol, Name, Notes) + full-width Add button
- Watchlist list: stacked cards; reduce horizontal whitespace

## Components
- Card (List Item)
  - Container: 100% width, 8px radius, gray-50, border gray-200, padding 12–16px
  - Title: `SYMBOL — Name` (16–18px)
  - Meta: 12–14px, Price + Change (colored) + Updated + badges
  - Buttons: inline under title on mobile
    - Edit Notes (outline blue)
    - Delete (outline red)
  - Notes: label + content (14px)
  - Inline Edit: input + Save/Cancel stack on narrow view

- Inputs & Buttons
  - Inputs: full-width
  - Refresh/Add: full-width on small widths; consider icon+label for refresh

- Toast
  - Same as desktop; ensure top margin not overlapping system UI

## Interactions
- Toggle Live: same behavior, badges visible under meta
- Auto-refresh: interval selection affects timing
- Refresh: visible toast
- Edit Notes: inline; ensure keyboard-safe area (use autolayout with padding)
- Delete: confirm; toast

## Accessibility
- Touch targets ≥ 44×44px
- Focus visible and label associations
- High contrast; avoid tiny meta text

## Prototype Links
- Tap Refresh → toast & content update
- Tap Edit Notes → inline editor; Save → toast & updated item
- Toggle Live/Auto → state change indicator
