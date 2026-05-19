# GigFlow Dashboard (MERN + TypeScript)

GigFlow Dashboard is a full-stack Lead Management & Sales Pipeline system built with TypeScript. It provides role-based access control, interactive Kanban board pipeline management, advanced filtering with debounced search, MongoDB-backed pagination, real-time 7-day performance analytics, and CSV export for lead data.

## Key Features
- 📋 **Interactive Sales Kanban Board** — Drag cards across pipeline stages (`new → contacted → qualified → won/lost`) with inline status controls.
- 🌗 **Dual-Theme Support** — Full Light Mode & Dark Mode with smooth transitions; all components are legible in both themes.
- 👤 **User Profile & Settings Modal** — Update name, email, phone, job title, company, and password from the profile dropdown.
- 📊 **Reports & Analytics Dashboard** — Conversion stage breakdowns, Top Opportunities, Acquisition Source channel metrics.
- ⚡ **Real-Time 7-Day Performance Metrics** — KPI cards calculate live percentage changes over the last 7 days using both `createdAt` and `updatedAt` timestamps.
- 🎯 **Acquisition Channels & Scheduled Lead Actions** — Sources view and Tasks sub-view for follow-up management.
- 🔐 **Role-Based Authentication** — Admin vs. Sales Representative access tiers via JWT.
- 🗃️ **MERN CRUD Architecture** — Compound indexes and server-side pagination on all lead queries.
- 📥 **CSV Exporter** — Stream and download filtered lead data as a formatted CSV file.
- 🐳 **Docker Compose Support** — Single-command full-stack launch.
- 📝 **Rich Sign-Up Flow** — Two-column registration form captures optional Phone, Job Title, and Company on account creation.

## Tech Stack
- **Frontend**: React 18 + TypeScript + TailwindCSS v3 + Axios + React Router v6
- **Backend**: Node.js + Express + TypeScript + MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs + express-validator
- **DevOps**: Docker + Docker Compose

