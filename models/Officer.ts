import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOfficer extends Document {
  fullName: string;
  email: string;
  phone?: string;
  employeeId: string;
  password: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const OfficerSchema = new Schema<IOfficer>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    employeeId: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Officer: Model<IOfficer> =
  mongoose.models.Officer || mongoose.model<IOfficer>("Officer", OfficerSchema);
export default Officer;
