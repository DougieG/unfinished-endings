# Progress Tracking System

## Overview
Real-time visual progress indicators for long-running tasks like story re-generation, transcription, and crankie generation.

---

## ✨ Features

### For Admins
- **Real-time progress bars** - See exactly what's happening
- **Percentage complete** - Know how long to wait
- **Step-by-step updates** - Track each stage of processing
- **Multiple concurrent tasks** - Regenerate multiple stories at once
- **Auto-refresh** - Page updates when tasks complete
- **Error handling** - Clear feedback if something fails

### Visual Feedback
```
┌────────────────────────────────────────┐
│ ⏳ Generating shadow puppet scenes...  │  65%
│ ████████████████░░░░░░░░░░░░░░░░░░░░  │
│ Step 5 of 8                            │
└────────────────────────────────────────┘
```

---

## 🎯 Where You'll See It

### 1. **Bottom-Right Corner**
- Fixed position toast-style notifications
- Shows all active tasks
- Automatically appears when task starts
- Disappears when complete

### 2. **Re-gen Button States**
```
Normal:      [Re-gen]
In Progress: [⏳ Regenerating...]  (disabled, grayed out)
Complete:    [Re-gen]  (page auto-refreshes)
```

---

## 📊 Progress Stages

### Story Re-generation (8 Steps)

| Step | Status | Description | Progress |
|------|--------|-------------|----------|
| 1 | Downloading... | Fetching audio file | 5% |
| 2 | Transcribing... | Whisper AI processing | 15% |
| 3 | Extracting keywords... | AI analysis | 35% |
| 4 | Analyzing narrative... | Story structure | 50% |
| 5 | Generating images... | Creating puppet scenes | 60-85% |
| 6 | Saving panorama... | Storing results | 90% |
| 7 | Complete! | ✅ Done | 100% |

### Image Generation Progress
- Each scene adds ~5% to progress
- 5-7 scenes typical (60% → 85%)
- Real-time updates as each scene completes

---

## 🛠️ Technical Architecture

### Components

**1. Task Progress Tracking (`lib/task-progress.ts`)**
```typescript
// Create a new task
const taskId = createTask(storyId);

// Update progress
updateTaskProgress(taskId, {
  status: 'generating_images',
  progress: 65,
  currentStep: 'Generating shadow puppet scenes...'
});

// Complete task
completeTask(taskId);
```

**2. Progress API (`/api/admin/task-progress`)**
```
GET /api/admin/task-progress
  - Returns all active tasks

GET /api/admin/task-progress?taskId=xyz
  - Returns specific task details
```

**3. UI Components**
- `TaskProgressBar` - Individual progress bar
- `TaskProgressList` - Container for all active tasks
- Auto-polling every 2-3 seconds

### Data Flow

```
[Admin clicks "Re-gen"]
        ↓
[Task created with ID]
        ↓
[API starts processing]
        ↓
[Progress updates written to memory]
        ↓
[UI polls for updates every 2s]
        ↓
[Progress bar animates]
        ↓
[Task completes]
        ↓
[Page auto-refreshes]
```

---

## 📝 Files Modified/Created

### New Files
1. **`lib/task-progress.ts`**
   - Core progress tracking logic
   - In-memory task storage
   - Progress calculation utilities

2. **`app/api/admin/task-progress/route.ts`**
   - API endpoint for fetching task status
   - Supports single task or all tasks

3. **`components/TaskProgressBar.tsx`**
   - Visual progress bar component
   - Auto-polling logic
   - Multiple task container

4. **`PROGRESS-TRACKING-SYSTEM.md`** (this file)

### Modified Files
5. **`app/api/transcribe/[id]/route.ts`**
   - Added progress tracking at each step
   - Reports status to tracking system
   - Returns taskId to client

6. **`components/AdminTable.tsx`**
   - Tracks regenerating stories
   - Auto-refresh on completion
   - Visual button state changes

7. **`app/admin/page.tsx`**
   - Added TaskProgressList component

---

## 🎨 UI States

### Progress Bar States

**Queued**
```
⏳ Queued                               0%
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
Step 0 of 8
```

**In Progress**
```
⏳ Generating shadow puppet scenes...    65%
████████████████████████░░░░░░░░░░░░
Step 5 of 8
```

**Completed**
```
✅ Complete!                           100%
████████████████████████████████████
Step 8 of 8
```

**Error**
```
❌ Transcription failed               45%
█████████████████░░░░░░░░░░░░░░░░░░
Failed to download audio
```

