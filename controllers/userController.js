// const User = require("../models/userSchema.js");
// const errorHandler = require("../middlewares/errorMiddleware.js");

// const currentUser = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findOne({ _id: id, role: "user" }).select(
//       "-password"
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.role !== "user") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     next(errorHandler);
//   }
// };

// module.exports = currentUser;
