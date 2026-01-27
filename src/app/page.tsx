import Link from "next/link";

/**
 * Landing page for the interview application. It introduces the context
 * and outlines both phases of the exercise. Candidates can navigate to the interview
 * task via the call to action.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-medium text-muted-foreground">
          VectorCam Web Interview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">
          Review &amp; Annotation Workflow Exercise
        </h1>
        <p className="text-base text-muted-foreground mt-4">
          This application is a simplified review and annotation dashboard
          inspired by VectorCam’s production system. Your goal is to improve an
          intentionally imperfect implementation, design clean abstractions and
          extend it with realistic features using a mock API.
        </p>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">
              Phase 1: Analyse &amp; Refactor
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Read and explain the existing components and hooks, identify
              issues with naming, state management, error handling, and
              separation of concerns. Refactor thoughtfully. The code has been
              intentionally split across multiple files (context, hooks,
              summary, filter and history) to encourage architectural thinking.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                Organise context, hooks and UI components into clear modules
              </li>
              <li>Add loading, error and empty states where missing</li>
              <li>
                Explain how derived data (summary and history) is computed
              </li>
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">
              Phase 2: Extend &amp; Design
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Extend the system with new features (e.g. filter by status,
              summary counts, history log) and implement review actions
              (approve, flag, needs revision). Persist updates via the mock API
              and ensure changes propagate across components.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Design forms and interactions with proper validation</li>
              <li>Consider concurrency, audit trails and atomic updates</li>
              <li>Discuss testing, scalability and edge cases</li>
            </ul>
          </div>
        </section>

        <section className="mt-10 rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Guidance &amp; Expectations</h2>
          <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div className="rounded-md bg-muted/40 p-3">
              Think out loud, ask clarifying questions, and explain tradeoffs.
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              Optimise for clarity and correctness over finishing every detail.
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              Keep domain logic separate from UI where it makes sense.
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              Prefer small, safe refactors over big rewrites.
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/interview"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Start the Interview Task →
          </Link>
          <p className="text-xs text-muted-foreground">
            Tip: the mock API is in memory and resets when the server restarts.
          </p>
        </div>

        <footer className="mt-14 border-t pt-6 text-xs text-muted-foreground">
          This exercise uses a mock API and does not connect to production
          systems.
        </footer>
      </div>
    </main>
  );
}
