// worker/routes/admin.js

export default async function handleAdminRoutes(request, env) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  // Remove 'api' and 'admin' from path segments
  const adminPath = pathSegments.slice(2).join('/');
  
  try {
    // Simple auth check - get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For now, we'll assume the token is valid if present
    // In production, you'd verify the JWT token here
    const token = authHeader.substring(7);
    
    // Get database connection
    const db = env.DB;

    switch (request.method) {
      case 'GET':
        return handleAdminGet(adminPath, db);
      case 'POST':
        return handleAdminPost(adminPath, request, db);
      case 'PUT':
        return handleAdminPut(adminPath, request, db);
      case 'DELETE':
        return handleAdminDelete(adminPath, request, db);
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Admin route error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAdminGet(path, db) {
  const pathParts = path.split('/');

  switch (pathParts[0]) {
    case 'users':
      return getUsersList(db);
    case 'stats':
      return getAdminStats(db);
    case 'data':
      return getAdminData(db);
    default:
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

async function handleAdminPost(path, request, db) {
  const pathParts = path.split('/');
  
  if (pathParts.length >= 3 && pathParts[0] === 'users') {
    const userId = parseInt(pathParts[1]);
    const action = pathParts[2];
    
    return handleUserAction(userId, action, db);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleAdminPut(path, request, db) {
  const pathParts = path.split('/');
  
  if (pathParts.length >= 3 && pathParts[0] === 'users') {
    const userId = parseInt(pathParts[1]);
    const field = pathParts[2];
    
    if (field === 'username') {
      return updateUsername(userId, request, db);
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleAdminDelete(path, request, db) {
  const pathParts = path.split('/');
  
  if (pathParts.length >= 2 && pathParts[0] === 'users') {
    const userId = parseInt(pathParts[1]);
    return deleteUser(userId, db);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getUsersList(db) {
  try {
    const users = await db.prepare(`
      SELECT 
        id, username, email, isActive, isAdmin, 
        createdAt, lastLoginAt
      FROM users 
      ORDER BY createdAt DESC
    `).all();

    return new Response(JSON.stringify({
      success: true,
      data: users.results || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch users'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getAdminStats(db) {
  try {
    const [totalUsers, activeUsers, totalTasks, totalProjects] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM users').first(),
      db.prepare('SELECT COUNT(*) as count FROM users WHERE isActive = 1').first(),
      db.prepare('SELECT COUNT(*) as count FROM tasks').first(),
      db.prepare('SELECT COUNT(*) as count FROM projects').first()
    ]);

    return new Response(JSON.stringify({
      success: true,
      data: {
        totalUsers: totalUsers.count || 0,
        activeUsers: activeUsers.count || 0,
        totalTasks: totalTasks.count || 0,
        totalProjects: totalProjects.count || 0
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch statistics'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getAdminData(db) {
  try {
    const [usersResponse, statsResponse] = await Promise.all([
      getUsersList(db),
      getAdminStats(db)
    ]);

    const usersData = await usersResponse.json();
    const statsData = await statsResponse.json();

    return new Response(JSON.stringify({
      success: true,
      data: {
        users: usersData.data || [],
        stats: statsData.data || {}
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch admin data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleUserAction(userId, action, db) {
  try {
    let query = '';
    let params = [userId];

    switch (action) {
      case 'activate':
        query = 'UPDATE users SET isActive = 1 WHERE id = ?';
        break;
      case 'deactivate':
        query = 'UPDATE users SET isActive = 0 WHERE id = ?';
        break;
      case 'ban':
        query = 'UPDATE users SET isActive = 0 WHERE id = ?';
        break;
      case 'unban':
        query = 'UPDATE users SET isActive = 1 WHERE id = ?';
        break;
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    const result = await db.prepare(query).bind(...params).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `User ${action} successful`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error performing user action ${action}:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: `Failed to ${action} user`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateUsername(userId, request, db) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Valid username is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const trimmedUsername = username.trim();

    // Check if username is already taken by another user
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE username = ? AND id != ?'
    ).bind(trimmedUsername, userId).first();

    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username is already taken'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the username
    const result = await db.prepare(
      'UPDATE users SET username = ? WHERE id = ?'
    ).bind(trimmedUsername, userId).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Username updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update username'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteUser(userId, db) {
  try {
    // Start a transaction to delete user and related data
    const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
    const deleteTasksQuery = 'DELETE FROM tasks WHERE userId = ?';
    const deleteProjectsQuery = 'DELETE FROM projects WHERE userId = ?';

    // Execute deletions in order (tasks first, then projects, then user)
    await db.prepare(deleteTasksQuery).bind(userId).run();
    await db.prepare(deleteProjectsQuery).bind(userId).run();
    const result = await db.prepare(deleteUserQuery).bind(userId).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'User deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete user'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}