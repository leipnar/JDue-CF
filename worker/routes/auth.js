import { Router } from 'itty-router';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.js';
import { corsHeaders } from '../middleware/auth.js';

const router = Router();

// Password hashing using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

router.post('/login', async (request, env) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Update last login
    await db.updateUserLoginInfo(user.id);
    
    const token = await jwt.sign({
      userId: user.id,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }, env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: Boolean(user.isAdmin)
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

router.post('/register', async (request, env) => {
  try {
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: 'Username, email, and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    const existingUser = await db.getUserByEmail(email);
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const passwordHash = await hashPassword(password);
    const userId = `user-${uuidv4()}`;
    
    const userData = {
      id: userId,
      username,
      email,
      passwordHash,
      isAdmin: 0,
      status: 'active',
      passkeys_json: '[]',
      createdAt: new Date().toISOString()
    };
    
    await db.createUser(userData);
    
    // Create default project for new user
    const defaultProject = {
      id: `project-${uuidv4()}`,
      name: 'My First Project',
      description: 'Welcome to JDue! Start organizing your tasks here.',
      color: '#3B82F6',
      userId: userId
    };
    
    await db.createProject(defaultProject);
    
    const token = await jwt.sign({
      userId: userId,
      email: email,
      isAdmin: false,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }, env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      token,
      user: {
        id: userId,
        username,
        email,
        isAdmin: false
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export default router;
