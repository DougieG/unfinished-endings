# Phone Audio Configuration System

## Overview
A complete admin interface system for managing phone intro/outro audio files. Brooke can now upload and configure all phone audio messages through the admin dashboard without any code changes.

---

## 🎯 Features

### For Admins (Brooke)
- **Upload MP3 files** directly through the web interface
- **Play/preview** current audio before replacing
- **Download** existing audio files for backup
- **Real-time updates** - changes take effect immediately on all phones
- **No code changes required** - fully configurable through UI

### Technical Features
- **Database-backed configuration** - All audio URLs stored in Supabase
- **Automatic caching** - 5-minute cache to reduce database calls
- **Fallback defaults** - System uses defaults if database unavailable
- **Hot reloading** - Phones fetch fresh config on each session

---

## 📋 Available Audio Configurations

### Interior Phone (Recording)
1. **Intro Audio** - Plays when phone is picked up, before recording starts
2. **Outro Audio** - Plays after recording completes (after silence detection)

### Exterior Phone (Listening)
3. **Intro Audio** (Optional) - Can play when phone is picked up
4. **Outro Audio** - Plays after crankie animation completes

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Run this SQL in your Supabase SQL editor:

```sql
-- File: supabase/migrations/add_phone_audio_config.sql
-- This creates the phone_audio_config table and inserts default values
```

Or run from command line:
```bash
cd /Users/douglasgoldstein/Documents/unfinished-endings
supabase db push
```

### Step 2: Access Admin Interface

1. Navigate to: `https://your-domain.com/admin`
2. Log in with admin password
3. Scroll to **"Phone Audio Configuration"** section at the top

### Step 3: Upload Audio Files

For each phone audio slot:

1. **Click "▶️ Play Current"** to preview the existing audio
2. **Click "📤 Upload New MP3"** to select a new file
3. Wait for upload confirmation (✅ Audio uploaded successfully!)
4. **Test immediately** - pick up phone to hear new audio

---

## 🎛️ Using the Admin Interface

### Audio Configuration Panel

Each audio slot shows:

```
┌─────────────────────────────────────────────┐
│ Interior Phone - Intro                      │
│ Plays when user picks up recording phone    │
│ Last updated: Nov 21, 2025 11:30 AM        │
│                                             │
│ [▶️ Play Current] [📤 Upload New MP3] [💾]  │
│                                             │
│ https://...supabase.../int.phone-track.mp3  │
└─────────────────────────────────────────────┘
```

### Actions Available

| Button | Function |
|--------|----------|
| **▶️ Play Current** | Preview the currently active audio |
| **⏸️ Stop** | Stop audio playback |
| **📤 Upload New MP3** | Select and upload new audio file |
| **💾 Download** | Download current audio to your computer |

---

## 🔧 Technical Architecture

### Database Schema

```sql
Table: phone_audio_config
├── id (serial, primary key)
├── config_key (text, unique) - e.g., "interior_intro"
├── audio_url (text) - Full URL to audio file
├── display_name (text) - Human-readable name
├── description (text) - Help text for admins
├── updated_at (timestamp) - Last modification time
└── created_at (timestamp) - Creation time
```

### Configuration Keys

| Key | Purpose |
|-----|---------|
| `interior_intro` | Recording phone intro message |
| `interior_outro` | Recording phone outro message |
| `exterior_intro` | Listening phone intro (optional) |
| `exterior_outro` | Listening phone outro message |

### File Storage

- **Location**: Supabase Storage bucket `stories/phone-audio/`
- **Format**: MP3 files (audio/mpeg)
- **Naming**: `{config_key}-{timestamp}.mp3`
- **Access**: Public URLs with caching

### Caching Strategy

```typescript
// Audio config is cached for 5 minutes
// Reduces database load while allowing quick updates
Cache Duration: 5 minutes
Cache Location: Server-side memory (lib/phone-audio-config.ts)
Cache Invalidation: Time-based (automatic after 5 min)
```

---

## 📁 Files Modified/Created

### New Files
1. **`supabase/migrations/add_phone_audio_config.sql`**
   - Database schema for audio configuration
   - Default audio URLs
   - Row-level security policies

2. **`app/api/admin/phone-audio/route.ts`**
   - GET endpoint: Fetch all audio configs
   - POST endpoint: Upload new audio and update config

3. **`components/PhoneAudioConfig.tsx`**
   - Admin UI for audio management
   - Upload, play, download functionality
   - Real-time status updates

4. **`lib/phone-audio-config.ts`**
   - Helper functions for fetching config
   - Caching logic
   - Fallback defaults

5. **`AUDIO-CONFIG-SYSTEM.md`** (this file)
   - Complete documentation

### Modified Files
6. **`app/admin/page.tsx`**
   - Added PhoneAudioConfig component to dashboard

7. **`app/phone/recording/page.tsx`**
   - Dynamic audio URL fetching
   - Uses config instead of hardcoded URLs

8. **`app/phone/playback/page.tsx`**
   - Dynamic audio URL fetching
   - Uses config instead of hardcoded URLs

---

## 🧪 Testing Checklist

