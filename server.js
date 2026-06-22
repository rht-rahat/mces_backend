require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { ensureAdminExists } = require("./routes/auth");

// Models for seeding
const Package = require("./models/Package");
const Circular = require("./models/Circular");
const Slider = require("./models/Slider");
const Review = require("./models/Review");
const Blog = require("./models/Blog");
const Appointment = require("./models/Appointment");
const galleryRoute = require("./routes/gallery");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: true, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoute = require("./routes/auth").router;
const verifyToken = require("./routes/auth").verifyToken || ((req, res, next) => next());

const passportsRoute = require("./routes/passports");
const packagesRoute = require("./routes/packages");
const circularsRoute = require("./routes/circulars");
const slidersRoute = require("./routes/sliders");
const reviewsRoute = require("./routes/reviews");
const blogsRoute = require("./routes/blogs");
const notificationsRoute = require("./routes/notifications").router;
const messagesRoute = require("./routes/messages");
const contactRoute = require("./routes/contact");

app.use("/api/auth", authRoute);
app.use("/api/passports", passportsRoute);
app.use("/api/packages", packagesRoute);
app.use("/api/circulars", circularsRoute);
app.use("/api/sliders", slidersRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/contact", contactRoute);

// ১. অ্যাপয়েন্টমেন্ট বুকিং রাউট (POST)
app.post("/api/appointments", async (req, res) => {
  try {
    const { name, email, phone, message, serviceName, date } = req.body;

    if (!name || !phone || !serviceName || !date) {
      return res.status(400).json({ message: "প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন।" });
    }

    const newAppointment = new Appointment({
      name,
      email,
      phone,
      message,
      serviceName,
      date,
      status: "pending",
    });

    await newAppointment.save();
    res.status(201).json({
      message: "অ্যাপয়েন্টমেন্ট সফলভাবে বুকিং করা হয়েছে!",
      data: newAppointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "সার্ভার সমস্যা, আবার চেষ্টা করুন।" });
  }
});

// ২. অ্যাপয়েন্টমেন্টের স্ট্যাটাস আপডেট করার রাউট (PUT)
app.put("/api/appointments/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "ভুল স্ট্যাটাস দেওয়া হয়েছে।" });
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status: status },
      { new: true },
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "অ্যাপয়েন্টমেন্টটি খুঁজে পাওয়া যায়নি।" });
    }

    res.json({
      message: `অ্যাপয়েন্টমেন্ট সফলভাবে ${status === "accepted" ? "গৃহীত" : "প্রত্যাখ্যাত"} হয়েছে!`,
      data: updatedAppointment,
    });
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর।" });
  }
});

// Base route
app.get("/", (req, res) => {
  res.send("MCES Platform Backend API is running...");
});

// Vercel / Serverless-friendly Database Connection
connectDB()
  .then(() => {
    console.log("Database connected successfully");
    ensureAdminExists().catch(err => console.error("Admin check failed:", err));
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });

// Local localhost server fallback
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;