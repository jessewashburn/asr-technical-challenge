# 20_ROADMAP_OUTPUT.md

# Specification-Driven Execution Roadmap

---

## 0. Clarifications and Assumptions

**Clarifying questions (minimal):**

* [ ] Are the optional Phase 2 features (pagination and optimistic concurrency) expected to be fully implemented or only planned and scoped?
* [ ] Does the repository already include a test framework, or is adding a minimal, conventional setup acceptable if missing?

**Stated Assumptions (proceeding):**

* Core Phase 2 requirements are implemented; optional features are scoped with explicit completion gates.
* Existing Next.js + TypeScript testing conventions are used if present; otherwise, only minimal, standard tooling is added.

---

## 1. Purpose and Scope

**Objective:**
Refactor and extend the VectorCam interview dashboard to improve maintainability, correctness, and feature completeness for record review workflows.

**In Scope:**

* Refactoring the `/interview` module for clarity and separation of concerns
* Implementing review actions (Approved, Flagged, Needs Revision)
* Validation and persistence via the mock API
* Status filtering, summary counts, and audit history
* Tests covering core logic, validation, and UI behavior

**Out of Scope / Non-Goals:**

* Mobile capture pipeline
* Real database persistence beyond the in-memory mock API
* Authentication/authorization
* Large-scale performance optimization

This document is the **single source of truth** for planning, execution, and verification.

---

## 2. Execution Environment (Lock First)

Before any planning or implementation begins, confirm:

* [ ] Correct repository and branch checked out
* [ ] **Target deployment:** Local development (interview exercise)
* [ ] **Runtime:** Node.js 20.17.0 (local dev server)
* [ ] Required services running (Next.js dev server, mock API)
* [ ] Environment variables present (if any)
* [ ] Tooling access verified (npm, test runner)

**No implementation proceeds until this section is verified.**

---

## 3. System Context

### Domain Context

**Feature:** VectorCam Review & Annotation Dashboard
**Goal:** Enable reviewers to inspect, update, filter, and audit specimen records
**Users:**

* Entomologists
* Public health program managers
* Internal reviewers (interview evaluators)

### Stack

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
* **Backend:** Next.js API routes (mock API)
* **Database:** In-memory mock data (resets on server restart)
* **Jobs/Workflows:** None
* **Integrations:** None

### Constraints and Standards

* **Architecture to follow:** Feature-based structure under `src/app/interview`
* **Code conventions:** TypeScript-first, idiomatic React hooks, clear naming
* **Security/Compliance:** None specified (local-only exercise)
* **Forbidden changes:** Over-engineering, unrelated rewrites, changing core data flow semantics

---

## 4. Desired Behavior (What "Correct" Means)

### Primary Flows (Happy Paths)

* User navigates to `/interview` and sees a list of records
* User opens a record detail dialog
* User updates record status via dropdown
* Validation is enforced when required
* Update persists via PATCH to mock API
* List, summary counts, and history update reactively

### Edge Cases and Failure Modes

* Missing note when setting status to Flagged or Needs Revision
* PATCH request failure
* Record status change causes it to leave the current filtered view
* Empty list or empty filter results
* (Optional) Version conflict during PATCH (409)

### Business Acceptance Criteria

* Status updates persist correctly and are reflected across the UI
* Validation blocks invalid updates with clear feedback
* Summary counts remain accurate at all times
* History log records all successful status transitions
* Tests cover core flows and validation failures

### Data Integrity and Audit Requirements

* **Data integrity:** Status and note updates are atomic; no partial state
* **Audit/logging:** Every successful status change is recorded with timestamp, transition, and note

---

## 5. Scope and Timeline

* **Deadline/Timebox:** Interview exercise scope
* **Priorities:**

  * Must-have: Refactor, review actions, filter, summary, history, tests
  * Nice-to-have: Pagination, optimistic concurrency

---

## 6. Phased Roadmap Overview

Execution is broken into **strict, sequential phases**.
Only one phase may be active at a time.

