import { NextResponse } from "next/server";
import { getAccountLeaderboard } from "@/lib/db/queries";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const data = await getAccountLeaderboard(20);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
