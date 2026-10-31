import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Officer from "@/models/Officer";

export async function GET() {
  try {
    await connectToDatabase();
    const officers = await Officer.find({}, "-password").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, officers });
  } catch (error: unknown) {
    console.error("Officers fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch officers." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, employeeId, password } = body;

    if (!fullName || !email || !employeeId || !password) {
      return NextResponse.json(
        { success: false, error: "All required fields must be filled." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Officer.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { employeeId: employeeId.trim() }],
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An officer with this email or employee ID already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const officer = await Officer.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      employeeId: employeeId.trim(),
      password: hashedPassword,
      status: "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Officer account created successfully.",
        officer: {
          _id: officer._id,
          fullName: officer.fullName,
          email: officer.email,
          employeeId: officer.employeeId,
          status: officer.status,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Officer create error:", error);
    return NextResponse.json({ success: false, error: "Failed to create officer." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { officerId, status } = body;
    if (!officerId || !status) {
      return NextResponse.json({ success: false, error: "Missing fields." }, { status: 400 });
    }
    await connectToDatabase();
    await Officer.findByIdAndUpdate(officerId, { status });
    return NextResponse.json({ success: true, message: "Officer status updated." });
  } catch (error: unknown) {
    console.error("Officer update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update officer." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const officerId = searchParams.get("officerId");
    if (!officerId) {
      return NextResponse.json({ success: false, error: "Officer ID required." }, { status: 400 });
    }
    await connectToDatabase();
    await Officer.findByIdAndDelete(officerId);
    return NextResponse.json({ success: true, message: "Officer deleted." });
  } catch (error: unknown) {
    console.error("Officer delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete officer." }, { status: 500 });
  }
}
