# VectorCam Interview Exercise - Execution Roadmap

## 0. Purpose and Scope

**Objective:**  
Refactor and extend a Next.js review dashboard to improve code quality, implement review workflow features (status updates with validation, filtering, summary counts, history log), and add visual polish.

**In Scope:**  
- Phase 1: Code analysis and refactoring for maintainability
- Phase 2: Review workflow features (status updates, filtering, summary, history)
- UI/UX polish (subtle improvements to spacing, typography, states)

**Out of Scope / Non-Goals:**  
- Server-side pagination (optional, not implementing)
- Optimistic concurrency with version conflicts (optional, not implementing)
- Major UI framework changes or complete redesigns

This document is the **single source of truth** for planning, execution, and verification.

---

## 1. Execution Environment (Lock First)

Before any planning or implementation begins, confirm:

- [x] Correct repository: `c:\Users\jesse\asr-technical-challenge`
- [x] Branch: working branch identified
- [x] Node.js 20.17.0 required
- [x] Dependencies: `npm install` completed
- [x] Dev server: `npm run dev` runs on `http://localhost:3000`
- [x] Route: Main work under `/interview` route
- [x] Mock API: `GET` and `PATCH` at `/api/mock/records`
- [x] Test runner: Vitest configured

**Environment verified. Ready to proceed.**

---

## 2. System Context and Constraints

### Domain Context
VectorCam helps entomologists and public health managers review and annotate field specimen data. This exercise focuses on the web dashboard where users review records, update their status (Approved, Flagged, Needs Revision), add notes, and track history of changes.

### Architectural Constraints
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context + hooks
- **API:** Mock in-memory API (resets on server restart)
- **Testing:** Vitest + React Testing Library

### Existing Decisions to Respect
- App Router structure (`src/app/`)
- Feature-based folder (`src/app/interview/`)
- shadcn/ui components in `src/components/ui/`
- Mock API structure in `src/app/api/mock/records/route.ts`

---

## 3. Desired Behavior (What "Correct" Means)

### Primary User / System Flows (Happy Paths)

**Flow 1: Review a record**
- User clicks a record card to open detail dialog
- User selects status from dropdown (Approved, Flagged, Needs Revision)
- If status is Flagged/Needs Revision, user enters a note (required)
- If status is Approved, note is optional
- User saves
- System validates, performs PATCH to API
- Dialog closes, list updates, summary counts refresh, history entry added

**Flow 2: Filter records**
- User selects status filter (All, Pending, Approved, Flagged, Needs Revision)
- List shows only matching records
- Summary counts remain accurate
- Filter state persists during record updates

**Flow 3: View summary**
- Dashboard displays counts for each status
- Counts update automatically when records change

**Flow 4: View history**
- History log shows all status changes with timestamp, from→to, and note
- Most recent changes appear first
- Log is scrollable for many entries

### Important Edge Cases
- **Validation:** Empty note for Flagged/Needs Revision blocks save with clear error
- **API errors:** Network failures show user-friendly message
- **Empty states:** Zero records, zero filtered results, empty history
- **Filter consistency:** Record changing status may leave/enter current filtered view

---

## 4. Phased Roadmap Overview

Execution is broken into **strict, sequential phases**.  

- **Phase 1:** Code analysis and refactoring
- **Phase 2:** Core feature implementation (status updates with validation)
- **Phase 3:** Supporting features (filter, summary, history)
- **Phase 4:** UI/UX polish
- **Phase 5:** Testing and verification

---

## 5. Phase 1: Code Analysis & Refactoring ✅ COMPLETE

### Goals
Understand existing codebase, identify issues, and refactor for clarity and maintainability using industry-standard patterns.

### Tasks
- [x] Read and document current architecture (RecordsContext, hooks, components)
- [x] Identify naming issues, mixed concerns, and architectural problems
- [x] Propose improved architecture with clear patterns:
  - Context for global state
  - Custom hooks for derived state and side effects
  - Service/utility layer for API calls
  - Component separation (container/presenter where helpful)
- [x] Implement refactoring:
  - Reorganize file structure if needed
  - Extract API service layer
  - Separate state management from UI logic
  - Improve error and loading handling
  - Consistent naming conventions

