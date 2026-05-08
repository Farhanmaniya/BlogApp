const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Load secret key from environment variable
const secret = process.env.JWT_SECRET;

function createToken(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };

    const token = JWT.sign(payload, secret, { expiresIn: '7d' });
    return token;
}

function validateToken(token){
    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports = {
    createToken,
    validateToken,
}
