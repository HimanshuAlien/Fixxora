import User from "../models/User.model.js";

/* ADMIN - GET ALL USERS BY ROLE */
export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;

        let query = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 });

        // Get booking stats for technicians
        let usersWithStats = users;
        if (role === "technician") {
            const Booking = (await import("../models/booking.model.js")).default;

            // Get all bookings to calculate stats
            const allBookings = await Booking.find();

            usersWithStats = users.map(user => {
                const userBookings = allBookings.filter(booking =>
                    booking.mechanic && booking.mechanic.toString() === user._id.toString()
                );

                const completedJobs = userBookings.filter(booking => booking.status === "completed").length;
                const activeJobs = userBookings.filter(booking =>
                    booking.status === "assigned" || booking.status === "in-progress"
                ).length;
                const totalJobs = userBookings.length;

                return {
                    ...user.toObject(),
                    rating: {
                        average: user.rating?.average ?? 0,
                        count: user.rating?.count ?? 0,
                    },
                    totalBookings: totalJobs,
                    activeBookings: activeJobs,
                    completedBookings: completedJobs,
                };
            });
        } else {
            usersWithStats = users.map(user => ({
                ...user.toObject(),
                rating: {
                    average: user.rating?.average ?? 0,
                    count: user.rating?.count ?? 0,
                },
            }));
        }

        res.json(usersWithStats);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* ADMIN - GET USER BY ID */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* ADMIN - UPDATE USER STATUS */
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["active", "suspended"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User status updated",
            user
        });
    } catch (error) {
        console.error("Update user status error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