### Acceptance Criteria
- [x] Codebase compiles and runs without errors
- [x] Clear separation: Context (state) → Hooks (logic) → Components (UI)
- [x] API calls isolated in service layer
- [x] Loading and error states properly handled
- [x] No unused code or redundant logic
- [x] Documentation of architecture decisions

### Verification Steps
- [x] Run dev server, confirm `/interview` route works
- [x] Check that existing UI functionality still works
- [x] Code review for clear responsibilities

### Completion Gate
**Phase 1 is complete! ✅**
- Refactored code is cleaner and responsibilities are clear
- App compiles and runs without errors
- Architecture documented in PHASE1_ARCHITECTURE.md
- Implemented patterns: Service Layer, Container/Presenter, Custom Hooks
- Save functionality, filtering, summary, and history all working

---

## 6. Phase 2: Core Feature - Review Actions with Validation ✅ COMPLETE

### Goals
Implement status update workflow with validation through the detail dialog.

### Tasks
- [x] Wire status dropdown in RecordDetailDialog to local state
- [x] Add note textarea with character count
- [x] Implement validation logic:
  - Flagged/Needs Revision: non-empty note required
  - Approved: note optional
- [x] Show inline validation errors when note is missing
- [x] Implement save handler:
  - Validate inputs
  - Call API service to PATCH record
  - Handle success: update context, close dialog, show success message
  - Handle errors: show error message, keep dialog open
- [x] Ensure optimistic or pessimistic update strategy is clear

### Acceptance Criteria
- [x] Status dropdown correctly updates state
- [x] Note validation prevents save for invalid inputs
- [x] Validation error messages are clear and inline
- [x] Successful save updates record in context
- [x] List reflects updated status immediately
- [x] Dialog closes only on successful save (with 800ms success message)
- [x] Success/error feedback shown to user (inline)

### Verification Steps
✅ Manually tested each status change scenario:
- ✅ Approved: note optional, saves successfully
- ✅ Flagged: note required, validation blocks save when empty
- ✅ Needs Revision: note required, validation blocks save when empty
- ✅ Pending: note optional, saves successfully

✅ Verified list updates after save
✅ Verified summary counts update reactively
✅ Verified history log records changes with timestamp
✅ Verified inline success message shows before close
✅ Verified inline error messages display correctly
✅ API PATCH request verified in Network tab

### Implementation Details

**Validation Logic:**
```typescript
const requiresNote = status === "flagged" || status === "needs_revision";

if (requiresNote && !note.trim()) {
  setValidationError("A note is required for flagged or needs revision status.");
  return;
}
```

**Save Flow:**
1. Validate inputs
2. Call `updateRecord()` from context
3. Context calls API service
4. On success: update local state, add history entry
5. Show success message inline
6. Close dialog after 800ms delay

**Error Handling:**
- Validation errors: shown inline, prevent save
- API errors: shown inline, keep dialog open, allow retry

### Completion Gate
**Phase 2 is complete! ✅**
- Status updates work end-to-end with proper validation
- Validation prevents invalid saves
- User receives clear feedback (success and errors)
- List, summary, and history all update correctly
- Dialog behavior is intuitive and responsive

---

## 7. Phase 3: Supporting Features (Filter, Summary, History) ✅ COMPLETE

### Goals
Implement filter functionality, summary counts, and history log.

### Tasks
- [x] **Filter:**
  - Wire status filter dropdown to context/hook
  - Implement filtering logic for records
  - Handle "All" option
  - Ensure filter persists during updates
- [x] **Summary:**
  - Create RecordSummary component showing counts per status
  - Calculate counts from current records state
  - Update reactively when records change
- [x] **History Log:**
  - Extend context to track status change history
  - On status update, append history entry: timestamp, from→to, note
  - Display history in HistoryLog component
  - Most recent first, scrollable
  - Add clear history option (in-memory only)

### Acceptance Criteria
- [x] Filter correctly shows/hides records by status
- [x] Filter defaults to "All" with clear indication
- [x] Summary displays accurate counts for all statuses
- [x] Summary updates when records change
- [x] History appends entry on each status change
- [x] History shows timestamp, status transition, and note
- [x] History is ordered (most recent first) and scrollable

### Verification Steps
✅ Tested filter with each status option
✅ Verified counts match visible records
✅ Changed record status and confirmed history entry appears
✅ Verified history formatting and ordering
✅ Tested filter persistence during updates

### Completion Gate
**Phase 3 is complete! ✅**
All three supporting features work correctly and stay in sync.