---

## 🔄 Concurrent Task Handling

### Multiple Stories
Users can regenerate multiple stories simultaneously:

```
Bottom-right corner shows:

┌────────────────────────────────────┐
│ ⏳ Transcribing...           Story A │ 15%
│ █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⏳ Generating images...      Story B │ 75%
│ ██████████████████████████░░░░░░░ │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⏳ Extracting keywords...    Story C │ 35%
│ ████████████░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────┘
```

Each task:
- Tracks independently
- Updates at own pace
- Removes itself when complete
- Doesn't block other tasks

---

## 🧪 Testing

### Manual Test Steps

1. **Start Regeneration**
   - Go to admin interface
   - Click "Re-gen" on any story
   - Confirm prompt

2. **Observe Progress**
   - Progress bar appears bottom-right
   - Updates every 2 seconds
   - Shows current step and percentage
   - Button changes to "⏳ Regenerating..."

3. **Test Multiple Stories**
   - Click "Re-gen" on 2-3 stories quickly
   - See multiple progress bars stacked
   - Each updates independently

4. **Completion**
   - When task hits 100%, progress bar disappears
   - Button returns to "Re-gen"
   - Page auto-refreshes
   - New crankie appears in table

5. **Error Handling**
   - If task fails, see red error state
   - Error message displayed
   - Can try again

---

## ⚙️ Configuration

### Polling Intervals

**Progress Bar (single task):**
```typescript
// Poll every 2 seconds
const interval = setInterval(fetchProgress, 2000);
```

**Task List (all tasks):**
```typescript
// Poll every 3 seconds
const interval = setInterval(fetchTasks, 3000);
```

### Cache Duration

Tasks auto-delete after completion:
```typescript
// Clean up after 5 minutes
setTimeout(() => taskProgress.delete(taskId), 5 * 60 * 1000);
```

### Progress Steps

Adjust total steps in API:
```typescript
totalSteps: 8  // Default for full re-generation
```

---

## 🐛 Troubleshooting

### Progress Bar Not Appearing
**Cause**: Task not created or API error  
**Fix**: Check browser console for errors

### Progress Stuck at Same Percentage
**Cause**: Long-running step (image generation)  
**Fix**: Wait, each image takes 10-15 seconds

### Multiple Progress Bars for Same Story
**Cause**: Clicked "Re-gen" multiple times  
**Fix**: Refresh page, task IDs should be unique

### Page Doesn't Auto-Refresh
**Cause**: Polling stopped or network error  
**Fix**: Manual refresh or check network tab

---

## 💡 Tips

### For Brooke

**Regenerating Multiple Stories**
1. Click "Re-gen" on first story
2. Immediately click "Re-gen" on others
3. Watch all progress bars appear
4. Wait for all to complete (page refreshes)

**Monitoring Progress**
- Look bottom-right corner for active tasks
- Each task shows current step name
- Percentage shows overall completion
- Don't click away during regeneration

**If Something Goes Wrong**
- Red error message will appear
- Can safely click "Re-gen" again
- Previous attempt will be cleared

---

## 🎯 Benefits

| Before | After |
|--------|-------|
| Click and wait blindly | See real-time progress |
| "Refresh in 60-90 seconds" | Auto-refreshes when done |
| No feedback if failed | Clear error messages |
| One at a time | Multiple concurrent tasks |
| Manual page refresh | Automatic updates |

---

## 📊 Performance Impact

### Memory Usage
- In-memory task storage
- Auto-cleanup after 5 minutes
- Minimal footprint (~1KB per task)

### Network
- Lightweight polling (2-3 second intervals)
- Small JSON responses (~200 bytes)
- Only polls active admin sessions

### Database
- No additional database calls
- All tracking in memory
- Same database operations as before

---

## 🚀 Future Enhancements (Optional)

### Could Add
- WebSocket for real-time updates (eliminate polling)
- Progress persistence (survive page refresh)
- Detailed logs for each step
- Pause/resume functionality
- Batch operations with single progress bar
- Email notification on completion
- Download progress tracking

---

## ✅ Summary

The progress tracking system provides:
- **Visual feedback** for long-running operations
- **Real-time updates** during processing
- **Multiple concurrent tasks** support
- **Auto-refresh** when complete
- **Clear error handling**

No more guessing when regeneration is done! 🎉

---

**Last Updated**: November 21, 2025  
**Status**: Implemented and Ready ✅
