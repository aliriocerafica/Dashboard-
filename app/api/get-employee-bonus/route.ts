import { NextRequest, NextResponse } from "next/server";

function parseCSVLine(line: string): string[] {
  const columns: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      columns.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  columns.push(current.trim());
  return columns;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("id");

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQI1mBFgpUtrV81ZIWyxjDNagtwJM9ReeMU_pY15f1fyhb2zzYvXQ2KrCzg1LZGsEeIBlSrLe8FpEEQ/pub?gid=1628066319&single=true&output=csv";

    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const csvText = await response.text();

    // Check if we got HTML instead of CSV
    if (
      csvText.includes("<!DOCTYPE") ||
      csvText.includes("<html") ||
      csvText.includes("<head>")
    ) {
      throw new Error(
        "Received HTML instead of CSV. The Google Sheet needs to be published to the web."
      );
    }

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: "No data found" },
        { status: 404 }
      );
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]);

    // Normalize employee ID (handle both "2025-001" and "2025001" formats)
    const normalizedSearchId = employeeId.trim().replace(/-/g, "");
    const searchIdWithDash =
      normalizedSearchId.length === 7
        ? `${normalizedSearchId.slice(0, 4)}-${normalizedSearchId.slice(4)}`
        : employeeId.trim();

    console.log("Searching for employee ID:", {
      original: employeeId,
      normalized: normalizedSearchId,
      withDash: searchIdWithDash,
    });

    // Find employee by ID
    // NOTE: This searches the entire fresh CSV data each time, so it will always
    // detect the latest Employee IDs even if they change in the Google Sheet.
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      // Skip empty rows or totals row
      if (!columns[0] || columns[0] === "TOTAL" || columns[0].trim() === "") {
        continue;
      }

      // Normalize CSV employee ID for comparison
      const csvEmployeeId = columns[0].trim();
      const normalizedCsvId = csvEmployeeId.replace(/-/g, "");

      // Check if this is the employee we're looking for (match with or without dash)
      if (
        csvEmployeeId === searchIdWithDash ||
        csvEmployeeId === employeeId.trim() ||
        normalizedCsvId === normalizedSearchId
      ) {
        // Map columns to employee data
        const employeeData: any = {
          employeeId: columns[0]?.trim() || "",
          name: columns[1]?.trim() || "",
          account: columns[2]?.trim() || "",
          dateHired: columns[3]?.trim() || "",
          requiredWeeks: parseFloat(columns[4]?.replace(/,/g, "") || "0") || 0,
          attendanceWeeks:
            parseFloat(columns[18]?.replace(/,/g, "") || "0") || 0,
          paidLeaves: parseFloat(columns[19]?.replace(/,/g, "") || "0") || 0,
          qualifiedForPerfectPresence:
            columns[20]?.trim().toLowerCase() === "yes",
          attendanceBonusPerQtr:
            parseFloat(
              columns[21]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          attendanceBonusPerWk:
            parseFloat(
              columns[22]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          perfectPresenceAward:
            parseFloat(
              columns[23]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          attendanceRelatedBonus:
            parseFloat(
              columns[24]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          onsiteWfh: columns[25]?.trim() || "",
          clientSatisfaction:
            parseFloat(
              columns[26]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          teamContinuity:
            parseFloat(
              columns[27]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          supervisorAward:
            parseFloat(
              columns[28]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          totalQuarterlyBonus:
            parseFloat(
              columns[29]?.replace(/,/g, "").replace(/"/g, "") || "0"
            ) || 0,
          status: columns[30]?.trim() || "",
          weeklyAttendance: [],
        };

        // Parse weekly attendance (columns 5-17)
        const weekLabels = [
          "Aug. 03 - 09",
          "Aug. 10 - 16",
          "Aug. 17- 23",
          "Aug. 24 - 30",
          "Aug. 31 - Sept. 06",
          "Sept. 07 - 13",
          "Sept. 14 - 20",
          "Sept. 21 - 27",
          "Sept. 28 -Oct. 04",
          "Oct. 05 - 11",
          "Oct. 12 - 18",
          "Oct. 19 - 25",
          "Oct. 26 - Nov. 01",
        ];

        for (let j = 0; j < 13; j++) {
          const weekIndex = 5 + j;
          employeeData.weeklyAttendance.push({
            week: weekLabels[j] || `Week ${j + 1}`,
            present: columns[weekIndex]?.trim().toUpperCase() === "TRUE",
          });
        }

        console.log(
          "Employee found:",
          employeeData.employeeId,
          employeeData.name
        );
        return NextResponse.json({
          success: true,
          data: employeeData,
        });
      }
    }

    // Employee not found - log available IDs for debugging
    console.log("Employee not found. Searched for:", searchIdWithDash);
    if (lines.length > 1) {
      const firstFewIds = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols[0] && cols[0] !== "TOTAL") {
          firstFewIds.push(cols[0]);
        }
      }
      console.log("Sample employee IDs in CSV:", firstFewIds);
    }

    return NextResponse.json(
      { success: false, error: "Employee not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching employee bonus data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}
