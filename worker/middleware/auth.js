import jwt from '@tsndr/cloudflare-worker-jwt';
import { DatabaseService } from '../services/database.js';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for now
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}

export async function authenticateUser(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const isValid = await jwt.verify(token, env.JWT_SECRET);
    if (!isValid) {
      throw new Error('Invalid token');
    }
    
    const decoded = jwt.decode(token);
    const db = new DatabaseService(env.DB);
    const user = await db.getUserById(decoded.payload.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function requireAuth(handler) {
  return async (request, env, ctx) => {
    try {
      const user = await authenticateUser(request, env);
      request.user = user;
      return await handler(request, env, ctx);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  };
}

export function requireAdmin(handler) {
  return async (request, env, ctx) => {
    try {
      const user = await authenticateUser(request, env);
      
      if (!user.isAdmin) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      request.user = user;
      return await handler(request, env, ctx);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  };
}
