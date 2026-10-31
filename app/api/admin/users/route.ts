import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user directory." },
      { status: 500 }
    );
  }
}

