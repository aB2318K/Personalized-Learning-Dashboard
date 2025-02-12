const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    data: { type: Object, required: true }, 
    url: { type: String, required: true }, 
  }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
