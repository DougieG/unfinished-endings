# 🎨 Sketch Processing - Quick Start Guide

## Installation (5 minutes)

### 1. Install Dependencies

```bash
cd /Users/douglasgoldstein/Documents/unfinished-endings
npm install
```

This installs:
- `sharp` - Image processing
- `tesseract.js` - OCR engine

### 2. Run Database Migration

```bash
# Apply sketch support schema
supabase db push
```

Or paste SQL from `supabase/migrations/add_sketch_support.sql` into Supabase dashboard.

### 3. Start Development Server

```bash
npm run dev
```

---

## First Upload (2 minutes)

### Option A: Test Upload Interface

1. Open **http://localhost:3000/playback/pic**
2. Click upload area
3. Select a photo of your Ending Care Form
4. Wait for processing (15-30 seconds)
5. Review extracted data
6. Click "Create Shadow Puppet Show"
7. See your sketch as a crankie!

### Option B: Test Admin Attachment

1. Open **http://localhost:3000/admin**
2. Find any existing story
3. Click "Upload Sketch" in Sketch column
4. Upload form photo
5. Sketch auto-attaches to story

---

## Test the System

### Test Form

Don't have a completed form? Create a test:

1. **Print** `Ending_Care_Form.pdf`
2. **Draw** simple sketch (tree, house, etc.)
3. **Write** title in BLOCK LETTERS with Sharpie:
   - Example: "MY GRANDMOTHER'S GARDEN"
4. **Fill** first name field
5. **Take photo** with phone or scan
6. **Upload** to `/playback/pic`

Expected results:
- Sketch extracted cleanly
- Title OCR'd (85-90% accuracy with block letters)
- Name extracted
- Confidence scores > 80%

---

## Troubleshooting

### "Cannot find module 'sharp'" or "Cannot find module 'tesseract.js'"

**Fix:** Run `npm install`

### OCR Returns Gibberish

**Causes:**
- Cursive handwriting (use block letters)
- Pencil instead of marker (use Sharpie)
- Form not aligned in photo

**Fix:** Retake photo, ensure good lighting, use dark marker

### Upload Fails

**Causes:**
- File too large (> 10MB)
- Network timeout
- Supabase connection issue

**Fix:**
- Compress image
- Check `.env.local` has Supabase credentials
- Retry upload

### Sketch Looks Wrong

**Causes:**
- Form coordinates don't match template
- Form printed at wrong size
- Image very skewed/rotated

**Fix:**
- Use official form template
- Ensure flat, straight photo
- Update `FORM_REGIONS` in `lib/form-processor.ts` if needed

---

## Next Steps

✅ Upload test form  
✅ Verify OCR accuracy  
✅ Test admin panel integration  
✅ Try playback interface  

Then:
- 📖 Read full docs: `SKETCH-PROCESSING-SYSTEM.md`
- 🎨 Create batch upload script (optional)
- 🔧 Tune OCR threshold if needed
- 🎭 Generate AI variations from sketches

---

## Quick Reference

| Task | URL |
|------|-----|
| Upload form | `http://localhost:3000/playback/pic` |
| Admin panel | `http://localhost:3000/admin` |
| View story | `http://localhost:3000/story/[id]` |

| File | Purpose |
|------|---------|
| `lib/form-processor.ts` | OCR & extraction logic |
| `app/api/sketch/upload/route.ts` | Upload endpoint |
| `app/playback/pic/page.tsx` | Upload interface |
| `components/SketchManagement.tsx` | Admin widget |

---

**Ready to go!** 🚀

Upload your first form at: **http://localhost:3000/playback/pic**
