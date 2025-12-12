import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  customer: String,
  service: String,
  date: String,
  time: String,
  province: String,
  teamAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "Team" }
});

export default mongoose.model("Booking", BookingSchema);
