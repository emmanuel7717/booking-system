import mongoose from "mongoose";
import Team from "./models/Team.js";

const mongoURI = "mongodb+srv://emmanuelept12345_db_user:John123@cpan212-emmanuel.gwfa95d.mongodb.net/booking_system?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const teams = [
  { name: "Truck 1", province: "ON", bookings: [] },
  { name: "Truck 2", province: "ON", bookings: [] },
  { name: "Truck 3", province: "ON", bookings: [] },
  { name: "Truck 4", province: "QC", bookings: [] },
  { name: "Truck 5", province: "QC", bookings: [] },
  { name: "Subcontractor A", province: "ON", bookings: [] },
  { name: "Subcontractor B", province: "QC", bookings: [] },
  { name: "Subcontractor C", province: "QC", bookings: [] },
];

const seedTeams = async () => {
  await Team.deleteMany({}); // remove old teams
  await Team.insertMany(teams);
  console.log("Teams seeded!");
  mongoose.disconnect();
};

seedTeams();
