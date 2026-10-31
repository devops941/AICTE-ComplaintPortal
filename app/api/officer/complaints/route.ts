import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const officerId = searchParams.get("officerId");

    if (!officerId) {
      return NextResponse.json(
        { success: false, message: "officerId query parameter is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaints = await Complaint.find({ assignedOfficerId: officerId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error("[Officer Complaints GET Error]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { complaintId, status, officerRemarks } = await req.json();

    if (!complaintId) {
      return NextResponse.json(
        { success: false, message: "complaintId is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await Complaint.findByIdAndUpdate(
      complaintId,
      { status, officerRemarks },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error) {
    console.error("[Officer Complaints PATCH Error]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
