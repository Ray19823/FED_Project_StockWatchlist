# Achievements Tab — Spec

## Goals
- Light gamification to increase engagement: track streaks and award badges for milestones.
- Non-intrusive; purely client-side for prototype.

## Badges
- First Watchlist Item: unlock when user adds first stock.
- Note Taker: unlock when user edits notes on any stock.
- Daily Check-in: unlock when user refreshes once per day (simulated).
- Refresh Streaks: 3×, 7×, 14× consecutive refreshes (while Live or Simulated).

## Data Model (client-side)
- `achievements` (object keyed by badge id → { unlockedAt })
- `streak` (number), `lastRefreshDate` (ISO)
- Persistence: localStorage keys `achievements`, `streak`, `lastRefreshDate`

## UI (Desktop/Mobile)
- Tab: Achievements
- Grid of badges: 2–4 columns; each card shows badge icon, title, status
  - Locked: gray icon, "Locked"
  - Unlocked: colored icon, date
- Streak counter: prominent number with short description

## Interactions
- On Add Stock: set `achievements.firstItem.unlockedAt = now`
- On Save Notes: set `achievements.noteTaker.unlockedAt = now`
- On Refresh: increment streak if last refresh is same day or consecutive day; else reset to 1
- Streak badges: unlock at thresholds when streak increments

## Accessibility
- Ensure contrast and focusable badge cards; provide text labels for icons

## Implementation Notes (optional)
- Keep prototype non-destructive; simulate updates with variants in Figma instead of code.
- For live app, wire to localStorage in `public/main.js` if desired.
