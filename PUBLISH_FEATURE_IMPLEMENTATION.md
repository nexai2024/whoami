# Publish Feature Implementation Summary

## Completed

### ✅ Courses - DONE
**File:** `components/CourseBuilder.tsx`

**Changes Made:**
1. Added `FiUpload` icon import
2. Created `handlePublishCourse()` function that toggles status between DRAFT/PUBLISHED
3. Added status badge next to title showing current status
4. Added Publish/Unpublish button that:
   - Only shows after course is saved (has ID)
   - Green when DRAFT (shows "Publish")
   - Yellow when PUBLISHED (shows "Unpublish")
   - Updates course status via API

**Usage:** Users can now publish courses from the course edit page.

---

## Still Needed

### 🔄 Pages - IN PROGRESS
**File:** `components/EnhancedPageBuilder.jsx`

**Required Changes:**

1. **Add Publish Button** (line ~750, next to Save button):
```javascript
// Add after Save button
{pageData?.id && (
  <button
    onClick={handlePublishPage}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      pageData.isActive
        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        : 'bg-green-600 text-white hover:bg-green-700'
    }`}
  >
    <FiUpload />
    {pageData.isActive ? 'Unpublish' : 'Publish'}
  </button>
)}
```

2. **Add Publish Handler** (after handleSaveAll function):
```javascript
const handlePublishPage = async () => {
  if (!pageData?.id) {
    toast.error('Save page first before publishing');
    return;
  }

  try {
    const newStatus = !pageData.isActive;
    await PageService.updatePage(pageData.id, {
      isActive: newStatus
    });

    setPageData({ ...pageData, isActive: newStatus });
    toast.success(newStatus ? 'Page published!' : 'Page unpublished');
  } catch (error) {
    console.error('Error publishing page:', error);
    toast.error('Failed to update page status');
  }
};
```

3. **Make Slug Editable** (line ~687-699 in Settings tab):
```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Page Slug (URL)</label>
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-500">yoursite.com/</span>
    <input
      type="text"
      value={pageData?.slug || ''}
      onChange={(e) => {
        const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setPageData(prev => ({ ...prev, slug }));
      }}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      placeholder="my-page-url"
    />
  </div>
  <p className="text-xs text-gray-500 mt-1">
    This will be your page URL. Use lowercase letters, numbers, and hyphens only.
  </p>
</div>
```

4. **Update Save Function** to include slug:
```javascript
// In handleSaveAll(), update the PageService.updatePage call:
await PageService.updatePage(currentPageId, {
  title: pageData?.title || 'Untitled Page',
  description: pageData?.description || '',
  slug: pageData?.slug, // ADD THIS LINE
});
```

5. **Add Status Badge** (in header, near tabs):
```javascript
// Add next to the tabs
<div className="flex items-center gap-3">
  {pageData?.isActive && (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      PUBLISHED
    </span>
  )}
  {pageData?.isActive === false && (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      DRAFT
    </span>
  )}
