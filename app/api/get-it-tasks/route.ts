import { NextResponse } from "next/server";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSdFvtYrlz0LFExRnEoD2-c9K-8mmv0bkj5y-yEDIHEsdKiqYJdb_H7ioceOZWRe46m0tEl_n4KEsV1/pub?gid=297970600&single=true&output=csv";

interface ITTask {
  taskName: string;
  startDate: string;
  deadline: string;
  assignee: string;
  status: string;
  dateCompleted: string;
}

export async function GET() {
  try {
    const response = await fetch(SHEET_URL, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          tasks: [],
          summary: {
            totalTasks: 0,
            completed: 0,
            inProgress: 0,
            toDo: 0,
            ongoing: 0,
          },
          assigneeCounts: {},
        },
        lastUpdated: new Date().toISOString(),
      });
    }

    // Skip the header row
    const dataLines = lines.slice(1);
    
    const tasks: ITTask[] = [];
    const statusCounts = {
      completed: 0,
      inProgress: 0,
      toDo: 0,
      ongoing: 0,
    };

    const assigneeCounts: Record<string, number> = {};

    for (const line of dataLines) {
      // Parse CSV line properly handling quotes
      const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
      const allFields = line.split(csvRegex).map(field => 
        field.replace(/^"(.*)"$/, '$1').trim()
      );

      // Only take the first 6 columns (A-F), ignore satisfaction survey columns and empty trailing columns
      const taskName = allFields[0] || "";
      const startDate = allFields[1] || "";
      const deadline = allFields[2] || "";
      const assignee = allFields[3] || "";
      const status = allFields[4] || "";
      const dateCompleted = allFields[5] || "";

      console.log(`Row ${dataLines.indexOf(line) + 2}: Task="${taskName}", Assignee="${assignee}", Status="${status}"`);

      // Skip empty rows, satisfaction survey rows, or header-like rows
      if (!taskName || 
          taskName.toLowerCase().includes("satisfaction") || 
          taskName.toLowerCase().includes("very") ||
          taskName.toLowerCase().includes("total") ||
          taskName.toLowerCase().includes("overall")) {
        continue;
      }

      tasks.push({
        taskName,
        startDate,
        deadline,
        assignee,
        status,
        dateCompleted,
      });

      // Count statuses (handle exact matches from dropdown)
      const statusLower = status.toLowerCase().trim();
      if (statusLower === "completed") {
        statusCounts.completed++;
      } else if (statusLower === "in progress") {
        statusCounts.inProgress++;
      } else if (statusLower === "to do") {
        statusCounts.toDo++;
      } else if (statusLower === "ongoing") {
        statusCounts.ongoing++;
      }

      // Count assignees
      if (assignee && assignee.trim() !== "") {
        assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        summary: {
          totalTasks: tasks.length,
          completed: statusCounts.completed,
          inProgress: statusCounts.inProgress,
          toDo: statusCounts.toDo,
          ongoing: statusCounts.ongoing,
        },
        assigneeCounts,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching IT tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch IT tasks",
      },
      { status: 500 }
    );
  }
}

