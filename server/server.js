import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import Booking from "./models/Booking.js";
import Team from "./models/Team.js";
import Admin from "./models/Admin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -----------------------------
// Admin login
// -----------------------------
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username, password });
  if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });
  res.json({ success: true, message: "Logged in" });
});

// -----------------------------
// Booking route
// -----------------------------
app.post("/api/book", async (req, res) => {
  try {
    const { customer, service, date, time, province } = req.body;

    // Find first available team in province
    const availableTeam = await Team.findOne({ province, bookings: { $ne: `${date} ${time}` } });
    if (!availableTeam) return res.json({ success: false, message: "No teams available at this time." });

    const booking = await Booking.create({
      customer,
      service,
      date,
      time,
      province,
      teamAssigned: availableTeam._id,
    });

    // Update team schedule
    availableTeam.bookings.push(`${date} ${time}`);
    await availableTeam.save();

    // Send email notification to client
    await transporter.sendMail({
      from: `"Booking System" <${process.env.EMAIL_USER}>`,
      to: process.env.CLIENT_EMAIL,
      subject: "New Booking Received",
      text: `New booking:
Customer: ${customer}
Service: ${service}
Date: ${date} ${time}
Province: ${province}
Team: ${availableTeam.name}`
    });

    res.json({ success: true, booking, teamAssigned: availableTeam.name });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// -----------------------------
// Get all bookings (admin dashboard)
// -----------------------------
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("teamAssigned", "name province");
    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------------------
// Get all teams (admin dashboard)
// -----------------------------
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json({ success: true, teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
