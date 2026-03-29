# UI Designer Memory

## Project: Advisory Council (orca)

### Tech Stack
- React + TypeScript + Tailwind CSS v4
- Tailwind v4 dark mode: `@custom-variant dark (&:where(.dark, .dark *));` in globals.css
- Dark class toggled on `document.documentElement` by ThemeContext
- RTL layout (Hebrew), `lang="he" dir="rtl"` on html element

### Critical Dark Mode Rule
**Never write both a base AND dark class for the same property on the same element.**
Wrong: `bg-gray-950 dark:bg-gray-950 bg-gray-50` (conflicting)
Correct: `bg-gray-50 dark:bg-gray-950`

### Component Theming Rules
- **Office components** (OfficeScene, DiscussionPanel, ProgressBar, InteractionBar, SpeechBubble, Character, DirectMessageModal): hardcoded dark slate-900/950 colors, NO `dark:` prefix needed — boardroom is always dark.
- **Landing, DomainSelector, DomainCard, Button, Card, ThemeToggle, AccessibilityMenu**: use `light-base dark:dark-variant` pattern for full dual-mode support.

### Color Palette
- Brand: indigo-600 primary, purple-600 secondary
- Office bg: slate-950, surfaces: slate-900/slate-800
- Light page bg: gray-50, dark: gray-950
- Light card bg: white, dark: gray-800/gray-900
- Text light: gray-900, muted: gray-600; dark: white, muted: gray-400/slate-400

### Design Decisions
1. **Office boardroom is always dark** — professional feel, no light mode switching inside /office route.
2. **Mini office preview on Landing** — uses hardcoded slate-900 background (not light-mode responsive).
3. **DiscussionPanel messages** — added fallback rendering when `getMember()` returns undefined (messages still render with default indigo color + member ID as label).
4. **Loading spinner** — replaced 5 staggered gray dots with a single indigo SVG spinner (circle + arc path) in the waiting state. Cleaner and purposeful.
5. **ThemeToggle** — uses `bg-gray-200 dark:bg-gray-800` so it's visible in both modes.

### Button Variants (dual-mode)
- primary: `bg-indigo-600 text-white` (no change needed)
- secondary: `bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100`
- ghost: `border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`

### Accessibility Menu
- Panel: `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`
- Buttons: `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`
- Active toggle: `bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30`
- Reading guide feature not yet implemented (only 7 of 8 required toggles present — missing reading guide).
