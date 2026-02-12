import { NextRequest, NextResponse } from "next/server";

import type { RecordItem, RecordStatus } from "@/app/interview/types";

// Sample dataset. Feel free to extend with more realistic examples.
let records: RecordItem[] = [
  {
    id: "1",
    name: "Anopheles gambiae ♀",
    status: "pending",
    description:
      "Collected by CDC light trap near Nyansato village (Ghana), 12 Mar 2026. Indoor resting capture at 05:30. Wing venation suggests An. gambiae s.l.; awaiting PCR confirmation for s.s. vs coluzzii.",
    version: 1,
  },
  {
    id: "2",
    name: "Anopheles funestus ♀",
    status: "approved",
    description:
      "Human landing catch (HLC) in Kagera region (Tanzania), 18 Mar 2026, 22:15. Distinctively banded legs and pale wing spots. Verified by senior entomologist.",
    note: "Morphology consistent with An. funestus s.s.; add to indoor-resting dataset.",
    version: 1,
  },
  {
    id: "3",
    name: "Anopheles arabiensis ♀",
    status: "flagged",
    description:
      "Pyrethrum spray catch in Mchinji (Malawi), 09 Mar 2026. Specimen abdomen damaged; blood meal analysis inconclusive.",
    note: "Image blurry; request re-photo and consider ELISA for bloodmeal if tissue sufficient.",
    version: 1,
  },
  {
    id: "4",
    name: "Anopheles gambiae larva (L3)",
    status: "needs_revision",
    description:
      "Larval dip from irrigated rice field near Kano (Nigeria), 21 Mar 2026. Head capsule and palmate hairs photographed; metadata incomplete.",
    note: "Missing water body type classification and turbidity; please add habitat details.",
    version: 1,
  },
  {
    id: "5",
    name: "Anopheles coluzzii ♀",
    status: "approved",
    description:
      "Indoor resting collection, Bobo-Dioulasso (Burkina Faso), 16 Mar 2026. PCR (SINE200) confirms coluzzii. Clear maxillary palps and wing spots.",
    note: "Confirmed coluzzii by molecular assay; include in vector composition analysis.",
    version: 1,
  },
  {
    id: "6",
    name: "Anopheles gambiae ♂",
    status: "pending",
    description:
      "Sweep net capture near breeding site in Kisumu (Kenya), 10 Mar 2026. Plumose antennae visible; specimen intact. Awaiting species-level confirmation.",
    version: 1,
  },
  {
    id: "7",
    name: "Anopheles rivulorum ♀",
    status: "flagged",
    description:
      "Window exit trap, Nkhata Bay (Malawi), 13 Mar 2026. Possible mislabel: morphology closer to An. funestus group; needs expert review.",
    note: "Suspected mis-ID; cross-check funestus-group keys and reclassify if needed.",
    version: 1,
  },
  {
    id: "8",
    name: "Anopheles gambiae egg raft",
    status: "needs_revision",
    description:
      "Collected from temporary puddle, Tamale (Ghana), 08 Mar 2026. Photographs show egg raft but GPS accuracy low (±200m).",
    note: "Update coordinates and add microhabitat photo for verification.",
    version: 1,
  },
  {
    id: "9",
    name: "Anopheles pharoensis ♀",
    status: "approved",
    description:
      "Light trap near irrigation canal, Gezira (Sudan), 19 Mar 2026. Diagnostic pale scaling on wings; specimen in good condition.",
    version: 1,
  },
  {
    id: "10",
    name: "Anopheles gambiae s.s. ♀",
    status: "approved",
    description:
      "HLC indoor, Savelugu (Ghana), 15 Mar 2026. PCR confirms s.s.; ELISA positive for human blood meal. Eligible for biting time analysis.",
    note: "Add to vector-human contact dataset (indoor, late evening).",
    version: 1,
  },
  {
    id: "11",
    name: "Anopheles coustani ♀",
    status: "pending",
    description:
      "Outdoor resting capture, Kilifi (Kenya), 12 Mar 2026. Secondary vector; useful for zoophily assessment. Awaiting supervisor review.",
    version: 1,
  },
  {
    id: "12",
    name: "Anopheles funestus ♀ (damaged)",
    status: "flagged",
    description:
      "PSC in Muleba (Tanzania), 20 Mar 2026. Abdomen ruptured; parity determination not possible.",
    note: "Consider excluding from parity analysis; keep for species presence record only.",
    version: 1,
  },
];

/*
 * Mock Records API for the interview exercise. This API stores records in
 * memory and supports reading and updating them. Each record has a status,
 * optional note, and version number for optimistic concurrency control.
 * In-memory persistence means data resets when the server restarts, which
 * is acceptable for this exercise.
 * 
 * Supports:
 * - GET with pagination (page, limit query params)
 * - PATCH with version-based optimistic concurrency (409 on conflict)
 */

// GET /api/mock/records?page=1&limit=10
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  // If no pagination params, return all records (backward compatibility)
  if (!pageParam && !limitParam) {
    return NextResponse.json(records);
  }

  const page = parseInt(pageParam || '1', 10);
  const limit = parseInt(limitParam || '10', 10);

  // Validate params
  if (page < 1 || limit < 1) {
    return NextResponse.json(
      { error: 'page and limit must be positive integers' },
      { status: 400 }
    );
  }

  const totalCount = records.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRecords = records.slice(startIndex, endIndex);

  // Calculate status counts from ALL records, not just current page
  const statusCounts = {
    pending: records.filter(r => r.status === 'pending').length,
    approved: records.filter(r => r.status === 'approved').length,
    flagged: records.filter(r => r.status === 'flagged').length,
    needs_revision: records.filter(r => r.status === 'needs_revision').length,
  };

  return NextResponse.json({
    records: paginatedRecords,
    totalCount,
    page,
    limit,
    statusCounts,
  });
}

// PATCH /api/mock/records - with optimistic concurrency
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, note, version } = body as {
      id: string;
      status?: RecordStatus;
      note?: string;
      version?: number;
    };

    const record = records.find((r) => r.id === id);
    if (!record) {
      return NextResponse.json(
        { error: `Record with id ${id} not found.` },
        { status: 404 },
      );
    }

    // Optimistic concurrency check
    if (version !== undefined && record.version !== version) {
      return NextResponse.json(
        { 
          error: "version_conflict",
          message: "This record has been modified by another user. Please refresh and try again.",
          serverRecord: record
        },
        { status: 409 },
      );
    }

    // Update record
    if (status) record.status = status;
    if (note !== undefined) record.note = note;
    
    // Increment version after successful update
    record.version += 1;

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
