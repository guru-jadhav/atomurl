# atomURL Frontend

Single Page Application for atomURL built with React 19, Vite, and plain CSS.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (custom properties, no heavy UI library)
- **Icons**: Lucide React

## Features

- **Dashboard**: Lists user links with infinite scrolling (keyset cursor pagination via `IntersectionObserver`).
- **Analytics**: 30-day click breakdown chart with daily inspection pills and a link switcher.
- **Authentication**: Modal supporting email OTP verification and Google/GitHub OAuth.
- **Theming**: Dark and light modes with custom scrollbars and responsive layout for mobile.
- **Clipboard Helper**: Copies links reliably across both HTTPS and insecure local/mobile hotspot connections.

## Directory Structure

```text
src/
├── api/             # API client (client.js)
├── components/      # UI components (Navbar, Dashboard, Hero, Modals)
├── context/         # AuthContext (user session & theme state)
├── pages/           # AnalyticsPage, AuthCallback
├── utils/           # clipboard and number formatting helpers
├── App.jsx          # Root application and route handling
└── index.css        # Global CSS variables and styles
```

## Running Locally

Install dependencies:
```bash
npm install
```

Start the Vite dev server:
```bash
npm run dev
```
Runs at `http://localhost:3000`.

### Scripts

- `npm run dev`: Start local dev server
- `npm run build`: Build for production into `dist/`
- `npm run preview`: Preview the production build
- `npm run lint`: Run Oxlint
