import Issue from "../models/issue.model.js";
import Booking from "../models/booking.model.js";

// CUSTOMER - Report Issue
export const reportIssue = async (req, res) => {
    try {
        const { bookingId, issueType, title, description, severity } = req.body;

        if (!bookingId || !issueType || !title || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Verify booking exists and belongs to user
        const booking = await Booking.findById(bookingId).populate("service", "name");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Create issue ticket
        const issue = await Issue.create({
            booking: bookingId,
            user: req.user._id,
            service: booking.service?.name,
            issueType,
            title,
            description,
            severity: severity || "medium",
            status: "open",
        });

        await issue.populate("user", "name email phone");
        await issue.populate("booking", "bookingCode");

        res.status(201).json({
            message: "Issue reported successfully",
            ticket: issue,
            ticketId: issue.ticketId,
        });
    } catch (error) {
        console.error("Report issue error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// CUSTOMER - Get My Issues
export const getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ user: req.user._id })
            .populate("booking", "bookingCode service")
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        console.error("Get issues error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// CUSTOMER - Get Issue Details
export const getIssueDetails = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate("user", "name email phone")
            .populate("booking")
            .populate("resolvedBy", "name");

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Verify user owns this issue
        if (issue.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        res.json(issue);
    } catch (error) {
        console.error("Get issue details error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ADMIN - Get All Issues
export const getAllIssues = async (req, res) => {
    try {
        const { status, severity, issueType } = req.query;
        let filter = {};

        if (status) filter.status = status;
        if (severity) filter.severity = severity;
        if (issueType) filter.issueType = issueType;

        const issues = await Issue.find(filter)
            .populate("user", "name email phone")
            .populate("booking", "bookingCode service")
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        console.error("Get all issues error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ADMIN - Update Issue Status
export const updateIssueStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        // Fetch the issue first to access its current adminNotes if needed
        const existingIssue = await Issue.findById(req.params.id);
        if (!existingIssue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id,
            {
                status,
                adminNotes: adminNotes || existingIssue.adminNotes,
                ...(status === "resolved" && {
                    resolvedAt: new Date(),
                    resolvedBy: req.user._id,
                }),
            },
            { new: true }
        );

        res.json({
            message: "Issue updated successfully",
            issue: updatedIssue,
        });
    } catch (error) {
        console.error("Update issue error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
