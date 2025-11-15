# LemonFox API Integration Setup

## Environment Variables

### Local Development

1. **Create `.env` file in the `server` directory:**
   ```bash
   cd server
   touch .env
   ```

2. **Add your LemonFox API key:**
   ```
   LEMONFOX_API_KEY=VY1c9L5WommkQRzryoKZLgU7zBJg1sPl
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3001
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

### Netlify Deployment

1. **Go to Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**

2. **Add these environment variables:**
   - `LEMONFOX_API_KEY` = `VY1c9L5WommkQRzryoKZLgU7zBJg1sPl`
   - `JWT_SECRET` = (generate a strong secret key)

3. **Redeploy your site** after adding environment variables

## API Endpoint Configuration

The current implementation uses:
- **Endpoint**: `https://api.lemonfox.ai/v1/tts`
- **Method**: POST
- **Authentication**: Bearer token in Authorization header

**Note**: If LemonFox uses a different endpoint or request format, you may need to adjust:

1. **Endpoint URL** in:
   - `server/server.js` (line ~146)
   - `netlify/functions/text-to-voice.js` (line ~81)

2. **Request body format** - adjust parameters like:
   - `voice`: voice selection
   - `speed`: speech speed
   - `format`: audio format (mp3, wav, etc.)

## Testing

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl -X POST http://localhost:3001/api/text-to-voice \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello, this is a test"}'
   ```

## Troubleshooting

### API Key Not Working
- Verify the API key is correct
- Check if the API key has proper permissions
- Review LemonFox API documentation for correct endpoint and format

### Audio Not Playing
- Check browser console for errors
- Verify the audio format is supported by the browser
- Check if CORS is properly configured

### Fallback to Web Speech API
- If LemonFox API fails, the app will automatically fallback to browser's Web Speech API
- This ensures the app continues to work even if the API is unavailable

## API Response Format

The backend returns:
```json
{
  "message": "Text converted to voice successfully",
  "audio": "data:audio/mpeg;base64,...",
  "text": "Your text here"
}
```

The frontend uses the `audio` field (base64 encoded) to play the audio.

