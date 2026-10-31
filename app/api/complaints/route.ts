import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      complainantName,
      email,
      phone,
      userCategory,
      institutionName,
      institutionState,
      aicteInstituteId,
      category,
      subject,
      description,
      reliefSought,
      priority,
      images,
    } = body;

    // Validate required fields
    if (
      !complainantName ||
      !email ||
      !phone ||
      !institutionName ||
      !institutionState ||
      !category ||
      !subject ||
      !description
    ) {
      return NextResponse.json(
        { success: false, error: "Please fill in all mandatory fields marked with *." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate unique complaint ID: AICTE-2026-XXXXX
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const complaintId = `AICTE-2026-${randomDigits}`;

    const newComplaint = new Complaint({
      complaintId,
      userId: userId || undefined,
      complainantName: complainantName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      userCategory: userCategory || "student",
      institutionName: institutionName.trim(),
      institutionState: institutionState.trim(),
      aicteInstituteId: (aicteInstituteId || "").trim(),
      category: category.trim(),
      subject: subject.trim(),
      description: description.trim(),
      reliefSought: (reliefSought || "").trim(),
      images: Array.isArray(images) ? images : [],
      status: "Submitted",
      priority: priority || "Normal",
    });

    await newComplaint.save();

    const notifBase = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notifications`;
    // Notify student
    fetch(notifBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      recipientId: email.trim().toLowerCase(), recipientType: "student", type: "complaint_submitted",
      title: "Complaint Submitted Successfully",
      message: `Your complaint "${subject.trim()}" has been registered with ID ${complaintId}. We will review and respond soon.`,
      complaintId,
    })}).catch(() => {});
    // Notify admin
    fetch(notifBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      recipientId: "admin", recipientType: "admin", type: "new_complaint",
      title: "New Complaint Received",
      message: `A new complaint has been submitted by ${complainantName.trim()} (${email.trim().toLowerCase()}). ID: ${complaintId}, Category: ${category.trim()}.`,
      complaintId,
    })}).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "Your complaint has been successfully submitted to AICTE Central Redressal Cell.",
        complaintId,
        complaint: newComplaint,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Complaint registration error:", error);
    return NextResponse.json(
      { success: false, error: "Server error registering complaint. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("complaintId");
    const email = searchParams.get("email");

    await connectToDatabase();

    if (id) {
      const complaint = await Complaint.findOne({ complaintId: id.trim().toUpperCase() });
      if (!complaint) {
        return NextResponse.json(
          { success: false, error: "No complaint found with Complaint ID " + id },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, complaint });
    }

    if (email) {
      const complaints = await Complaint.find({ email: email.trim().toLowerCase() }).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, complaints });
    }

    // Default or ?all=true: Return all complaints for administrator
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, complaints });
  } catch (error: unknown) {
    console.error("Complaint fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaint data." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { complaintId, status, priority, adminRemarks, images, assignedOfficerId, assignedOfficerName, officerRemarks } = body;

    if (!complaintId) {
      return NextResponse.json(
        { success: false, error: "Complaint ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminRemarks !== undefined) updateData.adminRemarks = adminRemarks;
    if (Array.isArray(images)) updateData.images = images;
    if (assignedOfficerId !== undefined) updateData.assignedOfficerId = assignedOfficerId;
    if (assignedOfficerName !== undefined) updateData.assignedOfficerName = assignedOfficerName;
    if (officerRemarks !== undefined) updateData.officerRemarks = officerRemarks;
    if (body.officerImages !== undefined) updateData.officerImages = body.officerImages;

    const updated = await Complaint.findOneAndUpdate(
      { complaintId: complaintId.trim().toUpperCase() },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Complaint not found with ID " + complaintId },
        { status: 404 }
      );
    }

    const notifBase = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notifications`;
    // If officerRemarks or officerImages in body → officer submitted findings → notify admin
    if (body.officerRemarks !== undefined || body.officerImages !== undefined) {
      fetch(notifBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        recipientId: "admin", recipientType: "admin", type: "officer_update",
        title: "Officer Submitted Investigation Findings",
        message: `Field officer has submitted findings for complaint ${complaintId}. Status: ${updated.status}.`,
        complaintId,
      })}).catch(() => {});
    } else {
      // Admin update → notify student of status change
      if (status && updated.email) {
        fetch(notifBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          recipientId: updated.email, recipientType: "student", type: "status_changed",
          title: `Complaint Status Updated: ${status}`,
          message: `Your complaint ${complaintId} has been updated to status "${status}"${body.adminRemarks ? `. Remarks: ${body.adminRemarks}` : ""}.`,
          complaintId,
        })}).catch(() => {});
      }
      // If assigning to officer → notify officer
      if (body.assignedOfficerId && updated.assignedOfficerId) {
        fetch(notifBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          recipientId: updated.assignedOfficerId, recipientType: "officer", type: "complaint_assigned",
          title: "New Complaint Assigned to You",
          message: `Complaint ${complaintId} has been assigned to you. Subject: ${updated.subject}. Please investigate and submit your findings.`,
          complaintId,
        })}).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `Complaint ${complaintId} updated successfully.`,
      complaint: updated,
    });
  } catch (error: unknown) {
    console.error("Complaint update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update complaint." },
      { status: 500 }
    );
  }
}

