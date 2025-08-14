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
