import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Decode token to get userId
    const { jwtDecode } = await import("jwt-decode");
    const decoded = jwtDecode<{ userId: string }>(token);
    const userId = decoded.userId;

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

    const response = await fetch(
      `${backendUrl}/api/progress/${userId}/summary`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch progress summary" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Progress summary API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
