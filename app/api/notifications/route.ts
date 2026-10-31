import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId");
    const recipientType = searchParams.get("recipientType");

    if (!recipientId || !recipientType) {
      return NextResponse.json({ success: false, error: "recipientId and recipientType are required" }, { status: 400 });
    }

    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notifications = await Notification.find({ recipientId, recipientType } as any).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Notification fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientId, recipientType, type, title, message, complaintId } = body;

    if (!recipientId || !recipientType || !type || !title || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const notification = await Notification.create({ recipientId, recipientType, type, title, message, complaintId: complaintId || "" });
    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error("Notification create error:", error);
    return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, recipientId, recipientType } = body;

    await connectToDatabase();

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } else if (recipientId && recipientType) {
      await Notification.updateMany({ recipientId, recipientType, isRead: false }, { $set: { isRead: true } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
  }
}
