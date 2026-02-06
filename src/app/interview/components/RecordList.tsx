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
import RecordFilter from "./RecordFilter";
import RecordSummary from "./RecordSummary";
import HistoryLog from "./HistoryLog";
import RecordDetailDialog from "./RecordDetailDialog";
import { Button } from "@/components/ui/button";

export default function RecordList() {
  const { records, loading, error, refresh } = useRecords();
  const { filter, setFilter, filteredRecords } = useRecordFilter(records);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with count and controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Records
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{records.length}</span> total • <span className="font-medium text-foreground">{filteredRecords.length}</span> showing
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
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-destructive text-lg">⚠</span>
            <div>
              <p className="text-sm font-semibold text-destructive">Error Loading Records</p>
              <p className="text-sm text-destructive/90 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading records...</p>
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
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border-2 border-dashed bg-muted/20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-base font-medium text-foreground mb-1">
            No records match this filter
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try selecting a different status or view all records
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilter('all')}
          >
            Show all records
          </Button>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border-2 border-dashed bg-muted/20">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-base font-medium text-foreground mb-1">
            No records available
          </p>
          <p className="text-sm text-muted-foreground">
            Records will appear here once they are loaded
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
