# GigFlow Dashboard — Frontend

React 18 + TypeScript client for the **GigFlow Lead Management Dashboard**. Built with TailwindCSS v3, Axios, and React Router v6.

---

## 🚀 Quick Start

```bash
npm install
npm start
```

Opens at `http://localhost:3000`. The backend must be running at `http://localhost:5000` (or set via `REACT_APP_API_URL`).

---

## 📋 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Runs the dev server with hot reload at `http://localhost:3000` |
| `npm run build` | Produces an optimized production bundle in `/build` |
| `npm test` | Launches the test runner in interactive watch mode |

---

## 🗂️ Project Structure

```
src/
├── components/          # Shared, reusable UI components
│   ├── KanbanBoard.tsx      # Drag-and-drop pipeline board
│   ├── LeadList.tsx         # Paginated list view
│   ├── LeadForm.tsx         # Create / edit lead modal
│   ├── FilterBar.tsx        # Status, source, search, sort controls
│   ├── DealDetailsSidebar.tsx # Slide-in lead detail panel
│   ├── CardContextMenu.tsx  # Right-click context menu
│   └── ErrorMessage.tsx     # Inline error banner
│
├── context/             # React context providers
│   ├── AuthContext.tsx      # Auth session state
│   ├── ThemeContext.tsx     # Light / dark mode toggle
│   └── ToastContext.tsx     # Toast notification system
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts           # Login, logout, updateProfile
│   └── useLeads.ts          # CRUD, filters, pagination, CSV export
│
├── pages/               # Route-level page components
│   ├── Dashboard.tsx        # Main shell: sidebar, header, KPI cards, modals
│   ├── ReportsView.tsx      # Analytics sub-view (pipeline KPIs, top deals)
│   ├── SourcesView.tsx      # Acquisition channel stats sub-view
│   ├── TasksView.tsx        # Tasks and scheduled actions sub-view
│   ├── Login.tsx            # Login page
│   ├── Register.tsx         # Two-column sign-up form
│   └── NotFound.tsx         # 404 page
│
├── services/            # Axios API layer
│   ├── api.ts               # Axios instance with auth interceptors
│   ├── authService.ts       # register, login, me, updateProfile
│   └── leadService.ts       # CRUD, export, stats endpoints
│
├── types/               # Shared TypeScript interfaces
│   └── index.ts             # Lead, User, LeadStatus, AuthResponse, etc.
│
├── App.tsx              # Route tree
├── index.css            # Global Tailwind stylesheet + dual-theme badges
└── index.tsx            # React entry point
```

---

## 🌗 Theme Support

Click the 🌙/☀️ icon in the top-right header to switch between **Light Mode** and **Dark Mode**. Both themes are fully supported across all components, modals, badges, and sub-views.

---

## 🔐 Environment Variables

Create a `.env` file in this directory if your backend runs on a different address:

```ini
REACT_APP_API_URL=http://localhost:5000
```

If not set, defaults to `http://localhost:5000` for local development.

---

## 🐳 Docker

The frontend is containerized with a multi-stage `Dockerfile`:
- **Stage 1**: Builds the production bundle via `npm run build`
- **Stage 2**: Serves the static files via an Nginx proxy on port `3000`

Run the entire stack with:
```bash
# from the project root
docker-compose up --build
```

---

## 📚 Full Documentation

- [API Documentation](../docs/API%20Documentation.md)
- [Setup & Launch Instructions](../docs/Setup%20Instructions.md)
- [Root README](../README.md)
