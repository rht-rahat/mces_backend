require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { ensureAdminExists } = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// auth.js থেকে router এবং verifyToken ইম্পোর্ট করা হচ্ছে
const authModule = require("./routes/auth");
const authRoute = authModule.router;
const verifyToken = authModule.verifyToken || ((req, res, next) => next());

app.use("/api/auth", authRoute);
app.use("/api/passports", require("./routes/passports"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/circulars", require("./routes/circulars"));
app.use("/api/sliders", require("./routes/sliders"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/blogs", require("./routes/blogs"));
app.use("/api/notifications", require("./routes/notifications").router);
app.use("/api/messages", require("./routes/messages"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/gallery", require("./routes/gallery"));

// অ্যাপয়েন্টমেন্ট স্ট্যাটাস রাউট
app.put("/api/appointments/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const Appointment = require("./models/Appointment");

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "ভুল স্ট্যাটাস দেওয়া হয়েছে।" });
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "অ্যাপয়েন্টমেন্টটি খুঁজে পাওয়া যায়নি।" });
    }

    res.json({
      message: `অ্যাপয়েন্টমেন্ট সফলভাবে ${status === "accepted" ? "গৃহীত" : "প্রত্যাখ্যাত"} হয়েছে!`,
      data: updatedAppointment,
    });
  } catch (err) {
    console.error("Appointment update error:", err);
    res.status(500).json({ message: "সার্ভার এরর।" });
  }
});

// Base route
app.get("/", (req, res) => {
  res.send("MCES Platform Backend API is running...");
});

// Database Connection & Server
connectDB()
  .then(() => {
    console.log("Database connected successfully");
    ensureAdminExists().catch(err => console.error("Admin check failed:", err));
    
    // Vercel Serverless Function-এর ক্ষেত্রে app.listen করার রেস্ট্রিকশন আছে,
    // কিন্তু লোকাল বা কন্টেইনারাইজড এনভায়রনমেন্টে লিসেনার রান করতে হবে।
    if (!process.env.VERCEL) {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } else {
      console.log("Vercel Serverless environment detected. Handling routes asynchronously.");
    }
  })
  .catch(err => {
    console.error("Database connection failed during boot:", err);
    process.exit(1);
  });

// Vercel-এর জন্য এক্সপোর্ট
module.exports = app;