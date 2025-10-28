import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetUrl = searchParams.get("url");

    if (!sheetUrl) {
      return NextResponse.json(
        { error: "Sheet URL is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Server-side fetch for DPO data:", sheetUrl);

    // Fetch the CSV data server-side (no CORS issues)
    const response = await fetch(sheetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log("✅ Server-side fetch successful");

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json([]);
    }

    const dpoTasks = [];

    // Skip header row and parse data
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      // Skip empty rows
      if (columns.length === 0 || !columns.some((col) => col?.trim())) {
        continue;
      }

      // Skip if first column contains header text or if task name is empty
      const firstCol = columns[0]?.trim().toLowerCase() || "";
      const taskName = columns[0]?.trim() || "";
      if (firstCol === "task name" || taskName === "") {
        continue;
      }

      dpoTasks.push({
        taskName: columns[0]?.trim() || "", // Column A (index 0) - Task Name
        startDate: columns[1]?.trim() || "", // Column B (index 1) - Start Date
        status: columns[2]?.trim() || "", // Column C (index 2) - Status
        submittedTo: columns[3]?.trim() || "", // Column D (index 3) - Submitted To
        targetDateOfCompletion: columns[4]?.trim() || "", // Column E (index 4) - Target Date
        dateCompleted: columns[5]?.trim() || "", // Column F (index 5) - Date Completed
      });
    }

    console.log("📊 Server-side parsed data:", dpoTasks);

    return NextResponse.json(dpoTasks);
  } catch (error) {
    console.error("❌ Server-side error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DPO data" },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV line
function parseCSVLine(line: string): string[] {
  const result = [];
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
