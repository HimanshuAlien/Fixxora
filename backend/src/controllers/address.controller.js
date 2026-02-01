import Address from "../models/address.model.js";

/**
 * @desc Add new address
 * @route POST /api/addresses
 * @access Private
 */
export const addAddress = async (req, res) => {
    try {
        const address = await Address.create({
            user: req.user._id,
            ...req.body,
        });

        res.status(201).json(address);
    } catch (err) {
        res.status(500).json({ message: "Failed to save address" });
    }
};

/**
 * @desc Get logged-in user's addresses
 * @route GET /api/addresses
 * @access Private
 */
export const getMyAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch addresses" });
    }
};
