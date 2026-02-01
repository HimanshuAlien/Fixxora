import express from "express";
import { addAddress, getMyAddresses } from "../controllers/address.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, addAddress);
router.get("/", protect, getMyAddresses);

export default router;
