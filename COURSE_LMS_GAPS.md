# Micro Course LMS - Gap Analysis & Implementation Plan

## Current State ✅

**What's Working:**
- Course builder (create/edit courses, lessons)
- Course landing pages
- Basic learning interface (lesson content, navigation)
- Enrollment system (FREE, PAID, EMAIL_GATE)
- Drip scheduling
- Progress tracking (basic)
- Publish/unpublish functionality
- Analytics dashboard (structure exists)

---

## Critical Gaps 🚨

### 1. **Authentication Mismatch** (URGENT)
**Problem:** API inconsistency between email-based and userId-based lookups
- Enrollment API uses email-based queries
- Progress API requires email but frontend sends userId
- This breaks the learning experience

**Fix Needed:**
- Update progress API to support both email OR userId
- Ensure enrollment API stores userId when user is logged in
- Frontend should pass user.email to APIs

**Impact:** ⚠️ HIGH - Currently broken for logged-in users

### 2. **Quiz Functionality** (MISSING)
**What's in DB:** `hasQuiz` flag, `quizData` JSON field
**What's Missing:**
- Quiz builder in CourseBuilder
- Quiz display in learning view
- Quiz submission handling
- Quiz results storage in progress table
- Pass/fail logic

**Priority:** 🔴 HIGH - Core LMS feature

### 3. **Certificates** (MISSING)
**What's in DB:** Certificate fields in CourseEnrollment
**What's Missing:**
- Certificate generation logic
- Certificate design/template
- Certificate download
- Completion triggers

**Priority:** 🟡 MEDIUM - Nice to have

### 4. **Lesson Resources** (MISSING)
**What's in DB:** LessonResource model fully defined
**What's Missing:**
- Resource upload in builder
- Resource display in learning view
- Download tracking
- Resource management UI

**Priority:** 🟡 MEDIUM - Important for course quality

### 5. **Student Notes** (MISSING)
**What's in DB:** `notes` field in CourseLessonProgress
**What's Missing:**
- Note-taking UI in learning view
- Notes display/save
- Notes persistence

**Priority:** 🟢 LOW - Nice to have

### 6. **Reviews & Ratings** (MISSING)
**What's in DB:** CourseReview model fully defined
**What's Missing:**
- Review submission UI
- Review display on landing page
- Rating aggregation
- Moderation tools

**Priority:** 🟡 MEDIUM - Important for social proof

### 7. **My Courses Dashboard** (MISSING)
**What's Missing:**
- Student view of enrolled courses
- Course progress overview
- Quick access to continue learning
- Certificates collection
- Bookmarks/favorites

**Priority:** 🔴 HIGH - Essential for student experience

### 8. **Course Analytics** (INCOMPLETE)
**What's Missing:**
- Revenue tracking
- Completion rate charts
- Engagement metrics (time spent, drop-off points)
- Student journey visualization
- Export functionality

**Priority:** 🟡 MEDIUM - For course creators

---

## Implementation Priority Roadmap

### Phase 1: Fix Critical Issues (Week 1)
1. ✅ Fix authentication mismatch in progress API
2. ✅ Ensure enrollment stores userId properly
3. ✅ Add user.email to frontend API calls

### Phase 2: Core Features (Weeks 2-3)
4. ✅ Quiz builder in CourseBuilder component
5. ✅ Quiz display and submission in learning view
6. ✅ My Courses dashboard for students
7. ✅ Lesson resources upload/display/download

### Phase 3: Enhancement Features (Week 4)
8. ✅ Certificate generation system
9. ✅ Reviews & ratings on landing page
10. ✅ Student notes feature
11. ✅ Enhanced analytics dashboard

---

## Detailed Feature Specifications

### Quiz Builder Spec
```
Fields in quizData JSON:
{
  "questions": [
    {
      "id": "string",
      "type": "multiple-choice" | "true-false" | "short-answer",
      "question": "string",
      "options": ["option1", "option2", ...], // for multiple-choice
      "correctAnswer": "string | number",
      "points": 10
    }
  ],
  "passingScore": 70,
  "timeLimit": 600 // seconds
}
```

### Certificate Spec
```
Generate PDF certificate on course completion
Include:
- Student name
- Course title
- Completion date
- Course creator name
- Unique certificate ID
- Verification URL
```

### My Courses Spec
```
Features:
- Grid/list view of enrolled courses
- Progress bar per course
- Last accessed timestamp
- Continue learning button
- Certificates section
- Search/filter by status (in-progress, completed)
```

---

## Technical Debt

### Code Issues to Address
1. ❌ Hardcoded 'demo-user' in CourseBuilder.tsx:74
2. ❌ Missing userId in enrollment creation
3. ❌ Inconsistent API error handling
4. ❌ No loading states in some components
5. ❌ Missing input validation

### Database Optimizations
1. Add index on courseEnrollment.userId (if not exists)
2. Add index on courseEnrollment.courseId for faster lookups
3. Consider adding full-text search on course titles

---

## Success Metrics

**For Completion Tracking:**
- Course completion rate > 60%
- Average time to complete
- Drop-off analysis

**For Engagement:**
- Lessons viewed per course
- Quiz pass rate
- Resource downloads
- Notes created

**For Business:**
- Enrollment conversion rate
- Paid course revenue
- Student retention (30/60/90 day)
- Review ratings average

---

## Next Steps

1. Review this document and prioritize features
2. Start with Phase 1 fixes
3. Create individual task tickets for each feature
4. Set up testing plan for each feature
5. Deploy incrementally

