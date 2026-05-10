const { validate } = require("../models/User");
const { validateToken } = require("../services/authService");

function getTokenFromRequest(req, cookieName) {
    const cookieToken = req.cookies?.[cookieName];
    const authHeader = req.headers?.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }

    return cookieToken;
}

function checkAuth(cookieName) {
    return (req, res, next) => {
        const token = getTokenFromRequest(req, cookieName);

        if (!token) {
            return next();
        }

        try {
            const payload = validateToken(token);
            req.user = payload;
        } catch (error) {
            req.user = null;
        }

        return next();
    };
}

function requireAuth(cookieName) {
    return (req, res, next) => {
        const token = getTokenFromRequest(req, cookieName);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        try {
            const payload = validateToken(token);
            req.user = payload;
            return next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
    };
}

// Any logged-in user (admin OR user) can access
function requireUser(cookieName) {
    return (req, res, next) => {
        const token = getTokenFromRequest(req, cookieName);

        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Login required. Please sign in to continue.",
            });
        }

        try {
            const payload = validateToken(token);
            req.user = payload;
            return next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again.",
            });
        }
    };
}

module.exports = {
    checkAuth,
    requireAuth,
    requireUser,
};