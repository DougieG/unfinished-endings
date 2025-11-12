# 🚀 Quick Start Guide

Get **Unfinished Endings** running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Step-by-Step Setup

### 1. Supabase Setup (5 min)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize
3. Go to **SQL Editor** and run the migration:
   - Open `supabase/migration.sql` in this repo
   - Copy the entire SQL script
   - Paste into SQL Editor and click **Run**
4. Go to **Storage** and verify the `stories` bucket was created
5. Get your credentials from **Settings → API**:
   - Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - Copy `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 2. Environment Setup (1 min)

Create `.env.local` in the project root:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin (REQUIRED)
ADMIN_PASSWORD=your-secure-password

# App URL (REQUIRED for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: OpenAI (for transcription/keywords)
# OPENAI_API_KEY=sk-...

# Optional: Twilio (leave empty for mock mode)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

### 3. Install & Run (1 min)

Dependencies are already installed. Just run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Seed Sample Data (Optional)

```bash
npm run seed
```

This adds 10 sample stories with placeholders.

## What You Can Do Now

### On the Home Page:

**Left Side (Witness Wall)**
- Click "Pick up a phone" → plays a random story
- Watch shadow puppets animate based on keywords
- Stories won't repeat (last 3 tracked via LRU)

**Right Side (Archive Core)**
- Click "Press 1 to Record" → record your own 2:45 story
- Generate an Archive Card with QR code
- Print or download the card

### Admin Dashboard:

Go to [http://localhost:3000/admin](http://localhost:3000/admin)
- Login with your `ADMIN_PASSWORD`
- View all stories
- Toggle consent, edit keywords, redact transcripts
- Delete stories

### Individual Story Page:

After recording, click the QR code or visit `/story/[id]`
- Play the story
- See transcript (if OpenAI configured)
- Light a virtual candle

## Mock Mode (No Twilio)

The app runs in **mock mode** by default (no Twilio credentials needed):
- Web recording works perfectly
- Random playback works
- IVR simulation available in UI
- Great for development!

## Adding Twilio (Optional)

To enable real phone calls:

1. Get a Twilio account
2. Add credentials to `.env.local`
3. Deploy to Vercel/production
4. Configure Twilio webhooks:
   - Voice: `https://your-domain.com/api/twilio/voice/inbound`
   - Recording Callback: `https://your-domain.com/api/twilio/recording/complete`

## Adding OpenAI (Optional)

To enable transcription + keyword extraction:

1. Get OpenAI API key
2. Add to `.env.local`: `OPENAI_API_KEY=sk-...`
3. Stories will automatically transcribe after recording

## Troubleshooting

**"Cannot connect to Supabase"**
- Check your `.env.local` URLs
- Ensure Supabase project is running
- Verify anon key is correct

**"No stories available"**
- Run `npm run seed` to add sample data
- Or record a story manually

**Audio not playing**
- Check browser permissions for microphone
- Try a different browser (Chrome/Firefox work best)
- Clear browser cache

**Admin login not working**
- Double-check `ADMIN_PASSWORD` in `.env.local`
- Restart dev server after changing env vars

## Next Steps

- Customize colors in `tailwind.config.ts`
- Add your own seed stories in `scripts/seed.ts`
- Configure OpenAI for transcriptions
- Deploy to Vercel (see `README.md`)

## Need Help?

Check the full `README.md` for detailed documentation.
