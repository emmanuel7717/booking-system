import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  name: String,
  province: String,
  bookings: [String]
});

export default mongoose.model("Team", TeamSchema);
