export class DatabaseService {
  constructor(db) {
    this.db = db;
  }

  // User operations
  async getUserByEmail(email) {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE email = ? AND status = "active"');
      const result = await stmt.bind(email).first();
      return result;
    } catch (error) {
      console.error('Database error in getUserByEmail:', error);
      throw new Error('Database operation failed');
    }
  }

  async getUserById(id) {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE id = ? AND status = "active"');
      const result = await stmt.bind(id).first();
      return result;
    } catch (error) {
      console.error('Database error in getUserById:', error);
      throw new Error('Database operation failed');
    }
  }

  async createUser(userData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (id, username, email, passwordHash, isAdmin, status, passkeys_json, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        userData.id,
        userData.username,
        userData.email,
        userData.passwordHash,
        userData.isAdmin || 0,
        userData.status || 'active',
        userData.passkeys_json || '[]',
        userData.createdAt || new Date().toISOString()
      ).run();
      
      return userData;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUserLoginInfo(userId) {
    try {
      const stmt = this.db.prepare(`
        UPDATE users 
        SET lastLogin = ?, loginAttempts = 0 
        WHERE id = ?
      `);
      await stmt.bind(new Date().toISOString(), userId).run();
    } catch (error) {
      console.error('Database error in updateUserLoginInfo:', error);
    }
  }

  // Project operations
  async getProjectsByUserId(userId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC');
      const result = await stmt.bind(userId).all();
      return result.results || [];
    } catch (error) {
      console.error('Database error in getProjectsByUserId:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  async createProject(projectData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO projects (id, name, description, color, userId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const now = new Date().toISOString();
      await stmt.bind(
        projectData.id,
        projectData.name,
        projectData.description || '',
        projectData.color || '#3B82F6',
        projectData.userId,
        now,
        now
      ).run();
      
      return { ...projectData, createdAt: now, updatedAt: now };
    } catch (error) {
      console.error('Database error in createProject:', error);
      throw new Error('Failed to create project');
    }
  }

  async updateProject(projectId, userId, updates) {
    try {
      const setParts = [];
      const values = [];
      
      Object.entries(updates).forEach(([key, value]) => {
        if (['name', 'description', 'color'].includes(key)) {
          setParts.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      if (setParts.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      setParts.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(projectId);
      values.push(userId);
      
      const stmt = this.db.prepare(`
        UPDATE projects 
        SET ${setParts.join(', ')} 
        WHERE id = ? AND userId = ?
      `);
      
      const result = await stmt.bind(...values).run();
      
      if (result.changes === 0) {
        throw new Error('Project not found or access denied');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Database error in updateProject:', error);
      throw new Error('Failed to update project');
    }
  }

  async deleteProject(projectId, userId) {
    try {
      // First delete all tasks in the project
      const deleteTasksStmt = this.db.prepare('DELETE FROM tasks WHERE projectId = ? AND userId = ?');
      await deleteTasksStmt.bind(projectId, userId).run();
      
      // Then delete the project
      const deleteProjectStmt = this.db.prepare('DELETE FROM projects WHERE id = ? AND userId = ?');
      const result = await deleteProjectStmt.bind(projectId, userId).run();
      
      if (result.changes === 0) {
        throw new Error('Project not found or access denied');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Database error in deleteProject:', error);
      throw new Error('Failed to delete project');
    }
  }

  // Task operations
  async getTasksByUserId(userId, projectId = null) {
    try {
      let query = 'SELECT * FROM tasks WHERE userId = ?';
      let params = [userId];
      
      if (projectId) {
        query += ' AND projectId = ?';
        params.push(projectId);
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const stmt = this.db.prepare(query);
      const result = await stmt.bind(...params).all();
      
      // Parse JSON fields and convert integers to booleans
      return (result.results || []).map(task => ({
        ...task,
        completed: Boolean(task.completed),
        labels: JSON.parse(task.labels || '[]'),
        recurrence: task.recurrence ? JSON.parse(task.recurrence) : null
      }));
    } catch (error) {
      console.error('Database error in getTasksByUserId:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async createTask(taskData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO tasks (id, title, description, completed, priority, dueDate, labels, reminder, recurrence, projectId, userId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const now = new Date().toISOString();
      await stmt.bind(
        taskData.id,
        taskData.title,
        taskData.description || '',
        taskData.completed ? 1 : 0,
        taskData.priority || 'medium',
        taskData.dueDate || null,
        JSON.stringify(taskData.labels || []),
        taskData.reminder || null,
        taskData.recurrence ? JSON.stringify(taskData.recurrence) : null,
        taskData.projectId,
        taskData.userId,
        now,
        now
      ).run();
      
      return {
        ...taskData,
        completed: Boolean(taskData.completed),
        labels: taskData.labels || [],
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Database error in createTask:', error);
      throw new Error('Failed to create task');
    }
  }

  async updateTask(taskId, userId, updates) {
    try {
      const setParts = [];
      const values = [];
      
      Object.entries(updates).forEach(([key, value]) => {
        if (['title', 'description', 'priority', 'dueDate', 'reminder'].includes(key)) {
          setParts.push(`${key} = ?`);
          values.push(value);
        } else if (key === 'completed') {
          setParts.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else if (key === 'labels') {
          setParts.push(`${key} = ?`);
          values.push(JSON.stringify(value || []));
        } else if (key === 'recurrence') {
          setParts.push(`${key} = ?`);
          values.push(value ? JSON.stringify(value) : null);
        }
      });
      
      if (setParts.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      setParts.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(taskId);
      values.push(userId);
      
      const stmt = this.db.prepare(`
        UPDATE tasks 
        SET ${setParts.join(', ')} 
        WHERE id = ? AND userId = ?
      `);
      
      const result = await stmt.bind(...values).run();
      
      if (result.changes === 0) {
        throw new Error('Task not found or access denied');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Database error in updateTask:', error);
      throw new Error('Failed to update task');
    }
  }

  async deleteTask(taskId, userId) {
    try {
      const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?');
      const result = await stmt.bind(taskId, userId).run();
      
      if (result.changes === 0) {
        throw new Error('Task not found or access denied');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Database error in deleteTask:', error);
      throw new Error('Failed to delete task');
    }
  }

  // Admin operations
  async getAllUsers() {
    try {
      const stmt = this.db.prepare('SELECT id, username, email, isAdmin, status, createdAt, lastLogin FROM users ORDER BY createdAt DESC');
      const result = await stmt.all();
      return result.results || [];
    } catch (error) {
      console.error('Database error in getAllUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getSystemStats() {
    try {
      const userCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
      const projectCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM projects');
      const taskCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM tasks');
      
      const [userCount, projectCount, taskCount] = await Promise.all([
        userCountStmt.first(),
        projectCountStmt.first(),
        taskCountStmt.first()
      ]);
      
      return {
        totalUsers: userCount.count,
        totalProjects: projectCount.count,
        totalTasks: taskCount.count
      };
    } catch (error) {
      console.error('Database error in getSystemStats:', error);
      throw new Error('Failed to fetch system stats');
    }
  }
}