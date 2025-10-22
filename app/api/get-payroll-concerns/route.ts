import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1D2Du8AeSWHVMSsHfe6Yxu6WxbLXrLvuMWU-h83YOgQQ/edit?usp=sharing";

export async function GET(request: NextRequest) {
  try {
    // For now, let's return sample data that matches the structure
    // This will be replaced with actual Google Sheets integration later
    const sampleData = {
      summary: {
        totalConcerns: 5,
        resolvedConcerns: 5,
        pendingConcerns: 0,
        inReviewConcerns: 0,
      },
      concerns: [
        {
          id: 1,
          email: "jsalonga.apabs@gmail.com",
          name: "Jobelle, Salonga, C.",
          payrollDate: "10/5/2025",
          concernType: "Referral Bonus",
          details:
            "On September 10, 2025, Tristan became a regular employee, but I haven't received the referral bonus yet. May I kindly ask if it will be credited in this cutoff?",
          attachments: "",
          status: "Resolved",
          dateResolved: "October 20, 2025",
        },
        {
          id: 2,
          email: "efenis.apabs@gmail.com",
          name: "Eddrielle Marie, Fenis, P",
          payrollDate: "10/20/2025",
          concernType: "Release of Salary",
          details:
            "I strongly suggest a fixed, or at the very least, announced schedule for the release of salary. Some cutoffs were released as late as 8PM, just 2 hours before shift which is not enough for employees that require long travel time. Please be considerate.",
          attachments: "",
          status: "Resolved",
          dateResolved: "October 20, 2025",
        },
        {
          id: 3,
          email: "mmanzo.apabs@gmail.com",
          name: "Melvin, Manzo B",
          payrollDate: "10/20/2025",
          concernType: "PFWG amount inquiry",
          details:
            "Hi, I just want to know if the amount on my payroll for PFWG is correct, as per the payroll it is indicated as 22,050.00 but, as per memorandum by the APF the proposal that was approved is 24,500.00 I want to know if deductions was already been made before it was included in the payroll, thank you.",
          attachments:
            "https://drive.google.com/open?id=1ycJjiyKujo70e7gmvjs4WqKKyHQtOtFt",
          status: "Resolved",
          dateResolved: "October 20, 2025",
        },
        {
          id: 4,
          email: "nbugarin.apabs@gmail.com",
          name: "NEIL ALDRIN, BUGARIN, S.",
          payrollDate: "10/20/2025",
          concernType: "Missing two days credit in my payslip.",
          details:
            "I started working with ardent at September 29'2025 but as per checking on my payslip for October 20'2025, I am only paid for October 1-15 '2025. I hope this would get fixed as soon as possible. Also I still havent received my pay on my bank account. Thanks.",
          attachments:
            "https://drive.google.com/open?id=1ZBvPI5muU9NTk7ow1tmYoOXSz4qNtIJW",
          status: "Resolved",
          dateResolved: "October 20, 2025",
        },
        {
          id: 5,
          email: "bvicente.apabs@gmail.com",
          name: "Benjie, Vicente, S",
          payrollDate: "10/20/2025",
          concernType: "Payroll issue/concern",
          details:
            "Good day. I would like to seek clarification regarding my payroll for October 20, 2025. Upon checking, I noticed a deduction for an absence even though I did not have any absences during this cutoff period. For reference, I was absent only once on September 30, 2025, and that deduction was already reflected in my previous payslip.",
          attachments:
            "https://drive.google.com/open?id=1qvhKx7Och90biszZe1mH3geu3Iperz08",
          status: "Resolved",
          dateResolved: "October 21, 2025",
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: sampleData,
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
