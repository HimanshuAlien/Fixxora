import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
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
    { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