</div>
```

---

### 📋 Lead Magnets
**File:** `components/lead-magnets/LeadMagnetDashboard.tsx`

**Required Changes:**

1. **Add Import:**
```javascript
import { FiUpload } from 'react-icons/fi';
```

2. **Add Publish Handler:**
```javascript
const handlePublish = async (magnetId, currentStatus) => {
  const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

  try {
    const response = await fetch(`/api/lead-magnets/${magnetId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currUser.id,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      toast.success(`Lead magnet ${newStatus === 'ACTIVE' ? 'published' : 'unpublished'}!`);
      loadLeadMagnets(); // Reload list
    } else {
      toast.error('Failed to update status');
    }
  } catch (error) {
    console.error('Error publishing:', error);
    toast.error('Failed to update status');
  }
};
```

3. **Add Publish Button** (in the lead magnet card actions):
```javascript
// Add publish button next to edit/delete buttons
<button
  onClick={() => handlePublish(magnet.id, magnet.status)}
  className={`p-2 rounded-lg transition-colors ${
    magnet.status === 'ACTIVE'
      ? 'text-yellow-600 hover:bg-yellow-50'
      : 'text-green-600 hover:bg-green-50'
  }`}
  title={magnet.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
>
  <FiUpload />
</button>
```

---

### 🔄 Workflows
**File:** Need to find workflow builder/editor

**Required Changes:**

1. **Add Publish Toggle:**
```javascript
const handlePublishWorkflow = async (workflowId, currentStatus) => {
  const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

  try {
    const response = await fetch(`/api/workflows/${workflowId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currUser.id,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      toast.success(`Workflow ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}!`);
      loadWorkflows();
    } else {
      toast.error('Failed to update workflow status');
    }
  } catch (error) {
    console.error('Error publishing workflow:', error);
    toast.error('Failed to update workflow status');
  }
};
```

2. **Add Test/Debug Feature:**
```javascript
const handleTestWorkflow = async (workflowId) => {
  try {
    const response = await fetch(`/api/workflows/${workflowId}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currUser.id,
      },
      body: JSON.stringify({
        testData: {
          email: 'test@example.com',
          // Add any test trigger data
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      // Show test execution result in a modal or panel
      toast.success('Workflow test completed! Check console for details.');
      console.log('Workflow test result:', result);
    } else {
      toast.error('Workflow test failed');
    }
  } catch (error) {
    console.error('Error testing workflow:', error);
    toast.error('Failed to test workflow');
  }
};
```

3. **Create Test Endpoint:**
**File:** `app/api/workflows/[id]/test/route.ts` (NEW FILE)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify workflow ownership
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
      include: {
        trigger: true,
        steps: { orderBy: { order: 'asc' } },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Create test execution
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'RUNNING',
        triggerData: body.testData || {},
        subscriberEmail: body.testData?.email,
      },
    });

    // Execute each step (simplified test mode)
    const stepResults = [];
    for (const step of workflow.steps) {
      const stepLog = await prisma.workflowStepLog.create({
        data: {
          executionId: execution.id,
          stepId: step.id,
          status: 'COMPLETED',
          startedAt: new Date(),
          completedAt: new Date(),
          input: step.config,
          output: { success: true, message: 'Test execution - no real action taken' },
        },
      });
      stepResults.push(stepLog);
    }

    // Mark execution complete
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      execution: {
        id: execution.id,
        status: 'COMPLETED',
        steps: stepResults,
      },
      message: 'Test execution completed successfully',
    });
  } catch (error) {
    console.error('Error testing workflow:', error);
    return NextResponse.json(
      { error: 'Failed to test workflow' },
      { status: 500 }
    );
  }
}
```

---

## API Endpoints That Need Status Support

### Verify these endpoints accept status field:

1. **✅ Courses API** - Already supports status (DRAFT/PUBLISHED/ARCHIVED)
   - `PUT /api/courses/[id]` - accepts `status` field

2. **❓ Pages API** - Uses `isActive` boolean
   - Need to verify `PUT /api/pages/[id]` accepts `isActive`
   - Need to verify `PUT /api/pages/[id]` accepts `slug` updates

3. **❓ Lead Magnets API**
   - Need to verify `PATCH /api/lead-magnets/[id]` accepts `status`

4. **❓ Workflows API**
   - Need to verify `PATCH /api/workflows/[id]` accepts `status`
   - Need to create `POST /api/workflows/[id]/test` endpoint

---

## Testing Checklist

After implementation:

- [ ] Test Course publish/unpublish
- [ ] Test Page publish/unpublish
- [ ] Test Page slug editing and saving
- [ ] Test Lead Magnet publish/unpublish
- [ ] Test Workflow activate/deactivate
- [ ] Test Workflow test/debug feature
- [ ] Verify status badges show correctly
- [ ] Verify published content is publicly accessible
- [ ] Verify unpublished content is not publicly accessible

---

## User Experience Flow

1. **Create Content** → Status: DRAFT (not public)
2. **Add Details** → Still DRAFT
3. **Click Publish** → Status: PUBLISHED/ACTIVE (now public)
4. **Make Changes** → Still PUBLISHED (changes apply immediately)
5. **Click Unpublish** → Back to DRAFT (no longer public)

This matches standard CMS behavior (WordPress, etc.)
