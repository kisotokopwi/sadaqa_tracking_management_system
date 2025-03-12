const express = require("express");
const { getProfile } = require("../controllers/userController");
const bcrypt = require("bcryptjs");
const db = require("../config/db"); // Database connection
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Fetch user profile details
 * @access  Private (Authenticated Users Only)
 */
router.get("/profile", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from authentication middleware
        
        // Fetch user details from the database
        const [user] = await db.query("SELECT id, name, email, phone, profile_picture, created_at FROM users WHERE id = ?", [userId]);
        
        if (!user.length) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user[0]); // Send user profile details
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @route   PATCH /api/user/update-password
 * @desc    Update user password securely
 * @access  Private (Authenticated Users Only)
 */
router.patch("/update-password", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Check if the new password meets security requirements
        if (!newPassword || newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Za-z]/.test(newPassword)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain both letters and numbers." });
        }

        // Fetch current hashed password from the database
        const [user] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
        if (!user.length) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare current password with stored hash
        const isMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        // Hash new password and update in database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        res.json({ message: "Password updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @route   PATCH /api/user/update-profile
 * @desc    Update user profile details
 * @access  Private (Authenticated Users Only)
 */
router.patch("/update-profile", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, profile_picture } = req.body;

        // Update user profile details
        await db.query("UPDATE users SET name = ?, phone = ?, profile_picture = ? WHERE id = ?", [name, phone, profile_picture, userId]);

        res.json({ message: "Profile updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
