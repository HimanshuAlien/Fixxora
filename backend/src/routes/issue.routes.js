import express from "express";
import {
    reportIssue,
    getMyIssues,
    getIssueDetails,
    getAllIssues,
    updateIssueStatus,
} from "../controllers/issue.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* ADMIN - MUST BE BEFORE :id ROUTE */
router.get("/admin/all", protect, allowRoles("admin"), getAllIssues);
router.patch("/:id/status", protect, allowRoles("admin"), updateIssueStatus);

/* CUSTOMER */
router.post("/", protect, allowRoles("customer"), reportIssue);
router.get("/my", protect, allowRoles("customer"), getMyIssues);
router.get("/:id", protect, allowRoles("customer"), getIssueDetails);

export default router;
