const { validateToken } = require("../services/authService");

function checkAuth(cookieName) {
    return (req, res, next) => {
        const token = req.cookies[cookieName];

        if (!token) {
           return next();
        }

        try {
            const playload = validateToken(token);
            req.user = playload;
            next();
        } catch (error) {
            next();
        }
    }
};

module.exports = {
    checkAuth,
};