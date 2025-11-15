# How to Run on Localhost

## Quick Start Guide

### Step 1: Install Frontend Dependencies

Open terminal in the project root (`parking-lot` directory):

```bash
npm install
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### Step 3: Create Environment File

Create a `.env` file in the `server` directory with your LemonFox API key:

**Windows (PowerShell):**
```powershell
cd server
@"
LEMONFOX_API_KEY=VY1c9L5WommkQRzryoKZLgU7zBJg1sPl
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
"@ | Out-File -FilePath .env -Encoding utf8
cd ..
```

**Mac/Linux:**
```bash
cd server
cat > .env << EOF
LEMONFOX_API_KEY=VY1c9L5WommkQRzryoKZLgU7zBJg1sPl
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
EOF
cd ..
```

**Or manually create the file:**
1. Navigate to `server` folder
2. Create a new file named `.env`
3. Add the following content:
   ```
   LEMONFOX_API_KEY=VY1c9L5WommkQRzryoKZLgU7zBJg1sPl
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3001
   ```

### Step 4: Run the Application

You have **two options**:

#### Option A: Run Both Servers Together (Recommended)

If you have `concurrently` installed globally, or it's in your dependencies:

```bash
npm run dev:full
```

This will start both frontend and backend simultaneously.

#### Option B: Run Servers Separately (Two Terminals)

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Backend will run on: `http://localhost:3001`

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Step 5: Access the Application

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the login page

## Troubleshooting

### Port Already in Use

If port 3001 is already in use:
- Change `PORT=3001` to another port (e.g., `PORT=3002`) in `server/.env`
- Update `VITE_API_URL` in frontend if needed

### Module Not Found Errors

Make sure you've installed all dependencies:
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### Database Errors

The SQLite database will be created automatically on first run. If you see database errors:
- Make sure the `server` directory has write permissions
- Delete `server/database.sqlite` if it exists and restart the server

### API Key Not Working

- Verify the `.env` file is in the `server` directory (not root)
- Check that the file doesn't have extra spaces or quotes
- Restart the backend server after creating/editing `.env`

## What You Should See

1. **Backend Server Running:**
   ```
   Server running on http://localhost:3001
   ```

2. **Frontend Server Running:**
   ```
   VITE v7.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

3. **In Browser:**
   - Login/Signup page with gradient background
   - After login, you'll see the Text to Voice interface

## Testing the App

1. **Sign Up:** Create a new account
2. **Login:** Use your credentials
3. **Convert Text:** Enter text and click "Convert to Voice"
4. **Check History:** View your conversion history

## Stopping the Servers

- Press `Ctrl + C` in each terminal window
- Or close the terminal windows

