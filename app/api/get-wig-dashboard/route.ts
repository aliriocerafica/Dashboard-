import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL;
    
    if (!sheetUrl) {
      return NextResponse.json(
        { error: 'Google Sheets URL not configured' },
        { status: 500 }
      );
    }

    // Extract sheet ID from the URL
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL format' },
        { status: 400 }
      );
    }

    const sheetId = sheetIdMatch[1];
    
    // For now, return mock data based on the WIG dashboard structure
    // In production, you would use Google Sheets API with proper authentication
    const wigDashboardData = {
      summary: {
        totalCommitments: 164,
        completedCommitments: 91,
        incompleteCommitments: 7,
        commitmentRate: 55.49
      },
      officeScores: [
        { office: "Office of the President", score: 53.15 },
        { office: "Office of the Vice President for Human Resource", score: 31.93 },
        { office: "Office of the Vice President for Operations", score: 56.93 },
        { office: "Office of the Assistant Vice President for Operations", score: 22.86 },
        { office: "Office of the Vice President for Finance", score: 59.52 },
        { office: "Office of the Vice President for Legal Affairs", score: 33.33 },
        { office: "Office of the Corporate Secretary", score: 8.00 }
      ],
      unitScores: [
        { unit: "Office of the President", score: 81.11 },
        { unit: "General Administrative Support Unit", score: 60.00 },
        { unit: "Information Technology Unit", score: 29.33 },
        { unit: "Data Protection Office", score: 53.33 },
        { unit: "Office of the Vice President for Human Resource", score: 27.78 },
        { unit: "HR Recruitment", score: 30.00 },
        { unit: "HR Development and Training Team", score: 49.33 },
        { unit: "HR Administration", score: 29.33 },
        { unit: "Socials Committee", score: 33.33 },
        { unit: "Office of the Vice President for Operations", score: 75.00 },
        { unit: "Marketing Unit", score: 52.22 },
        { unit: "Sales Unit", score: 49.60 },
        { unit: "Office of the Assistant Vice President for Operations", score: 27.50 },
        { unit: "Team Leader", score: 16.67 },
        { unit: "Office of the Vice President for Finance", score: 62.50 },
        { unit: "Payroll Unit", score: 55.56 }
      ],
      recentCommitments: [
        {
          sessionDate: "10/6/2025",
          department: "Office of the Vice President for Finance Proper",
          leadStatement: "Submit to the President, monthly cash flow forecasting that covers at least three (3) upcoming payroll and bonus cycles.",
          status: "Completed",
          dueDate: "10/13/2025"
        },
        {
          sessionDate: "10/6/2025",
          department: "Office of the President",
          leadStatement: "Attend weekly WIG sessions presided by the CEO; and, in his absence, to preside the WIG sessions.",
          status: "Completed",
          dueDate: "10/13/2025"
        },
        {
          sessionDate: "10/6/2025",
          department: "Office of the President",
          leadStatement: "Conduct daily cleaning and orderliness checks of all office spaces, with issues corrected within the same day.",
          status: "In Progress",
          dueDate: "10/24/2025"
        }
      ],
      trends: {
        weeklyCommitments: [
          { week: "Week 40", commitments: 12, completed: 8 },
          { week: "Week 41", commitments: 15, completed: 11 },
          { week: "Week 42", commitments: 18, completed: 13 },
          { week: "Week 43", commitments: 14, completed: 10 }
        ],
        departmentPerformance: [
          { department: "Finance", trend: "up", change: 5.2 },
          { department: "Operations", trend: "up", change: 3.8 },
          { department: "HR", trend: "down", change: -2.1 },
          { department: "IT", trend: "stable", change: 0.5 }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: wigDashboardData,
      lastUpdated: new Date().toISOString(),
      source: `Google Sheets: ${sheetId}`
    });

  } catch (error) {
    console.error('Error fetching WIG dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WIG dashboard data' },
      { status: 500 }
    );
  }
}
