const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Connect to database
require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
const helmet = require('helmet');
app.use(helmet());

const rateLimit = require('express-rate-limit');

// Global Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:5174'
        ].filter(Boolean).map(url => url.replace(/\/$/, '')); // normalize by removing trailing slash

        const normalizedOrigin = origin.replace(/\/$/, '');

        // Allow exact matches or any Vercel preview/production deployment
        if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter); // Apply rate limiter to all requests

// Health Check (used by Railway/Render to verify the server is alive)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle undefined routes
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

const http = require('http');
const server = http.createServer(app);

// Socket.io Setup
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            
            const allowedOrigins = [
                process.env.FRONTEND_URL,
                'http://localhost:5173',
                'http://localhost:5174'
            ].filter(Boolean).map(url => url.replace(/\/$/, ''));
            
            const normalizedOrigin = origin.replace(/\/$/, '');

            if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith('.vercel.app')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('User connected via socket:', socket.id);
    
    socket.on('join_project', (projectId) => {
        socket.join(`project_${projectId}`);
        console.log(`Socket ${socket.id} joined project_${projectId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Export io so controllers can use it
app.set('io', io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));