-- ============================================
-- PostgreSQL Seed Data
-- ============================================

-- SAMPLE USERS
INSERT INTO users (name, email, password, role)
VALUES
(
    'Sarah Johnson',
    'sarah@example.com',
    '$2b$10$972qB3b3pevnj7y6B5AMa.ag7d3xcE9xcbyh9YQLkesBO03f1y6ZG',
    'Member'
),
(
    'Mike Chen',
    'mike@example.com',
    '$2b$10$972qB3b3pevnj7y6B5AMa.ag7d3xcE9xcbyh9YQLkesBO03f1y6ZG',
    'Member'
)
ON CONFLICT (email) DO NOTHING;

-- SAMPLE PROJECTS
INSERT INTO projects (title, description, created_by)
VALUES
(
    'E-Commerce Platform',
    'Build a full-stack e-commerce platform with React and Node.js',
    1
),
(
    'Mobile Banking App',
    'Design and develop a secure mobile banking application',
    1
),
(
    'AI Chatbot System',
    'Create an intelligent chatbot for customer support',
    1
);

-- PROJECT MEMBERS
INSERT INTO project_members (project_id, user_id)
VALUES
(1,1),
(1,2),
(1,3),

(2,1),
(2,2),

(3,1),
(3,3)

ON CONFLICT DO NOTHING;

-- TASKS
INSERT INTO tasks
(
    title,
    description,
    status,
    priority,
    due_date,
    assigned_to,
    project_id,
    created_by
)
VALUES

(
    'Design product catalog UI',
    'Create responsive product listing and detail pages',
    'Completed',
    'High',
    CURRENT_DATE - INTERVAL '3 days',
    2,
    1,
    1
),

(
    'Setup payment gateway',
    'Integrate Stripe payment processing',
    'In Progress',
    'High',
    CURRENT_DATE + INTERVAL '5 days',
    1,
    1,
    1
),

(
    'Build shopping cart API',
    'REST API for cart add/remove/update operations',
    'Todo',
    'Medium',
    CURRENT_DATE + INTERVAL '10 days',
    3,
    1,
    1
),

(
    'Write unit tests',
    'Add Jest tests for all API endpoints',
    'Todo',
    'Low',
    CURRENT_DATE + INTERVAL '14 days',
    2,
    1,
    1
),

(
    'Create login screen',
    'Implement biometric and PIN authentication',
    'Completed',
    'High',
    CURRENT_DATE - INTERVAL '7 days',
    2,
    2,
    1
),

(
    'Build transaction history',
    'Display paginated transaction list with filters',
    'In Progress',
    'Medium',
    CURRENT_DATE + INTERVAL '3 days',
    1,
    2,
    1
),

(
    'Fund transfer module',
    'Implement secure P2P and bank transfer features',
    'Todo',
    'High',
    CURRENT_DATE + INTERVAL '7 days',
    2,
    2,
    1
),

(
    'Train NLP model',
    'Fine-tune language model on customer support data',
    'In Progress',
    'High',
    CURRENT_DATE - INTERVAL '1 day',
    3,
    3,
    1
),

(
    'Design chat interface',
    'Build responsive chat widget with typing indicators',
    'Completed',
    'Medium',
    CURRENT_DATE - INTERVAL '5 days',
    1,
    3,
    1
),

(
    'Setup webhook integrations',
    'Connect chatbot to Slack, Teams, and email',
    'Todo',
    'Low',
    CURRENT_DATE + INTERVAL '12 days',
    3,
    3,
    1
),

(
    'Performance load testing',
    'Benchmark chatbot under 10k concurrent users',
    'Todo',
    'Medium',
    CURRENT_DATE + INTERVAL '20 days',
    1,
    3,
    1
);