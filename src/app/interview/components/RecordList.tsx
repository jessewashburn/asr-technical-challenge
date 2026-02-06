"use client";

/**
 * RecordList - Main Container Component
 * 
 * Orchestrates the record review interface by:
 * - Fetching records from context
 * - Managing filter state
 * - Delegating to presentational components (Summary, Filter, History)
 * - Handling record selection for detail dialog
 */

import { useState } from "react";
import { useRecords } from "../context/RecordsContext";
import { useRecordFilter } from "../hooks/useRecordFilter";
import type { RecordItem } from "../types";

import RecordCard from "./RecordCard";
import RecordDetailDialog from "./RecordDetailDialog";
import RecordFilter from "./RecordFilter";
import RecordSummary from "./RecordSummary";
import HistoryLog from "./HistoryLog";
import { Button } from "@/components/ui/button";

export default function RecordList() {
  const { records, loading, error, refresh } = useRecords();
  const { filter, setFilter, filteredRecords } = useRecordFilter(records);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  return (
    <div className="space-y-6">
      {/* Header with count and controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Records
          </h2>
          <p className="text-sm text-muted-foreground">
            {records.length} total • {filteredRecords.length} showing
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <RecordFilter value={filter} onChange={setFilter} />
          <Button variant="ghost" onClick={() => refresh()} disabled={loading}>
            Reload
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium">Error: {error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Loading records...</p>
        </div>
      )}

      {/* Summary counts */}
      {!loading && <RecordSummary />}

      {/* Records grid */}
      {!loading && filteredRecords.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <RecordCard 
              key={record.id} 
              record={record} 
              onSelect={setSelectedRecord} 
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredRecords.length === 0 && records.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No records match the selected filter.
          </p>
          <Button 
            variant="link" 
            onClick={() => setFilter('all')}
            className="mt-2"
          >
            Clear filter
          </Button>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No records found.
          </p>
        </div>
      )}

      {/* Detail dialog */}
      {selectedRecord && (
        <RecordDetailDialog 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}

      {/* History log */}
      <HistoryLog />
    </div>
  );
}
