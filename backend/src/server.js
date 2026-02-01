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

const app = express();

app.use(cors());
app.use(express.json());

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("DB Connection Error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.use("/api/bookings", bookingRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", async (req, res) => {
    try {
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

export default app;
