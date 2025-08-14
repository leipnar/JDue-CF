import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.js';
import { requireAuth, corsHeaders } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(async (request, env) => {
  try {
    const db = new DatabaseService(env.DB);
    const projects = await db.getProjectsByUserId(request.user.id);
    
    return new Response(JSON.stringify(projects), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.post('/', requireAuth(async (request, env) => {
  try {
    const { name, description, color } = await request.json();
    
    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: 'Project name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const projectData = {
      id: `project-${uuidv4()}`,
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#3B82F6',
      userId: request.user.id
    };
    
    const db = new DatabaseService(env.DB);
    const project = await db.createProject(projectData);
    
    return new Response(JSON.stringify(project), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Create project error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.put('/:id', requireAuth(async (request, env) => {
  try {
    const projectId = request.params.id;
    const updates = await request.json();
    
    // Validate updates
    const allowedFields = ['name', 'description', 'color'];
    const validUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        validUpdates[key] = typeof value === 'string' ? value.trim() : value;
      }
    }
    
    if (Object.keys(validUpdates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    await db.updateProject(projectId, request.user.id, validUpdates);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Update project error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to update project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.delete('/:id', requireAuth(async (request, env) => {
  try {
    const projectId = request.params.id;
    const db = new DatabaseService(env.DB);
    
    await db.deleteProject(projectId, request.user.id);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

export default router;
router.put('/:id', requireAuth(async (request, env) => {
  try {
    const projectId = request.params.id;
    const updates = await request.json();
    
    // Validate updates
    const allowedFields = ['name', 'description', 'color'];
    const validUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        validUpdates[key] = typeof value === 'string' ? value.trim() : value;
      }
    }
    
    if (Object.keys(validUpdates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    await db.updateProject(projectId, request.user.id, validUpdates);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Update project error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to update project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.delete('/:id', requireAuth(async (request, env) => {
  try {
    const projectId = request.params.id;
    const db = new DatabaseService(env.DB);
    
    await db.deleteProject(projectId, request.user.id);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.put('/:id', requireAuth(async (request, env) => {
  try {
    const projectId = request.params.id;
    const updates = await request.json();
    
    const allowedFields = ['name', 'description', 'color'];
    const validUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        validUpdates[key] = typeof value === 'string' ? value.trim() : value;
      }
    }
    
    if (Object.keys(validUpdates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    await db.updateProject(projectId, request.user.id, validUpdates);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Update project error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to update project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.delete('/:id', requireAuth(async (request, env) => {
  try {
    const projectId = request.params.id;
    const db = new DatabaseService(env.DB);
    
    await db.deleteProject(projectId, request.user.id);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));
