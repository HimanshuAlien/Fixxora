import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "trustac",
        });

        isConnected = db.connections[0].readyState;
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB error:", err.message);
    }
};

export default connectDB;
