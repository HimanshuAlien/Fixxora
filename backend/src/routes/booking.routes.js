import express from "express";
import {
    createBooking,
    getMyBookings,
    getOpenBookings,
    acceptBooking,
    updateBookingStatus,
    getMyAssignedBookings,
    getAllBookings,
    completeBooking,
    rescheduleBooking,
    cancelBooking,
    rateBooking
} from "../controllers/booking.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
const router = express.Router();

/* ADMIN - MUST BE FIRST */
router.get("/admin/all", protect, allowRoles("admin"), getAllBookings);

/* CUSTOMER */
router.post("/", protect, allowRoles("customer"), createBooking);
router.get("/my", protect, allowRoles("customer"), getMyBookings);
router.patch("/:id/reschedule", protect, allowRoles("customer"), rescheduleBooking);
router.patch("/:id/cancel", protect, allowRoles("customer"), cancelBooking);

/* TECHNICIAN */
router.get("/open", protect, allowRoles("technician"), getOpenBookings);
router.get("/mechanic", protect, allowRoles("technician"), getMyAssignedBookings);
router.patch("/:id/accept", protect, allowRoles("technician"), acceptBooking);
router.patch("/:id/status", protect, allowRoles("technician"), updateBookingStatus);
router.patch("/:id/complete", protect, allowRoles("technician"), completeBooking);
// Customer rates a completed booking
router.post("/:id/rate", protect, allowRoles("customer"), rateBooking);
router.patch("/:id/complete", protect, allowRoles("technician"), completeBooking);

export default router;
