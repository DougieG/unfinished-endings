# 🔍 Debug: Sketch Upload Never Worked

## Issue

Photo upload has **never worked successfully** - not even once.

## Errors Seen

1. **React errors** (#425, #418, #423) - Hydration/rendering issues
2. **500 Internal Server Error** - API failing
3. **504 Gateway Timeout** - Function timing out
4. **"Failed to process form"** - Generic error

## Diagnostic Steps

### Step 1: Test Basic API Connection

Visit this URL in browser:
```
https://unfinished-endings.vercel.app/api/sketch/test
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "API route is working",
  "timestamp": "2025-11-21T...",
  "runtime": "vercel",
  "nodeVersion": "v18.x.x"
}
```

**If this fails:** API routes not deploying correctly

---

### Step 2: Test Simple Upload (No OCR)

Use this test endpoint (no heavy processing):

```bash
# Using curl
curl -X POST https://unfinished-endings.vercel.app/api/sketch/upload-simple \
  -F "form_image=@/path/to/test-image.jpg"
```

**Or use Postman:**
- URL: `https://unfinished-endings.vercel.app/api/sketch/upload-simple`
- Method: POST
- Body: form-data
- Key: `form_image`
- Type: File
- Value: Select any JPG image

**Expected response:**
```json
{
  "success": true,
  "message": "Simple upload test passed",
  "url": "https://...",
  "filename": "sketch/test-...",
  "fileSize": 123456,
  "timestamp": "2025-11-21T..."
}
```

**If this fails:** Issue with Supabase connection or file handling
**If this works:** Issue is with OCR/sharp processing

---

### Step 3: Check Vercel Build Logs

1. Go to: https://vercel.com/your-username/unfinished-endings
2. Click "Deployments"
3. Click the latest deployment
4. Scroll to "Build Logs"

**Look for:**

✅ **Good signs:**
```
Installing dependencies...
- sharp@0.33.0
- tesseract.js@5.0.4
✓ Compiled successfully
```

❌ **Bad signs:**
```
WARN sharp ...
ERROR Failed to compile
npm ERR! sharp installation failed
peer dependency warning
```

**Common issues:**
- Sharp binary not building for Linux (Vercel uses Linux)
- Missing native dependencies
- Memory issues during build

---

### Step 4: Check Vercel Function Logs

1. Go to deployment page
2. Click "Functions" tab
3. Find `/api/sketch/upload`
4. Look at recent invocations

**What to look for:**

✅ **If you see:**
```
📸 Processing form image...
🔄 Starting OCR and image extraction...
```
Then the function is at least starting.

❌ **If you see:**
```
Error: Cannot find module 'sharp'
Error: Dynamic require of "sharp" is not supported
Module not found: Can't resolve 'tesseract.js'
```
Then dependencies aren't loading.

---

### Step 5: Check React Page

Visit: `https://unfinished-endings.vercel.app/playback/pic`

**Questions:**
- Does the page load at all?
- Do you see the upload interface?
- Are there React errors in browser console (F12)?
- Does the page freeze or crash?

**Common React issues:**
- Hydration mismatch (server vs client rendering)
- Component mounting before window/navigator available
- useEffect dependencies causing infinite loops

---

## Possible Root Causes

### 1. Sharp Not Working on Vercel ⚠️

**Symptom:** "Cannot find module 'sharp'" or similar

**Why:** Sharp uses native binaries that must be compiled for Linux (Vercel environment)

**Fix:**
```json
// package.json
{
  "overrides": {
    "sharp": "0.33.0"
  }
}
```

Or try older version:
```bash
npm install sharp@0.32.6
```

### 2. Tesseract.js WASM Loading ⚠️

**Symptom:** Timeout during OCR processing

**Why:** Tesseract needs to load large WASM files (~10MB)

**Fixes:**
- Pre-load worker files
- Use CDN for worker files
- Increase function memory

**Config:**
```typescript
// In form-processor.ts
const worker = await createWorker('eng', 1, {
  workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/worker.min.js',
  langPath: 'https://tessdata.projectnaptha.com/4.0.0',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0'
});
```

### 3. Vercel Function Timeout ⚠️

**Symptom:** 504 Gateway Timeout

**Why:** OCR takes 15-30 seconds, default timeout is 10s

**Fix:** Already added `maxDuration: 60` in vercel.json
**Requires:** Vercel Pro plan ($20/month)

### 4. Out of Memory ⚠️

**Symptom:** Function crashes with no clear error

**Why:** Sharp + Tesseract + large images = high memory usage

**Fix:**
```json
// vercel.json
{
  "functions": {
    "app/api/sketch/upload/route.ts": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

Memory options: 1024, 1769, 2048, 3008 MB
Default: 1024 MB

### 5. React Hydration Errors ⚠️

**Symptom:** Error #425, #418, #423 in console

**Why:** Component rendering differently on server vs client

**Common causes:**
- Using `window` or `navigator` before checking if defined
- Date/time rendering (timezone differences)
- Random IDs not matching between renders

**Fix in WebcamCapture or page:**
- Wrap camera code in `useEffect`
- Add `'use client'` directive
- Check `typeof window !== 'undefined'`

---

## Quick Diagnosis Commands

### Test API Health
```bash
curl https://unfinished-endings.vercel.app/api/sketch/test
```

### Test Simple Upload
```bash
curl -X POST https://unfinished-endings.vercel.app/api/sketch/upload-simple \
  -F "form_image=@test.jpg" | jq
```

### Check if Sharp Works Locally
```bash
cd /Users/douglasgoldstein/Documents/unfinished-endings
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/sketch/test
```

---

## What I've Added

1. **Test endpoint:** `/api/sketch/test`
   - Simple health check
   - No dependencies
   - Should always work

2. **Simple upload:** `/api/sketch/upload-simple`
   - Tests file upload + Supabase
   - No OCR or Sharp processing
   - If this works, OCR is the problem
   - If this fails, basic upload is broken

3. **Better error handling** in main upload route

4. **Timeout fix** with vercel.json

---

## Recommended Debug Order

1. ✅ Test `/api/sketch/test` - Verify API works
2. ✅ Test `/api/sketch/upload-simple` - Verify upload works
3. ✅ Check Vercel build logs - Verify dependencies installed
4. ✅ Check function logs - See actual errors
5. ✅ Test with smaller image - Rule out size issues
6. ✅ Check Vercel plan - Confirm timeout limit

---

## Next Steps

Based on what fails, we'll know:

- **Test API fails** → Deployment issue
- **Simple upload fails** → Supabase or file handling issue
- **Simple upload works, full upload fails** → OCR/Sharp issue
- **Everything works in local dev** → Vercel-specific issue
- **React errors in console** → Component issue

---

## Contact Info

**Vercel Support:** https://vercel.com/support
**Sharp Issues:** https://github.com/lovell/sharp/issues
**Tesseract Issues:** https://github.com/naptha/tesseract.js/issues

---

## Deploy These Tests

```bash
git add app/api/sketch/test/ app/api/sketch/upload-simple/ DEBUG-SKETCH-UPLOAD.md
git commit -m "debug: Add diagnostic endpoints for sketch upload troubleshooting"
git push
```

Then test the endpoints above! 🔍
