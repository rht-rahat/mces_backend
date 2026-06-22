"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Briefcase,
  GraduationCap,
  Map,
  FileText,
  CheckSquare,
  Phone,
  UserCheck,
  ShieldCheck,
  Star,
  Calendar,
  ArrowRight,
  Search,
  Eye,
  Download,
  Info,
  Trash2,
  Edit,
  Plus,
  Bell,
  MessageSquare,
  LayoutDashboard,
  Image,
  Camera,
  BookOpen,
  Layers,
  Menu,
  X,
  LogOut,
  Check,
  Send,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { api, API_BASE } from "../../hooks/useApi";
import useStore from "../../store/useStore";
import Link from "next/link";

// Fallback high-quality default images for the Travel & Recruiting agency
const DEFAULT_GALLERY = [
  {
    _id: "def1",
    id: "def1",
    title: "Skilled Engineers Departure for Saudi Arabia",
    titleBn: "সৌদি আরবে দক্ষ প্রকৌশলী দলের যাত্রা",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80",
    category: "Recruitment",
    categoryBn: "নিয়োগ",
    date: "2026-05-12",
  },
  {
    _id: "def2",
    id: "def2",
    title: "Romania Visa Success & Flight Briefing",
    titleBn: "রোমানিয়ার ভিসা সাকসেস এবং ফ্লাইট ব্রিফিং",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    category: "Visa Success",
    categoryBn: "ভিসা সাফল্য",
    date: "2026-06-01",
  },
  {
    _id: "def3",
    id: "def3",
    title: "Student Group Departure for United Kingdom",
    titleBn: "যুক্তরাজ্যে উচ্চশিক্ষার উদ্দেশ্যে ছাত্রদলের যাত্রা",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    category: "Study Abroad",
    categoryBn: "উচ্চশিক্ষা",
    date: "2026-04-20",
  },
  {
    _id: "def4",
    id: "def4",
    title: "MCES Office Client Counselling Session",
    titleBn: "MCES অফিসে ক্লায়েন্ট কাউন্সেলিং সেশন",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    category: "Counseling",
    categoryBn: "কাউন্সেলিং",
    date: "2026-05-28",
  },
  {
    _id: "def5",
    id: "def5",
    title: "Skilled Welders Practical Demonstration Narsingdi",
    titleBn: "নরসিংদীতে ওয়েল্ডারদের ব্যবহারিক দক্ষতা প্রদর্শনী",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    category: "Recruitment",
    categoryBn: "নিয়োগ",
    date: "2026-03-15",
  },
  {
    _id: "def6",
    id: "def6",
    title: "Croatia Work Permit Distribution Event",
    titleBn: "ক্রোয়েশিয়া ওয়ার্ক পারমিট বিতরণ অনুষ্ঠান",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    category: "Visa Success",
    categoryBn: "ভিসা সাফল্য",
    date: "2026-06-10",
  }
];