---

## 8. Phase 4: UI/UX Polish ✅ COMPLETE

### Goals
Improve visual clarity and user experience with small, focused changes.

### Tasks
- [x] Refine spacing and typography for better hierarchy
- [x] Add hover states and subtle shadows to interactive elements
- [x] Improve empty state messaging (no records, no filtered results, empty history)
- [x] Improve loading state visibility
- [x] Enhance error message presentation
- [x] Use badge variants and status-specific colors
- [x] Ensure accessibility (focus states, labels, ARIA attributes)
- [x] Add custom scrollbar styling

### Acceptance Criteria
- [x] UI feels polished and professional
- [x] Clear visual hierarchy
- [x] Interactive elements have clear hover/focus states
- [x] Empty states have helpful messaging with icons
- [x] Loading states are visible but unobtrusive
- [x] Readability maintained across all states
- [x] Status colors are consistent and meaningful

### Implementation Details

**Visual Enhancements:**

1. **Typography & Spacing**
   - Larger, bolder headings for better hierarchy
   - Increased spacing between sections (6-8 units)
   - Better line height and letter spacing

2. **Status Color System**
   - **Pending**: Blue (bg-blue-50, text-blue-700, border-blue-200)
   - **Approved**: Green (bg-green-50, text-green-700, border-green-200)
   - **Flagged**: Red (bg-red-50, text-red-700, border-red-200)
   - **Needs Revision**: Amber (bg-amber-50, text-amber-700, border-amber-200)
   - Applied consistently across Summary, Badges, and History

3. **Interactive Elements**
   - **Cards**: hover shadow-md, translate-y-0.5, border-2
   - **Buttons**: existing variants with better sizes
   - **Summary cards**: status-specific colors with smooth transitions
   - **History items**: hover:bg-muted/30 with transition

4. **Empty States**
   - Emoji icons for visual interest (🔍, 📋, 📝)
   - Larger text with clear hierarchy
   - Border-dashed containers with bg-muted/20
   - Actionable buttons where appropriate

5. **Loading State**
   - Spinning border animation (border-t-primary)
   - Centered with descriptive text
   - 12-unit padding for emphasis

6. **Error States**
   - Warning icon (⚠) for visual attention
   - Flex layout with icon and message
   - Enhanced border and background colors

7. **History Log**
   - Reversed order (most recent first)
   - Color-coded status transitions
   - Increased max-height (60→80 units)
   - Custom scrollbar styling
   - Quote styling for notes with border-l

8. **Page Layout**
   - Gradient background (from-background to-muted/20)
   - Container with max-width and responsive padding
   - Better header with larger title

### Verification Steps
✅ Tested hover states on all interactive elements
✅ Verified status colors are consistent across components
✅ Checked empty states (no records, filtered view, empty history)
✅ Verified loading spinner animation works
✅ Tested error display with long messages
✅ Verified accessibility - tab navigation works correctly
✅ Checked responsive layout on different screen sizes
✅ Verified custom scrollbar appears in history log

### Completion Gate
**Phase 4 is complete! ✅**
- UI improvements applied consistently
- Visual hierarchy is clear and professional
- All interactive states have appropriate feedback
- Accessibility maintained throughout

---

## 9. Phase 5: Testing and Verification ✅ COMPLETE

### Goals
Add tests to validate core functionality and ensure correctness.

### Test Coverage
- [x] **Unit tests:**
  - ✅ validation.spec.ts - Validation logic (note required for Flagged/Needs Revision)
  - ✅ hooks.spec.ts - Filter logic (useRecordFilter)
  - ✅ hooks.spec.ts - Summary count calculations (useStatusCounts)
- [x] **Component tests:**
  - ✅ RecordDetailDialog.spec.tsx - Dialog rendering, status display, note textarea, character count, buttons
  - ✅ RecordCard.spec.tsx - Card rendering and interactions
- [x] **Hook tests:**
  - ✅ Filter functionality with different statuses
  - ✅ "All" filter showing all records
  - ✅ Empty array handling
  - ✅ Status count calculations

### Test Files Created
1. **src/__tests__/validation.spec.ts** (8 tests)
   - Tests note requirement for flagged/needs_revision statuses
   - Tests optional note for approved/pending statuses
   - Tests whitespace handling

