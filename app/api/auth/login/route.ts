import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your Email/ID and Password." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find by email or phone
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: identifier.trim() },
      ],
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "No account found with these credentials. Please check or register." },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again or reset password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sign in successful! Redirecting...",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          userCategory: user.userCategory,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
