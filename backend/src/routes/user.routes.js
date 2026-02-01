import express from "express";
import {
    getUsersByRole,
    getUserById,
    updateUserStatus
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* ADMIN - MUST BE FIRST (before :id param) */
router.get("/", protect, allowRoles("admin"), getUsersByRole);
router.patch("/:id/status", protect, allowRoles("admin"), updateUserStatus);

/* ADMIN - GET USER BY ID */
router.get("/:id", protect, allowRoles("admin"), getUserById);

export default router;
