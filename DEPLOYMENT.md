# Deployment Guide for Netlify

## Quick Deploy Steps

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy to Netlify:**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables:
     - `JWT_SECRET`: A strong random string (e.g., use `openssl rand -base64 32`)

## Important Notes for Netlify

### Database Storage
- The SQLite database file (`server/database.sqlite`) will be created in the Netlify Functions environment
- **Note**: SQLite on serverless functions has limitations. For production, consider:
  - Using a cloud database (PostgreSQL, MySQL)
  - Using Netlify's built-in storage
  - Using an external database service

### Environment Variables
Set these in Netlify Dashboard → Site settings → Environment variables:
- `JWT_SECRET`: Your secret key for JWT tokens

### Function Configuration
The Netlify Functions are located in `netlify/functions/`:
- `auth.js` - Handles authentication (signup, login, me)
- `text-to-voice.js` - Handles text-to-voice and history

### API Endpoints on Netlify
After deployment, your API will be available at:
- `https://your-site.netlify.app/api/auth/signup`
- `https://your-site.netlify.app/api/auth/login`
- `https://your-site.netlify.app/api/auth/me`
- `https://your-site.netlify.app/api/text-to-voice`
- `https://your-site.netlify.app/api/history`

## Alternative: Separate Backend Deployment

If you prefer to host the backend separately:

1. **Deploy Backend** to Railway, Render, or Heroku:
   ```bash
   cd server
   # Follow your hosting platform's instructions
   ```

2. **Update Frontend API URL:**
   - Set `VITE_API_URL` environment variable in Netlify to your backend URL
   - Example: `VITE_API_URL=https://your-backend.railway.app/api`

3. **Deploy Frontend** to Netlify as usual

## Troubleshooting

### Functions Not Working
- Check Netlify Functions logs in the dashboard
- Ensure `better-sqlite3` is compatible with Netlify's Node.js version
- Check that database file path is correct

### CORS Issues
- CORS headers are already configured in the functions
- If issues persist, check browser console for specific errors

### Database Issues
- SQLite on serverless may have write limitations
- Consider migrating to a cloud database for production use

