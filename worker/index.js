import { Router } from 'itty-router';
import { handleCORS, corsHeaders } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import adminRoutes from './routes/admin.js';

const router = Router();

// CORS preflight handling
router.options('*', handleCORS);

// Health check endpoint
router.get('/api/health', () => {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// Auth routes
router.post('/api/auth/login', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/auth', ''), request);
  return authRoutes.handle(newRequest, env, ctx);
});

router.post('/api/auth/register', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/auth', ''), request);
  return authRoutes.handle(newRequest, env, ctx);
});

// Project routes
router.get('/api/projects', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/projects', '/'), request);
  return projectRoutes.handle(newRequest, env, ctx);
});

router.post('/api/projects', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/projects', '/'), request);
  return projectRoutes.handle(newRequest, env, ctx);
});

// Task routes
router.get('/api/tasks', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/tasks', '/'), request);
  return taskRoutes.handle(newRequest, env, ctx);
});

router.post('/api/tasks', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/tasks', '/'), request);
  return taskRoutes.handle(newRequest, env, ctx);
});

// Admin routes
router.get('/api/admin/users', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/admin', ''), request);
  return adminRoutes.handle(newRequest, env, ctx);
});

router.get('/api/admin/stats', (request, env, ctx) => {
  const newRequest = new Request(request.url.replace('/api/admin', ''), request);
  return adminRoutes.handle(newRequest, env, ctx);
});

// 404 handler
router.all('*', () => {
  return new Response(JSON.stringify({ error: 'Route not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

export default {
  async fetch(request, env, ctx) {
    try {
      // Handle the request
      const response = await router.handle(request, env, ctx);
      
      // Add CORS headers to all responses
      if (response) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
      
      return response || new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
