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

## 6. Phase 2: Core Feature - Review Actions with Validation

### Goals
Implement status update workflow with validation through the detail dialog.

### Tasks
- [ ] Wire status dropdown in RecordDetailDialog to local state
- [ ] Add note textarea with character count
- [ ] Implement validation logic:
  - Flagged/Needs Revision: non-empty note required
  - Approved: note optional
- [ ] Show inline validation errors when note is missing
- [ ] Implement save handler:
  - Validate inputs
  - Call API service to PATCH record
  - Handle success: update context, close dialog, show success message
  - Handle errors: show error message, keep dialog open
- [ ] Ensure optimistic or pessimistic update strategy is clear

### Acceptance Criteria
- [ ] Status dropdown correctly updates state
- [ ] Note validation prevents save for invalid inputs
- [ ] Validation error messages are clear and inline
- [ ] Successful save updates record in context
- [ ] List reflects updated status immediately
- [ ] Dialog closes only on successful save
- [ ] Success/error feedback shown to user (toast or inline)

### Verification Steps
- Manually test each status change scenario
- Test validation (try saving Flagged without note)
- Check that list updates after save
- Verify API PATCH request in Network tab

### Completion Gate
Status updates work end-to-end with proper validation and error handling.

---

## 7. Phase 3: Supporting Features (Filter, Summary, History)

### Goals
Implement filter functionality, summary counts, and history log.

### Tasks
- [ ] **Filter:**
  - Wire status filter dropdown to context/hook
  - Implement filtering logic for records
  - Handle "All" option
  - Ensure filter persists during updates
- [ ] **Summary:**
  - Create RecordSummary component showing counts per status
  - Calculate counts from current records state
  - Update reactively when records change
- [ ] **History Log:**
  - Extend context to track status change history
  - On status update, append history entry: timestamp, from→to, note
  - Display history in HistoryLog component
  - Most recent first, scrollable
  - Add clear history option (in-memory only)

### Acceptance Criteria
- [ ] Filter correctly shows/hides records by status
- [ ] Filter defaults to "All" with clear indication
- [ ] Summary displays accurate counts for all statuses
- [ ] Summary updates when records change
- [ ] History appends entry on each status change
- [ ] History shows timestamp, status transition, and note
- [ ] History is ordered (most recent first) and scrollable

### Verification Steps
- Test filter with each status option
- Verify counts match visible records
- Change record status and confirm history entry appears
- Check history formatting and ordering

### Completion Gate
All three supporting features (filter, summary, history) work correctly and stay in sync.

---

## 8. Phase 4: UI/UX Polish

### Goals
Improve visual clarity and user experience with small, focused changes.

### Tasks
- [ ] Refine spacing and typography for better hierarchy
- [ ] Add hover states and subtle shadows to interactive elements
- [ ] Improve empty state messaging (no records, no filtered results, empty history)
- [ ] Improve loading state visibility
- [ ] Enhance error message presentation
- [ ] Use shadcn variants effectively (e.g., badge variants for statuses)
- [ ] Ensure accessibility (focus states, labels, ARIA attributes)
- [ ] Optional: subtle color theming for status badges

### Acceptance Criteria
- [ ] UI feels polished and professional
- [ ] Clear visual hierarchy
- [ ] Interactive elements have clear hover/focus states
- [ ] Empty states have helpful messaging
- [ ] Loading states are visible but unobtrusive
- [ ] Readability maintained across all states

### Verification Steps
- Visual inspection of all components
- Test hover and focus states
- Check empty states (clear all records, clear history)
- Verify accessibility with keyboard navigation

### Completion Gate
UI improvements applied consistently without breaking functionality.

---

## 9. Phase 5: Testing and Verification

### Goals
Add tests to validate core functionality and ensure correctness.

### Test Coverage Expectations
- [ ] **Unit tests:**
  - Validation logic (note required for Flagged/Needs Revision)
  - Filter logic
  - Summary count calculations
- [ ] **Component tests:**
  - RecordDetailDialog: status selection, note input, validation errors, save flow
  - RecordCard interactions
  - Filter component behavior
  - HistoryLog rendering
- [ ] **Integration tests:**
  - Full review workflow: open dialog → change status → add note → save → verify updates

### Acceptance Criteria
- [ ] All tests pass
- [ ] Test coverage includes happy paths and validation failures
- [ ] No skipped or flaky tests
- [ ] Tests use proper mocks for API calls

### Verification Steps
- Run `npm test` or `npx vitest`
- Check test output for passes/failures
- Review test coverage report if available

### Completion Gate
Test suite validates key behaviors and all tests pass reliably.

---

## 10. Phase 6: Documentation and Cleanup

### Goals
Document changes, clean up code, and prepare for handoff.

### Tasks
- [ ] Remove debug code and console.logs
- [ ] Add inline comments for non-obvious logic
- [ ] Update README with architecture summary
- [ ] Document known limitations (e.g., in-memory API)
- [ ] Remove any TODO comments related to core functionality
- [ ] Final code review for consistency

### Acceptance Criteria
- [ ] Codebase is clean and readable
- [ ] README documents architecture and patterns used
- [ ] No unnecessary debug code
- [ ] Known limitations documented

---

## 11. Issues and Iteration Log

All discovered issues will be recorded here.

### Issue Template
- **Description:**
- **Observed Behavior:**
- **Expected Behavior:**
- **Resolution:**
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
