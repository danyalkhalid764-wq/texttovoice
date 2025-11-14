import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const getDb = () => {
  const dbPath = join(__dirname, '../../server/database.sqlite');
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  return db;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Extract the action from the path
  let action = 'text-to-voice';
  const pathParts = event.path.split('/').filter(p => p);
  
  if (pathParts.includes('history')) {
    action = 'history';
  } else if (pathParts.includes('text-to-voice')) {
    action = 'text-to-voice';
  }
  
  // Also check query string
  if (event.queryStringParameters && event.queryStringParameters.action) {
    action = event.queryStringParameters.action;
  }
  
  const db = getDb();

  try {
    // Authenticate user
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

    if (action === 'text-to-voice' && event.httpMethod === 'POST') {
      const { text } = JSON.parse(event.body);

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Text is required' }),
        };
      }

      const stmt = db.prepare('INSERT INTO text_to_voice_history (user_id, text) VALUES (?, ?)');
      stmt.run(decoded.userId, text);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Text ready for voice conversion',
          text: text.trim(),
        }),
      };
    }

    if (action === 'history' && event.httpMethod === 'GET') {
      const stmt = db.prepare('SELECT * FROM text_to_voice_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
      const history = stmt.all(decoded.userId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ history }),
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

