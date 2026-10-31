import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, userCategory, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Full Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      userCategory: userCategory || "student",
      password: hashedPassword,
    });

    // Fire-and-forget welcome notification
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: normalizedEmail,
        recipientType: "student",
        type: "welcome",
        title: "Welcome to AICTE Complaint Portal",
        message: `Hello ${fullName.trim()}, your account has been created successfully. You can now submit and track complaints.`,
      }),
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! You can now sign in.",
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          userCategory: newUser.userCategory,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

