import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import addressRoutes from "./routes/address.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import userRoutes from "./routes/user.routes.js";
import mongoose from "mongoose";




dotenv.config();
// connectDB(); // Called inside handler for Vercel

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/bookings", bookingRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", async (req, res) => {
    try {
        await connectDB();
        const state = mongoose.connection.readyState;
        res.json({
            status: "ok",
            dbState: state,
            states: { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" }
        });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("TrustAC backend running");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on ${PORT}`);
    });
}

const handler = async (req, res) => {
    await connectDB();
    return app(req, res);
};

export default handler;
