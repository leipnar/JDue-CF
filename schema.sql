-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    passkeys_json TEXT DEFAULT '[]',
    createdAt TEXT DEFAULT (datetime('now')),
    lastLogin TEXT,
    loginAttempts INTEGER DEFAULT 0,
    lastLoginAttempt TEXT
);

-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    userId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    dueDate TEXT,
    labels TEXT DEFAULT '[]',
    reminder TEXT,
    recurrence TEXT,
    projectId TEXT NOT NULL,
    userId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_userId ON projects(userId);
CREATE INDEX idx_tasks_userId ON tasks(userId);
CREATE INDEX idx_tasks_projectId ON tasks(projectId);
