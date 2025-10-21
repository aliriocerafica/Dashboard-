import { NextRequest, NextResponse } from "next/server";
import {
  fetchWIGDataFromMultipleSheets,
  calculateWIGMetrics,
} from "@/app/lib/sheets";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sheetUrl = searchParams.get("sheetUrl");
    const gidsParam = searchParams.get("gids");

    if (!sheetUrl) {
      return NextResponse.json(
        { error: "Missing sheetUrl parameter" },
        { status: 400 }
      );
    }

    // Parse GIDs from query parameter (comma-separated)
    const gids = gidsParam ? gidsParam.split(",") : ["0", "1673922593"];

    console.log(`Fetching WIG data from: ${sheetUrl} with gids: ${gids}`);

    // Fetch commitments from all sheets
    const commitments = await fetchWIGDataFromMultipleSheets(sheetUrl, gids);

    // Calculate metrics
    const metrics = calculateWIGMetrics(commitments);

    return NextResponse.json({
      success: true,
      data: {
        commitments,
        metrics,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/get-wig-data:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
