# Spec 01 — Project Setup

## Goal

Scaffold the Corville project as a Vite + TypeScript single-page app configured for deployment on GitHub Pages.

## Deliverables

- Vite project initialised with the TypeScript template
- Folder structure established
- GitHub Pages deployment configured
- Linting configured

## Tasks

### 1. Initialise Vite project

Run `npm create vite@latest . -- --template vanilla-ts` from the repo root (or equivalent). Remove the default boilerplate (counter example, Vite logo, etc.) so the app starts from a blank slate.

### 2. Establish folder structure

```
src/
  components/       # Reusable UI components
  views/            # Top-level views (Tables, Lookup, Encounter)
  data/             # JSON config files (monsters, items, tables)
  types/            # TypeScript type definitions
  styles/           # Global CSS (design tokens, resets, base styles)
  main.ts           # Entry point
index.html
```

### 3. Configure GitHub Pages deployment

- Set `base` in `vite.config.ts` to the repository name (e.g. `"/corville/"`) so asset paths resolve correctly on GitHub Pages
- Add a `deploy` npm script that runs `vite build && gh-pages -d dist` (using the `gh-pages` package)
- Add a `.github/workflows/deploy.yml` GitHub Actions workflow that builds and deploys to the `gh-pages` branch on push to `main`

### 4. Configure linting

- Install and configure ESLint with the TypeScript plugin (`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`)
- Add an `lint` npm script: `eslint src --ext .ts`
- Rules: standard recommended config, no special overrides needed

### 5. Verify

- `npm run dev` starts the dev server and shows a blank page with no console errors
- `npm run build` produces a `dist/` folder without errors
- `npm run lint` passes cleanly

## References

- Design doc: Tech Stack, Architecture sections
