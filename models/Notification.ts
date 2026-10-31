import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientId: string;
  recipientType: string;
  type: string;
  title: string;
  message: string;
  complaintId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    recipientId: { type: String, required: true, index: true },
    recipientType: { type: String, enum: ["student", "officer", "admin"], required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    complaintId: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
