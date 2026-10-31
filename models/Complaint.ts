import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComplaint extends Document {
  complaintId: string;
  userId?: mongoose.Types.ObjectId | string;
  complainantName: string;
  email: string;
  phone: string;
  userCategory: "student" | "faculty" | "citizen" | "other";
  institutionName: string;
  institutionState: string;
  aicteInstituteId?: string;
  category: string;
  subject: string;
  description: string;
  reliefSought?: string;
  images?: string[];
  status: "Submitted" | "Confirmed" | "Assigned" | "Resolved" | "Closed" | "Rejected" | string;
  priority: "Normal" | "High" | "Urgent";
  adminRemarks?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  officerRemarks?: string;
  officerImages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    complainantName: {
      type: String,
      required: [true, "Complainant Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    userCategory: {
      type: String,
      enum: ["student", "faculty", "citizen", "other"],
      default: "student",
    },
    institutionName: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
    },
    institutionState: {
      type: String,
      required: [true, "Institution State/UT is required"],
      trim: true,
    },
    aicteInstituteId: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Complaint category is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Detailed description is required"],
      trim: true,
    },
    reliefSought: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Submitted", "Confirmed", "Assigned", "Resolved", "Closed", "Rejected", "Pending", "Under Review", "In Review", "Under Scrutiny"],
      default: "Submitted",
    },
    priority: {
      type: String,
      enum: ["Normal", "High", "Urgent"],
      default: "Normal",
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    assignedOfficerId: {
      type: String,
      default: "",
    },
    assignedOfficerName: {
      type: String,
      trim: true,
      default: "",
    },
    officerRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    officerImages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;

