import type { RecordStatus } from "../types";
import { useRecords } from "../context/RecordsContext";

/**
 * RecordSummary computes derived counts by status from the current record set
 * provided by RecordsContext and renders them as a lightweight dashboard.
 */
export default function RecordSummary() {
  const { records } = useRecords();
  // Compute counts for each status
  const counts = records.reduce(
    (acc, record) => {
      acc[record.status] = (acc[record.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<RecordStatus, number>,
  );
  const statuses: RecordStatus[] = [
    "pending",
    "approved",
    "flagged",
    "needs_revision",
  ];

  // Status-specific colors for visual distinction
  const statusStyles: Record<RecordStatus, string> = {
    pending: "border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300",
    approved: "border-green-200 bg-green-50/50 hover:bg-green-50 hover:border-green-300",
    flagged: "border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300",
    needs_revision: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300",
  };

  const statusTextColors: Record<RecordStatus, string> = {
    pending: "text-blue-700",
    approved: "text-green-700",
    flagged: "text-red-700",
    needs_revision: "text-amber-700",
  };

  return (
    <section aria-label="Record status summary" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
          Summary
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review status counts
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statuses.map((status) => {
          const count = counts[status] ?? 0;
          return (
            <div
              key={status}
              className={`rounded-lg border p-4 sm:p-5 flex flex-col items-center justify-center shadow-sm transition-all duration-200 ${statusStyles[status]}`}
            >
              <span className="text-xs sm:text-sm font-semibold capitalize text-muted-foreground mb-1">
                {status.replace("_", " ")}
              </span>
              <span
                className={`text-2xl sm:text-3xl font-bold tracking-tight ${statusTextColors[status]}`}
                aria-label={`${status} count`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
