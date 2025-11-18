import { NextRequest, NextResponse } from "next/server";

// DPO Google Sheets Published CSV URL
const DPO_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7SSTo_WAXSjYWE_stXl5LdVy2bBj1JOGwXiPWyBWKPaOBlqyafhGCr2brLc0Xsf7GMEP168sV0l03/pub?output=csv";

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Fetching DPO overview data from:", DPO_SHEET_URL);

    // Fetch the CSV data with timestamp to prevent caching
    const csvUrl = `${DPO_SHEET_URL}&timestamp=${Date.now()}`;
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
    console.log("✅ DPO data fetch successful, CSV length:", csvText.length);

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          tasks: [],
          summary: {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            completionRate: 0,
          },
        },
      });
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
        taskName: columns[0]?.trim() || "", // Column A - Task Name
        startDate: columns[1]?.trim() || "", // Column B - Start Date
        status: columns[2]?.trim() || "", // Column C - Status
        submittedTo: columns[3]?.trim() || "", // Column D - Submitted To
        targetDateOfCompletion: columns[4]?.trim() || "", // Column E - Target Date
        dateCompleted: columns[5]?.trim() || "", // Column F - Date Completed
      });
    }

    console.log("📊 Parsed DPO tasks:", dpoTasks.length);

    // Calculate statistics
    const totalTasks = dpoTasks.length;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    dpoTasks.forEach((task) => {
      const status = task.status.toLowerCase();

      // Count completed tasks
      if (status === "completed" || task.dateCompleted) {
        completedTasks++;
      } 
      // Count pending tasks
      else if (status === "pending" || status === "in progress") {
        pendingTasks++;

        // Check if task is overdue
        if (task.targetDateOfCompletion) {
          const targetDate = new Date(task.targetDateOfCompletion);
          if (targetDate < today && status !== "completed") {
            overdueTasks++;
          }
        }
      }
    });

    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        tasks: dpoTasks,
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching DPO overview data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch DPO data",
        data: {
          tasks: [],
          summary: {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            completionRate: 0,
          },
        },
      },
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

