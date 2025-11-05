import { NextRequest, NextResponse } from "next/server";

const MARKETING_GANTT_URL =
  process.env.NEXT_PUBLIC_MARKETING_GANTT_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmD1pwH70Jmk99umPEi-XNJrvAxCiIOb-3S40eFHmHxT8-YKQ_I2hWbIwsQ4909AAMTByWZcr7jhTj/pub?gid=240728240&single=true&output=csv";

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Toggle quote state or escape quotes
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

export async function GET(request: NextRequest) {
  try {
    const csvUrl = `${MARKETING_GANTT_URL}&timestamp=${Date.now()}`;
    const res = await fetch(csvUrl, {
      cache: "no-store",
      headers: { Accept: "text/csv", "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)" },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }

    const csv = await res.text();
    if (csv.includes("<!DOCTYPE") || csv.includes("<html")) {
      throw new Error("Received HTML instead of CSV. Ensure the sheet is published.");
    }

    const lines = csv.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ success: true, data: { items: [] }, summary: {}, headers: [], lastUpdated: new Date().toISOString() });
    }

    const parsed = lines.map(parseCSVLine);

    // Identify header row (search for "Key of Activities")
    const headerIndex = parsed.findIndex((row) => row[0]?.toLowerCase().includes("key of activities"));
    const headers = headerIndex >= 0 ? parsed[headerIndex] : parsed[0];

    // Column indexes
    const idx = (label: string) => headers.findIndex((h) => (h || "").toLowerCase().trim() === label.toLowerCase());
    const keyIdx = 0; // Key of Activities
    const notesIdx = idx("notes");
    const startIdx = idx("start");
    const endIdx = idx("end");
    const durationIdx = idx("duration");
    const statusIdx = idx("status");

    // Legend counts
    const legendRow = parsed.findIndex((row) => row.some((c) => (c || "").toLowerCase().includes("legend")));
    const statusLabels = ["Delayed", "Ongoing", "Target", "Completed", "On Hold"]; // From sheet sample
    const statusCounts: Record<string, number> = {};
    if (legendRow >= 0 && parsed[legendRow + 1]) {
      const countsRow = parsed[legendRow + 1];
      // Find the first occurrence of each label in headers; if not found, fallback to relative tail positions
      statusLabels.forEach((label, i) => {
        let value: number | undefined = undefined;
        const labelIdx = headers.findIndex((h) => (h || "").toLowerCase() === label.toLowerCase());
        if (labelIdx >= 0) {
          const raw = countsRow[labelIdx];
          const n = parseInt((raw || "").replace(/[^0-9-]/g, ""), 10);
          if (!Number.isNaN(n)) value = n;
        }
        if (value === undefined) {
          // try from the right side (as sample places counts near the end)
          const tail = countsRow.slice(-statusLabels.length);
          const raw = tail[i];
          const n = parseInt((raw || "").replace(/[^0-9-]/g, ""), 10);
          if (!Number.isNaN(n)) value = n;
        }
        statusCounts[label] = value ?? 0;
      });
    }

    // Items: iterate rows after headerIndex
    const startRow = headerIndex >= 0 ? headerIndex + 1 : 1;
    const items: Array<{
      name: string;
      isSubtask: boolean;
      notes?: string;
      start?: string;
      end?: string;
      duration?: string;
      status?: string;
      months: Record<string, string>; // month -> cell value (to reflect planned marks)
    }> = [];

    // Month columns present in header
    const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const monthIndices: Record<string, number> = {};
    monthNames.forEach((m) => {
      const mi = headers.findIndex((h) => (h || "").toUpperCase() === m);
      if (mi >= 0) monthIndices[m] = mi;
    });

    for (let r = startRow; r < parsed.length; r++) {
      const row = parsed[r];
      if (!row || row.length === 0) continue;
      const nameRaw = (row[keyIdx] || "").trim();
      if (!nameRaw) continue;

      // Skip rows that are metadata like title or legend content
      if (/^gantt chart/i.test(nameRaw) || /legend/i.test(nameRaw)) continue;

      const isSubtask = /^\s/.test((row[0] || ""));

      const months: Record<string, string> = {};
      Object.entries(monthIndices).forEach(([m, mi]) => {
        months[m] = (row[mi] || "").trim();
      });

      items.push({
        name: nameRaw,
        isSubtask,
        notes: notesIdx >= 0 ? row[notesIdx] || undefined : undefined,
        start: startIdx >= 0 ? row[startIdx] || undefined : undefined,
        end: endIdx >= 0 ? row[endIdx] || undefined : undefined,
        duration: durationIdx >= 0 ? row[durationIdx] || undefined : undefined,
        status: statusIdx >= 0 ? row[statusIdx] || undefined : undefined,
        months,
      });
    }

    return NextResponse.json({
      success: true,
      data: { items, headers, statusCounts },
      lastUpdated: new Date().toISOString(),
      source: "Marketing Gantt CSV",
    });
  } catch (err: any) {
    console.error("Error fetching Marketing Gantt:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch Marketing Gantt" },
      { status: 500 }
    );
  }
}
