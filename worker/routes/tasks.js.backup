import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.js';
import { requireAuth, corsHeaders } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(async (request, env) => {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    
    const db = new DatabaseService(env.DB);
    const tasks = await db.getTasksByUserId(request.user.id, projectId);
    
    return new Response(JSON.stringify(tasks), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.post('/', requireAuth(async (request, env) => {
  try {
    const { title, description, priority, dueDate, labels, reminder, recurrence, projectId } = await request.json();
    
    if (!title?.trim()) {
      return new Response(JSON.stringify({ error: 'Task title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const taskData = {
      id: `task-${uuidv4()}`,
      title: title.trim(),
      description: description?.trim() || '',
      completed: false,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      labels: Array.isArray(labels) ? labels : [],
      reminder: reminder || null,
      recurrence: recurrence || null,
      projectId,
      userId: request.user.id
    };
    
    const db = new DatabaseService(env.DB);
    const task = await db.createTask(taskData);
    
    return new Response(JSON.stringify(task), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Create task error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.put('/:id', requireAuth(async (request, env) => {
  try {
    const taskId = request.params.id;
    const updates = await request.json();
    
    // Validate updates
    const allowedFields = ['title', 'description', 'completed', 'priority', 'dueDate', 'labels', 'reminder', 'recurrence'];
    const validUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'title' || key === 'description') {
          validUpdates[key] = typeof value === 'string' ? value.trim() : value;
        } else {
          validUpdates[key] = value;
        }
      }
    }
    
    if (Object.keys(validUpdates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    await db.updateTask(taskId, request.user.id, validUpdates);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Update task error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to update task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

router.delete('/:id', requireAuth(async (request, env) => {
  try {
    const taskId = request.params.id;
    const db = new DatabaseService(env.DB);
    
    await db.deleteTask(taskId, request.user.id);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}));

export default router;