## Documentation & Live Demos
- **Live Frontend**: [https://gigflow-dashboard-gold.vercel.app](https://gigflow-dashboard-gold.vercel.app)
- **Live Backend API**: [https://gigflow-backend-9zsj.onrender.com/api/health](https://gigflow-backend-9zsj.onrender.com/api/health)
- [API Documentation](docs/API%20Documentation.md)
- [Setup & Launch Instructions](docs/Setup%20Instructions.md)

## Repository Structure
```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Route business logic (auth, leads)
│   │   ├── middleware/      # Auth validation, error handling, validator schemas
│   │   ├── models/          # User & Lead Mongoose schema models
│   │   ├── routes/          # Express route bindings
│   │   ├── types/           # Request/response TypeScript types
│   │   └── server.ts        # App bootstrapper
│   ├── .env.example
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── logo.png         # App logo (used across sidebar, login, register)
│   ├── src/
│   │   ├── components/      # KanbanBoard, FilterBar, LeadList, LeadForm, DealDetailsSidebar, etc.
│   │   ├── context/         # Auth, Theme, Toast contexts
│   │   ├── hooks/           # useAuth, useLeads hook state machines
│   │   ├── pages/           # Login, Register, Dashboard, LeadDetail, NotFound
│   │   ├── services/        # Axios API wrapper (authService, leadService)
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── App.tsx          # Client routing tree
│   │   └── index.css        # Global Tailwind stylesheet with dual-theme badge classes
│   ├── tailwind.config.js   # Extended with custom color shades (350, 450, 550, 650, 655…)
│   ├── postcss.config.js
│   └── Dockerfile
├── docs/
│   ├── API Documentation.md
│   └── Setup Instructions.md
├── docker-compose.yml
└── README.md
```

## Setup & Launch Instructions

### Method 1: Local Development Execution

#### 1. Database (MongoDB Atlas)
Ensure you have a MongoDB connection URI (local instance or MongoDB Atlas).

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Fill in MONGODB_URI, JWT_SECRET, ADMIN_SECRET
npm run dev
```
The server starts listening on `http://localhost:5000`.

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The application starts automatically at `http://localhost:3000`.

---

### Method 2: Docker Compose (One-Command Setup)
Build and run the entire ecosystem (Express, React, and MongoDB) in containerized isolation:
```bash
docker-compose up --build
```
Access the client at `http://localhost:3000`.

---

## API Endpoint Summary

### Authentication Routes
| Method | Endpoint | Auth Required | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | Creates a new user account | `{ name, email, password, adminSecret?, phone?, title?, company? }` |
| `POST` | `/api/auth/login` | No | Authenticates user credentials | `{ email, password }` |
| `GET` | `/api/auth/me` | Yes | Returns current profile session | None |
| `PUT` | `/api/auth/profile` | Yes | Updates user profile details | `{ name?, email?, phone?, title?, company?, password? }` |

### Leads Pipeline Routes
| Method | Endpoint | Auth Required | Description | Query Parameters |
|---|---|---|---|---|
| `POST` | `/api/leads` | Yes | Creates a new sales lead | None |
| `GET` | `/api/leads` | Yes | Returns paginated, filtered leads | `status`, `source`, `search`, `sortBy`, `page`, `limit` |
| `GET` | `/api/leads/:id` | Yes | Retrieves details of a single lead | None |
| `PUT` | `/api/leads/:id` | Yes | Updates lead information | None |
| `DELETE` | `/api/leads/:id` | Yes | Deletes a lead | None |
| `GET` | `/api/leads/export/csv` | Yes | Downloads filtered leads as CSV | `status`, `source`, `search` |
| `GET` | `/api/leads/stats/dashboard` | Yes | Retrieves KPI statistics for dashboard | None |

---

## Role-Based Access Control & Test Accounts
- **Sales User**: Register normally at `/register`. Has full CRUD over leads they create.
- **Admin**: Expand "Are you an Admin?" during registration and enter the `ADMIN_SECRET` from your `.env`. Admins see a 🛡️ badge and can supervise the full pipeline.

---

## Recent Changes & Fixes
- **Custom Logo Integration**: Replaced inline SVG placeholders with `logo.png` asset across Sidebar, Navbar, Login, and Register pages.
- **Redesigned Sign-Up Page**: Two-column responsive layout; captures optional Phone, Job Title, and Company on registration — stored in MongoDB via updated `authController`.
- **CSS Dual-Theme Overhaul**: Fixed 20+ non-existent Tailwind color shades (`brand-655`, `slate-955`, `gray-505`, etc.) by extending `tailwind.config.js`. All badge classes now render correctly in both Light and Dark modes.
- **Integrations Tab Removed**: Removed the mock Zapier/Slack/Mailchimp/HubSpot integration panel since it had no live backend connections.
- **`express-validator` v7 Union Types Bug**: Resolved field-level error mapping to correctly expose `email`, `password`, etc. in validation error responses.
- **MongoDB Conflict Handler**: Unique index collision (`11000`) now returns a clean `409 Conflict` instead of `500 Server Error`.

---

## Assignment Deliverables Checklist
- [x] Full-Stack TypeScript MERN stack implementation
- [x] JWT authentication with auto-logout on token expiry
- [x] Advanced dynamic pipeline filtering with debounced search
- [x] Compound indexes & server-side pagination
- [x] High-performance dashboard stat aggregations
- [x] Direct streaming CSV exporter
- [x] Multi-stage production containers via Dockerfiles & Docker Compose
- [x] Validations on both frontend inputs and backend endpoints
- [x] BONUS: Centralized Theme Context for Dark Mode / Light Mode
- [x] BONUS: Interactive Kanban Board with drag-and-drop stage transitions
- [x] BONUS: User Profile Settings modal (name, email, phone, title, company, password)
- [x] BONUS: Reports, Sources, and Tasks analytics sub-views
- [x] BONUS: Real-time 7-day pipeline activity calculation engine
- [x] BONUS: Two-column Sign-Up form with optional profile fields
- [x] BONUS: Custom logo across all pages (Sidebar, Navbar, Login, Register)
