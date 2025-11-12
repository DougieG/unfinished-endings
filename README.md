# Unfinished Endings

A living archive of loss and memory. An immersive installation connecting phones, stories, and shadow-puppet visuals.

## Overview

**Unfinished Endings** enables people to record personal stories about loss (via phone or web), stores them in a growing archive, plays them back randomly to "witnesses," and generates simple shadow-puppet visuals driven by extracted keywords.

## Features

### MVP (Web, No Twilio Required)
- ✅ Record story (2:45 cap) → save to DB/storage
- ✅ Random playback with LRU anti-repeat + recency bias
- ✅ Archive card generator with claim number + QR to `/story/[id]`
- ✅ Shadow-puppet visual (SVG/Canvas) driven by keywords

### v1 (Telephony + Pipeline)
- ⚙️ Twilio IVR (interior line): "Press 1 to add your tale…"
- ⚙️ Transcription job (Whisper/OpenAI) → keywords extract
- ⚙️ Operator dashboard: review, redact, consent toggle

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Supabase (Postgres + Storage + RLS)
- **Telephony**: Twilio Voice (optional)
- **AI**: OpenAI API (transcription + keyword extraction)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration SQL:

```bash
# Copy the SQL from supabase/migration.sql and run it in the SQL editor
```

3. Create a storage bucket named `stories` with public read access

4. Get your credentials from Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
ADMIN_PASSWORD=your-secure-password

# Twilio (optional - leave empty for mock mode)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_RECORDING_WEBHOOK_SECRET=

# OpenAI (for transcription)
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

**Build settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

### Twilio Webhook Configuration

If using Twilio:

1. Configure your Twilio number's voice webhook to:
   ```
   https://your-domain.vercel.app/api/twilio/voice/inbound
   ```

2. Set recording status callback to:
   ```
   https://your-domain.vercel.app/api/twilio/recording/complete
   ```

## Mock Mode

When `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are not set, the app runs in **mock mode**:
- No actual phone calls
- Web recording works normally
- IVR simulation available in UI

This lets you develop and iterate without Twilio credentials.

## File Structure

```
/app
  /api
    /stories/route.ts                # POST create, GET list
    /stories/random/route.ts         # GET weighted-random
    /twilio/voice/inbound/route.ts   # IVR entry
    /twilio/recording/complete/route.ts
    /transcribe/[id]/route.ts        # Whisper job
    /visual/[id]/route.ts            # Keyword→motif data
    /admin/login/route.ts
    /admin/stories/[id]/route.ts
  /(site)
    page.tsx                         # Home: WitnessWall | ArchiveCore
    layout.tsx
    globals.css
    /story/[id]/page.tsx             # Individual story page
    /admin/page.tsx                  # Admin dashboard
/components
  WitnessWall.tsx                    # Playback interface
  ArchiveCore.tsx                    # Recording interface
  ArchiveCard.tsx                    # QR card generator
  ShadowPuppet.tsx                   # SVG/Canvas visual
  AdminTable.tsx                     # CRUD table
/lib
  supabase.ts                        # DB client
  audio.ts                           # MediaRecorder utils
  random.ts                          # Weighted selection + LRU
  keywords.ts                        # Extraction + motif mapping
  twilio.ts                          # TwiML + signature verify
/supabase
  migration.sql                      # Database schema
```

## API Routes

### Public

- `POST /api/stories` - Upload audio recording
- `GET /api/stories/random` - Get random story (anti-repeat)
- `GET /api/story/[id]` - Get specific story
- `POST /api/twilio/voice/inbound` - Twilio IVR entry
- `POST /api/twilio/recording/complete` - Twilio webhook

### Admin (Password Protected)

- `POST /api/admin/login` - Authenticate
- `PATCH /api/admin/stories/[id]` - Update story (consent, keywords, etc.)
- `DELETE /api/admin/stories/[id]` - Delete story

## Data Model

```sql
stories (
  id uuid primary key
  created_at timestamptz
  source text ('interior' | 'exterior' | 'preload' | 'upload')
  duration_s int
  audio_url text
  transcript text
  keywords jsonb
  visual_url text
  consent boolean
  play_count int
  last_played_at timestamptz
)
```

## Visual Motifs

The shadow puppet generator maps keywords to visual categories:

- **fabric**: sock, thread, cloth → wavering ribbon
- **hand**: hand, touch, finger → articulated hand with curl
- **portal**: window, door, key → rectangular frame with drift
- **bird**: bird, crane, wing → wing flap animation
- **light**: candle, flame → flickering flame
- **nature**: tree, flower, water → swaying branches
- **abstract**: fallback → drifting circles

## Testing

Run random selection tests:

```bash
npm test
```

## TODO / Future Features

- [ ] Audio loudness normalization
- [ ] Profanity/PII redaction toggle
- [ ] Pi light client for exterior phones
- [ ] Tempo ±10% playback control
- [ ] Advanced visual generation (AI-driven)
- [ ] Multi-language support

## Design Principles

**Sacred + Gentle**
- Motion breathes (300–600ms fades, subtle scale 0.98↔1)
- Palette: cardboard (#E8DCC4), soot (#1A1A1A), candle amber (#F4A259), pale teal (#B8D4D4)
- Fonts: Cormorant Garamond (headings), Inter (UI)
- Accessibility: keyboard operable, caption toggle

## License

MIT

## Credits

Built for the immersive installation "Unfinished Endings"
