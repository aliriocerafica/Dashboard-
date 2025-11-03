import { NextResponse } from "next/server";

// President dashboard reset: return empty data (no external fetch)
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      summary: {},
      officeScores: [],
      unitScores: [],
    },
  });
}
