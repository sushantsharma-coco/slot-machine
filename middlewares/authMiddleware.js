const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      console.log("req.user in auth", req.user);

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  }
};

// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "owner") {
//     next();
//   } else {
//     res.status(403).json({ message: "Admin resource, access denied" });
//   }
// };

module.exports = protect;
