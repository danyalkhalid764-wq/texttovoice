import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import db from './database.js';
import { createUser, getUserByEmail, comparePassword, generateToken, verifyToken } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const userId = await createUser(email, password, name);
    const token = generateToken(userId);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        email,
        name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint
app.get('/api/me', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?');
    const user = stmt.get(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Text to voice endpoint with LemonFox API
app.post('/api/text-to-voice', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const lemonfoxApiKey = process.env.LEMONFOX_API_KEY;
    if (!lemonfoxApiKey) {
      return res.status(500).json({ error: 'LemonFox API key not configured' });
    }

    // Store in history
    const stmt = db.prepare('INSERT INTO text_to_voice_history (user_id, text) VALUES (?, ?)');
    stmt.run(req.userId, text);

    try {
      // Call LemonFox API
      // Adjust the endpoint URL based on LemonFox's actual API documentation
      const lemonfoxResponse = await axios.post(
        'https://api.lemonfox.ai/v1/tts', // Common endpoint pattern - adjust if needed
        {
          text: text.trim(),
          voice: 'default', // Adjust voice parameter as needed
          speed: 1.0,
          format: 'mp3'
        },
        {
          headers: {
            'Authorization': `Bearer ${lemonfoxApiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer' // For audio binary data
        }
      );

      // Convert audio buffer to base64 for frontend
      const audioBase64 = Buffer.from(lemonfoxResponse.data).toString('base64');
      const audioMimeType = lemonfoxResponse.headers['content-type'] || 'audio/mpeg';

      res.json({
        message: 'Text converted to voice successfully',
        audio: `data:${audioMimeType};base64,${audioBase64}`,
        text: text.trim()
      });
    } catch (apiError) {
      console.error('LemonFox API error:', apiError.response?.data || apiError.message);
      
      // If API call fails, return error but still save to history
      res.status(500).json({
        error: 'Failed to convert text to voice',
        details: apiError.response?.data?.message || apiError.message,
        // Fallback: return text so frontend can use Web Speech API as backup
        text: text.trim(),
        useFallback: true
      });
    }
  } catch (error) {
    console.error('Text to voice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get text-to-voice history
app.get('/api/history', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM text_to_voice_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
    const history = stmt.all(req.userId);
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

