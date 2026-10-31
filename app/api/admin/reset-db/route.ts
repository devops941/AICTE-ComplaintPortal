import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Officer from "@/models/Officer";
import Complaint from "@/models/Complaint";
import Notification from "@/models/Notification";

export async function DELETE(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "aicte-reset-2026") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  await Promise.all([
    User.deleteMany({}),
    Officer.deleteMany({}),
    Complaint.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  return NextResponse.json({ success: true, message: "All collections cleared." });
}
