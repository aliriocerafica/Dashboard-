import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQI1mBFgpUtrV81ZIWyxjDNagtwJM9ReeMU_pY15f1fyhb2zzYvXQ2KrCzg1LZGsEeIBlSrLe8FpEEQ/pub?output=csv";

interface PayrollConcern {
  timestamp: string;
  email: string;
  name: string;
  payrollDate: string;
  concernType: string;
  details: string;
  attachments: string;
  status: string;
  dateResolved: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching payroll concerns from:", GOOGLE_SHEET_URL);

    // Fetch data from Google Sheets CSV
    const response = await fetch(GOOGLE_SHEET_URL, {
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
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const concerns: PayrollConcern[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parsing (handles quoted fields)
      const values = parseCSVLine(line);

      // More lenient validation - check if we have enough columns and at least some data
      if (values.length >= 8) {
        // Check if this row has meaningful data (not just empty cells)
        const hasData = values.some((val) => val && val.trim() !== "");

        if (hasData) {
          concerns.push({
            timestamp: values[0] || "",
            email: values[1] || "",
            name: values[2] || "",
            payrollDate: values[3] || "",
            concernType: values[4] || "",
            details: values[5] || "",
            attachments: values[6] || "",
            status: values[7] || "",
            dateResolved: values[8] || "",
          });
        }
      }
    }

    console.log("Parsed concerns:", concerns.length);

    // Calculate summary statistics
    const totalConcerns = concerns.length;
    const resolvedConcerns = concerns.filter(
      (c) => c.status === "Resolved"
    ).length;
    const pendingConcerns = concerns.filter(
      (c) => c.status === "Pending"
    ).length;
    const inReviewConcerns = concerns.filter(
      (c) => c.status === "In Review"
    ).length;

    const payrollData = {
      summary: {
        totalConcerns,
        resolvedConcerns,
        pendingConcerns,
        inReviewConcerns,
      },
      concerns: concerns.map((concern, index) => ({
        id: index + 1,
        email: concern.email,
        name: concern.name,
        payrollDate: concern.payrollDate,
        concernType: concern.concernType,
        details: concern.details,
        attachments: concern.attachments,
        status: concern.status,
        dateResolved: concern.dateResolved,
      })),
    };

    return NextResponse.json({
      success: true,
      data: payrollData,
    });
  } catch (error) {
    console.error("Error fetching payroll concerns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payroll concerns data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV line with proper handling of quoted fields
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
