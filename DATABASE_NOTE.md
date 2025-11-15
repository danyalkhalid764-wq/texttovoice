# Database Configuration for Netlify

## Current Setup: SQLite

The app currently uses **SQLite** (file-based database). 

### Important Limitations in Serverless:

1. **No Database Variables Needed**: SQLite doesn't require connection strings or database environment variables - it's file-based.

2. **Data Persistence Issue**: 
   - In Netlify Functions, SQLite files are stored in `/tmp` directory
   - **Data will be lost** when:
     - Functions are redeployed
     - Functions go idle and restart
     - Netlify clears the `/tmp` directory

3. **Better-SQLite3 Compatibility**:
   - May have issues with native bindings in Lambda
   - Requires compilation for Linux x64 architecture

## Environment Variables You DO Need:

In Netlify Dashboard → Environment Variables, add:

1. **LEMONFOX_API_KEY** = `VY1c9L5WommkQRzryoKZLgU7zBJg1sPl`
2. **JWT_SECRET** = (generate a strong random string)

**You do NOT need database variables for SQLite.**

## For Production (Recommended):

If you need persistent data storage, consider switching to:

### Option 1: Supabase (PostgreSQL) - Recommended
- Free tier available
- Easy to set up
- Works great with serverless

### Option 2: PlanetScale (MySQL)
- Serverless MySQL
- Free tier available

### Option 3: MongoDB Atlas
- NoSQL database
- Free tier available

### Option 4: Netlify Storage (if available)
- Netlify's own storage solution

## Current Behavior:

- ✅ **Development**: Works fine with local SQLite file
- ⚠️ **Netlify**: Will work but data is not persistent
- ✅ **For Testing/Demo**: Current setup is fine
- ❌ **For Production**: Should migrate to cloud database

## If You Want to Keep SQLite:

The current setup will work for:
- Testing and demos
- Low-traffic applications where data loss is acceptable
- Development purposes

But be aware that user data and history will be reset periodically.

