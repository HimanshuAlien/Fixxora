
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        name: String,
        phone: String,
        address: String,
        landmark: String,
        pincode: String,
        addressType: {
            type: String,
            enum: ["home", "office"],
            default: "home",
        },
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        // Customer's rating and review for this booking
        userRating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        userReview: {
            type: String,
            default: "",
        },
        bookingCode: {
            type: String,
            unique: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        mechanic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        service: {
            name: String,
            price: Number,
            originalPrice: Number,
            duration: String,
        },

        schedule: {
            date: String,
            timeSlot: String,
        },

        address: addressSchema,

        paymentMethod: {
            type: String,
            enum: ["upi", "card", "wallet", "cod"],
            default: "cod",
        },

        instructions: String,

        status: {
            type: String,
            enum: ["pending", "assigned", "in-progress", "completed", "cancelled"],
            default: "pending",
        },


        trackingSteps: [
            {
                label: String,
                completed: Boolean,
                time: String,
            },
        ],

        // Technician's rating for this service (given by mechanic after completion)
        technicianRating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
