import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { passkey } = await request.json();

    // Get the passkey from environment variable
    const correctPasskey = process.env.FINANCE_PASSKEY || "123456";

    // Validate the passkey
    if (passkey === correctPasskey) {
      return NextResponse.json({
        success: true,
        message: "Passkey verified successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid passkey",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Passkey verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error during passkey verification",
      },
      { status: 500 }
    );
  }
}