Each phase produces a concrete artifact, has explicit acceptance criteria, and is independently verifiable.

---

## 7. Phase 1: Foundation / Scaffolding

### Goals

* Understand existing implementation
* Refactor for clarity, consistency, and separation of concerns
* Establish clean architectural boundaries

### Tasks

* [ ] Read and explain responsibilities of existing files in `/interview`
* [ ] Identify issues in naming, state flow, and concern mixing
* [ ] Reorganize files into logical groups (context, hooks, components, utilities)
* [ ] Extract derived state and side effects into hooks
* [ ] Improve loading and error handling
* [ ] Remove unused or redundant code

### Acceptance Criteria

* [ ] Application runs without behavior change
* [ ] File structure is logical and discoverable
* [ ] State, side effects, and presentation are clearly separated
* [ ] No unused code remains

### Verification Steps

* Manual walkthrough of `/interview`
* Visual inspection of file structure and naming
* `npm run dev` starts and runs without errors

### Completion Gate

**Phase 1 is complete only when refactoring introduces no regressions.**

---

## 8. Phase 2: Core Behavior Implementation

### Goals

Implement review actions and ensure consistent state across list, summary, and history.

### Tasks

* [ ] Implement status update via dropdown in detail dialog
* [ ] Enforce validation rules for notes
* [ ] Persist updates via PATCH to mock API
* [ ] Update local state so list, summary counts, and history stay in sync
* [ ] Provide lightweight success/failure feedback in the UI

### Acceptance Criteria

* [ ] Approved, Flagged, and Needs Revision persist correctly
* [ ] Validation blocks save when note is required and missing
* [ ] UI updates reactively without page reload
* [ ] Dialog closes only on successful save

### Verification Steps

```bash
npm run dev
```

* Manually change record status
* Verify list, summary, and history update correctly

### Completion Gate

No features beyond defined core behavior are added in this phase.

---

## 9. Phase 3: Edge Cases and Failure Handling

### Goals

Harden the system against invalid input and API failures.

### Tasks

* [ ] Handle PATCH failures with clear user feedback
* [ ] Ensure filtered views remain consistent after status changes
* [ ] Prevent invalid intermediate UI states

### Acceptance Criteria

* [ ] Errors are surfaced clearly to the user
* [ ] No data corruption or inconsistent UI state
* [ ] History logs only successful transitions

### Verification Steps

* Simulate failed PATCH requests
* Trigger validation failures
* Inspect UI state and history behavior

---

## 10. Phase 4: Verification and Testing

### Goals

Prove correctness against business acceptance criteria.

### Test Coverage Expectations

* [ ] Unit tests for state transitions
* [ ] Component tests for dialog interaction and validation
* [ ] Optional test for filter correctness after updates

### Acceptance Criteria

* [ ] All tests pass
* [ ] No skipped or flaky tests
* [ ] Core flows verified by tests

### Verification Artifacts

```bash
npm test
```

---

## 11. Phase 5: Cleanup, Documentation, and Handoff

### Goals

Make the solution understandable, maintainable, and review-ready.

### Tasks

* [ ] Remove debug code and temporary workarounds
* [ ] Add comments where intent is non-obvious
* [ ] Update README or inline documentation to reflect architecture
* [ ] Document known limitations and optional future improvements

### Acceptance Criteria

* [ ] Code follows stated conventions
* [ ] Documentation matches actual behavior
* [ ] No TODOs remain in core functionality

---

## 12. Issues and Iteration Log

*Record all issues discovered during execution. Do not delete resolved issues.*

### Issue Template

**Issue #:**

* **Observed:**
* **Expected:**
* **Resolution:**
* **Verification:**
* **Phase:**

---

## 13. Final Sign-Off Checklist

* [ ] All phases completed in order
* [ ] All acceptance criteria met
* [ ] Tests passing
* [ ] Manual verification completed
* [ ] Documentation updated
* [ ] Ready for review

**Only after this checklist is complete is the work considered done.**
