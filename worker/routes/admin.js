import { Router } from 'itty-router';
import { DatabaseService } from '../services/database.js';
import { requireAdmin, corsHeaders } from '../middleware/auth.js';

const router = Router();

router.get('/users', requireAdmin(async (request, env) => {
  try {
    const db = new DatabaseService(env.DB);
    const users = await db.getAllUsers();
    
    return new Response(JSON.stringify(users), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.get('/stats', requireAdmin(async (request, env) => {
  try {
    const db = new DatabaseService(env.DB);
    const stats = await db.getSystemStats();
    
    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch statistics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

export default router;

router.put('/make-admin/:userId', requireAdmin(async (request, env) => {
  try {
    const userId = request.params.userId;
    const db = new DatabaseService(env.DB);
    
    // Update user to admin
    const stmt = env.DB.prepare('UPDATE users SET isAdmin = 1 WHERE id = ?');
    await stmt.bind(userId).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Make admin error:', error);
    return new Response(JSON.stringify({ error: 'Failed to make user admin' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.get('/data', requireAdmin(async (request, env) => {
  try {
    const db = new DatabaseService(env.DB);
    const users = await db.getAllUsers();
    
    return new Response(JSON.stringify({ users }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get admin data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch admin data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.post('/users', requireAdmin(async (request, env) => {
  try {
    const { username, password } = await request.json();
    
    // Implementation for adding users by admin
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.delete('/users/:id', requireAdmin(async (request, env) => {
  try {
    const userId = request.params.id;
    
    // Implementation for deleting users
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.put('/users/:id/status', requireAdmin(async (request, env) => {
  try {
    const userId = request.params.id;
    const { status } = await request.json();
    
    // Implementation for updating user status
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update user status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.put('/users/:id/username', requireAdmin(async (request, env) => {
  try {
    const userId = request.params.id;
    const { username } = await request.json();
    
    if (!username || !username.trim()) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const db = new DatabaseService(env.DB);
    
    // Check if username already exists
    const existingUser = await db.db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(username.trim(), userId).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Username already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Update username
    await db.db.prepare('UPDATE users SET username = ? WHERE id = ?').bind(username.trim(), userId).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Update username error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update username' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));
