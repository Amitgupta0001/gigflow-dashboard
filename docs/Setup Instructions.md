# ⚡ GigFlow Dashboard - Setup & Launch Instructions

This document provides clear, step-by-step instructions on setting up and running the **GigFlow Dashboard** environment. The project can be deployed locally using manual node setups or orchestrating a fully containerized network using Docker Compose.

---

## 🌐 Live Deployments (Quick Access)
If you just want to test the application without setting it up locally, you can use the live hosted versions:
- **Frontend (Vercel)**: [https://gigflow-dashboard-gold.vercel.app](https://gigflow-dashboard-gold.vercel.app)
- **Backend API (Render)**: [https://gigflow-backend-9zsj.onrender.com/api/health](https://gigflow-backend-9zsj.onrender.com/api/health)

---

## 📋 Prerequisites
Before launching, make sure you have the following programs installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [MongoDB](https://www.mongodb.com/) (either a locally running service, or a MongoDB Atlas Cloud Cluster URI)
- [Docker & Docker Compose](https://www.docker.com/) *(Optional: required only for containerized deployment)*

---

## 🛠️ Method 1: Local Development Setup (Manual Execution)

Follow these instructions to run the frontend and backend servers individually on your development machine.

### 1. Backend Server Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Open the new `.env` file and replace placeholders with your active credentials:
   ```ini
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gigflow
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ADMIN_SECRET=admin_secret_for_creating_admin_users
   ```

4. **Launch the Server**:
   Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
   The backend server starts listening and logging:  
   `🚀 Server running on port 5000 in development mode`  
   `✅ MongoDB connected: <your_host>`

---

### 2. Frontend React Client Setup

1. **Navigate to the Frontend Directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Environment Setup (Optional)**:
   By default, the client points to `http://localhost:5000` inside source configuration. If your backend is hosted on a different address, define the endpoint by placing a `.env` file in the `frontend/` root:
   ```ini
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the Webpack Client Dev Server**:
   ```bash
   npm start
   ```
   A new browser window opens automatically at `http://localhost:3000` to serve the fluid dark glassmorphic dashboard!

---

## 🐳 Method 2: Containerized Isolation Setup (Docker Compose)

To spin up the entire ecosystem—including the Node/Express backend, React UI bundle (served through an Nginx proxy), and a containerized local MongoDB database—in single-command isolation, run the following in the root workspace folder:

1. **Build and Spin up Container Network**:
   ```bash
   docker-compose up --build
   ```
   *(Add `-d` flag to run in background: `docker-compose up -d --build`)*

2. **Standard Port Bindings**:
   - **Frontend application**: Serves compiled build components via an Nginx proxy on [http://localhost:3000](http://localhost:3000) ✓
   - **Backend API**: Exposes Express endpoints on [http://localhost:5000](http://localhost:5000) ✓
   - **Local MongoDB**: Operates inside container boundaries on port `27017` with volume persistence.

3. **To Terminate the Docker Environment**:
   ```bash
   docker-compose down
   ```

---

## 🛡️ Administrative Accounts & Testing Procedures

The project has standard, functional role-based permission locks for **Admins** and normal **Sales Representatives**:

### 💼 Standard Sales User Account
1. Open the signup screen on the dashboard and register.
2. Under normal configuration, this user has full, secure CRUD capabilities over leads they personally upload, but cannot see or alter global index entries belonging to other representatives.

### 🛡️ Administrator Account Activation
1. Navigate to the Signup page at `http://localhost:3000/register`.
2. Expand the *"Are you an Admin?"* link at the bottom of the registration modal form.
3. Input your desired administrator name, email, and password.
4. Input the **Admin Secret Key** defined inside the active backend `.env` configuration (default template value: `admin_secret_for_creating_admin_users`).
5. Click **Create Account**. Your account will be labeled with a 🛡️ **Admin** badge in the Navbar, letting you supervise and aggregate all dashboard metadata correctly!
