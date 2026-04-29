# RadioBiz Pro - Next.js Player

Modern React/Next.js implementation of the RadioBiz Pro player client.

## Features

- 🎵 Audio streaming from Google Drive or radio URLs
- 📻 Configurable jingle/spot scheduling with fade effects
- 🔒 PIN-based authentication
- 📱 Responsive design with Tailwind CSS
- 🔧 Firebase integration for real-time client configuration
- 📡 Remote command support from dashboard

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google Drive API

The project uses Google Drive API to fetch and stream audio files. You need to set up a Google Cloud project:

1. Create a Google Cloud project
2. Enable the Google Drive API
3. Create a service account and download the JSON key
4. Extract the credentials from the JSON key into `.env.local`:

```bash
cp .env.local.example .env.local
```

Then populate `.env.local` with your Google Cloud credentials:

```env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
```

### 3. Firebase Configuration

The Firebase configuration is already set in `lib/firebase.ts` with the ProRadioBiz project. No additional setup needed for Firebase itself.

### 4. Development

```bash
npm run dev
```

Open http://localhost:3000/player/c_clientId in your browser.

## Architecture

### Hooks

- **useAudioPlayer**: Complete audio playback logic
  - Music and ad element management
  - Fade in/out effects
  - Volume control
  - Progress tracking
  - Jingle scheduling and synchronization
  - Wake lock support

### Components

- **PlayerPage**: PIN authentication and player mounting
- **PlayerContent**: Main player UI with controls
  - Play/pause button
  - Volume slider
  - Real-time ad countdown
  - Stats display

### API Routes

- `GET /api/drive/[folderId]` - List audio files in a Drive folder
- `GET /api/drive/stream/[fileId]` - Stream audio file from Google Drive

## Firebase Integration

### Sessions

When a player connects, it registers a session in Firebase

### Remote Commands

The dashboard can send commands to players via Firebase

### Client Blocking

If a client is marked as blocked in Firebase, the player will pause immediately.

## Deployment

The project is configured for deployment on Vercel.

```bash
npm run build
```

Ensure all environment variables are set in Vercel project settings.
