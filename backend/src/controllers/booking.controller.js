// CUSTOMER — RATE BOOKING (mechanic/service)
export const rateBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }
    // Only allow rating if completed and by the customer who booked
    if (booking.status !== "completed" || booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized or booking not completed" });
    }
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating value" });
    }
    // Only allow rating once
    if (booking.userRating) {
        return res.status(400).json({ message: "You have already rated this booking." });
    }
    booking.userRating = rating;
    booking.userReview = review || "";
    await booking.save();

    // Update technician's average rating
    if (booking.mechanic) {
        const User = (await import("../models/User.model.js")).default;
        const Booking = (await import("../models/booking.model.js")).default;
        // Get all completed bookings for this mechanic with a userRating
        const allRatings = await Booking.find({
            mechanic: booking.mechanic,
            status: "completed",
            userRating: { $ne: null }
        }).select("userRating");
        const ratings = allRatings.map(b => b.userRating);
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        await User.findByIdAndUpdate(booking.mechanic, {
            $set: { "rating.average": avg, "rating.count": ratings.length }
        });
    }
    res.json({ message: "Thank you for your feedback!", booking });
};
// TECHNICIAN — RATE SERVICE
export const rateServiceByTechnician = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }
    // Only allow rating if completed and by assigned mechanic
    if (booking.status !== "completed" || !booking.mechanic || booking.mechanic.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized or booking not completed" });
    }
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating value" });
    }
    booking.technicianRating = rating;
    await booking.save();
    res.json({ message: "Service rated successfully", booking });
};
import Booking from "../models/booking.model.js";

/* CUSTOMER */
export const createBooking = async (req, res) => {
    const booking = await Booking.create({
        bookingCode: `STAR-${Date.now().toString().slice(-6)}`,
        user: req.user._id,
        service: req.body.service,
        schedule: req.body.schedule,
        address: req.body.address,
        paymentMethod: req.body.paymentMethod,
        instructions: req.body.instructions || "",
        status: "pending",
        mechanic: null
    });

    res.status(201).json(booking);
};

/* CUSTOMER */
export const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate({
            path: "mechanic",
            select: "name phone rating image"
        })
        .sort({ createdAt: -1 });

    res.json(bookings);
};

/* TECHNICIAN — AVAILABLE JOBS */
export const getOpenBookings = async (req, res) => {
    const bookings = await Booking.find({
        status: "pending",
        mechanic: null
    })
        .populate("user", "name phone")
        .sort({ createdAt: -1 });

    res.json(bookings);
};

/* TECHNICIAN — MY JOBS (ACTIVE + COMPLETED) */
export const getMyAssignedBookings = async (req, res) => {
    const bookings = await Booking.find({
        mechanic: req.user._id
    })
        .populate("user", "name phone")
        .sort({ updatedAt: -1 }); // completed jobs come on top

    res.json(bookings);
};

/* ADMIN — ALL BOOKINGS */
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("user", "name phone email")
            .populate("mechanic", "name phone")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Get all bookings error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* TECHNICIAN — TAKE JOB */
export const acceptBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.status !== "pending") {
        return res.status(400).json({ message: "Booking unavailable" });
    }

    booking.mechanic = req.user._id;
    booking.status = "assigned";
    await booking.save();

    res.json(booking);
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 🔐 Only assigned mechanic can update
        if (!booking.mechanic || booking.mechanic.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // 🚦 Allowed transitions
        const allowedTransitions = {
            assigned: ["in-progress"],
            "in-progress": ["completed"],
        };

        if (
            !allowedTransitions[booking.status] ||
            !allowedTransitions[booking.status].includes(status)
        ) {
            return res.status(400).json({
                message: `Invalid status transition from ${booking.status} to ${status}`,
            });
        }

        booking.status = status;
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* TECHNICIAN — COMPLETE JOB */
export const completeBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "completed";
    booking.completionProof = {
        description: req.body.description || "",
        extraCharge: req.body.extraCharge || 0,
        completedAt: new Date()
    };

    await booking.save();
    res.json(booking);
};

/* CUSTOMER — RESCHEDULE BOOKING */
export const rescheduleBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only allow rescheduling for pending or confirmed bookings
        if (booking.status === "in_progress" || booking.status === "completed" || booking.status === "cancelled") {
            return res.status(400).json({ message: `Cannot reschedule ${booking.status} bookings` });
        }

        // Update schedule with new date and time
        booking.schedule = {
            date: req.body.date,
            timeSlot: req.body.timeSlot
        };

        // If mechanic was assigned, unassign them for rescheduling
        if (booking.status === "assigned") {
            booking.mechanic = null;
            booking.status = "pending";
        }

        await booking.save();
        res.json({
            message: "Booking rescheduled successfully",
            booking
        });
    } catch (error) {
        console.error("Reschedule error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* CUSTOMER — CANCEL BOOKING */
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only allow cancellation for pending or confirmed bookings
        if (booking.status === "in_progress" || booking.status === "completed" || booking.status === "cancelled") {
            return res.status(400).json({ message: `Cannot cancel ${booking.status} bookings` });
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.cancellationReason = req.body.reason || "Customer requested cancellation";

        await booking.save();
        res.json({
            message: "Booking cancelled successfully",
            booking
        });
    } catch (error) {
        console.error("Cancel error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

