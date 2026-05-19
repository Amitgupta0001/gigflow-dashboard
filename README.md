# GigFlow Dashboard (MERN + TypeScript)

GigFlow Dashboard is a full-stack Lead Management system built with TypeScript. It provides role-based access control, advanced filtering with debounced search, MongoDB-backed pagination, and CSV export for lead data.

## Key Features
- Role-based authentication (admin and sales users)
- Lead CRUD with validation and robust error handling
- Server-side pagination and compound indexes
- Search and filter pipelines with debounced queries
- Dashboard stats aggregation
- CSV export of filtered lead data
- Dockerized local and production builds
- 🌗 **Dark Mode Support** (Responsive multi-theme UI)

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
│   │   ├── models/          # User & Lead schema models
│   │   ├── routes/          # Express route bindings
│   │   ├── types/           # Request/response TypeScript types
│   │   └── server.ts        # App bootstrapper
│   ├── .env.example
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, FilterBar, LeadCard, forms, spinners, protect routes
│   │   ├── context/         # Auth session context
│   │   ├── hooks/           # useAuth, useLeads hook state machines
│   │   ├── pages/           # Login, Register, Dashboard, LeadDetail, NotFound
│   │   ├── services/        # Axios API wrapper instances
│   │   ├── types/           # Client interfaces
│   │   ├── App.tsx          # Client routing
│   │   └── index.css        # Tailwind customized stylesheet
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Setup & Launch Instructions

### Method 1: Local Development Execution

#### 1. Database (MongoDB Atlas)
- Ensure you have a MongoDB connection URI (local instance or MongoDB Atlas).

#### 2. Backend Setup
```bash
cd backend
npm install
# Copy the example variables and fill in your MongoDB URI
cp .env.example .env
npm run dev
```
The server starts listening on `http://localhost:5000`.

#### 3. Frontend Setup
```bash
cd frontend
npm install
# Optional: Setup REACT_APP_API_URL if backend runs on a different port
npm start
```
Your application starts automatically at `http://localhost:3000`.

---

### Method 2: Docker Compose (One-Command Setup)
Build and run the entire ecosystem (Express, React, and MongoDB database) in containerized isolation:
```bash
docker-compose up --build
```
Access the client-side app directly at `http://localhost:3000`.

---

## API Endpoint Documentation

### Authentication Routes
| Method | Endpoint | Auth Required | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | Creates a new user account | `{ name, email, password, adminSecret? }` |
| `POST` | `/api/auth/login` | No | Authenticates user credentials | `{ email, password }` |
| `GET` | `/api/auth/me` | Yes | Returns current profile session | None |

### Leads Pipeline Routes
| Method | Endpoint | Auth Required | Description | Query Parameters |
|---|---|---|---|---|
| `POST` | `/api/leads` | Yes | Creates a new sales lead | None |
| `GET` | `/api/leads` | Yes | Returns paginated, filtered leads | `status`, `source`, `search`, `sortBy`, `page`, `limit` |
| `GET` | `/api/leads/:id` | Yes | Retrieves details of single lead | None |
| `PUT` | `/api/leads/:id` | Yes | Updates lead information details | None |
| `DELETE` | `/api/leads/:id` | Yes | Deletes a lead from index | None |
| `GET` | `/api/leads/export/csv` | Yes | Generates and downloads lead CSV | `status`, `source`, `search` |
| `GET` | `/api/leads/stats/dashboard` | Yes | Retrieves statistics for stats cards | None |

---

## Role-Based Access Control & Testing Accounts
To evaluate administrative vs sales representative features:
- **Sales User Account**: Register normally. Has CRUD access over leads they generate.
- **Admin Account**: Register by expanding the *"Are you an Admin?"* link and providing the `admin_secret_for_creating_admin_users` value (defined in `.env`).

---

## Recent Fixes
We audited and resolved several backend issues:
- **`express-validator` v7 Union Types Bug**: Resolved an issue where field-level validation errors mapped generic `"field": "field"` keys in error responses instead of the actual failed parameter name (e.g. `email`, `password`), ensuring API consumers and frontends can parse bad inputs correctly.
- **Centralized Database Collision Handler**: Resolved a strict type-matching error where unique index constraint collisions from MongoDB returned a numeric error code (`11000`) but were evaluated using strict string equality (`=== '11000'`). This now properly triggers a clean `409 Conflict` envelope instead of unhandled `500` server exceptions.
- **Strict TypeScript Compiler Paths**: Explicitly set `"moduleResolution": "node"` in `backend/tsconfig.json` to guarantee path lookups for extensionless TypeScript imports, completely satisfying strict editor checks.

---

## Assignment Deliverables Checklist
- [x] Full-Stack TypeScript MERN stack implementation
- [x] Standard JWT local storage authentication and auto-logout verification
- [x] Advanced dynamic pipeline filtering with debounced searching
- [x] Compound indexes & server-side pagination (limit=10)
- [x] High-performance dashboard stat aggregations
- [x] Direct streaming CSV exporter
- [x] Multi-stage production container setup via Dockerfiles & Compose file
- [x] Validations on both frontend input elements and backend endpoint parameters
- [x] BONUS: Implemented centralized Theme Context for Dynamic Dark Mode Support
