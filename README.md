# Text to Voice Web App

A modern web application with text-to-speech functionality, user authentication, and SQLite database integration. Built with React + Vite for the frontend and Node.js + Express for the backend.

## Features

- 🔐 User Authentication (Signup & Login)
- 🎤 Text-to-Voice conversion using Web Speech API
- 📝 History tracking of converted texts
- 💾 SQLite database for data persistence
- 🚀 Ready for Netlify deployment

## Tech Stack

### Frontend
- React 19
- Vite
- Modern CSS with gradients

### Backend
- Node.js
- Express
- SQLite (better-sqlite3)
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Create environment file:**
   Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:3001/api
   JWT_SECRET=your-secret-key-change-in-production
   ```

### Running Locally

**Option 1: Run frontend and backend separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run server
```

**Option 2: Run both together (requires concurrently):**
```bash
npm install -g concurrently
npm run dev:full
```

- Frontend will run on: `http://localhost:5173`
- Backend will run on: `http://localhost:3001`

## Deployment to Netlify

### Method 1: Using Netlify Functions (Recommended)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard:
     - `JWT_SECRET`: Your secret key for JWT tokens

3. **The Netlify Functions are already configured:**
   - `/api/auth/*` routes to `netlify/functions/auth.js`
   - `/api/text-to-voice/*` routes to `netlify/functions/text-to-voice.js`

### Method 2: Using Separate Backend Server

If you prefer to host the backend separately:

1. Deploy frontend to Netlify
2. Deploy backend to a service like Railway, Render, or Heroku
3. Update `VITE_API_URL` in your `.env` file to point to your backend URL

## Project Structure

```
parking-lot/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── TextToVoice.jsx
│   │   ├── Auth.css
│   │   └── TextToVoice.css
│   ├── api.js
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── database.js
│   ├── auth.js
│   ├── server.js
│   └── package.json
├── netlify/
│   └── functions/
│       ├── auth.js
│       └── text-to-voice.js
├── netlify.toml
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/signup` - Create a new user account
- `POST /api/login` - Login with email and password
- `GET /api/me` - Get current user info (requires auth)

### Text to Voice
- `POST /api/text-to-voice` - Save text for voice conversion (requires auth)
- `GET /api/history` - Get conversion history (requires auth)

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's name
- `created_at` - Timestamp

### Text to Voice History Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `text` - The text that was converted
- `created_at` - Timestamp

## Notes

- The database file (`server/database.sqlite`) will be created automatically on first run
- For production, change the `JWT_SECRET` to a strong, random string
- The text-to-voice feature uses the browser's Web Speech API
- SQLite database is included in the repository for Netlify Functions deployment

## License

MIT