function generateGalleryUniqueId() {
  return "custom_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
}

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    token,
    setAuth,
    logout,
    initializeAuth,
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    threads,
    activeThread,
    messages,
    setThreads,
    setActiveThread,
    setMessages,
    addMessage,
  } = useStore();

  const [activeTab, setActiveTab] = useState("overview"); // overview, passports, chat, sliders, circulars, packages, blogs, reviews
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const [isSubmittingPassport, setIsSubmittingPassport] = useState(false);
  const [isSubmittingSlider, setIsSubmittingSlider] = useState(false);

  // অ্যাপয়েন্টমেন্টের তালিকা লোড করা
  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.getAppointments(token),
    enabled: !!token,
  });
  // ২. স্ট্যাটাস আপডেটের মিউটেশন লজিক
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.updateAppointmentStatus(id, status, token),
    onSuccess: (res) => {
      alert(res.message || "স্ট্যাটাস আপডেট সফল হয়েছে!");
      refetchAppointments(); // টেবিল ডাটা রিয়েল-টাইমে রিফ্রেশ করবে
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (err) => {
      alert(err.message || "স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।");
    },
  });

  const handleUpdateStatus = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  // pdf

  // Search passport state
  const [passportSearch, setPassportSearch] = useState("");

  // Real-time Chat state
  const [adminReplyText, setAdminReplyText] = useState("");
  const chatEndRef = useRef(null);

  // CRUD Forms State
  const [editingId, setEditingId] = useState(null);

  // Form sliders
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderSubtitle, setSliderSubtitle] = useState("");
  const [sliderAction, setSliderAction] = useState("");
  const [sliderOrder, setSliderOrder] = useState("0");
  const [sliderImageFile, setSliderImageFile] = useState(null);

  // Form packages
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgDest, setPkgDest] = useState("");
  const [pkgDur, setPkgDur] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgItin, setPkgItin] = useState("");
  const [pkgImageFile, setPkgImageFile] = useState(null);

  // Form circulars
  const [circTitle, setCircTitle] = useState("");
  const [circCountry, setCircCountry] = useState("");
  const [circCat, setCircCat] = useState("");
  const [circSalary, setCircSalary] = useState("");
  const [circReqs, setCircReqs] = useState("");
  const [circImageFile, setCircImageFile] = useState(null);

  // Form reviews
  const [revName, setRevName] = useState("");
  const [revRole, setRevRole] = useState("");
  const [revText, setRevText] = useState("");
  const [revRating, setRevRating] = useState("5");
  const [revImageFile, setRevImageFile] = useState(null);

  // Form blogs
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogImageFile, setBlogImageFile] = useState(null);

  // Form Gallery
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryTitleBn, setGalleryTitleBn] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("Visa Success");
  const [galleryCategoryBn, setGalleryCategoryBn] = useState("ভিসা সাফল্য");
  const [galleryImageFile, setGalleryImageFile] = useState(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState("");
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [galleryAlertMsg, setGalleryAlertMsg] = useState({ text: "", type: "" });
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);

  const loadGalleryData = async () => {
    try {
      const data = await api.getGallery();
      if (data && data.length > 0) {
        setGalleryImages(data);
      } else {
        const localSaved = JSON.parse(localStorage.getItem("mces_local_gallery") || "[]");
        setGalleryImages([...localSaved, ...DEFAULT_GALLERY]);
      }
    } catch (err) {
      const localSaved = JSON.parse(localStorage.getItem("mces_local_gallery") || "[]");
      setGalleryImages([...localSaved, ...DEFAULT_GALLERY]);
    } finally {
      setIsGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "gallery") {
      let active = true;
      const fetchAndSet = async () => {
        try {
          const data = await api.getGallery();
          if (active) {
            if (data && data.length > 0) {
              setGalleryImages(data);
            } else {
              const localSaved = JSON.parse(localStorage.getItem("mces_local_gallery") || "[]");
              setGalleryImages([...localSaved, ...DEFAULT_GALLERY]);
            }
            setIsGalleryLoading(false);
          }
        } catch (err) {
          if (active) {
            const localSaved = JSON.parse(localStorage.getItem("mces_local_gallery") || "[]");
            setGalleryImages([...localSaved, ...DEFAULT_GALLERY]);
            setIsGalleryLoading(false);
          }
        }
      };
      fetchAndSet();
      return () => {
        active = false;
      };
    }
  }, [activeTab]);

  const triggerGalleryAlert = (text, type = "success") => {
    setGalleryAlertMsg({ text, type });
    setTimeout(() => setGalleryAlertMsg({ text: "", type: "" }), 4000);
  };

  const handleGalleryFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerGalleryAlert("ফাইলের সাইজ ৫ মেগাবাইটের কম হতে হবে।", "error");
      return;
    }

    setGalleryImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setGalleryImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!galleryTitle.trim() && !galleryTitleBn.trim()) {
      triggerGalleryAlert("দয়া করে ছবির শিরোনাম লিখুন।", "error");
      return;
    }
    if (!galleryImagePreview) {
      triggerGalleryAlert("দয়া করে একটি ছবি ফাইল সিলেক্ট করুন।", "error");
      return;
    }

    setIsSubmittingGallery(true);
    const formData = new FormData();
    formData.append("title", galleryTitle || galleryTitleBn);
    formData.append("titleBn", galleryTitleBn || galleryTitle);
    formData.append("category", galleryCategory);
    formData.append("categoryBn", galleryCategoryBn);
    if (galleryImageFile) {
      formData.append("file", galleryImageFile);
    } else {
      formData.append("imageUrl", galleryImagePreview);
    }

    try {
      await api.addGallery(formData, token);
      triggerGalleryAlert("ছবি গ্যালারিতে সফলভাবে যুক্ত হয়েছে!");
      await loadGalleryData();
      resetGalleryForm();
    } catch (err) {
      console.warn("Server add failed, saving custom item locally.");
      const customId = generateGalleryUniqueId();
      const newImg = {
        _id: customId,
        id: customId,
        title: galleryTitle || galleryTitleBn,
        titleBn: galleryTitleBn || galleryTitle,
        imageUrl: galleryImagePreview,
        category: galleryCategory,
        categoryBn: galleryCategoryBn,
        date: new Date().toISOString().split("T")[0],
        custom: true
      };

      const localSaved = JSON.parse(localStorage.getItem("mces_local_gallery") || "[]");
      const updatedLocal = [newImg, ...localSaved];
      localStorage.setItem("mces_local_gallery", JSON.stringify(updatedLocal));

      setGalleryImages([...updatedLocal, ...DEFAULT_GALLERY]);
      triggerGalleryAlert("ছবি গ্যালারিতে সফলভাবে যুক্ত হয়েছে!");
      resetGalleryForm();
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  const handleDeleteGalleryPhoto = async (id, isCustom) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ছবিটি মুছে ফেলতে চান?")) {
      return;
    }

    try {
      if (!isCustom) {
        await api.deleteGallery(id, token);
      }
      
      const localSaved = JSON.parse(localStorage.getItem("mces_local_gallery") || "[]");
      const updatedLocal = localSaved.filter(img => img._id !== id && img.id !== id);
      localStorage.setItem("mces_local_gallery", JSON.stringify(updatedLocal));
      
      setGalleryImages(prev => prev.filter(img => img._id !== id && img.id !== id));
      triggerGalleryAlert("ছবিটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error(err);
      const localSaved = JSON.parse(localStorage.getItem("mces_local_gallery") || "[]");
      const updatedLocal = localSaved.filter(img => img._id !== id && img.id !== id);
      localStorage.setItem("mces_local_gallery", JSON.stringify(updatedLocal));
      
      setGalleryImages(prev => prev.filter(img => img._id !== id && img.id !== id));
      triggerGalleryAlert("ছবিটি সফলভাবে মুছে ফেলা হয়েছে।");
    }
  };

  const resetGalleryForm = () => {
    setGalleryTitle("");
    setGalleryTitleBn("");
    setGalleryImageFile(null);
    setGalleryImagePreview("");
    setIsGalleryFormOpen(false);
  };

  // Form passports
  const [holderName, setHolderName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [passportFile, setPassportFile] = useState(null);

  // categories country,
  const countries = [
    "Australia",
    "Bahamas",
    "Belarus",
    "Denmark",
    "Dubai (UAE)", // দুবাই যেহেতু দেশ নয়, তাই ব্র্যাকেটে UAE লিখে দেওয়া ভালো
    "Greece",
    "Italy",
    "Laos",
    "Jordan",
    "Kuwait",
    "Libya",
    "Malaysia",
    "Maldives",
    "Mauritius",
    "New Zealand",
    "Qatar",
    "Romania",
    "Saudi Arabia",
    "Serbia",
    "Slovenia",
    "Vietnam",
  ];
  const categories = [
    "Construction",
    "Caregiver",
    "Driving",
    "Car Wash",
    "Hospitality",
    "IT/Engineering",
  ];

  // Modal / status states
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 1. Establish SSE stream for Admin (Notifications & Live Chat Messages) - FIXED VERSION
  // 1. Establish SSE stream for Admin (Notifications & Live Chat Messages) - FINAL FIXED
  useEffect(() => {
    if (!user || user.role !== "admin" || !token) return;

    // Load initial data
    api.getNotifications(token).then(setNotifications).catch(console.error);
    api.getChatThreads(token).then(setThreads).catch(console.error);

    const sseUrl = `${API_BASE}/notifications/stream`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "ping") return;

        // যদি ইউজারের কাছ থেকে লাইভ চ্যাট মেসেজ আসে
        if (payload.type === "chat_message") {
          const incomingChat = payload.chat;
          if (!incomingChat) return;

          // Zustand Store থেকে সরাসরি স্টেটের লেটেস্ট ভ্যালু পড়া (Closure bug এড়ানোর জন্য সবচেয়ে নিরাপদ)
          const currentActiveThread = useStore.getState().activeThread;

          const currentActiveUserId = currentActiveThread?.userId
            ? currentActiveThread.userId.toString()
            : "";
          const incomingMsgUserId = (incomingChat.userId || "").toString();

          // অ্যাডমিন যদি বর্তমানে এই নির্দিষ্ট ইউজারের চ্যাট উইন্ডোটিই ওপেন করে রাখে
          if (
            currentActiveUserId &&
            currentActiveUserId === incomingMsgUserId
          ) {
            setMessages((prev) => {
              const incomingId = (
                incomingChat._id ||
                incomingChat.id ||
                ""
              ).toString();
              const exists = prev.some(
                (m) => (m._id || m.id || "").toString() === incomingId,
              );
              if (exists) return prev;
              return [...prev, incomingChat];
            });
          }

          // বাম পাশের চ্যাট থ্রেড লিস্ট ও লাস্ট মেসেজ ব্যাকগ্রাউন্ডে রিফ্রেশ করা
          api.getChatThreads(token).then(setThreads).catch(console.error);
        } else {
          // সাধারণ নোটিফিকেশন হ্যান্ডলার
          addNotification(payload);
          queryClient.invalidateQueries(["passports"]);
          queryClient.invalidateQueries(["packages"]);
        }
      } catch (e) {
        console.error("Failed to parse Admin SSE payload:", e);
      }
    };

    eventSource.onerror = () => {
      console.log("Admin SSE disconnected. Retrying...");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [
    user,
    token,
    queryClient,
    setThreads,
    setMessages,
    addNotification,
    setNotifications,
  ]);
  // লক্ষ্য করুন: এখানে ডিপেন্ডেন্সিতে activeThread রাখা হয়নি, ফলে থ্রেড পাল্টালেও কানেকশন বারবার ড্রপ হবে না।
  // লক্ষ্য করুন: ডিপেন্ডেন্সি থেকে activeThread সরিয়ে দেওয়া হয়েছে যেন চ্যাট উইন্ডো কানেকশন বারবার ডিসকানেক্ট না হয়!
  // এখানে activeThread সহ প্রয়োজনীয় ডিপেন্ডেন্সিগুলো দেওয়া হয়েছে যেন রিয়েল-টাইম ডাটা আপডেট মিস না হয়।

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 2. Fetching history when active chat thread changes
  useEffect(() => {
    if (!activeThread) return;
    api
      .getChatHistory(activeThread.userId)
      .then(setMessages)
      .then(scrollToBottom)
      .catch(console.error);
  }, [activeThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Queries
  const { data: passports = [], refetch: refetchPassports } = useQuery({
    queryKey: ["passports", passportSearch],
    queryFn: () => api.getPassports(passportSearch, token),
    enabled: !!user && user.role === "admin",
  });

  const { data: sliders = [], refetch: refetchSliders } = useQuery({
    queryKey: ["adminSliders"],
    queryFn: api.getSliders,
    enabled: !!user && user.role === "admin",
  });

  const { data: packages = [], refetch: refetchPackages } = useQuery({
    queryKey: ["adminPackages"],
    queryFn: api.getPackages,
    enabled: !!user && user.role === "admin",
  });

  const { data: circulars = [], refetch: refetchCirculars } = useQuery({
    queryKey: ["adminCirculars"],
    queryFn: () => api.getCirculars(),
    enabled: !!user && user.role === "admin",
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: api.getReviews,
    enabled: !!user && user.role === "admin",
  });

  const { data: blogs = [], refetch: refetchBlogs } = useQuery({
    queryKey: ["adminBlogs"],
    queryFn: api.getBlogs,
    enabled: !!user && user.role === "admin",
  });


 const handleDownloadPDF = (app) => {
    try {
      const doc = new jsPDF();
      
      // =========================================================
      // ১. টপ হেডার ব্যানার ও লোগো যুক্ত করা (MCES Branding)
      // =========================================================
      // আপনার দেওয়া লোগোটি যুক্ত করা হলো (X, Y, Width, Height)
      doc.addImage("/logo.jpeg", "JPEG", 14, 15, 32, 22);

      // কোম্পানির নাম ও স্লোগান ডানপাশে রাইট-অ্যালাইনড
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136); // Teal Color (#0d9488)
      doc.text("MCES", 196, 23, { align: "right" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate Color
      doc.text("Global Gateway & Career Solutions", 196, 29, { align: "right" });
      doc.text("Email: info@mces.com | Web: www.mces.com", 196, 34, { align: "right" });

      // স্টাইলিশ থিক ডিভাইডার লাইন
      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.8);
      doc.line(14, 43, 196, 43);

      // =========================================================
      // ২. ইনভয়েস/রিসিট টাইটেল ও মেটা ডেটা গ্রিড
      // =========================================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // Dark Slate
      doc.text("APPOINTMENT CONFIRMATION RECEIPT", 14, 56);

      // মেটা ডেটা বক্স (ডানপাশে ব্যাকগ্রাউন্ড শেডসহ বুকিং ডিটেইলস)
      doc.setFillColor(248, 250, 252); // Light Gray Background
      doc.rect(120, 49, 76, 24, "F");
      
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("Receipt ID:", 124, 55);
      doc.text("Issued Date:", 124, 61);
      doc.text("Appr. Status:", 124, 67);

      doc.setFont("helvetica", "normal");
      doc.text(`${app._id ? app._id.substring(0, 12) : 'N/A'}`, 148, 55);
      doc.text(`${new Date().toLocaleDateString()}`, 148, 61);
      
      // স্ট্যাটাস অনুযায়ী টেক্সটের কালার পরিবর্তন ডাইনামিক
      const currentStatus = app.status ? app.status.toUpperCase() : 'PENDING';
      if(currentStatus === 'ACCEPTED') doc.setTextColor(22, 163, 74); // Green
      else if(currentStatus === 'REJECTED') doc.setTextColor(220, 38, 38); // Red
      else doc.setTextColor(217, 119, 6); // Amber/Pending
      doc.setFont("helvetica", "bold");
      doc.text(currentStatus, 148, 67);

      // =========================================================
      // ৩. ক্লায়েন্ট ইনফরমেশন সেকশন (টু কলম বা ক্লিন লেআউট)
      // =========================================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("APPLICANT DETAILS", 14, 85);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(14, 88, 196, 88); // চিকন ডিভাইডার লাইন

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold"); doc.text("Full Name:", 14, 96);
      doc.setFont("helvetica", "normal"); doc.text(`${app.name || 'N/A'}`, 45, 96);
      
      doc.setFont("helvetica", "bold"); doc.text("Phone Number:", 14, 103);
      doc.setFont("helvetica", "normal"); doc.text(`${app.phone || 'N/A'}`, 45, 103);
      
      doc.setFont("helvetica", "bold"); doc.text("Email Address:", 14, 110);
      doc.setFont("helvetica", "normal"); doc.text(`${app.email || 'N/A'}`, 45, 110);

      // =========================================================
      // ৪. বুকিং ও ডিপার্টমেন্ট টেবিল ম্যাপিং
      // =========================================================
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text("SERVICE & SCHEDULE", 14, 126);
      doc.line(14, 129, 196, 129);

      // টেবিল হেডার ব্যাকগ্রাউন্ড
      doc.setFillColor(13, 148, 136);
      doc.rect(14, 134, 182, 8, "F");
      
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255); // হোয়াইট টেক্সট
      doc.text("Selected Department / Service", 18, 139.5);
      doc.text("Booking Date", 140, 139.5);

      // টেবিল ডাটা রো
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.text(`${app.serviceName || 'General Consultation'}`, 18, 149);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text(`${app.date || 'Not Set'}`, 140, 149);

      // টেবিল ডাটার নিচের বর্ডার লাইন
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 154, 196, 154);

      // =========================================================
      // ৫. ইউজার মেসেজ/নোটস সেকশন (বক্স ডিজাইন)
      // =========================================================
      if (app.message) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(13, 148, 136);
        doc.text("APPLICANT NOTE / INQUIRY", 14, 170);
        doc.line(14, 173, 196, 173);

        // লাইট ব্যাকগ্রাউন্ড বক্স মেসেজের জন্য
        const splitMsg = doc.splitTextToSize(app.message, 174);
        const boxHeight = (splitMsg.length * 5) + 8;
        
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(241, 245, 249);
        doc.rect(14, 178, 182, boxHeight, "FD");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(splitMsg, 18, 184);
      }

      // =========================================================
      // ৬. প্রফেশনাল ফুটার ও ওয়াটারমার্ক
      // =========================================================
      // অথরাইজড সিগনেচার লাইন ডানপাশে
      doc.setDrawColor(203, 213, 225);
      doc.line(150, 245, 196, 245);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Authorized Signature", 173, 250, { align: "center" });

      // ফুটার বটম লাইন ও কপিরাইট নোটিশ
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 272, 196, 272);
      
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text("This is a system generated document, no physical seal required.", 14, 279);
      doc.text("© 2026 MCES Ltd. All Rights Reserved.", 196, 279, { align: "right" });

      // PDF ফাইল নামসহ অটোমেটিক ডাউনলোড হবে
      doc.save(`MCES_Appointment_${app.name || 'Customer'}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("পিডিএফ জেনারেট করতে সমস্যা হয়েছে। অনুগ্রহ করে টার্মিনালে 'npm install jspdf' কমান্ডটি রান করেছেন কিনা নিশ্চিত করুন।");
    }
  };

  // Handle Admin Credentials Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "ভুল ক্রেডেনশিয়াল! সঠিক ইমেইল ও পাসওয়ার্ড দিন।",
        );
      }

      if (data.user.role !== "admin") {
        throw new Error(
          "এক্সেস ডিনাইড! শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট প্রবেশ করতে পারবে।",
        );
      }

      setAuth(data.user, data.token);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Status handler for passports
  const handleUpdatePassportStatus = async (id, status) => {
    try {
      await api.updatePassportStatus(id, status, token);
      refetchPassports();
    } catch (err) {
      alert("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    }
  };

  // Delete handler with strict confirmation requirement
  const handleDeleteItem = async (type, id) => {
    const confirmDelete = window.confirm(
      "আপনি কি নিশ্চিত যে আপনি এই রেকর্ডটি চিরতরে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।",
    );
    if (!confirmDelete) return;

    try {
      if (type === "passport") {
        await api.deletePassport(id, token);
        refetchPassports();
      } else if (type === "slider") {
        await api.deleteSlider(id, token);
        refetchSliders();
      } else if (type === "package") {
        await api.deletePackage(id, token);
        refetchPackages();
      } else if (type === "circular") {
        await api.deleteCircular(id, token);
        refetchCirculars();
      } else if (type === "review") {
        await api.deleteReview(id, token);
        refetchReviews();
      } else if (type === "blog") {
        await api.deleteBlog(id, token);
        refetchBlogs();
      }
    } catch (err) {
      alert("মুছে ফেলা ব্যর্থ হয়েছে।");
    }
  };

  // Submit chat reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeThread) return;

    const text = adminReplyText;
    setAdminReplyText("");

    try {
      const savedReply = await api.sendAdminReply(
        {
          userId: activeThread.userId,
          message: text,
        },
        token,
      );
      setMessages((prev) => [...prev, savedReply]);
    } catch (err) {
      alert("বার্তা পাঠানো যায়নি।");
    }
  };

  // CRUD Actions submissions
  const handleSliderSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", sliderTitle);
    formData.append("subtitle", sliderSubtitle);
    formData.append("actionUrl", sliderAction);
    formData.append("order", sliderOrder);
    if (sliderImageFile) {
      formData.append("file", sliderImageFile);
    }

    setIsSubmittingSlider(true);

    try {
      if (editingId) {
        await api.updateSlider(editingId, formData, token);
      } else {
        if (!sliderImageFile)
          return alert("স্লাইডারের জন্য একটি ছবি আপলোড করা আবশ্যক।");
        await api.addSlider(formData, token);
      }
      refetchSliders();
      closeModal();
    } catch (err) {
      alert("স্লাইডার সেভ করা যায়নি।");
    }
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", pkgTitle);
    formData.append("destination", pkgDest);
    formData.append("duration", pkgDur);
    formData.append("price", pkgPrice);
    formData.append("description", pkgDesc);

    // Convert newlines to itinerary array stringified JSON
    const itinArray = pkgItin.split("\n").filter(Boolean);
    formData.append("itinerary", JSON.stringify(itinArray));

    if (pkgImageFile) {
      formData.append("file", pkgImageFile);
    }

    try {
      if (editingId) {
        await api.updatePackage(editingId, formData, token);
      } else {
        if (!pkgImageFile) return alert("প্যাকেজের ছবি আপলোড করা আবশ্যক।");
        await api.addPackage(formData, token);
      }
      refetchPackages();
      closeModal();
    } catch (err) {
      alert("প্যাকেজ সেভ করা যায়নি।");
    }
  };

  const handleCircularSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", circTitle);
    formData.append("country", circCountry);
    formData.append("jobCategory", circCat);
    formData.append("salaryRange", circSalary);

    const reqsArray = circReqs.split("\n").filter(Boolean);
    formData.append("requirements", JSON.stringify(reqsArray));

    if (circImageFile) {
      formData.append("file", circImageFile);
    }

    try {
      if (editingId) {
        await api.updateCircular(editingId, formData, token);
      } else {
        if (!circImageFile) return alert("সার্কুলারের ছবি আপলোড করা আবশ্যক।");
        await api.addCircular(formData, token);
      }
      refetchCirculars();
      closeModal();
    } catch (err) {
      alert("সার্কুলার সেভ করা যায়নি।");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("clientName", revName);
    formData.append("clientRole", revRole);
    formData.append("reviewText", revText);
    formData.append("rating", revRating);
    if (revImageFile) {
      formData.append("file", revImageFile);
    }

    try {
      if (!revImageFile && !editingId)
        return alert("ক্লায়েন্টের ছবি আপলোড করা আবশ্যক।");
      await api.addReview(formData, token);
      refetchReviews();
      closeModal();
    } catch (err) {
      alert("রিভিউ সেভ করা যায়নি।");
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();

    // লোডিং স্টেট চালু করা
    setIsSubmittingBlog(true);

    const formData = new FormData();
    formData.append("title", blogTitle);
    formData.append("content", blogContent);
    formData.append("author", blogAuthor || "Admin");

    if (blogImageFile) {
      formData.append("file", blogImageFile);
    }

    try {
      if (!blogImageFile && !editingId) {
        alert("ব্লগ ফিচার্ড ছবি আপলোড করা আবশ্যক।");
        setIsSubmittingBlog(false); // ছবি না থাকলে এখানেই লোডিং বন্ধ হবে
        return;
      }

      // এখানে আপনার এপিআই রিকোয়েস্ট (ধরে নিচ্ছি এডিটিং লজিকও হ্যান্ডেল করছেন)
      if (editingId) {
        await api.updateBlog(editingId, formData, token); // এডিট করার জন্য (যদি থাকে)
      } else {
        await api.addBlog(formData, token);
      }

      refetchBlogs();
      closeModal();

      // ফরম সফলভাবে সাবমিট হলে স্টেট রিসেট করা (ঐচ্ছিক)
      setBlogTitle("");
      setBlogContent("");
      setBlogAuthor("");
      setBlogImageFile(null);
    } catch (err) {
      alert("ব্লগ সেভ করা যায়নি।");
    } finally {
      // কাজ সফল হোক বা এরর আসুক, লোডিং স্টেট বন্ধ হবে
      setIsSubmittingBlog(false);
    }
  };

  const handlePassportSubmit = async (e) => {
    e.preventDefault();
    if (!passportFile && !editingId) {
      alert("পাসপোর্ট এর পিডিএফ ফাইল আপলোড করা আবশ্যক।");
      return;
    }
    setIsSubmittingPassport(true);

    const formData = new FormData();
    formData.append("holderName", holderName);
    formData.append("passportNumber", passportNumber.trim());
    formData.append("submissionDate", submissionDate);
    if (passportFile) {
      formData.append("file", passportFile);
    }

    try {
      await api.submitPassport(formData, token);
      refetchPassports();
      closeModal();
    } catch (err) {
      alert(err.message || "পাসপোর্ট সেভ করা যায়নি।");
    }
  };

  const handleClearNotifications = async () => {
    try {
      await api.clearNotifications(token);
      setNotifications([]);
    } catch (e) {
      alert("নোটিফিকেশন ক্লিয়ার করা যায়নি।");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id, token);
      // Update local read state
      const updated = notifications.map((n) =>
        n._id === id || n.id === id ? { ...n, isRead: true } : n,
      );
      setNotifications(updated);
    } catch (e) {}
  };

  const closeModal = () => {
    setIsCrudModalOpen(false);
    setEditingId(null);

    // Clean form states
    setSliderTitle("");
    setSliderSubtitle("");
    setSliderAction("");
    setSliderOrder("0");
    setSliderImageFile(null);
    setPkgTitle("");
    setPkgDest("");
    setPkgDur("");
    setPkgPrice("");
    setPkgDesc("");
    setPkgItin("");
    setPkgImageFile(null);
    setCircTitle("");
    setCircCountry("");
    setCircCat("");
    setCircSalary("");
    setCircReqs("");
    setCircImageFile(null);
    setRevName("");
    setRevRole("");
    setRevText("");
    setRevRating("5");
    setRevImageFile(null);
    setBlogTitle("");
    setBlogContent("");
    setBlogAuthor("");
    setBlogImageFile(null);
    setHolderName("");
    setPassportNumber("");
    setSubmissionDate("");
    setPassportFile(null);
  };

  const openEditModal = (type, item) => {
    setEditingId(item._id || item.id);
    setIsCrudModalOpen(true);

    if (type === "slider") {
      setSliderTitle(item.title);
      setSliderSubtitle(item.subtitle);
      setSliderAction(item.actionUrl);
      setSliderOrder(item.order.toString());
    } else if (type === "package") {
      setPkgTitle(item.title);
      setPkgDest(item.destination);
      setPkgDur(item.duration);
      setPkgPrice(item.price.toString());
      setPkgDesc(item.description);
      setPkgItin(item.itinerary?.join("\n") || "");
    } else if (type === "circular") {
      setCircTitle(item.title);
      setCircCountry(item.country);
      setCircCat(item.jobCategory);
      setCircSalary(item.salaryRange);
      setCircReqs(item.requirements?.join("\n") || "");
    }
  };

  // UN-AUTHENTICATED ADMIN PANEL - SHOW LOGIN
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-16 text-slate-100">
        <div className="bg-slate-800 p-8 md:p-10 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-teal-900/50 text-teal-400 rounded-tr-2xl rounded-bl-2xl shadow-sm mb-4 border border-teal-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              অ্যাডমিন ড্যাশবোর্ড লগইন
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              প্রশাসনিক কাজে প্রবেশ করতে প্রফেশনাল ক্রেডেনশিয়াল দিন।
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-950 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                অ্যাডমিন ইমেইল *
              </label>
              <input
                type="email"
                required
                placeholder="admin@mces.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                পাসওয়ার্ড *
              </label>
              <input
                type="password"
                required
                placeholder="admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-750 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-1"
            >
              <span>
                {isLoggingIn ? "ভেরিফাই হচ্ছে..." : "ড্যাশবোর্ড প্রবেশ করুন"}
              </span>
              {!isLoggingIn && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Generate Stats Data for charts
  const totalPassports = passports.length;
  const approvedPassports = passports.filter(
    (p) => p.status === "Approved",
  ).length;
  const processPassports = passports.filter(
    (p) => p.status === "In Process",
  ).length;
  const submittedPassports = passports.filter(
    (p) => p.status === "Submitted",
  ).length;
  const rejectedPassports = passports.filter(
    (p) => p.status === "Rejected",
  ).length;

  const passportStatusData = [
    { name: "Approved", value: approvedPassports, color: "#10b981" },
    { name: "In Process", value: processPassports, color: "#f59e0b" },
    { name: "Submitted", value: submittedPassports, color: "#6366f1" },
    { name: "Rejected", value: rejectedPassports, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const analyticsBarData = [
    { name: "ট্যুর প্যাকেজ", সংখ্যা: packages.length },
    { name: "সার্কুলার", সংখ্যা: circulars.length },
    { name: "ব্লগ", সংখ্যা: blogs.length },
    { name: "পাসপোর্ট", সংখ্যা: totalPassports },
  ];

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("/") ? `http://localhost:5000${url}` : url;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-600 text-white rounded-tr-lg rounded-bl-lg">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-lg font-bold text-white">MCES Admin</span>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              title="লগআউট"
              className="p-1.5 hover:bg-slate-800 rounded-md text-red-400 hover:text-red-650"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {[
              {
                id: "overview",
                name: "ওভারভিউ এনালিটিক্স",
                icon: LayoutDashboard,
              },
              {
                id: "passports",
                name: "পাসপোর্ট ম্যানেজমেন্ট",
                icon: CheckSquare,
              },
              {
                id: "chat",
                name: "লাইভ চ্যাট কনসোল",
                icon: MessageSquare,
                badge: threads.length,
              },
              { id: "sliders", name: "স্লাইডার ব্যানার", icon: Image },
              { id: "circulars", name: "কাজের সার্কুলার", icon: BookOpen },
              { id: "packages", name: "ট্যুর প্যাকেজ", icon: Map },
              { id: "blogs", name: "ব্লগ পোস্ট", icon: FileText },
              { id: "reviews", name: "গ্রাহক রিভিউ", icon: Star },
              { id: "appointment", name: "অ্যাপয়েন্টমেন্ট", icon: Star },
              { id: "gallery", name: "ফটোগ্রাফি গ্যালারি", icon: Camera },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === item.id
                      ? "bg-teal-700 text-white shadow-sm"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info footer */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
          <p>লগইন ইউজার: {user.name}</p>
          <p>পাওয়ারড বাই: MCES Global</p>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {/* Header toolbar */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
            {activeTab === "overview" && "ড্যাশবোর্ড এনালিটিক্স ওভারভিউ"}
            {activeTab === "passports" && "জমাকৃত পাসপোর্ট ও ফাইল তালিকা"}
            {activeTab === "chat" && "গ্রাহকদের চ্যাট ও সমাধান বোর্ড"}
            {activeTab === "sliders" && "স্লাইডার ব্যানার ম্যানেজমেন্ট"}
            {activeTab === "circulars" && "চাকরির সার্কুলার তালিকা"}
            {activeTab === "packages" && "ট্যুর প্যাকেজ তালিকা"}
            {activeTab === "blogs" && "ব্লগ ও ইনফরমেশন প্যানেল"}
            {activeTab === "reviews" && "গ্রাহক রিভিউ প্যানেল"}
            {activeTab === "appointment" && "অ্যাপয়েন্টমেন্ট প্যানেল"}
            {activeTab === "gallery" && "ফটোগ্রাফি গ্যালারি ম্যানেজমেন্ট"}
          </h2>

          {/* Right Bell notification stream */}
          <div className="flex items-center space-x-4">
            {/* Real-time notification panel */}
            <div className="relative group">
              <button className="relative p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown hover list */}
              <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 hidden group-hover:block z-40 max-h-[380px] overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="text-xs font-bold text-slate-700">
                    রিয়েল-টাইম নোটিফিকেশন
                  </span>
                  <button
                    onClick={handleClearNotifications}
                    className="text-[10px] text-red-600 hover:text-red-800 font-bold"
                  >
                    সব মুছুন
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      কোনো নোটিফিকেশন নেই।
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id || notif.id}
                        onClick={() => handleMarkRead(notif._id || notif.id)}
                        className={`p-3 cursor-pointer transition-colors flex items-start space-x-2.5 ${notif.isRead ? "bg-white" : "bg-teal-50/40 font-semibold"}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-slate-800 text-[11px]">
                            {notif.title}
                          </p>
                          <p className="text-slate-550 text-[10px] font-normal leading-tight">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-1"
            >
              <span>সাইট ভিজিট</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Panel Body */}
        <div className="p-6 md:p-8 flex-grow">
          {/* TAB 1: OVERVIEW ANALYTICS */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stat grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      মোট পাসপোর্ট আবেদন
                    </span>
                    <span className="text-2xl font-bold text-slate-800 mt-1">
                      {totalPassports}
                    </span>
                  </div>
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      অনুমোদিত (Approved)
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 mt-1">
                      {approvedPassports}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      প্রক্রিয়াধীন (In Process)
                    </span>
                    <span className="text-2xl font-bold text-amber-600 mt-1">
                      {processPassports}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      নতুন চ্যাট থ্রেডস
                    </span>
                    <span className="text-2xl font-bold text-indigo-600 mt-1">
                      {threads.length}
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recharts Data Visualization charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar chart */}
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-6">
                    কন্টেন্ট ও পাসপোর্ট স্ট্যাটিস্টিক্স
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={analyticsBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="সংখ্যা" fill="#0f766e" barSize={40} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-6">
                    পাসপোর্ট অনুমোদন স্থিতি (Status breakdown)
                  </h3>
                  {passportStatusData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-xs text-slate-400">
                      কোনো পাসপোর্ট রেকর্ড নেই।
                    </div>
                  ) : (
                    <div className="h-80 w-full flex flex-col justify-center">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={passportStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {passportStatusData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center space-x-4 text-xs font-semibold mt-4">
                        {passportStatusData.map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-1.5"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>
                              {entry.name}: {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASSPORT DOCUMENT LIST & SEARCH & STATUS ACTIONS */}
          {activeTab === "passports" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              {/* Search Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-sm flex">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="নাম অথবা পাসপোর্ট নাম্বার দিয়ে সার্চ করুন..."
                    value={passportSearch}
                    onChange={(e) => {
                      setPassportSearch(e.target.value);
                      setTimeout(() => refetchPassports(), 300);
                    }}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5 self-end sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন পাসপোর্ট জমা করুন</span>
                </button>
              </div>

              {/* Passports Table list */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs md:text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 font-semibold">
                      <th className="pb-3">ধারকের নাম</th>
                      <th className="pb-3">পাসপোর্ট নাম্বার</th>
                      <th className="pb-3">জমা দেওয়ার তারিখ</th>
                      <th className="pb-3">পিডিএফ ডকুমেন্ট</th>
                      <th className="pb-3">স্ট্যাটাস</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {passports.map((pass) => (
                      <tr key={pass.id}>
                        <td className="py-3.5 font-semibold">
                          {pass.holderName}
                        </td>
                        <td className="py-3.5 font-mono">
                          {pass.passportNumber}
                        </td>
                        <td className="py-3.5">{pass.submissionDate}</td>
                        <td className="py-3.5">
                          <a
                            href={getImageUrl(pass.pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-bold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF ফাইল দেখুন</span>
                          </a>
                        </td>
                        <td className="py-3.5">
                          <select
                            value={pass.status}
                            onChange={(e) =>
                              handleUpdatePassportStatus(
                                pass.id,
                                e.target.value,
                              )
                            }
                            className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-teal-700"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="In Process">In Process</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() =>
                              handleDeleteItem("passport", pass.id)
                            }
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {passports.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-8 text-slate-400 text-xs"
                        >
                          কোনো পাসপোর্ট রেকর্ড পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CHAT SUPPORT CONSOLE */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-2xl border border-teal-50 shadow-sm overflow-hidden h-[600px] flex">
              {/* Left Column: User threads list */}
              <div className="w-80 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-xs md:text-sm">
                  চ্যাট কনভার্সেশনস তালিকা
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {threads.length === 0 ? (
                    <div className="text-center py-12 text-slate-450 text-xs">
                      কোনো চ্যাট রিকোয়েস্ট নেই।
                    </div>
                  ) : (
                    threads.map((thread) => {
                      const isActive = activeThread?.userId === thread.userId;
                      return (
                        <div
                          key={thread.userId}
                          onClick={() => setActiveThread(thread)}
                          className={`p-4 cursor-pointer transition-colors ${isActive ? "bg-teal-50/50 border-r-4 border-teal-700" : "hover:bg-slate-50"}`}
                        >
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-slate-800 text-xs md:text-sm">
                              {thread.senderName}
                            </h4>
                            <span className="text-[9px] text-slate-400">
                              {new Date(thread.updatedAt).toLocaleTimeString(
                                "bn-BD",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs truncate leading-normal">
                            {thread.lastMessage}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat History & Reply */}
              <div className="flex-1 flex flex-col bg-slate-50 justify-between">
                {activeThread ? (
                  <>
                    {/* Header */}
                    <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                        <h4 className="font-bold text-slate-800 text-sm md:text-base">
                          {activeThread.senderName} এর সাথে চ্যাট
                        </h4>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-3">
                      {Array.isArray(messages) && messages.length > 0 ? (
                        messages.map((msg, index) => {
                          const isAdmin = msg.sender === "admin";
                          return (
                            <div
                              key={msg._id || msg.id || index}
                              className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                            >
                              <span className="text-[9px] text-slate-400 mb-0.5 px-1">
                                {isAdmin ? "অ্যাডমিন সাপোর্ট" : msg.senderName}
                              </span>
                              <div
                                className={`max-w-[70%] px-3.5 py-2.5 text-xs rounded-2xl shadow-sm ${
                                  isAdmin
                                    ? "bg-teal-700 text-white rounded-tr-none"
                                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-xs text-slate-400 py-4">
                          কোনো মেসেজ পাওয়া যায়নি বা লোড হচ্ছে...
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Reply Input Form */}
                    <form
                      onSubmit={handleSendReply}
                      className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        required
                        placeholder="আপনার রিপ্লাই বার্তাটি লিখুন..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-grow px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-600"
                      />
                      <button
                        type="submit"
                        className="p-3 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors shadow-md flex items-center justify-center focus:outline-none"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="m-auto text-slate-400 text-xs md:text-sm flex flex-col items-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-350" />
                    <span>
                      চ্যাট শুরু করতে বাম পাশের তালিকায় গ্রাহক নির্বাচন করুন।
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SLIDER BANNER CRUD */}
          {activeTab === "sliders" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  হোমপেজের স্লাইডার এডিটর প্যানেল
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন স্লাইডার যুক্ত করুন</span>
                </button>
              </div>

              {/* Slider list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sliders.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-36 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-slate-450 text-[10px] line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("slider", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("slider", item._id || item.id)
                        }
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: JOB CIRCULARS CRUD */}
          {activeTab === "circulars" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  দক্ষ শ্রমিক নিয়োগ সার্কুলার এডিটর
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সার্কুলার যুক্ত করুন</span>
                </button>
              </div>

              {/* Circulars list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {circulars.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-32 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md text-[8px] font-bold">
                        {item.country}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-teal-800 font-extrabold text-[10px]">
                        বেতন: {item.salaryRange}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("circular", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("circular", item._id || item.id)
                        }
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TOUR PACKAGES CRUD */}
          {activeTab === "packages" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  ট্যুর প্যাকেজ বুকিং এডিটর
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ট্যুর প্যাকেজ যুক্ত করুন</span>
                </button>
              </div>

              {/* Packages list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-32 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-md text-[8px] font-bold">
                        {item.destination}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-teal-800 font-extrabold text-[10px]">
                        মূল্য: ৳{item.price.toLocaleString("bn-BD")}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("package", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("package", item._id || item.id)
                        }
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BLOG MANAGEMENT CRUD */}
          {activeTab === "blogs" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  ইনফরমেশন ও এডুকেশন ব্লগ প্যানেল
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ব্লগ লিখুন</span>
                </button>
              </div>

              {/* Blogs list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-32 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2 flex-grow">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-slate-450 text-[10px] line-clamp-2">
                        {item.content}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() =>
                          handleDeleteItem("blog", item._id || item.id)
                        }
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors flex items-center space-x-1 font-semibold text-[10px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appointment" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-800">
                  সব অ্যাপয়েন্টমেন্ট তালিকা
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-semibold uppercase">
                      <th className="py-3 px-4">গ্রাহকের নাম</th>
                      <th className="py-3 px-4">যোগাযোগ ও ইমেইল</th>
                      <th className="py-3 px-4">ডিপার্টমেন্ট</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-50 text-slate-600">
                    {appointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-8 text-center text-slate-400"
                        >
                          কোনো অ্যাপয়েন্টমেন্ট ডাটা পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      appointments.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {app.name}
                          </td>
                          <td className="py-3 px-4">
                            <div>{app.phone}</div>
                            <div className="text-[11px] text-slate-400">
                              {app.email || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded text-[11px]">
                              {app.serviceName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-teal-700">
                            {app.date || "Not Set"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                app.status === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : app.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {app.status === "accepted"
                                ? "গৃহীত"
                                : app.status === "rejected"
                                  ? "প্রত্যাখ্যাত"
                                  : "পেন্ডিং"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {/* স্ট্যাটাস পেন্ডিং থাকলে অ্যাকশন বাটনগুলো দেখাবে */}
                            {(app.status === "pending" || !app.status) && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(app._id, "accepted")
                                  }
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-medium transition-colors"
                                >
                                  ✔ অ্যাক্সেপ্ট
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(app._id, "rejected")
                                  }
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-medium transition-colors"
                                >
                                  ✖ রিজেক্ট
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDownloadPDF(app)}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors"
                            >
                              🖨 PDF ডাউনলোড
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: CLIENT REVIEW MANAGEMENT CRUD */}
          {activeTab === "reviews" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  গ্রাহক প্রতিক্রিয়া রিভিউ মডারেটর
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন রিভিউ যোগ করুন</span>
                </button>
              </div>

              {/* Reviews list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-slate-600 text-xs italic line-clamp-3">
                        &ldquo;{item.reviewText}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.clientName}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-[11px]">
                            {item.clientName}
                          </h4>
                          <span className="text-[9px] text-slate-400 block">
                            {item.clientRole}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteItem("review", item._id || item.id)
                        }
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6 text-slate-800">
              {/* Alert message */}
              {galleryAlertMsg.text && (
                <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 border max-w-md ${
                  galleryAlertMsg.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}>
                  {galleryAlertMsg.type === "error" ? (
                    <span className="text-red-500 font-bold">&#9888; {galleryAlertMsg.text}</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">&#x2713; {galleryAlertMsg.text}</span>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-teal-50 shadow-xs">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-800">ফটোগ্রাফি গ্যালারি তালিকা</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    এখান থেকে গ্যালারির ছবি আপলোড ও ছবি মুছে ফেলার প্রক্রিয়া পরিচালনা করুন।
                  </p>
                </div>

                <button
                  onClick={() => setIsGalleryFormOpen(!isGalleryFormOpen)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {isGalleryFormOpen ? "ট্যাব বন্ধ করুন" : "নতুন ছবি আপলোড"}
                </button>
              </div>

              {isGalleryFormOpen && (
                <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm space-y-5 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-teal-600" />
                    <span>নতুন ছবি সাবমিট ফর্ম</span>
                  </h4>

                  <form onSubmit={handleAddGalleryPhoto} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Image selector */}
                    <div className="space-y-3">
                      <span className="font-bold text-slate-700 block">ছবি ফাইল সিলেক্ট করুন (বাধ্যতামূলক)</span>
                      
                      {galleryImagePreview ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 border">
                          <img src={galleryImagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setGalleryImageFile(null); setGalleryImagePreview(""); }}
                            className="absolute top-2 right-2 p-1.5 bg-red-650/80 hover:bg-red-700 text-white rounded-full cursor-pointer border-0"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 cursor-pointer p-6">
                          <div className="text-center space-y-1.5">
                            <span className="block font-semibold text-slate-600">ক্লিক করে ছবি সিলেক্ট করুন</span>
                            <span className="block text-[10px] text-slate-400">PNG, JPG format up to 5MB</span>
                          </div>
                          <input type="file" required accept="image/*" onChange={handleGalleryFileChange} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">ছবি শিরোনাম (ইংরেজিতে)</label>
                          <input
                            type="text"
                            required
                            value={galleryTitle}
                            onChange={(e) => setGalleryTitle(e.target.value)}
                            placeholder="e.g. Workers Departure Celebration"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-700"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">ছবি শিরোনাম (বাংলায়)</label>
                          <input
                            type="text"
                            required
                            value={galleryTitleBn}
                            onChange={(e) => setGalleryTitleBn(e.target.value)}
                            placeholder="যেমন: সৌদিগামী কর্মীদের বিদায়ী অনুষ্ঠান"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">ছবি ক্যাটাগরি</label>
                          <select
                            value={galleryCategory}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGalleryCategory(val);
                              if (val === "Visa Success") setGalleryCategoryBn("ভিসা সাফল্য");
                              else if (val === "Recruitment") setGalleryCategoryBn("নিয়োগ");
                              else if (val === "Study Abroad") setGalleryCategoryBn("উচ্চশিক্ষা");
                              else if (val === "Counseling") setGalleryCategoryBn("কাউন্সেলিং");
                              else setGalleryCategoryBn("অন্যান্য");
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
                          >
                            <option value="Visa Success">Visa Success</option>
                            <option value="Recruitment">Recruitment</option>
                            <option value="Study Abroad">Study Abroad</option>
                            <option value="Counseling">Counseling</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">বাংলা অনুবাদ</label>
                          <input
                            type="text"
                            readOnly
                            value={galleryCategoryBn}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={resetGalleryForm}
                          className="px-4 py-2 border border-slate-250 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingGallery}
                          className="px-6 py-2 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          {isSubmittingGallery ? "আপলোড হচ্ছে..." : "ছবি যুক্ত করুন"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {isGalleryLoading ? (
                <div className="text-center py-10 bg-white border rounded-2xl animate-pulse">
                  <Camera className="w-8 h-8 text-slate-200 mx-auto animate-bounce mb-2" />
                  <span className="text-xs text-slate-400">লোডিং গ্যালারি ডাটা...</span>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-12 bg-white border rounded-2xl text-slate-400 space-y-2">
                  <Camera className="w-10 h-10 mx-auto text-slate-300" />
                  <span className="text-xs font-semibold block">গ্যালারিতে কোনো ছবি নেই।</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.map((img) => {
                    const isCustom = img.custom || false;
                    return (
                      <div 
                        key={img._id || img.id}
                        className="bg-white rounded-2xl overflow-hidden border p-3 flex flex-col justify-between space-y-4 shadow-xs text-xs text-slate-800"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 border">
                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                            
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-bold tracking-wider rounded bg-teal-900/95 text-white flex items-center space-x-1 uppercase">
                              <span>{img.categoryBn || img.category}</span>
                            </span>
                          </div>

                          <div className="space-y-1 font-semibold text-slate-800 pb-1">
                            <h4 className="font-bold text-slate-800 leading-snug line-clamp-1">{img.titleBn || img.title}</h4>
                            <p className="text-[10px] text-slate-450 font-medium">{img.title || img.titleBn}</p>
                            
                            <div className="flex items-center space-x-1 text-[9px] text-slate-400 pt-1 font-medium">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              <span>{img.date || "2026-06-17"}</span>
                              {isCustom && (
                                <span className="px-1 bg-yellow-50 text-yellow-700 rounded text-[7px] font-bold border border-yellow-200 ml-1">
                                  স্থানীয় ডেটা
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t flex justify-end">
                          <button
                            onClick={() => handleDeleteGalleryPhoto(img._id || img.id, isCustom)}
                            className="p-1 px-2.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors cursor-pointer flex items-center space-x-1 text-[10px] font-bold"
                            title="ছবি মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>মুছে ফেলুন</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* CRUD MODAL FOR ADDING/EDITING DATA */}
      {isCrudModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative animate-in zoom-in-95 duration-200 text-slate-800 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-6">
              {editingId ? "রিকর্ড আপডেট এডিটর" : "নতুন রেকর্ড অ্যাড প্যানেল"}
            </h3>

            {/* Render conditional forms based on tab */}
            {activeTab === "sliders" && (
              <form onSubmit={handleSliderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    স্লাইডার শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={sliderTitle}
                    onChange={(e) => setSliderTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    স্লাইডার বিবরণ *
                  </label>
                  <textarea
                    required
                    value={sliderSubtitle}
                    onChange={(e) => setSliderSubtitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      লিংক URL (অ্যাকশন)
                    </label>
                    <input
                      type="text"
                      value={sliderAction}
                      onChange={(e) => setSliderAction(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      অর্ডার নম্বর (সাজানো)
                    </label>
                    <input
                      type="number"
                      value={sliderOrder}
                      onChange={(e) => setSliderOrder(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    স্লাইডার ব্যানার ইমেজ *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSliderImageFile(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingSlider}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md"
                >
                  {isSubmittingSlider
                    ? "স্লাইডার সেভ হচ্ছে..."
                    : "স্লাইডার সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "circulars" && (
              <form onSubmit={handleCircularSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    সার্কুলার জব টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={circTitle}
                    onChange={(e) => setCircTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* দেশ নির্বাচনের ড্রপডাউন মেনু */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      দেশ *
                    </label>
                    <select
                      required
                      value={circCountry}
                      onChange={(e) => setCircCountry(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-white"
                    >
                      <option value="">দেশ নির্বাচন করুন</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ক্যাটাগরি নির্বাচনের ড্রপডাউন মেনু */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ক্যাটাগরি *
                    </label>
                    <select
                      required
                      value={circCat}
                      onChange={(e) => setCircCat(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-white"
                    >
                      <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    বেতন পরিসীমা *
                  </label>
                  <input
                    type="text"
                    required
                    value={circSalary}
                    onChange={(e) => setCircSalary(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    placeholder="যেমন: ৮০০ ইউরো / মাস"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    যোগ্যতার রিকোয়ারমেন্টস (লাইন ব্রেক দিয়ে লিখুন) *
                  </label>
                  <textarea
                    required
                    value={circReqs}
                    onChange={(e) => setCircReqs(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 font-medium"
                    rows="4"
                    placeholder="১. ২ বছরের অভিজ্ঞতা&#10;২. ভাষা দক্ষতা..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ফিচার্ড ইমেজ *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCircImageFile(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md"
                >
                  সার্কুলার সেভ করুন
                </button>
              </form>
            )}

            {activeTab === "passports" && (
              <form onSubmit={handlePassportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট ধারির নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট নাম্বার *
                  </label>
                  <input
                    type="text"
                    required
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট জমা দেওয়ার তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট এর পিডিএফ ফাইল *
                  </label>
                  <input
                    type="file"
                    required={!editingId}
                    accept=".pdf"
                    onChange={(e) => setPassportFile(e.target.files[0])}
                    className="w-full text-xs border"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingPassport}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md"
                >
                  {isSubmittingPassport
                    ? "পাসপোর্ট সেভ হচ্ছে..."
                    : "পাসপোর্ট সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "packages" && (
              <form onSubmit={handlePackageSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    প্যাকেজ টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      গন্তব্য *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgDest}
                      onChange={(e) => setPkgDest(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="যেমন: Nepal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      সময়কাল *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgDur}
                      onChange={(e) => setPkgDur(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="যেমন: ৫ দিন ৪ রাত"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      প্যাকেজ মূল্য *
                    </label>
                    <input
                      type="number"
                      required
                      value={pkgPrice}
                      onChange={(e) => setPkgPrice(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="৳ মূল্য"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    সংক্ষিপ্ত বর্ণনা *
                  </label>
                  <textarea
                    required
                    value={pkgDesc}
                    onChange={(e) => setPkgDesc(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    বিস্তারিত ভ্রমণ পরিকল্পনা (লাইন ব্রেক দিয়ে লিখুন)
                  </label>
                  <textarea
                    value={pkgItin}
                    onChange={(e) => setPkgItin(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 font-medium"
                    rows="4"
                    placeholder="১ম দিন: আগমন ও হোটেলে ট্রান্সফার&#10;২য় দিন: দরবার স্কয়ার..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    প্যাকেজ ইমেজ *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPkgImageFile(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md"
                >
                  প্যাকেজ সেভ করুন
                </button>
              </form>
            )}

            {activeTab === "blogs" && (
              <form onSubmit={handleBlogSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ব্লগ শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    লেখক
                  </label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    placeholder="অ্যাডমিন"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ব্লগ কনটেন্ট *
                  </label>
                  <textarea
                    required
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ব্লগ কাভার ইমেজ *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBlogImageFile(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>

                {/* লোডিং স্টেট অনুযায়ী বাটনটি ডিজেবল হবে এবং টেক্সট পরিবর্তন হবে */}
                <button
                  type="submit"
                  disabled={isSubmittingBlog}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {isSubmittingBlog ? "ব্লগ সেভ হচ্ছে..." : "ব্লগ সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "reviews" && (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ক্লায়েন্টের নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      পদবী ও দেশ *
                    </label>
                    <input
                      type="text"
                      required
                      value={revRole}
                      onChange={(e) => setRevRole(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="যেমন: কনস্ট্রাকশন ফোরম্যান (রোমানিয়া)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    রেটিং (১-৫) *
                  </label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 bg-white"
                  >
                    <option value="5">৫ স্টার</option>
                    <option value="4">৪ স্টার</option>
                    <option value="3">৩ স্টার</option>
                    <option value="2">২ স্টার</option>
                    <option value="1">১ স্টার</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    রিভিউ প্রতিক্রিয়া টেক্সট *
                  </label>
                  <textarea
                    required
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    গ্রাহকের ছবি *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setRevImageFile(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md"
                >
                  রিভিউ সেভ করুন
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
