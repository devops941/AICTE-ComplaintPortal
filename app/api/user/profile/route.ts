import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// GET user profile by ID or email
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: "User ID or Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const query = id ? { _id: id } : { email: email?.toLowerCase().trim() };
    const user = await User.findOne(query).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        userCategory: user.userCategory,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile details" },
      { status: 500 }
    );
  }
}

// UPDATE user profile
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      fullName,
      email,
      phone,
      userCategory,
      currentPassword,
      newPassword,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: "Full Name and Email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = (phone || "").trim();

    // Check if new email is taken by another account
    if (cleanEmail !== user.email) {
      const existingEmail = await User.findOne({
        email: cleanEmail,
        _id: { $ne: id },
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: "This email address is already in use by another account." },
          { status: 409 }
        );
      }
    }

    // Check if new phone is taken by another account (if phone provided)
    if (cleanPhone && cleanPhone !== user.phone) {
      const existingPhone = await User.findOne({
        phone: cleanPhone,
        _id: { $ne: id },
      });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: "This phone number is already registered to another account." },
          { status: 409 }
        );
      }
    }

    // Optional: password update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Please enter your current password to set a new password." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Current password does not match our records." },
          { status: 400 }
        );
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update fields
    user.fullName = fullName.trim();
    user.email = cleanEmail;
    user.phone = cleanPhone;
    if (userCategory) {
      user.userCategory = userCategory;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile details updated successfully!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        userCategory: user.userCategory,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile details. Please try again." },
      { status: 500 }
    );
  }
}

