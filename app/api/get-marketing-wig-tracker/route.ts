import { NextRequest, NextResponse } from "next/server";

// Marketing WIG Tracker CSV URL
const MARKETING_WIG_TRACKER_URL =
  process.env.NEXT_PUBLIC_MARKETING_WIG_TRACKER_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmD1pwH70Jmk99umPEi-XNJrvAxCiIOb-3S40eFHmHxT8-YKQ_I2hWbIwsQ4909AAMTByWZcr7jhTj/pub?gid=1083366093&single=true&output=csv";

// Helper function to parse CSV line, handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching Marketing WIG Tracker data from:", MARKETING_WIG_TRACKER_URL);

    const csvUrl = `${MARKETING_WIG_TRACKER_URL}&timestamp=${Date.now()}`;
    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }

    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);
    console.log("First 200 chars:", csvText.substring(0, 200));

    // Check if we got HTML instead of CSV
    if (csvText.includes("<!DOCTYPE") || csvText.includes("<html")) {
      throw new Error(
        "Received HTML instead of CSV. The Google Sheet may not be published to the web."
      );
    }

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim());
    console.log("Parsed lines:", lines.length);

    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: "No data found in CSV",
        data: [],
        headers: [],
      });
    }

    // Parse all lines
    const parsedLines = lines.map((line) => parseCSVLine(line));

    // Extract header row (first row)
    const headers = parsedLines[0] || [];

    // Find LEAD rows and extract activities
    const leads: Array<{
      leadNumber: string;
      leadStatement: string;
      status: string;
      activities: Array<{
        activity: string;
        notes: string;
        status: string;
      }>;
    }> = [];

    let currentLead: {
      leadNumber: string;
      leadStatement: string;
      status: string;
      activities: Array<{
        activity: string;
        notes: string;
        status: string;
      }>;
    } | null = null;

    // Find status column index (look for "STATUS" in header)
    const statusColIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("status")
    );
    // Find NOTES column index
    const notesColIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("notes")
    );
    // Find Key of Activities column index (usually first column)
    const keyColIndex = 0;

    // Parse data rows
    for (let i = 1; i < parsedLines.length; i++) {
      const row = parsedLines[i];
      if (row.length === 0) continue;

      const keyActivity = (row[keyColIndex] || "").trim();

      // Check if this is a LEAD row (starts with "LEAD")
      if (keyActivity.match(/^LEAD\s+\d+/i)) {
        // Save previous lead if exists
        if (currentLead) {
          leads.push(currentLead);
        }

        // Extract lead number and statement
        const leadMatch = keyActivity.match(/^LEAD\s+(\d+)/i);
        const leadNumber = leadMatch ? `LEAD ${leadMatch[1]}` : keyActivity;

        // Find the lead statement (next non-empty row)
        let leadStatement = "";
        let status = "";
        for (let j = i + 1; j < Math.min(parsedLines.length, i + 5); j++) {
          const nextRow = parsedLines[j];
          const nextKey = (nextRow[keyColIndex] || "").trim();
          if (nextKey && !nextKey.match(/^LEAD\s+\d+/i) && !nextKey.match(/^\d+\./)) {
            leadStatement = nextKey;
            status = statusColIndex >= 0 ? (nextRow[statusColIndex] || "").trim() : "";
            break;
          }
        }

        currentLead = {
          leadNumber,
          leadStatement,
          status: status || "Unknown",
          activities: [],
        };
      }
      // Check if this is an activity row (starts with number like "1.", "2.", etc.)
      else if (currentLead && keyActivity.match(/^\d+\./)) {
        const activity = keyActivity.replace(/^\d+\.\s*/, "");
        const notes =
          notesColIndex >= 0 ? (row[notesColIndex] || "").trim() : "";
        const activityStatus =
          statusColIndex >= 0 ? (row[statusColIndex] || "").trim() : "";

        if (activity) {
          currentLead.activities.push({
            activity,
            notes,
            status: activityStatus || "Unknown",
          });
        }
      }
    }

    // Save last lead
    if (currentLead) {
      leads.push(currentLead);
    }

    // Extract summary statistics from legend section
    // Look for rows containing "Pending Review", "Drafting", "In progress", "Completed", "Approved"
    const legendRowIndex = parsedLines.findIndex((row) =>
      row.some((cell) => cell.toLowerCase().includes("legend"))
    );

    const statusCounts: Record<string, number> = {};
    if (legendRowIndex >= 0) {
      // The row after legend might contain counts
      const countRow = parsedLines[legendRowIndex + 1] || [];
      const statusLabels = ["Pending Review", "Drafting", "In progress", "Completed", "Approved"];
      
      // Find status labels in header row
      const statusIndices: Record<string, number> = {};
      headers.forEach((h, idx) => {
        const normalized = h.toLowerCase().trim();
        statusLabels.forEach((label) => {
          if (normalized === label.toLowerCase()) {
            statusIndices[label] = idx;
          }
        });
      });

      // Extract counts from countRow
      Object.entries(statusIndices).forEach(([label, idx]) => {
        const count = parseInt(countRow[idx] || "0", 10);
        if (!isNaN(count)) {
          statusCounts[label] = count;
        }
      });
    }

    // Calculate totals
    const totalLeads = leads.length;
    const totalActivities = leads.reduce(
      (sum, lead) => sum + lead.activities.length,
      0
    );

    // Group by status
    const leadsByStatus: Record<string, number> = {};
    leads.forEach((lead) => {
      const status = lead.status || "Unknown";
      leadsByStatus[status] = (leadsByStatus[status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        leads,
        summary: {
          totalLeads,
          totalActivities,
          leadsByStatus,
          statusCounts,
        },
        headers,
        rawLines: parsedLines.length,
      },
      lastUpdated: new Date().toISOString(),
      source: "Marketing WIG Tracker Google Sheet",
    });
  } catch (error: any) {
    console.error("Error fetching Marketing WIG Tracker data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Marketing WIG Tracker data",
        data: null,
      },
      { status: 500 }
    );
  }
}