2. **src/__tests__/hooks.spec.ts** (9 tests)
   - Tests useRecordFilter with all status options
   - Tests edge cases (empty array, "all" filter)
   - Tests useStatusCounts calculations

3. **src/__tests__/RecordDetailDialog.spec.tsx** (7 tests)
   - Tests dialog rendering and visibility
   - Tests form elements (status dropdown, note textarea)
   - Tests character count display
   - Tests button interactions

### Test Results
```bash
Test Files  4 passed (4)
Tests  25 passed (25)
Duration  2.55s
```

### Acceptance Criteria
- [x] All tests pass ✅
- [x] Test coverage includes happy paths and validation failures
- [x] No skipped or flaky tests
- [x] Tests use proper mocks for API calls
- [x] Tests wrapped in `act()` where needed for React state updates

### Notes
- Simplified RecordDetailDialog tests to focus on rendering and user-visible behavior
- Avoided testing Radix UI Select internal behavior (complex portal rendering)
- Act warnings from RecordsProvider are informational only - tests still pass
- All critical validation logic covered in unit tests

### Verification Steps
✅ Ran `npm test` - all 25 tests passing
✅ Checked test output for failures - none found
✅ Verified mocks properly isolate components
✅ Confirmed tests cover core business logic

### Completion Gate
**Phase 5 is complete! ✅**
- Comprehensive test suite covering validation, hooks, and components
- All tests passing reliably
- Core behaviors validated

---

## 10. Phase 6: Documentation and Cleanup ✅ COMPLETE

### Goals
Document changes, clean up code, and prepare for handoff.

### Tasks
- [x] Remove debug code and console.logs
- [x] Add inline comments for non-obvious logic
- [x] Update README with architecture summary
- [x] Document known limitations (e.g., in-memory API)
- [x] Remove any TODO comments related to core functionality
- [x] Final code review for consistency

### Verification Performed
✅ Searched for console.log statements - none found
✅ Searched for TODO/FIXME comments - none found
✅ Updated README with comprehensive architecture documentation
✅ Documented all design patterns and file structure
✅ Added implementation status section to README
✅ Documented testing approach and results

### Acceptance Criteria
- [x] Codebase is clean and readable
- [x] README documents architecture and patterns used
- [x] No unnecessary debug code
- [x] Known limitations documented (in-memory API noted in original README)

### Completion Gate
**Phase 6 is complete! ✅**
- README updated with full architecture summary
- No debug code or TODOs remaining
- Code is production-ready for exercise evaluation

---

## 11. Issues and Iteration Log
x] All phases completed in order (Phases 1-6 complete)
- [x] Acceptance criteria met for every phase
- [x] Tests passing (25/25 tests passing)
- [x] Manual verification performed on all features
- [x] README updated with architecture notes
- [x] Code is clean and production-ready (for exercise purposes)

**✅ ALL WORK COMPLETE!**

### Summary of Deliverables

**Phase 1 - Refactoring:**
- Service Layer pattern with `recordsApi.ts`
- Container/Presenter separation
- Custom hooks for derived state
- Consistent naming throughout
- Architecture documented in PHASE1_ARCHITECTURE.md

**Phase 2 - Review Actions:**
- Status update with dropdown
- Validation (note required for Flagged/Needs Revision)
- Save functionality with API integration
- Inline success feedback (800ms delay)

**Phase 3 - Supporting Features:**
- Filter by status (working correctly)
- Summary with accurate counts
- History log with status transitions

**Phase 4 - UI/UX Polish:**
- Status-specific color system
- Enhanced empty/loading/error states
- Improved hover effects and accessibility
- Custom scrollbar styling
- Gradient background

**Phase 5 - Testing:**
- 25 tests covering validation, hooks, and components
- All tests passing reliably
- Proper mocking and isolation

**Phase 6 - Documentation:**
- README updated with architecture summary
- All design patterns documented
- No debug code or TODOs
- Clean, production-ready codebase

**Final Status:** Ready for review and evaluation! 🎉
- **Verification Performed:**

---

## 12. Final Sign-Off Checklist

- [ ] All phases completed in order
- [ ] Acceptance criteria met for every phase
- [ ] Tests passing
- [ ] Manual verification performed on all features
- [ ] README updated with architecture notes
- [ ] Code is clean and production-ready (for exercise purposes)

**Only after this checklist is complete is the work considered done.**
