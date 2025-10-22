import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sheetUrl =
      searchParams.get("sheetUrl") || process.env.NEXT_PUBLIC_SHEET_URL;
    const gid = searchParams.get("gid") || "0"; // Default to first sheet

    if (!sheetUrl) {
      return NextResponse.json(
        { error: "Missing sheetUrl parameter" },
        { status: 400 }
      );
    }

    // Extract sheet ID from URL
    let sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];

    if (!sheetId) {
      sheetId = sheetUrl.split("/d/")[1]?.split("/")[0];
    }

    if (!sheetId) {
      return NextResponse.json(
        { error: "Invalid Google Sheets URL" },
        { status: 400 }
      );
    }

    console.log(
      `Fetching Weekly WIG Tracker data from sheet ID: ${sheetId}, gid: ${gid}`
    );
    console.log("Sheet URL:", sheetUrl);

    // Use the published CSV URL directly
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?output=csv";

    console.log("CSV URL:", csvUrl);

    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
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

    if (
      !csvText ||
      csvText.includes("<!DOCTYPE") ||
      csvText.includes("<html")
    ) {
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
    const headers = parseCSVLine(lines[0]);
    console.log("Headers:", headers);

    const wigTrackerData = [];

    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      if (columns.length === 0 || !columns.some((col) => col?.trim())) {
        continue;
      }

      // Skip empty rows or rows that look like headers
      const firstCol = columns[0]?.trim().toLowerCase() || "";
      if (
        firstCol === "session date" ||
        firstCol === "date" ||
        firstCol === "" ||
        firstCol.includes("total") ||
        firstCol.includes("count")
      ) {
        continue;
      }

      const rowData: any = {};

      // Map columns to data object
      headers.forEach((header, index) => {
        const cleanHeader = header?.trim().toLowerCase() || "";
        const value = columns[index]?.trim() || "";

        // Map common column names
        if (
          cleanHeader.includes("session date") ||
          cleanHeader.includes("date")
        ) {
          rowData.sessionDate = value;
        } else if (cleanHeader.includes("department")) {
          rowData.department = value;
        } else if (
          cleanHeader.includes("sub-department") ||
          cleanHeader.includes("sub department")
        ) {
          rowData.subDepartment = value;
        } else if (
          cleanHeader.includes("lead statement") ||
          cleanHeader.includes("statement")
        ) {
          rowData.leadStatement = value;
        } else if (cleanHeader.includes("commitment")) {
          rowData.commitment = value;
        } else if (
          cleanHeader.includes("due date") ||
          cleanHeader.includes("due")
        ) {
          rowData.dueDate = value;
        } else if (cleanHeader.includes("status")) {
          rowData.status = value;
        } else {
          // Use original header name for unmapped columns
          rowData[header?.trim() || `column_${index}`] = value;
        }
      });

      // Only add rows that have meaningful data
      if (rowData.sessionDate || rowData.department || rowData.leadStatement) {
        wigTrackerData.push({
          id: i,
          ...rowData,
        });
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
