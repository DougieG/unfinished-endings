# Audio Upload Troubleshooting Guide

**Date:** November 21, 2025  
**Issue:** Audio upload failing on recording phone

---

## Quick Diagnosis Steps

### 1. Check Browser Console
Open browser developer tools (F12 or right-click → Inspect) and look for errors:

**Look for these patterns:**
- `❌ Upload failed:` - Storage upload error
- `❌ Database insert error:` - Database permission issue
- `❌ No audio file in form data` - Recording not captured
- `Failed to upload audio` - Storage policy issue

### 2. Check Server Logs
If running locally, check the terminal where `npm run dev` is running:

```bash
# Good signs (what you want to see):
📥 Audio upload request received
📊 Audio file details: { name: ..., type: 'audio/mp4', size: ... }
📤 Uploading to Supabase: ...
✅ Upload successful: ...
💾 Inserting story record into database...
✅ Story saved successfully: ...

# Bad signs (errors):
❌ Upload error details: ...
❌ Database insert error: ...
```

---

## Common Issues & Fixes

### Issue 1: Storage Upload Permission Error

**Symptoms:**
- Error message: "Failed to upload audio"
- Console shows: `new row violates row-level security policy`

**Fix:**
```bash
cd /Users/douglasgoldstein/Documents/unfinished-endings

# Apply the storage policy fix
supabase db push supabase/migrations/fix_storage_upload.sql

# Or manually in Supabase Dashboard:
# 1. Go to Storage → Policies
# 2. Check that 'stories' bucket has upload policy
# 3. Policy should allow all inserts (service role bypasses this anyway)
```

### Issue 2: Missing Environment Variables

**Symptoms:**
- Error: `SUPABASE_SERVICE_ROLE_KEY not configured`

**Fix:**
Check `.env.local` file has all required variables:

```bash
# Required variables:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # This one is critical!
```

**Get service role key:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy "service_role" key (not anon key!)
4. Add to `.env.local`
5. Restart dev server: `npm run dev`

### Issue 3: File Size Too Large

**Symptoms:**
- Upload fails for long recordings
- Error: "payload too large"

**Check file size limits:**
```typescript
// In app/api/stories/route.ts
// Default: No explicit limit, but check Supabase storage limits
// Free tier: 1GB total storage
// Max file size: 50MB per file
```

**Fix:**
Add file size check before upload:
```typescript
if (audioFile.size > 50 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'Audio file too large (max 50MB)' },
    { status: 413 }
  );
}
```

### Issue 4: Wrong MIME Type

**Symptoms:**
- Recording succeeds but file won't play
- Error: "Unsupported format"

**Current setup:**
```typescript
// Recording page uses: audio/mp4 (AAC codec)
const blob = new Blob(audioChunks.current, { type: 'audio/mp4' });
```

**Check browser support:**
```javascript
// In browser console:
MediaRecorder.isTypeSupported('audio/mp4')  // Should be true
MediaRecorder.isTypeSupported('audio/webm') // Fallback
```

**Fix for Safari/iOS issues:**
Safari supports `audio/mp4` with AAC codec. If failing, check:
1. iPad is on latest iOS version
2. Browser has microphone permissions
3. Not using Private Browsing mode

### Issue 5: Supabase Storage Bucket Not Created

**Symptoms:**
- Error: "Bucket 'stories' not found"

**Fix:**
```bash
# Run the initial migration
cd /Users/douglasgoldstein/Documents/unfinished-endings
supabase db push supabase/migration.sql

# Or create manually:
# 1. Go to Supabase Dashboard → Storage
# 2. Create new bucket: 'stories'
# 3. Make it public
# 4. Set policies (see migration.sql)
```

### Issue 6: CORS Issue

**Symptoms:**
- Error in console: "CORS policy blocked"
- Fetch fails from different domain

