require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const { ensureAdminExists } = require("./routes/auth");
const dbHelper = require("./models/modelHelper");

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
    origin: true, // এটি রিকোয়েস্ট করা ডোমেইনটিকে স্বয়ংক্রিয়ভাবে অ্যালাউ করবে
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static file uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoute = require("./routes/auth").router;
// auth ফাইল থেকে verifyToken মিডলওয়্যারটি ইমপোর্ট করা হলো যেন এরর না আসে
const verifyToken =
  require("./routes/auth").verifyToken || ((req, res, next) => next());

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

// ১. অ্যাপয়েন্টমেন্ট বুকিং রাউট (POST) - এখানে আনা হয়েছে
app.post("/api/appointments", async (req, res) => {
  try {
    const { name, email, phone, message, serviceName, date } = req.body;

    if (!name || !phone || !serviceName || !date) {
      return res
        .status(400)
        .json({ message: "প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন।" });
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

// ২. অ্যাপয়েন্টমেন্টের স্ট্যাটাস আপডেট করার রাউট (PUT) - এখানে আনা হয়েছে
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
      return res
        .status(404)
        .json({ message: "অ্যাপয়েন্টমেন্টটি খুঁজে পাওয়া যায়নি।" });
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

// Database seeding helper function (এখন এটি সম্পূর্ণ ফ্রেশ ও এরর-মুক্ত)
const seedDefaultData = async () => {
  try {
    // 1. Slider Banners
    const sliders = await dbHelper.find(Slider, "sliders");
    if (sliders.length === 0) {
      const defaultSliders = [
        {
          title: "বিদেশে নিরাপদ কর্মসংস্থান ও আপনার স্বপ্ন পূরণ",
          subtitle:
            "জাপান, রোমানিয়া ও মধ্যপ্রাচ্যসহ বিভিন্ন দেশে দক্ষ কর্মী হিসেবে যোগ দিন। আমরা দিচ্ছি বিশ্বস্ত ভিসা প্রসেসিং ও সহযোগিতা।",
          imageUrl:
            "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200",
          actionUrl: "/circulars",
          order: 0,
        },
        {
          title: "বিদেশের স্বনামধন্য বিশ্ববিদ্যালয়ে উচ্চশিক্ষা",
          subtitle:
            "যুক্তরাজ্য, ইউএসএ,加拿大 ও ইউরোপের সেরা বিশ্ববিদ্যালয়সমূহে ভর্তির আবেদন করুন। স্কলারশিপ ও ভিসা গাইডের সম্পূর্ণ দায়িত্ব আমাদের।",
          imageUrl:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
          actionUrl: "#appointment-form",
          order: 1,
        },
        {
          title: "রোমাঞ্চকর ট্যুর প্যাকেজ - নেপাল, শ্রীলঙ্কা ও সুন্দরবন",
          subtitle:
            "আপনার ভ্রমণের সঙ্গী হতে আমরা দিচ্ছি সবচেয়ে সাশ্রয়ী প্যাকেজ। এখনই বুকিং করুন আর উপভোগ করুন লাইফটাইম এক্সপেরিয়েন্স!",
          imageUrl:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
          actionUrl: "#tour-packages",
          order: 2,
        },
      ];
      for (const s of defaultSliders) {
        await dbHelper.create(Slider, "sliders", s);
      }
      console.log("Seeded slider banners.");
    }

    // 2. Tour Packages
    const packages = await dbHelper.find(Package, "packages");
    if (packages.length === 0) {
      const defaultPackages = [
        {
          title: "নেপাল অ্যাডভেঞ্চার ও মাউন্ট এভারেস্ট ভিউ",
          destination: "Nepal",
          duration: "৫ দিন, ৪ রাত",
          price: 28500,
          description:
            "কাঠমান্ডু এবং পোখরা শহরের নয়নাবিরাম প্রাকৃতিক দৃশ্য এবং হিমালয়ের চূড়া দেখার অপূর্ব সুযোগ। গাইড ও হোটেলসহ সম্পূর্ণ সার্ভিস।",
          imageUrl:
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800",
          itinerary: [
            "১ম দিন: কাঠমান্ডু আগমন ও হোটেল ট্রান্সফার",
            "২য় দিন: স্বয়ম্ভূনাথ এবং দরবার স্কয়ার পরিদর্শন",
            "৩য় দিন: পোখরা যাত্রা ও ফেওয়া লেকে নৌকা ভ্রমণ",
            "৪র্থ দিন: সারেংকোট থেকে সূর্যোদয় দর্শন",
            "৫ম দিন: বিদায় ও ঢাকা প্রত্যাবর্তন",
          ],
        },
        {
          title: "শ্রীলঙ্কা হেরিটেজ ও সিগিরিয়া লাক্সারি ট্যুর",
          destination: "Sri Lanka",
          duration: "৬ দিন, ৫ রাত",
          price: 42000,
          description:
            "কলম্বো, ক্যান্ডি এবং সিগিরিয়ার ঐতিহাসিক লায়ন রক ঘুরে দেখার অপূর্ব সুযোগ। বৌদ্ধ ঐতিহ্য এবং সমুদ্র সৈকতের সমন্বয়।",
          imageUrl:
            "https://images.unsplash.com/photo-1588598126749-db37f698c9f5?auto=format&fit=crop&q=80&w=800",
          itinerary: [
            "১ম দিন: কলম্বো আগমন ও ক্যান্ডি যাত্রা",
            "২য় দিন: টুথ রিলিক টেম্পল ও রয়্যাল বোটানিক্যাল গার্ডেন",
            "৩য় দিন: সিগিরিয়া কেল্লা আরোহণ",
            "৪র্থ দিন: নুয়ারা এলিয়া চা বাগান পরিদর্শন",
            "৫ম দিন: কলম্বো সিটি ট্যুর ও শপিং",
            "৬ষ্ঠ দিন: ঢাকা প্রত্যাবর্তন",
          ],
        },
        {
          title: "সুন্দরবন রোমাঞ্চ ও কটকা সী-বিচ অভিযান",
          destination: "Sundarbans",
          duration: "৩ দিন, ২ রাত",
          price: 9500,
          description:
            "করমজল, হারবাড়িয়া ও কটকার গভীর জঙ্গল ঘুরে বেঙ্গল টাইগারের পদচিহ্ন ও চিত্রা হরিণ দেখার রোমাঞ্চকর বোট ট্যুর।",
          imageUrl:
            "https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?auto=format&fit=crop&q=80&w=800",
          itinerary: [
            "১ম দিন: মংলা ঘাট থেকে বোটে চড়ে করমজল ও হাড়বাড়িয়া ভ্রমণ",
            "২য় দিন: কটকা ওয়াচ টাওয়ার ও জামতলা সমুদ্র সৈকত ট্র্যাকিং",
            "৩য় দিন: করমজল অভয়ারণ্য এবং মংলা প্রত্যাবর্তন",
          ],
        },
      ];
      for (const p of defaultPackages) {
        await dbHelper.create(Package, "packages", p);
      }
      console.log("Seeded tour packages.");
    }

    // 3. Circulars
    const circulars = await dbHelper.find(Circular, "circulars");
    if (circulars.length === 0) {
      const defaultCirculars = [
        {
          title: "রোমানিয়া কনস্ট্রাকশন ওয়ার্কার রিক্রুটমেন্ট",
          country: "Romania",
          jobCategory: "Construction",
          salaryRange: "৭০০ - ৯০০ ইউরো / মাস",
          requirements: [
            "ন্যূনতম ২ বছরের বাস্তব অভিজ্ঞতা",
            "ইংরেজি ভাষায় সাধারণ কথোপকথনের দক্ষতা",
            "বয়স ২০ থেকে ৪৫ বছরের মধ্যে হতে হবে",
          ],
          imageUrl:
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
        },
      ];
      for (const c of defaultCirculars) {
        await dbHelper.create(Circular, "circulars", c);
      }
      console.log("Seeded job circulars.");
    }

    // 4. Reviews
    const reviews = await dbHelper.find(Review, "reviews");
    if (reviews.length === 0) {
      const defaultReviews = [
        {
          clientName: "হাসান আল মামুন",
          clientRole: "কনস্ট্রাকশন ফোরম্যান (রোমানিয়া)",
          reviewText:
            "এমসিইএস প্ল্যাটফর্মের মাধ্যমে আমি রোমানিয়াতে কাজের ভিসা পেয়েছি। তাদের প্রসেসিং খুবই স্বচ্ছ এবং দ্রুত ছিল। ধন্যবাদ পুরো টিমকে!",
          rating: 5,
          imageUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        },
      ];
      for (const r of defaultReviews) {
        await dbHelper.create(Review, "reviews", r);
      }
      console.log("Seeded client reviews.");
    }

    // 5. Blogs
    const blogs = await dbHelper.find(Blog, "blogs");
    if (blogs.length === 0) {
      const defaultBlogs = [
        {
          title: "জাপানে কারিগরি ইন্টার্নশিপে যাওয়ার সেরা গাইডলাইন",
          content:
            "জাপানে বর্তমানে কেয়ারগিভার, এগ্রিকালচার এবং কনস্ট্রাকশনে অনেক দক্ষ শ্রমিকের প্রয়োজন।...",
          imageUrl:
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800",
          author: "এডমিন",
        },
      ];
      for (const b of defaultBlogs) {
        await dbHelper.create(Blog, "blogs", b);
      }
      console.log("Seeded blog posts.");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await ensureAdminExists();
  // await seedDefaultData();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

startServer();
