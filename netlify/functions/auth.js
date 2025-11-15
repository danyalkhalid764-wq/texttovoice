import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database
// For Netlify Functions, use /tmp directory (writable but ephemeral)
// Note: Data will be lost between deployments. For production, use a cloud database.
const getDb = () => {
  // Use /tmp in serverless environment, otherwise use server directory
  const dbPath = process.env.NETLIFY 
    ? '/tmp/database.sqlite'
    : join(__dirname, '../../server/database.sqlite');
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  return db;
};

// Initialize database tables
const initDb = () => {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS text_to_voice_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  return db;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Extract the action from the path or query string
  // Check if path contains the action (e.g., /api/auth/signup)
  let action = 'me';
  const pathParts = event.path.split('/').filter(p => p);
  
  // Check for action in path
  if (pathParts.includes('signup')) {
    action = 'signup';
  } else if (pathParts.includes('login')) {
    action = 'login';
  } else if (pathParts.includes('me')) {
    action = 'me';
  }
  
  // Also check query string
  if (event.queryStringParameters && event.queryStringParameters.action) {
    action = event.queryStringParameters.action;
  }
  
  const db = initDb();

  try {
    if (action === 'signup' && event.httpMethod === 'POST') {
      const { email, password, name } = JSON.parse(event.body);

      if (!email || !password || !name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email, password, and name are required' }),
        };
      }

      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'User with this email already exists' }),
        };
      }

      const hashedPassword = await hashPassword(password);
      const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);
      const token = generateToken(result.lastInsertRowid);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'User created successfully',
          token,
          user: { id: result.lastInsertRowid, email, name },
        }),
      };
    }

    if (action === 'login' && event.httpMethod === 'POST') {
      const { email, password } = JSON.parse(event.body);

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password are required' }),
        };
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid email or password' }),
        };
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid email or password' }),
        };
      }

      const token = generateToken(user.id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Login successful',
          token,
          user: { id: user.id, email: user.email, name: user.name },
        }),
      };
    }

    if (path === 'me' && event.httpMethod === 'GET') {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Access token required' }),
        };
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token' }),
        };
      }

      const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(decoded.userId);
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

