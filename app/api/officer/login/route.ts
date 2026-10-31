import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Officer from "@/models/Officer";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Identifier and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const officer = await Officer.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
    });

    if (!officer) {
      return NextResponse.json(
        { success: false, message: "No officer found with this email or phone." },
        { status: 401 }
      );
    }

    if (officer.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Your account has been deactivated. Contact admin." },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, officer.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      officer: {
        _id: officer._id.toString(),
        fullName: officer.fullName,
        email: officer.email,
        phone: officer.phone,
        employeeId: officer.employeeId,
        status: officer.status,
      },
    });
  } catch (error) {
    console.error("[Officer Login Error]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
