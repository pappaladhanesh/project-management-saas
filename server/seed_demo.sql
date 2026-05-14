-- Insert Admin Demo User if not exists
INSERT INTO users (name, email, password, role)
SELECT 'Admin Demo', 'admin@test.com', '$2b$10$HfCrI.cJO3b9/lxMfPwn1eSJDdbHzX0V7rUJj0dxUiEgK95i17Wwu', 'Admin'
WHERE NOT EXISTS (
    SELECT id FROM users WHERE email = 'admin@test.com'
);

-- Insert Member Demo User if not exists
INSERT INTO users (name, email, password, role)
SELECT 'Member Demo', 'member@test.com', '$2b$10$HfCrI.cJO3b9/lxMfPwn1eSJDdbHzX0V7rUJj0dxUiEgK95i17Wwu', 'Member'
WHERE NOT EXISTS (
    SELECT id FROM users WHERE email = 'member@test.com'
);
