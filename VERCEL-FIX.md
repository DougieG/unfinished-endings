# 🔧 Vercel Production Error - Fixes

## Errors Encountered

1. **500 Internal Server Error** - API route failing
2. **504 Gateway Timeout** - Serverless function timing out
3. **"Failed to process form"** - OCR processing error

## Root Causes

### 1. Serverless Function Timeout
- **Problem:** OCR processing takes 15-30 seconds
- **Vercel limit:** 10 seconds (Hobby), 60 seconds (Pro)  
- **Fix:** Set `maxDuration: 60` in vercel.json

### 2. Heavy Dependencies in Serverless
- **`tesseract.js`:** Large WASM files (~10MB)
- **`sharp`:** Native binaries
- **Problem:** May not bundle correctly in serverless environment

## Fixes Applied

### Fix 1: Increase Timeout ✅

Created `vercel.json`:
```json
{
  "functions": {
    "app/api/sketch/upload/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Fix 2: Better Error Handling ✅

Updated `/app/api/sketch/upload/route.ts`:
- Wrapped OCR processing in try/catch
- Added specific error messages
- Better console logging for debugging

## Alternative Solutions

### Option A: Keep Current Approach (Recommended)

**Pros:**
- Simple, all-in-one processing
- No external services needed
- Free (except Vercel Pro if needed)

**Cons:**
- Requires Vercel Pro for 60s timeout ($20/month)
- Heavy dependencies

**To Deploy:**
1. Commit + push vercel.json
2. Upgrade to Vercel Pro (if on Hobby plan)
3. Should work with 60s timeout

### Option B: Split Processing (If timeouts persist)

Move OCR to background job:
1. Upload triggers serverless function
2. Function queues job
3. Returns immediately to user
4. Background worker processes OCR
5. Webhook/polling updates UI

**Services:**
- Vercel Cron
- Upstash Queue
- Railway (for long-running worker)

### Option C: External OCR API

Use Google Cloud Vision API instead of tesseract.js:
- **Pros:** Faster (<2s), better accuracy, no timeout issues
- **Cons:** Costs $1.50 per 1000 images
- **Best for:** High volume

## Immediate Action

### Deploy Fix

```bash
git add vercel.json app/api/sketch/upload/route.ts
git commit -m "fix: Increase Vercel timeout and improve error handling for sketch upload"
git push
```

### After Deploy

1. **Check Vercel plan:**
   - If on Hobby: Upgrade to Pro ($20/month)
   - If already Pro: Should work now

2. **Test again:**
   - Upload form image
   - Should complete in <60 seconds
   - Check Vercel logs for detailed errors

3. **Check Vercel logs:**
   - Go to: https://vercel.com/your-project/deployments
   - Click latest deployment
   - View Function Logs
   - Look for our console.log messages

## Vercel Plan Requirements

| Plan | Timeout | Price | Sketch Processing |
|------|---------|-------|-------------------|
| **Hobby** | 10s | Free | ❌ Too short |
| **Pro** | 60s | $20/mo | ✅ Should work |
| **Enterprise** | 900s | Custom | ✅ Plenty of time |

**Recommendation:** Upgrade to Pro if not already

## Testing After Fix

### 1. Check Logs

In Vercel dashboard, look for:
```
📸 Processing form image...
🔄 Starting OCR and image extraction...
✅ OCR and extraction complete
📤 Uploading original form to storage...
...
```

### 2. Common Issues

**Still timing out?**
- OCR might be taking >60s (unlikely)
- Try smaller/clearer images
- Consider Option B (background processing)

**Dependencies missing?**
- Check build logs for sharp/tesseract errors
- May need `sharp` optimization for Vercel

**Out of memory?**
- Vercel functions: 1GB RAM (Hobby), 3GB (Pro)
- Reduce image size before processing
- Optimize form-processor.ts

## Sharp on Vercel

Sharp usually works on Vercel but might need:

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

## Tesseract.js on Vercel

Tesseract.js works but:
- Large WASM files need to load
- First run is slow (cold start)
- Subsequent runs faster (warm)

**Optimization:**
```typescript
// In form-processor.ts
const worker = await createWorker('eng', 1, {
  workerPath: '/path/to/worker.min.js',
  corePath: '/path/to/tesseract-core.wasm.js',
});
```

## Summary

**Quick Fix:** 
1. ✅ Created vercel.json with 60s timeout
2. ✅ Improved error handling
3. 🔄 Commit + push
4. ⚠️ May need Vercel Pro ($20/month)

**Long-term Options:**
- Background processing (complex)
- External OCR API (costs per image)
- Stay with current (need Pro plan)

---

**Deploy the fixes now and test again!** 🚀
