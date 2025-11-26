import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

    const response = await fetch(`${backendUrl}/api/exercises`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch exercises" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Exercises API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
