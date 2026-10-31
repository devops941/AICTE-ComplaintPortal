import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone?: string;
  userCategory: "student" | "faculty" | "institute" | "citizen";
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    userCategory: {
      type: String,
      enum: ["student", "faculty", "institute", "citizen"],
      default: "student",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during hot reloads
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
