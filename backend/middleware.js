const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Received Authorization Header:", authHeader); // Log auth header

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Missing or Invalid Authorization Header");
    return res.status(403).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is correct
    console.log("✅ Decoded Token:", decoded); // Log decoded token
    
    if (!decoded.userId) {
      console.log("❌ Token is missing userId");
      return res.status(403).json({ message: "Invalid token payload" });
    }

    req.userId = decoded.userId;  
    console.log("✅ Set req.userId:", req.userId);
    
    next();
  } catch (err) {
    console.error("❌ JWT Verification Error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };
