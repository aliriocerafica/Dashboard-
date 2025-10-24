import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?output=csv";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching WIG dashboard data from:", GOOGLE_SHEET_URL);

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
    console.log("Parsed lines:", lines.length);

    // For now, return the existing mock data structure
    // TODO: Parse real CSV data from the WIG tracker sheet
    const wigDashboardData = {
      summary: {
        totalCommitments: 164,
        completedCommitments: 91,
        incompleteCommitments: 7,
        commitmentRate: 55.49,
      },
      officeScores: [
        { office: "Office of the President", score: 53.15 },
        {
          office: "Office of the Vice President for Human Resource",
          score: 31.93,
        },
        { office: "Office of the Vice President for Operations", score: 56.93 },
        {
          office: "Office of the Assistant Vice President for Operations",
          score: 22.86,
        },
        { office: "Office of the Vice President for Finance", score: 59.52 },
        {
          office: "Office of the Vice President for Legal Affairs",
          score: 33.33,
        },
        { office: "Office of the Corporate Secretary", score: 8.0 },
      ],
      unitScores: [
        { unit: "Office of the President", score: 81.11 },
        { unit: "General Administrative Support Unit", score: 60.0 },
        { unit: "Information Technology Unit", score: 29.33 },
        { unit: "Data Protection Office", score: 53.33 },
        {
          unit: "Office of the Vice President for Human Resource",
          score: 27.78,
        },
        { unit: "HR Recruitment", score: 30.0 },
        { unit: "HR Development and Training Team", score: 49.33 },
        { unit: "HR Administration", score: 29.33 },
        { unit: "Socials Committee", score: 33.33 },
        { unit: "Office of the Vice President for Operations", score: 75.0 },
        { unit: "Marketing Unit", score: 52.22 },
        { unit: "Sales Unit", score: 49.6 },
        {
          unit: "Office of the Assistant Vice President for Operations",
          score: 27.5,
        },
        { unit: "Team Leader", score: 16.67 },
        { unit: "Office of the Vice President for Finance", score: 62.5 },
        { unit: "Payroll Unit", score: 55.56 },
      ],
      recentCommitments: [
        {
          sessionDate: "10/6/2025",
          department: "Office of the Vice President for Finance Proper",
          leadStatement:
            "Submit to the President, monthly cash flow forecasting that covers at least three (3) upcoming payroll and bonus cycles.",
          status: "Completed",
          dueDate: "10/13/2025",
        },
        {
          sessionDate: "10/6/2025",
          department: "Office of the President",
          leadStatement:
            "Attend weekly WIG sessions presided by the CEO; and, in his absence, to preside the WIG sessions.",
          status: "Completed",
          dueDate: "10/13/2025",
        },
        {
          sessionDate: "10/6/2025",
          department: "Office of the President",
          leadStatement:
            "Conduct daily cleaning and orderliness checks of all office spaces, with issues corrected within the same day.",
          status: "In Progress",
          dueDate: "10/24/2025",
        },
      ],
      trends: {
        weeklyCommitments: [
          { week: "Week 40", commitments: 12, completed: 8 },
          { week: "Week 41", commitments: 15, completed: 11 },
          { week: "Week 42", commitments: 18, completed: 13 },
          { week: "Week 43", commitments: 14, completed: 10 },
        ],
        departmentPerformance: [
          { department: "Finance", trend: "up", change: 5.2 },
          { department: "Operations", trend: "up", change: 3.8 },
          { department: "HR", trend: "down", change: -2.1 },
          { department: "IT", trend: "stable", change: 0.5 },
        ],
      },
    };

    return NextResponse.json({
      success: true,
      data: wigDashboardData,
      lastUpdated: new Date().toISOString(),
      source: "WIG Tracker Google Sheet",
      csvLines: lines.length,
    });
  } catch (error) {
    console.error("Error fetching WIG dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch WIG dashboard data" },
      { status: 500 }
    );
  }
}
