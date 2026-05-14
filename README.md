# ProjectPro — Full-Stack Project Management Application

A production-ready project management web application built with **React**, **Node.js**, **Express**, and **MySQL**. Features JWT authentication, role-based access control (RBAC), drag-and-drop Kanban task boards, and a complete Admin/Member permission system.

## ✨ Features

### Authentication & Security
- JWT-based authentication with 24h token expiry
- Secure password hashing with bcrypt
- Protected API routes with middleware verification
- Auto-redirect on token expiry
- Duplicate email prevention

### Role-Based Access Control (RBAC)
| Feature | Admin | Member |
|---------|-------|--------|
| Dashboard | ✅ Full stats | ✅ Own stats |
| View Projects | ✅ All | ✅ Assigned only |
| Create/Edit/Delete Projects | ✅ | ❌ |
| View Tasks | ✅ All | ✅ Assigned only |
| Create/Delete Tasks | ✅ | ❌ |
| Update Task Status | ✅ Any | ✅ Own tasks only |
| Manage Users | ✅ | ❌ |

### Project Management
- Create, edit, and delete projects
- Project member assignment
- Project cards with creation dates

### Task Tracking
- Drag-and-drop Kanban board (Todo → In Progress → Completed)
- Priority levels (High, Medium, Low)
- Due date tracking
- User assignment
- Status badges with color coding

### User Management (Admin Only)
- User list with role indicators
- Inline role switching (Admin/Member)
- User deletion with confirmation
- Stats cards (Total, Admins, Members)

### UX Polish
- Toast notifications for all CRUD operations
- Inline form validation
- Loading spinners on buttons and pages
- Responsive sidebar navigation
- Empty state illustrations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MySQL 8 |
| Auth | JWT, bcryptjs |
| UI | Lucide Icons, react-hot-toast |
| Drag & Drop | @hello-pangea/dnd |

---

## 📁 Project Structure

```
management-app-project/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Sidebar
│   │   ├── context/            # AuthContext (JWT state)
│   │   ├── layouts/            # DashboardLayout
│   │   ├── pages/              # Dashboard, Projects, Tasks, Users, Login, Register
│   │   ├── services/           # Axios API client
│   │   └── App.jsx             # Routes + Toaster
│   ├── .env.example
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/                 # MySQL connection pool
│   ├── controllers/            # Auth, Project, Task, User logic
│   ├── middleware/             # JWT verify, Role check
│   ├── routes/                 # API route definitions
│   ├── schema.sql              # Database table creation
│   ├── seed.sql                # Sample data
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/projectpro.git
cd projectpro
```

### 2. Setup Database
```bash
mysql -u root -p < server/schema.sql
mysql -u root -p project_management_db < server/seed.sql   # Optional: sample data
```

### 3. Configure Backend
```bash
cd server
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
npm install
npm start
```

### 4. Configure Frontend
```bash
cd client
cp .env.example .env
# Edit .env if your backend runs on a different port
npm install
npm run dev
```

### 5. Access the app
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

### Default Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | password123 |
| Member | sarah@example.com | member123 |

---

## 🌐 Deployment

### Backend → Railway
1. Push `server/` to a GitHub repo
2. Connect to [Railway](https://railway.app)
3. Add a MySQL plugin
4. Set environment variables:
   - `DATABASE_URL` (auto-filled by Railway MySQL plugin)
   - `JWT_SECRET` (your secret key)
   - `FRONTEND_URL` (your Vercel domain, e.g. `https://projectpro.vercel.app`)
   - `NODE_ENV=production`

### Frontend → Vercel
1. Push `client/` to a GitHub repo (or same repo)
2. Connect to [Vercel](https://vercel.app)
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-railway-backend.up.railway.app/api`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register (always Member) |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |

### Projects
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/projects` | ✅ | Any | List projects |
| POST | `/api/projects` | ✅ | Admin | Create project |
| PUT | `/api/projects/:id` | ✅ | Admin | Update project |
| DELETE | `/api/projects/:id` | ✅ | Admin | Delete project |

### Tasks
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/tasks` | ✅ | Any | List tasks |
| POST | `/api/tasks` | ✅ | Admin | Create task |
| PUT | `/api/tasks/:id` | ✅ | Any* | Update status |
| DELETE | `/api/tasks/:id` | ✅ | Admin | Delete task |

*Members can only update tasks assigned to them

### Users
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users` | ✅ | Admin | List all users |
| PUT | `/api/users/:id/role` | ✅ | Admin | Change role |
| DELETE | `/api/users/:id` | ✅ | Admin | Delete user |

---

## 🔒 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 24 hours
- All API routes protected by `verifyToken` middleware
- Admin routes protected by `requireRole(['Admin'])` middleware
- Registration always assigns `Member` role (cannot self-assign Admin)
- Task ownership enforced — Members can only modify their own tasks
- SQL injection prevented via parameterized queries
- CORS restricted to configured frontend origins
- Duplicate email check on registration

---

## 📄 License

MIT
