"use client";

/**
 * RecordDetailDialog - Review Action Interface
 * 
 * Provides a focused modal for reviewing records and updating their status.
 * Implements validation logic and integrates with the records context for persistence.
 */

import { useState } from "react";
import { useRecords } from "../context/RecordsContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import type { RecordItem, RecordStatus } from "../types";

interface RecordDetailDialogProps {
  record: RecordItem;
  onClose: () => void;
}

export default function RecordDetailDialog({
  record,
  onClose,
}: RecordDetailDialogProps) {
  const { updateRecord } = useRecords();
  
  const [status, setStatus] = useState<RecordStatus>(record.status);
  const [note, setNote] = useState<string>(record.note ?? "");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const statusOptions: RecordStatus[] = [
    "pending",
    "approved",
    "flagged",
    "needs_revision",
  ];

  const requiresNote = status === "flagged" || status === "needs_revision";

  const handleSave = async () => {
    // Clear previous errors
    setValidationError(null);
    setSaveError(null);

    // Validate note requirement
    if (requiresNote && !note.trim()) {
      setValidationError("A note is required for flagged or needs revision status.");
      return;
    }

    setSaving(true);
    try {
      await updateRecord(record.id, { status, note: note.trim() || undefined });
      onClose(); // Close dialog on successful save
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg tracking-tight">
            {record.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {record.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as RecordStatus);
                setValidationError(null); // Clear validation when status changes
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note input */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="block text-sm font-medium">
                Reviewer note
                {requiresNote && <span className="text-destructive ml-1">*</span>}
              </label>
              <span className="text-xs text-muted-foreground">
                {note.length} characters
              </span>
            </div>
            <Textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setValidationError(null); // Clear validation on input
              }}
              placeholder={requiresNote ? "Add a note (required)..." : "Add a note (optional)..."}
              className="min-h-24"
            />
            {requiresNote && (
              <p className="mt-1 text-xs text-muted-foreground">
                Notes are required for flagged or needs revision status.
              </p>
            )}
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3">
              <p className="text-sm text-destructive">{validationError}</p>
            </div>
          )}

          {/* Save error */}
          {saveError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3">
              <p className="text-sm text-destructive">Error: {saveError}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
