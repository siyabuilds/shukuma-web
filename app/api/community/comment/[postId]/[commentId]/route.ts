import { NextResponse } from "next/server";

// DELETE /api/community/comment/[postId]/[commentId] - Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const { postId, commentId } = await params;
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${backendUrl}/api/community/comment/${postId}/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to delete comment" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Delete comment API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
