# Spec 02 — Design System

## Goal

Establish the visual foundation for the app: CSS design tokens, base typography, reusable card/tile styles, and the responsive layout shell. All subsequent specs build on this.

## Deliverables

- `src/styles/tokens.css` — design tokens
- `src/styles/base.css` — reset and base typography
- `src/styles/components.css` — shared component styles (cards, buttons)
- `src/styles/layout.css` — app shell layout
- Tokens and base styles imported globally in `main.ts`

## Aesthetic Reference

- Motifs: gothic, dark fantasy, grimdark, minimalist
- Palette: black background, white/grey text, blood red for accents (used sparingly)
- Feel: functional and stark, not decorative

## Tasks

### 1. Design tokens (`src/styles/tokens.css`)

Define CSS custom properties on `:root`:

```css
/* Colors */
--color-bg: #0a0a0a;
--color-surface: #141414;
--color-border: #2a2a2a;
--color-text-primary: #e8e8e8;
--color-text-secondary: #888888;
--color-accent: #8b1a1a;       /* blood red */
--color-accent-hover: #a82020;
--color-disabled: #333333;

/* Typography */
--font-family: system-ui, -apple-system, sans-serif;
--font-size-sm: 0.8125rem;   /* 13px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-weight-normal: 400;
--font-weight-bold: 600;

/* Spacing */
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;

/* Borders */
--radius-sm: 2px;
--radius-md: 4px;
--border-width: 1px;
```

Exact hex values are suggestions — adjust to taste, but maintain the dark/minimal aesthetic.

### 2. Base reset and typography (`src/styles/base.css`)

- Box-sizing reset (`*, *::before, *::after { box-sizing: border-box; }`)
- Remove default margins/padding
- Set `background-color`, `color`, and `font-family` on `body` using tokens
- Set `line-height: 1.5` on body
- Style `h1`–`h3` with appropriate sizes from token scale, no decorative styles
- Links: use accent color, no underline by default

### 3. Card/tile component styles (`src/styles/components.css`)

Cards are the primary display unit for creature/item entries in lists.

```
.card
  background: var(--color-surface)
  border: var(--border-width) solid var(--color-border)
  border-radius: var(--radius-md)
  padding: var(--space-3) var(--space-4)
  cursor: pointer

.card:hover
  border-color: var(--color-text-secondary)

.card--disabled
  opacity: 0.4
  cursor: not-allowed
```

Also define:
- `.btn` — base button style (no background, border using accent color, accent text, small padding)
- `.btn--primary` — filled accent background
- `.btn--ghost` — no border, text only
- `.input` — text input style (dark background, border, white text, full width)
- `.badge` — small inline label (used for tags or status indicators)

### 4. App shell layout (`src/styles/layout.css`)

The app shell has two regions: the main content area and the tab bar at the bottom.

```
#app
  display: flex
  flex-direction: column
  height: 100dvh        /* dynamic viewport height for mobile */
  max-width: 768px      /* cap width for larger screens */
  margin: 0 auto

.view
  flex: 1
  overflow-y: auto
  padding: var(--space-4)

.tab-bar
  flex-shrink: 0
  display: flex
  border-top: var(--border-width) solid var(--color-border)
  background: var(--color-surface)
```

### 5. Verify

- `npm run dev` renders the app shell with a dark background and correct font
- No layout overflow or horizontal scroll on a 375px-wide viewport
- Design tokens are accessible across all CSS files via cascade

## References

- Design doc: Aesthetic, Layout/UI sections
- Spec 01 must be complete before this spec runs
