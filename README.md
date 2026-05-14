<div align="center">
  <img src="https://img.icons8.com/color/96/000000/kanban.png" alt="ProjectPro Logo" width="80" />
  <h1>🚀 ProjectPro</h1>
  <p><strong>A Production-Ready Full-Stack SaaS Project Management Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📖 Resume / LinkedIn Summary
**ProjectPro** is a highly scalable, real-time SaaS project management platform designed to streamline team collaboration. Built with React, Node.js, and PostgreSQL, it features a live-syncing drag-and-drop Kanban board via WebSockets, role-based access control, rich data analytics, and secure cloud file attachments. The architecture is cloud-native, seamlessly integrated with Neon databases and deployed across Vercel and Render for high availability and performance.

---

## 🌟 Project Overview
ProjectPro transforms chaotic team workflows into organized, actionable pipelines. It is an enterprise-grade project management platform featuring **role-based collaboration**, **real-time Kanban boards**, and an **analytics dashboard**. Designed with a modern cloud-ready architecture, it ensures seamless updates and absolute security for remote teams.

---

## ✨ Key Features
- 🔐 **JWT Authentication**: Secure, stateless user sessions.
- 👥 **Admin/Member RBAC**: Strict role-based access controls ensuring members only modify their own assigned tasks.
- ⚡ **Real-Time Socket.io Updates**: Kanban boards instantly sync across all clients without page reloads.
- 🖱️ **Drag-and-Drop Kanban**: Intuitive task management with beautiful, fluid animations.
- 📊 **Dashboard Analytics**: Visualize project velocity and completion rates using Recharts.
- 📁 **Project & Task Management**: Full CRUD capabilities for seamless team organization.
- 🕒 **Activity Logs**: Detailed, automated audit trails for every task update.
- ☁️ **File Uploads**: Cloudinary integration for secure image, PDF, and document attachments.
- 🌙 **Dark Mode**: Premium, OS-aware dark mode built with Tailwind CSS.
- 📱 **Responsive UI**: Flawless experience on desktop, tablet, and mobile.
- 🗄️ **PostgreSQL Integration**: Highly relational, robust data modeling hosted on Neon.
- 🔌 **REST APIs**: Fast, modular, and secure backend endpoints.
- 🛡️ **Protected Routes**: Frontend and backend navigation secured by robust middleware.
- 💬 **Comments System**: Threaded communication integrated directly into task cards.
- 🔔 **Notifications**: Real-time event broadcasting to keep teams aligned.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Axios, React Router, Recharts, @hello-pangea/dnd |
| **Backend** | Node.js, Express.js, Socket.io, JWT (JSON Web Tokens), Multer, Cloudinary |
| **Database** | PostgreSQL (Neon Cloud Database), `pg` driver |
| **Deployment** | Vercel (Frontend), Render (Backend), Neon (Postgres) |

---

## 🏗️ Architecture
ProjectPro is built on a heavily decoupled **Client-Server Architecture**:
- **Frontend (SPA)**: A React/Vite single-page application that consumes REST APIs and maintains an active WebSocket connection for live UI updates.
- **Backend (REST + WS)**: A Node.js/Express server that acts as the central router, verifying JWTs, executing business logic, and broadcasting Socket.io events.
- **Database**: A highly normalized PostgreSQL relational database optimized for quick joins across users, projects, tasks, comments, and activity logs.

---

## 📸 Screenshots

| Dashboard Analytics | Live Kanban Board |
| :---: | :---: |
| *(Add Dashboard Screenshot Here)* | *(Add Kanban Screenshot Here)* |
| **User Management** | **Secure Login & Dark Mode** |
| *(Add Users Screenshot Here)* | *(Add Login/Dark Mode Screenshot Here)* |

---

## 🔑 Demo Credentials
Experience the live platform instantly using these quick-fill demo accounts:

**Admin Account** (Full Access)
- **Email:** `admin@test.com`
- **Password:** `member123`

**Member Account** (Restricted Access)
- **Email:** `member@test.com`
- **Password:** `member123`

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/projectpro.git
cd projectpro
```

### 2. Backend Setup
```bash
cd server
npm install
# Create your .env file using the template below
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Create your .env file
npm run dev
```

---

## 🔐 Environment Variables

### `server/.env`
```env
PORT=5000
DATABASE_URL=postgres://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```
*(Do not expose database or JWT secrets in the client `.env`!)*

---

## 🚀 Deployment Instructions

### 1. Database (Neon)
- Create a new project on [Neon.tech](https://neon.tech).
- Copy the **Pooled Connection String** and paste it into your backend's `DATABASE_URL`.
- Run the schema scripts located in `server/schema.sql` to initialize your tables.

### 2. Backend (Render)
- Connect your GitHub to [Render](https://render.com) and create a new **Web Service**.
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Add all variables from your `server/.env` into Render's Environment Variables panel.

### 3. Frontend (Vercel)
- Import the repository into [Vercel](https://vercel.com).
- Root Directory: `client`
- Framework Preset: `Vite`
- Set `VITE_API_URL` to your live Render backend URL (e.g., `https://your-app.onrender.com/api`).
- Deploy! The included `vercel.json` will automatically handle SPA routing.

---

## 🛡️ Security Features
- **Passwords**: Hashed with `bcrypt` using 10 salt rounds.
- **Authentication**: Stateless `JWT` tokens stored securely.
- **Access Control**: Strict `Admin`/`Member` RBAC middleware protecting sensitive APIs.
- **Protection**: `helmet` headers protect against XSS and clickjacking.
- **Rate Limiting**: `express-rate-limit` prevents brute-force attacks (10 requests/15m for auth routes).
- **Environment**: Strict separation of concerns; backend secrets are completely inaccessible to the browser.

---

## 🔮 Future Improvements
- 🤖 **AI Integrations**: Smart task prioritization and automated project summaries.
- 📅 **Calendar View**: A drag-and-drop timeline/calendar view for due dates.
- 📧 **Email Notifications**: Automated reminders via SendGrid/AWS SES.
- 🤝 **Team Invites**: Magic link invitations for seamless onboarding.
---
<div align="center">
  <i>Built with ❤️ for modern software teams.</i>
</div>

## 📄 License

MIT 

## 🚀 Live Demo
**Frontend Deployment**
https://project-management-saas-eight.vercel.app

**Backend API**
https://project-management-saas-nknw.onrender.com 
