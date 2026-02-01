import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            unique: true,
            default: () => `TKT-${Date.now().toString().slice(-8).toUpperCase()}`,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        service: String, // Service name for quick reference
        issueType: {
            type: String,
            enum: ["quality", "behavior", "billing", "safety", "other"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["open", "in-review", "resolved", "closed"],
            default: "open",
        },
        attachments: [String], // URLs to images/files
        adminNotes: String,
        resolvedAt: Date,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
