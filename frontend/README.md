# atomURL Frontend

Single Page Application for atomURL built with React 19, Vite, and vanilla CSS.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS (custom design system, CSS variables, zero heavy component libraries)
- **Icons**: Lucide React

## Features

- **Dashboard**:
  - Keyset cursor pagination with infinite scrolling via `IntersectionObserver`.
  - Quick link copying with cross-browser fallback support (works over HTTP/LAN).
  - Monochromatic, theme-consistent delete confirmation dialogs.
- **Analytics**:
  - Interactive 30-day click breakdown charts with daily inspection badges.
  - Direct short code search and telemetry inspection.
- **Admin Console**:
  - Live service health cards (PostgreSQL latency, CacheCore status via native `PING`, and SMTP status).
  - Platform telemetry: total URLs, click metrics, registered users, and JVM heap memory bar.
  - User directory with search debouncing (300ms) and pagination controls.
  - System error buffer with on-demand refresh and buffer purge.
  - Unified contextual **Refresh** button cleanly aligned alongside the sub-header tabs (`Overview | Users | Errors`).
- **Session Lifecycle & Security**:
  - Passwordless email OTP verification modal and OAuth2 callback handlers (Google / GitHub).
  - Automatic 7-day token expiration check (`exp` claim) with safe base64 decoding to cleanly transition expired sessions back to guest mode.
  - Persistent active tab state preserved across page reloads.
  - Flicker-free role checks that keep admin navigation pills hidden from non-admin accounts.
- **State & Request Resilience**:
  - In-flight request guards and memoized toast dispatchers to eliminate cascading re-render loops and prevent hitting API rate limits during error states.
  - Visual loading states with spinning indicators and `cursor: not-allowed` disabled feedback across all action and refresh buttons.
- **Theming**:
  - Instant dark and light theme switching.
  - Custom themed scrollbars and mobile-responsive drawer navigation.

## Directory Structure

```text
src/
├── api/             # API client & fetch wrappers (client.js)
├── components/      # UI components (Navbar, Dashboard, HeroShortener, Modals)
├── context/         # AuthContext (session, token expiration & theme state)
├── pages/           # AdminPage, AnalyticsPage, AuthCallback
├── utils/           # Clipboard helpers and number formatting
├── App.jsx          # Root application, route switching & error boundaries
└── index.css        # Global CSS variables, utility classes & button states
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

- `npm run dev`: Start local development server
- `npm run build`: Build production bundle into `dist/`
- `npm run preview`: Locally preview the production build
- `npm run lint`: Run Oxlint code analysis
