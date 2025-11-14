# GitHub Repository Setup Guide

## Step 1: Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `text-to-voice-app` (or any name you prefer)
   - **Description**: "Text to Voice Web App with Authentication and SQLite"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Initialize Git and Push Code

Open your terminal in the project directory (`parking-lot`) and run:

```bash
# Initialize git repository (if not already initialized)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Text to Voice app with authentication"

# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Connect to Netlify

1. Go to [Netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"** and authorize Netlify
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy site"**

## Step 4: Add Environment Variables in Netlify

1. Go to your site settings in Netlify
2. Navigate to **"Environment variables"**
3. Add:
   - **Key**: `JWT_SECRET`
   - **Value**: Generate a strong secret (you can use: `openssl rand -base64 32`)

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create text-to-voice-app --public --source=. --remote=origin --push
```

## Repository Name Suggestions

- `text-to-voice-app`
- `voice-converter-app`
- `tts-web-app`
- `text-speech-app`

Choose any name you like!

