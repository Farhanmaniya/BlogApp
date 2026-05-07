const JWT = require('jsonwebtoken');
const dotenve = require('dotenv');
dotenve.config();

// Load secret key from environment variable
const secret = process.env.JwT_SECRET;

function createToken(user) {
    const playload = {
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };

    const token = JWT.sign(playload, secret);
    return token;
}

function validateToken(token){
    const playload = JWT.verify(token, secret, { exipresIn: "7d" });
    return playload;
}

module.exports = {
    createToken,
    validateToken,
}
