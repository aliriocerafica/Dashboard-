import { NextRequest, NextResponse } from "next/server";

// Single published document base. We'll select the Weekly WIG Tracker tab by gid.
const PUBLISHED_DOC_BASE =
  process.env.NEXT_PUBLIC_PUBLISHED_DOC_BASE ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?output=csv";
const buildCsvUrl = (gid: string) => `${PUBLISHED_DOC_BASE}&single=true&gid=${gid}`;

export async function GET(request: NextRequest) {
  try {
    // Use the published CSV URL directly for Weekly WIG Tracker tab
    const csvUrl = `${buildCsvUrl("1673922593")}&timestamp=${Date.now()}`;

    console.log("CSV URL:", csvUrl);

    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv, */*;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", errorText.substring(0, 200));
      console.error("Response status:", response.status);
      console.error(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.status === 400) {
        throw new Error(
          "Google Sheet is not published to the web. Please go to File > Share > Publish to web and publish the 'Weekly WIG Tracker' sheet as a web page."
        );
      } else if (response.status === 403) {
        throw new Error(
          "Access denied. Please make sure the Google Sheet is published to the web (File > Share > Publish to web) and set to 'Anyone with the link can view'"
        );
      } else if (response.status === 404) {
        throw new Error(
          "Sheet not found. Please check if the Google Sheet URL is correct and the sheet exists."
        );
      } else {
        throw new Error(
          `Failed to fetch Weekly WIG Tracker data: ${response.status}. Make sure the Google Sheet is published to the web (File > Share > Publish to web)`
        );
      }
    }

    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);

    if (!csvText || csvText.includes("<!DOCTYPE") || csvText.includes("<html")) {
      throw new Error(
        "Sheet is not publicly accessible. Please publish it to the web."
      );
    }

    const lines = csvText.split("\n").filter((line) => line.trim());
    console.log("Number of lines:", lines.length);

    if (lines.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No data found in the sheet",
      });
    }

    // Parse CSV data
    const headers = parseCSVLine(lines[0]).map((h) => (h || "").trim());
    console.log("Headers:", headers);

    const wigTrackerData: any[] = [];

    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]).map((c) => (c || "").trim());
      if (!columns.length || !columns.some((c) => c)) continue;

      const rowData: any = {};

      headers.forEach((header, index) => {
        const cleanHeader = (header || "").trim().toLowerCase();
        const value = columns[index] || "";

        if (cleanHeader === "session date" || cleanHeader === "date") {
          rowData.sessionDate = value;
        } else if (cleanHeader === "department (dropdown)" || cleanHeader === "department") {
          rowData.department = value;
        } else if (
          cleanHeader === "sub-department (dropdown)" ||
          cleanHeader === "sub-department" ||
          cleanHeader === "sub department"
        ) {
          rowData.subDepartment = value;
        } else if (cleanHeader === "lead statement") {
          rowData.leadStatement = value;
        } else if (cleanHeader === "commitment") {
          rowData.commitment = value;
        } else if (cleanHeader === "due date" || cleanHeader === "due") {
          rowData.dueDate = value;
        } else if (cleanHeader === "status") {
          rowData.status = value;
        } else if (header) {
          rowData[header] = value;
        }
      });

      // Add any row that has at least one of the primary fields
      if (
        rowData.sessionDate ||
        rowData.department ||
        rowData.subDepartment ||
        rowData.leadStatement ||
        rowData.commitment ||
        rowData.status
      ) {
        wigTrackerData.push({ id: i, ...rowData });
      }
    }

    console.log(
      `✓ Successfully parsed ${wigTrackerData.length} WIG Tracker entries`
    );

    return NextResponse.json({
      success: true,
      data: wigTrackerData,
      totalRows: wigTrackerData.length,
      headers: headers,
      lastUpdated: new Date().toISOString(),
      source: `Google Sheets: ${sheetId}`,
    });
  } catch (error) {
    console.error("Error fetching Weekly WIG Tracker data:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