**Fix:**
1. Check Supabase Storage CORS settings
2. In Supabase Dashboard → Storage → Configuration
3. Add allowed origins:
   - `http://localhost:3000` (dev)
   - `https://your-production-domain.com` (prod)

---

## Testing Checklist

After applying fixes, test in this order:

### Test 1: API Endpoint Works
```bash
# Test with curl
curl -X POST http://localhost:3000/api/stories \
  -F "audio=@test-audio.mp4"

# Should return:
# {"id":"...","audio_url":"https://..."}
```

### Test 2: Recording Page Works
1. Open http://localhost:3000/phone/recording
2. Open browser console (F12)
3. Trigger recording (lift phone/press key)
4. Hang up phone
5. Watch console for success messages

### Test 3: Verify Upload in Supabase
1. Go to Supabase Dashboard
2. Storage → stories bucket
3. Should see new file: `[timestamp]-recording.mp4`
4. Click to preview/download

### Test 4: Verify Database Record
1. Supabase Dashboard → Table Editor
2. Open `stories` table
3. Should see new row with:
   - `audio_url`: pointing to storage
   - `source`: 'interior'
   - `consent`: true

---

## Advanced Debugging

### Enable Verbose Logging

Add to `.env.local`:
```bash
NEXT_PUBLIC_DEBUG=true
```

### Monitor Supabase Logs
```bash
# In Supabase Dashboard:
# 1. Go to Logs → API Logs
# 2. Filter for 'storage' events
# 3. Look for failed requests
```

### Test Storage Directly
```javascript
// In browser console on /phone/recording page:
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY'
);

// Test upload
const testBlob = new Blob(['test'], { type: 'audio/mp4' });
const result = await supabase.storage
  .from('stories')
  .upload('test-upload.mp4', testBlob);

console.log(result);
// Should return: { data: { path: '...' }, error: null }
```

---

## What I Fixed

### Changes Made:

1. **Added detailed logging** to `/app/api/stories/route.ts`
   - Now shows file details, upload progress, error details
   - Helps diagnose exactly where upload fails

2. **Improved error handling** in `/app/phone/recording/page.tsx`
   - Shows actual error messages to user
   - Better console logging
   - Longer error display (5 seconds instead of 3)

3. **Created storage policy fix** in `/supabase/migrations/fix_storage_upload.sql`
   - Ensures storage bucket allows uploads
   - Adds update/delete policies for admin operations

### Next Steps:

1. **Apply the migration:**
   ```bash
   cd /Users/douglasgoldstein/Documents/unfinished-endings
   supabase db push
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test recording:**
   - Go to http://localhost:3000/phone/recording
   - Open browser console (F12)
   - Try recording
   - **Copy any error messages you see**

4. **Share results:**
   - What error messages appear?
   - What does the server log show?
   - Does it fail at upload or database insert?

---

## Quick Reference

### Key Files:
- **Upload API:** `/app/api/stories/route.ts`
- **Recording UI:** `/app/phone/recording/page.tsx`
- **Storage Config:** `/supabase/migration.sql`
- **Storage Fix:** `/supabase/migrations/fix_storage_upload.sql`

### Key URLs:
- **Recording page:** http://localhost:3000/phone/recording
- **Admin panel:** http://localhost:3000/admin
- **Test stories API:** http://localhost:3000/api/stories

### Environment Variables Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # Most important!
```

---

## Still Not Working?

**Send me:**
1. Full error message from browser console
2. Server log output
3. Screenshot of error state
4. Supabase project ID (for direct inspection)

**Most likely cause:** Missing `SUPABASE_SERVICE_ROLE_KEY` in environment variables.

**Second most likely:** Storage bucket policy restricting uploads.

**Quick test:**
```bash
# Check if env vars are loaded:
cd /Users/douglasgoldstein/Documents/unfinished-endings
grep SUPABASE .env.local

# Should show 3 lines (URL, ANON_KEY, SERVICE_ROLE_KEY)
```
