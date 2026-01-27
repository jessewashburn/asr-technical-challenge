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
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Review &amp; Annotation Task</h1>
        <p className="text-muted-foreground">
          Use this interface to review incoming records, adjust their status,
          and leave notes. The data is served by a mock API and stored in
          memory.
        </p>
        <RecordList />
      </div>
    </RecordsProvider>
  );
}
