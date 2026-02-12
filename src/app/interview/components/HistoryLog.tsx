import { useRecords } from "../context/RecordsContext";
import { Button } from "@/components/ui/button";

/**
 * History log renders a chronological, scrollable list of status changes
 * captured during the current session by the RecordsContext. Each entry shows
 * the record id, a human‑readable timestamp, the previous → new status, and an
 * optional reviewer note to aid traceability. A Clear action is provided to
 * reset the in‑memory log.
 */
export default function HistoryLog() {
  const { history, clearHistory } = useRecords();
  
  // Color coding for status transitions
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-blue-600",
      approved: "text-green-600",
      flagged: "text-red-600",
      needs_revision: "text-amber-600",
    };
    return colors[status] || "text-foreground";
  };

  return (
    <div className="space-y-4 mt-8 pt-6 border-t">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Change History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {history.length} {history.length === 1 ? "change" : "changes"} recorded this session
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearHistory}>
            Clear History
          </Button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <div className="text-2xl mb-2">📝</div>
          <p className="text-sm text-muted-foreground">No status changes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Changes will be tracked here as you review records</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {history.slice().reverse().map((entry, idx) => (
            <li key={idx} className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold text-sm">Record {entry.id}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className={`font-medium capitalize ${getStatusColor(entry.previousStatus)}`}>
                  {entry.previousStatus.replace("_", " ")}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className={`font-medium capitalize ${getStatusColor(entry.newStatus)}`}>
                  {entry.newStatus.replace("_", " ")}
                </span>
              </div>
              {entry.note && (
                <p className="text-xs text-muted-foreground mt-2 italic pl-3 border-l-2 border-muted">
                  &ldquo;{entry.note}&rdquo;
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
