import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

    const response = await fetch(`${backendUrl}/api/daily-challenge/stats`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Daily challenge stats API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