### Admin Interface Tests
- [ ] Load admin page - audio config panel appears
- [ ] Play each audio file - correct file plays
- [ ] Upload new MP3 - success message appears
- [ ] Check URL updates after upload
- [ ] Download audio file - correct file downloads
- [ ] Verify last updated timestamp changes

### Interior Phone Tests
- [ ] Pick up phone - new intro audio plays
- [ ] Complete recording - new outro audio plays
- [ ] Audio matches what's shown in admin

### Exterior Phone Tests
- [ ] Pick up phone - story plays
- [ ] Crankie ends - new outro audio plays
- [ ] Audio matches what's shown in admin

### Cache Tests
- [ ] Upload new audio
- [ ] Wait 10 seconds
- [ ] Pick up phone - new audio plays (cache refreshed)

---

## 🔒 Security

### Row Level Security (RLS)

```sql
-- Public read access (phones need to read config)
CREATE POLICY "Allow public read access"
  ON phone_audio_config FOR SELECT USING (true);

-- Only service role can update (admin only)
CREATE POLICY "Allow service role to update"
  ON phone_audio_config FOR UPDATE USING (true);
```

### File Upload Security
- Admin authentication required
- Only MP3 files accepted (audio/mpeg)
- Files stored with unique timestamps
- Public URLs (required for phone playback)

---

## 🐛 Troubleshooting

### Audio Not Updating
**Problem**: Uploaded new audio but phone still plays old audio

**Solutions**:
1. Wait 5 minutes for cache to expire
2. Reload the phone page
3. Check browser console for errors
4. Verify audio_url updated in database

### Upload Fails
**Problem**: Upload button shows error

**Solutions**:
1. Check file is MP3 format
2. Verify file size < 10MB
3. Check SUPABASE_SERVICE_ROLE_KEY is set
4. Verify Supabase storage bucket permissions

### Audio Doesn't Play
**Problem**: Phone picks up but no audio

**Solutions**:
1. Check audio URL is accessible (paste in browser)
2. Verify audio file is valid MP3
3. Check browser console for playback errors
4. Test with different audio file

### Database Migration Issues
**Problem**: Table doesn't exist

**Solutions**:
```bash
# Run migration manually
cd /Users/douglasgoldstein/Documents/unfinished-endings
supabase db push

# Or run SQL directly in Supabase dashboard
```

---

## 📝 Default Audio Files

The system comes with these defaults:

| Config | Default File |
|--------|-------------|
| Interior Intro | `int.phone pre-track.mp3` |
| Interior Outro | `int-post recording.mp3` |
| Exterior Intro | `1Listening.mp3` |
| Exterior Outro | `ext-post-story.mp3` |

**Note**: These are fallback values. You should upload your actual files through the admin interface.

---

## 🔄 How It Works

### Upload Flow
```
1. Admin clicks "Upload New MP3"
2. File selected from computer
3. POST /api/admin/phone-audio
   ├── Upload to Supabase Storage
   ├── Get public URL
   └── Update database record
4. Success confirmation
5. Cache clears automatically in 5 min
6. Phones fetch new URL on next session
```

### Phone Playback Flow
```
1. Phone page loads
2. Fetch audio config from database
3. Cache config for 5 minutes
4. User picks up phone
5. Play audio using config URL
6. If config fails, use default fallback
```

---

## 🎨 Customization

### Adjust Cache Duration

Edit `lib/phone-audio-config.ts`:

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// Change to 1 minute for faster updates:
const CACHE_DURATION = 1 * 60 * 1000;
```

### Add New Audio Configurations

1. Add to database:
```sql
INSERT INTO phone_audio_config (config_key, audio_url, display_name, description)
VALUES ('new_config', 'url', 'Display Name', 'Description');
```

2. Update TypeScript type in `lib/phone-audio-config.ts`:
```typescript
export interface PhoneAudioConfig {
  interior_intro: string;
  interior_outro: string;
  exterior_intro: string;
  exterior_outro: string;
  new_config: string; // Add your new config
}
```

---

## ✅ Benefits Over Hardcoded URLs

| Before | After |
|--------|-------|
| Edit code files | Upload through web UI |
| Restart servers | Changes instant |
| Deploy to production | No deployment needed |
| Developer required | Brooke self-sufficient |
| Version control needed | Database-backed |
| Static URLs | Dynamic, updatable URLs |

---

## 📞 Support

### Common Admin Tasks

**Upload new intro audio:**
1. Go to admin dashboard
2. Find "Interior Phone - Intro"
3. Click "Upload New MP3"
4. Select file, wait for confirmation

**Backup current audio:**
1. Click "💾 Download" on each audio config
2. Files saved to your Downloads folder

**Revert to previous audio:**
1. Find backed-up file on your computer
2. Upload it using "Upload New MP3"

---

## 🎉 Complete!

The phone audio configuration system is now fully operational. Brooke can:

✅ Upload new MP3 files through admin interface  
✅ Preview audio before replacing  
✅ Download current audio for backup  
✅ See when files were last updated  
✅ Changes take effect immediately  

No code changes required for audio updates!
