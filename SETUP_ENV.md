# Quick Environment Setup

## Step 1: Create Server Environment File

Create a file named `.env` in the `server` directory with the following content:

```env
LEMONFOX_API_KEY=VY1c9L5WommkQRzryoKZLgU7zBJg1sPl
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

**On Windows (PowerShell):**
```powershell
cd server
@"
LEMONFOX_API_KEY=VY1c9L5WommkQRzryoKZLgU7zBJg1sPl
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
"@ | Out-File -FilePath .env -Encoding utf8
```

**On Mac/Linux:**
```bash
cd server
cat > .env << EOF
LEMONFOX_API_KEY=VY1c9L5WommkQRzryoKZLgU7zBJg1sPl
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
EOF
```

## Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

## Step 3: Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Step 4: Start the Frontend (in a new terminal)

```bash
cd ..  # Go back to project root
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## For Netlify Deployment

Add these environment variables in Netlify Dashboard:
- `LEMONFOX_API_KEY` = `VY1c9L5WommkQRzryoKZLgU7zBJg1sPl`
- `JWT_SECRET` = (generate a strong random string)

