const User = require("../models/User");
const { createHmac, randomBytes } = require("crypto");
const jwt = require("jsonwebtoken");
const { createToken, validateToken } = require("../services/authService");

const userSignIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const hashedPassword = createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
      return res.status(400).json({
        error: "Incorrect password",
      });
    }

    const token = createToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        secure: false,
      })
      return res.status(200)
      .json({
        message: "User signed in successfully",
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const userSignup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Generate salt and hash password
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    const user = await User.create({
      fullName,
      email,
      salt,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Error creating user",
    });
  }
};

const userLogout = async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

module.exports = {
  userSignup,
  userSignIn,
  userLogout,
};
