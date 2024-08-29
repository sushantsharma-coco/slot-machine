const mongoose = require("mongoose");
const { Schema } = mongoose;

const houseRevenueSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    houseState: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("house_revenue", houseRevenueSchema);
