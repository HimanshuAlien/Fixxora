import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },

        role: {
            type: String,
            enum: ["customer", "technician", "admin"],
            default: "customer",
        },

        phone: String,
        isActive: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
        },

        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },

        specialization: [String],
        totalBookings: { type: Number, default: 0 },
        completedBookings: { type: Number, default: 0 },
        activeBookings: { type: Number, default: 0 },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.models.User || mongoose.model("User", userSchema);
