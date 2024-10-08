const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const jwtToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true, // Helps prevent XSS attacks
    sameSite: "None", // Important for cross-site cookies
    secure: true, // Only send cookie over HTTPS
});
};

module.exports = {
  jwtToken,
};
