# ⚡ GigFlow Dashboard — Setup & Launch Instructions

This document covers all options for running **GigFlow Dashboard** locally or in a containerized environment.

---

## 🌐 Live Deployments (Quick Access)
Test the application without a local setup:
- **Frontend (Vercel)**: [https://gigflow-dashboard-gold.vercel.app](https://gigflow-dashboard-gold.vercel.app)
- **Backend API (Render)**: [https://gigflow-backend-9zsj.onrender.com/api/health](https://gigflow-backend-9zsj.onrender.com/api/health)

---

## 📋 Prerequisites
Make sure the following are installed:

| Requirement | Minimum Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18+ | Includes `npm` |
| [MongoDB](https://www.mongodb.com/) | v5+ | Local instance or Atlas Cloud URI |
| [Docker & Docker Compose](https://www.docker.com/) | v24+ | Optional — required for containerized setup only |

---

## 🛠️ Method 1: Local Development (Manual)

### Step 1 — Backend Setup

```bash
cd backend
npm install
```

Copy and configure your environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
```ini
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gigflow
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ADMIN_SECRET=admin_secret_for_creating_admin_users
```

Start the backend dev server:
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000 in development mode
✅ MongoDB connected: <your_host>
```

---

### Step 2 — Frontend Setup

```bash
cd ../frontend
npm install
```

> **Optional**: If your backend runs on a port other than `5000`, create a `frontend/.env` file:
> ```ini
> REACT_APP_API_URL=http://localhost:5000
> ```

Start the frontend dev server:
```bash
npm start
```

The browser opens automatically at `http://localhost:3000`.

---

## 🐳 Method 2: Docker Compose (One-Command)

Launches the full stack (Express backend + Nginx-served React build + MongoDB container) in isolated containers:

```bash
# From the project root:
docker-compose up --build
```

Add `-d` to run in background:
```bash
docker-compose up -d --build
```

**Port Bindings**:
| Service | URL |
|---|---|
| Frontend (Nginx) | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MongoDB | `localhost:27017` (container-internal) |

Tear down the environment:
```bash
docker-compose down
```

---

## 🛡️ Role-Based Accounts

### 💼 Sales Representative
1. Navigate to `http://localhost:3000/register`.
2. Fill in **Full Name**, **Email**, **Password** (required).
3. Optionally provide **Phone Number**, **Job Title**, and **Company Name** in the two-column form.
4. Click **Create Account**.
5. Sales Reps have full CRUD access over leads they personally create.

### 🛡️ Administrator
1. Navigate to `http://localhost:3000/register`.
2. Fill in the required fields plus optional profile fields.
3. Click **"Are you an Admin?"** at the bottom of the form.
4. Enter the **Admin Secret Key** defined in your backend `.env` (`ADMIN_SECRET`).
5. Click **Create Account**.
6. Admin accounts display a 🛡️ badge and can manage all leads in the system.

---

## 🎨 Application Features Overview

### Dashboard Views (Left Sidebar Navigation)
| Sidebar Item | Description |
|---|---|
| **Dashboard** | Greeting overview and pipeline KPI stat cards |
| **Leads** | Compact paginated list view of all leads |
| **Pipelines** | Interactive Kanban Board with drag-and-drop stage transitions |
| **Reports** | Analytics: pipeline conversion, top deals, acquisition source breakdown |
| **Sources** | Acquisition channel stats (website, instagram, referral) |
| **Tasks** | Custom task creator + next-action items from active leads |
| **Settings** | Opens the Profile Settings modal (name, email, phone, title, company, password) |

### Theme Toggle
Click the 🌙/☀️ icon in the top header to switch between **Dark Mode** and **Light Mode**. Both themes are fully supported across all views, badges, cards, and modals.

### Profile Dropdown (Top Right)
Click your name/avatar in the top-right corner to:
- View your full profile info (name, email, company)
- Open **Profile Settings** modal
- **Logout**

### Kanban Board
- Leads are organized into columns: **New → Contacted → Qualified → Won → Lost**
- Use the status buttons inside each card to move a deal between stages
- Right-click any card for a context menu (Edit, Move, Delete)

---

## 📁 Environment Variables Reference (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Minimum 32-character secret for signing JWTs |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Allowed origin for CORS (default: `http://localhost:3000`) |
| `ADMIN_SECRET` | No | Secret key for elevating accounts to Admin role |
