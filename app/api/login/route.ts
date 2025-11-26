import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 }
      );
    }

    // Call backend API
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    console.log("Attempting login with backend URL:", backendUrl);

    const response = await fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      console.error(
        "Backend response error:",
        response.status,
        response.statusText
      );
    }

    const data = await response.json();

    // Return the response from backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: String(error) },
      { status: 500 }
    );
  }
}
