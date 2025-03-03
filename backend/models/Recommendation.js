import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    data: { type: Object, required: true }, 
    url: { type: String, required: true }, 
  }
);

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
