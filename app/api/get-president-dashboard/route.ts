import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sheetUrl = searchParams.get("sheetUrl");
    const gid = searchParams.get("gid") || "1871520824"; // Dashboard sheet GID

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
      `Fetching Dashboard data from sheet ID: ${sheetId}, gid: ${gid}`
    );

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&timestamp=${Date.now()}`;

    console.log("CSV URL:", csvUrl);

    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", errorText.substring(0, 200));
      throw new Error(
        `Failed to fetch Dashboard data: ${response.status}. Make sure the Google Sheet is published to the web (File > Share > Publish to web)`
      );
    }

    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);
    console.log("First 500 chars:", csvText.substring(0, 500));

    if (
      !csvText ||
      csvText.includes("<!DOCTYPE") ||
      csvText.includes("<html")
    ) {
      throw new Error(
        "Sheet is not publicly accessible. Please: 1) Open the Google Sheet, 2) Click File > Share > Publish to web, 3) Select 'Entire Document' and 'Web page', then click 'Publish'"
      );
    }

    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {},
          officeScores: [],
          unitScores: [],
        },
      });
    }

    // Parse the data
    const parseCSVLine = (line: string): string[] => {
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
    };

    // Extract summary data
    const summary: any = {};
    const officeScores: any[] = [];
    const unitScores: any[] = [];

    console.log("Total lines:", lines.length);

    for (let i = 0; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      // Debug first 40 rows
      if (i < 40) {
        console.log(`Row ${i}:`, columns.slice(0, 6));
      }

      // Extract summary statistics (Column B, rows around 5-11)
      const colA = columns[0]?.trim().toLowerCase() || "";
      const colB = columns[1]?.trim() || "";
      const colC = columns[2]?.trim() || "";
      const colD = columns[3]?.trim() || "";
      const colE = columns[4]?.trim() || "";

      // Summary stats in Column A-B
      if (
        colA.includes("count of commitment") &&
        !colA.includes("complete") &&
        !colA.includes("incomplete")
      ) {
        summary.totalCommitments = parseInt(colB) || 0;
        console.log("Found total commitments:", summary.totalCommitments);
      }
      if (colA.includes("count of complete")) {
        summary.completeCommitments = parseInt(colB) || 0;
        console.log("Found complete commitments:", summary.completeCommitments);
      }
      if (colA.includes("count of incomplete")) {
        summary.incompleteCommitments = parseInt(colB) || 0;
        console.log(
          "Found incomplete commitments:",
          summary.incompleteCommitments
        );
      }
      if (colA.includes("commitment rate")) {
        summary.commitmentRate = colB;
        console.log("Found commitment rate:", summary.commitmentRate);
      }

      // Office scores in Column D-E (after row 4, before the unit scores)
      if (i >= 4 && i <= 11 && colD && colE) {
        const office = colD;
        const score = colE;

        // Skip header rows
        if (
          (!office.toLowerCase().includes("commitment score") &&
            !office.toLowerCase().includes("office")) ||
          (office.toLowerCase().includes("office of") && score.includes("%"))
        ) {
          const scoreMatch = score.match(/([0-9.]+)%/);
          if (scoreMatch) {
            officeScores.push({
              office,
              score,
            });
            console.log("Found office score:", office, score);
          }
        }
      }

      // Unit scores in Column A-B (starting from row 16+)
      if (i >= 16) {
        const unit = columns[0]?.trim();
        const score = columns[1]?.trim();

        // Skip header rows and empty rows
        if (
          unit &&
          score &&
          !unit.toLowerCase().includes("commitment score per unit") &&
          score.includes("%")
        ) {
          const scoreMatch = score.match(/([0-9.]+)%/);
          if (scoreMatch) {
            unitScores.push({
              unit,
              score,
              scoreValue: parseFloat(scoreMatch[1]),
            });
          }
        }
      }
    }

    console.log("Summary:", summary);
    console.log("Office Scores:", officeScores.length);
    console.log("Unit Scores:", unitScores.length);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        officeScores,
        unitScores,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/get-president-dashboard:", error);

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
