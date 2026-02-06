import { RecordsProvider } from './context/RecordsContext';
import RecordList from './components/RecordList';

/**
 * The main interview page. It wraps the record list with the RecordsProvider
 * to supply global state and API functions. You can extend this page to
 * include additional context or summary information, such as charts or
 * aggregate metrics.
 */
export default function InterviewPage() {
  return (
    <RecordsProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Review &amp; Annotation Task</h1>
            <p className="text-base text-muted-foreground max-w-3xl">
              Use this interface to review incoming specimen records, adjust their status,
              and leave notes. The data is served by a mock API and stored in memory.
            </p>
          </header>
          <RecordList />
        </div>
      </div>
    </RecordsProvider>
  );
}
