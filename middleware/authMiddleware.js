const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

// Middleware to authenticate users using JWT
const authenticateUser = (req, res, next) => {
    try {
        // Extract token from HTTP-only cookie
        const token = req.cookies?.access_token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Verify JWT token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden: Invalid token" });
            }
            // Attach user data to request object
            req.user = { id: decoded.id, role: decoded.role };
            next(); // Proceed to the next middleware or route
        });

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = authenticateUser;
