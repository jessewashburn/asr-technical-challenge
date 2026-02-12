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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecordList() {
  const { 
    records = [], // Default to empty array if undefined
    loading, 
    error, 
    refresh, 
    currentPage, 
    totalPages: rawTotalPages, 
    totalCount,
    pageSize,
    setPageSize,
    goToPage
  } = useRecords();
  const { filter, setFilter, filteredRecords } = useRecordFilter(records);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  // Ensure totalPages is never NaN or 0
  const totalPages = Math.max(1, rawTotalPages || 1);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with count and controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Records
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{totalCount}</span> total • Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
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
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
              <RecordCard 
                key={record.id} 
                record={record} 
                onSelect={setSelectedRecord} 
              />
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex flex-col items-center justify-center gap-3 pt-4">
            {totalPages > 1 && (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  ← Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next →
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Show
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                per page
              </span>
            </div>
          </div>
        </>
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
