"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { api } from "../hooks/useApi";
import SliderBanner from "../components/SliderBanner";
import useStore from "../store/useStore";
import { translations } from "../utils/translations";

export default function Home() {
  const { language } = useStore();
  const t = translations[language] || translations["bn"];

  // 1. Fetching dynamic items
  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: api.getPackages,
  });

  const { data: circulars = [] } = useQuery({
    queryKey: ["circulars"],
    queryFn: api.getCirculars,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: api.getReviews,
  });

  const { data: blogs = [] } = useQuery({
    queryKey: ["blogs"],
    queryFn: api.getBlogs,
  });

  // 2. Tracking State
  const [trackNumber, setTrackNumber] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  const handleTrackPassport = async (e) => {
    e.preventDefault();
    if (!trackNumber.trim()) return;

    setIsTrackLoading(true);
    setTrackError("");
    setTrackResult(null);

    try {
      const res = await api.trackPassport(trackNumber);
      setTrackResult(res);
    } catch (err) {
      setTrackError(
        err.message ||
          (language === "bn"
            ? "পাসপোর্ট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক নাম্বার দিন।"
            : "Passport not found. Please enter a valid number."),
      );
    } finally {
      setIsTrackLoading(false);
    }
  };

  // 3. Appointment Form State
  const [appointmentName, setAppointmentName] = useState("");
  const [appointmentEmail, setAppointmentEmail] = useState("");
  const [appointmentPhone, setAppointmentPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentService, setAppointmentService] = useState("Skilled Labor");
  const [appointmentMsg, setAppointmentMsg] = useState("");
  const [appointmentSuccess, setAppointmentSuccess] = useState("");
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setIsSubmittingAppointment(true);
    setAppointmentSuccess("");

    try {
      const res = await api.submitContact({
        name: appointmentName,
        email: appointmentEmail,
        phone: appointmentPhone,
        message: appointmentMsg,
        type: "appointment",
        serviceName: appointmentService,
        date: appointmentDate,
        metadata: {
          name: appointmentName,
          email: appointmentEmail,
          phone: appointmentPhone,
          serviceName: appointmentService,
          date: appointmentDate,
          userMessage: appointmentMsg
        }
      });
      
      setAppointmentSuccess(res.message || t.appointmentSuccessMsg);
      setAppointmentName("");
      setAppointmentEmail("");
      setAppointmentPhone("");
      setAppointmentMsg("");
    } catch (err) {
      alert(
        language === "bn"
          ? "অ্যাপয়েন্টমেন্ট বুকিং করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।"
          : "Error booking appointment. Please try again."
      );
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  // 4. Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactSuccess("");

    try {
      const res = await api.submitContact({
        name: contactName,
        email: contactEmail,
        message: contactMsg,
        type: "contact",
      });
      setContactSuccess(res.message || (language === "bn" ? "বার্তা সফলভাবে পাঠানো হয়েছে!" : "Message sent successfully!"));
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    } catch (err) {
      alert(
        language === "bn"
          ? "যোগাযোগ ফর্ম পাঠাতে সমস্যা হয়েছে।"
          : "Error sending contact form. Please try again."
      );
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Resolve locally-saved image URLs if necessary
  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("/") ? `http://localhost:5000${url}` : url;
  };

  const services = [
    {
      title: t.servicesList[0].title,
      icon: Briefcase,
      color: "bg-emerald-50 text-emerald-700",
      description: t.servicesList[0].desc,
      consultant: t.servicesList[0].consultant,
      link: "/circulars",
    },
    {
      title: t.servicesList[1].title,
      icon: GraduationCap,
      color: "bg-indigo-50 text-indigo-700",
      description: t.servicesList[1].desc,
      consultant: t.servicesList[1].consultant,
      link: "#appointment-form",
    },
    {
      title: t.servicesList[2].title,
      icon: Map,
      color: "bg-amber-50 text-amber-700",
      description: t.servicesList[2].desc,
      consultant: t.servicesList[2].consultant,
      link: "#tour-packages",
    },
  ];

  return (
    <div className="bg-teal-50/20">
      {/* 1. Homepage Slider Banner */}
      <SliderBanner />

      {/* 2. Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            {t.servicesTitle}
          </h2>
          <div className="h-1 w-20 bg-teal-700 mx-auto mt-4 rounded-full" />
          <p className="text-slate-500 mt-4 text-sm md:text-base leading-relaxed">
            {t.servicesSubtitle}
          </p>
        </div>

        {/* Curvy cards with interactive states */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 curvy-card border border-teal-50 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`p-4 rounded-2xl w-fit ${srv.color} mb-6 shadow-sm`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {srv.title}
                  </h3>
                  <p className="text-slate-550 text-xs md:text-sm leading-relaxed mb-6">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="text-xs font-semibold text-teal-800 mb-4 bg-teal-50/50 py-2 px-3 rounded-lg flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
                    <span className="truncate">{srv.consultant}</span>
                  </div>
                  <Link
                    href={srv.link}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1 hover:translate-x-1 transition-transform"
                  >
                    <span>{t.serviceDetailsBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Passport Live Tracking Widget */}
      <section
        id="passport-track"
        className="bg-gradient-to-r from-teal-900 via-teal-850 to-emerald-900 text-white py-20 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-teal-700/20 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-emerald-600/20 rounded-full blur-2xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              {t.trackTitle}
            </h2>
            <p className="text-teal-200 mt-3 text-xs md:text-sm">
              {t.trackSubtitle}
            </p>
          </div>

          {/* Tracking Form */}
          <form
            onSubmit={handleTrackPassport}
            className="max-w-lg mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex shadow-lg"
          >
            <input
              type="text"
              required
              placeholder={t.trackInputPlaceholder}
              value={trackNumber}
              onChange={(e) => setTrackNumber(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent placeholder-teal-200 text-white rounded-xl text-xs md:text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={isTrackLoading}
              className="px-6 py-3 bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs md:text-sm curvy-button shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>
                {isTrackLoading ? t.trackLoading : t.trackBtn}
              </span>
            </button>
          </form>

          {/* Track Results */}
          {trackError && (
            <div className="mt-6 max-w-md mx-auto p-4 bg-rose-500/20 border border-rose-400/40 text-rose-100 rounded-xl text-xs">
              {trackError}
            </div>
          )}

          {trackResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 max-w-md mx-auto bg-white text-slate-800 p-6 rounded-2xl shadow-xl text-left border border-teal-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm md:text-base">
                  {t.trackReportTitle}
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    trackResult.status === "Approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : trackResult.status === "Rejected"
                        ? "bg-rose-100 text-rose-800"
                        : trackResult.status === "In Process"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {trackResult.status === "Submitted" ? t.statusSubmitted : trackResult.status === "In Process" ? t.statusInProcess : trackResult.status === "Approved" ? t.statusApproved : t.statusRejected}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.trackHolderName}</span>
                  <span className="font-semibold text-slate-800">
                    {trackResult.holderName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.trackPassportNumber}</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {trackNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.trackSubmissionDate}</span>
                  <span className="font-semibold text-slate-800">
                    {trackResult.submissionDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.trackLastUpdate}</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(trackResult.updatedAt).toLocaleDateString(
                      language === "bn" ? "bn-BD" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </span>
                </div>
              </div>

              {/* Status Stepper visualization */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between relative">
                  {["Submitted", "In Process", "Approved"].map((st, i) => {
                    const stepLabel = st === "Submitted" ? t.stepSubmitted : st === "In Process" ? t.stepInProcess : t.stepApproved;
                    const statuses = [
                      "Submitted",
                      "In Process",
                      "Approved",
                      "Rejected",
                    ];
                    const currentIdx = statuses.indexOf(trackResult.status);
                    const stepIdx = statuses.indexOf(st);

                    const isCompleted = currentIdx >= stepIdx;
                    const isRejectedStep =
                      trackResult.status === "Rejected" && st === "Approved";

                    return (
                      <div
                        key={st}
                        className="flex flex-col items-center flex-1 relative z-10"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isRejectedStep
                              ? "bg-rose-100 text-rose-800"
                              : isCompleted
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isRejectedStep ? "X" : i + 1}
                        </div>
                        <span className="text-[10px] mt-1.5 text-slate-500 font-semibold text-center">
                          {stepLabel}
                        </span>
                      </div>
                    );
                  })}
                  {/* Line connector */}
                  <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 4. Tour Packages Section */}
      <section
        id="tour-packages"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            {t.toursTitle}
          </h2>
          <div className="h-1 w-20 bg-teal-700 mx-auto mt-4 rounded-full" />
          <p className="text-slate-500 mt-4 text-xs md:text-sm">
            {t.toursSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(packages.length > 0 ? packages : []).slice(0, 6).map((pkg, idx) => (
            <motion.div
              key={pkg._id || pkg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden border border-teal-50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Package Image */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={getImageUrl(pkg.imageUrl)}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-3 right-3 px-3 py-1 bg-teal-700 text-white text-[10px] font-bold rounded-full shadow-sm">
                  {pkg.destination}
                </span>
              </div>

              {/* Package Details */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
                    <span>{language === 'bn' ? 'সময়কাল:' : 'Duration:'} {pkg.duration}</span>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {t.toursPricePill}
                    </span>
                    <span className="text-base font-extrabold text-teal-800">
                      ৳{pkg.price.toLocaleString(language === "bn" ? "bn-BD" : "en-US")}
                    </span>
                  </div>
                  <Link
                    href={`/packages/${pkg._id || pkg.id}`}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm"
                  >
                    {t.toursBookBtn}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-slate-400 bg-white border border-teal-50 rounded-2xl">
              {t.toursFallbackMsg}
            </div>
          )}
        </div>
      </section>

      {/* 5. Skilled Labor Circulars Section */}
      <section className="bg-slate-50 py-20 border-y border-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              {t.circsTitle}
            </h2>
            <div className="h-1 w-20 bg-teal-700 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-4 text-xs md:text-sm">
              {t.circsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(circulars.length > 0 ? circulars : [])
              .slice(0, 4)
              .map((circ, idx) => (
                <motion.div
                  key={circ._id || circ.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 hover:shadow-md transition-shadow"
                >
                  {/* Circular image */}
                  <div className="w-full md:w-36 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={getImageUrl(circ.imageUrl)}
                      alt={circ.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Circular Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md text-[9px] font-bold">
                          {circ.country}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {circ.jobCategory}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">
                        {circ.title}
                      </h3>
                      <p className="text-teal-800 font-extrabold text-xs mt-1">
                        {t.circsSalaryRange}: {circ.salaryRange}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/circulars?id=${circ._id || circ.id}`}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        {t.circsReqs}
                      </Link>
                      <a
                        href="#appointment-form"
                        className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-semibold curvy-button shadow-sm"
                      >
                        {t.circsApplyBtn}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/circulars"
              className="inline-flex items-center space-x-2 px-6 py-3 border border-teal-200 text-teal-800 hover:bg-teal-50 text-xs font-bold curvy-button transition-colors"
            >
              <span>{t.circsAllBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Appointment Form Section */}
      <section
        id="appointment-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Form info */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold rounded-full uppercase">
              {language === 'bn' ? 'বুকিং প্যানেল' : 'Booking Panel'}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">
              {t.appointmentTitle}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-light">
              {t.appointmentSubtitle}
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {t.appointmentSchedTitle}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t.appointmentSchedDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {t.appointmentSecureTitle}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t.appointmentSecureDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Widget */}
          <div className="bg-white p-8 curvy-card border border-teal-50 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
              {t.appointmentFormHeader}
            </h3>

            {appointmentSuccess && (
              <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-bold">
                {appointmentSuccess}
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.appointmentNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.appointmentPlaceholderName}
                    value={appointmentName}
                    onChange={(e) => setAppointmentName(e.target.value)}
                    className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.appointmentPhoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t.appointmentPlaceholderPhone}
                    value={appointmentPhone}
                    onChange={(e) => setAppointmentPhone(e.target.value)}
                    className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.appointmentEmailLabel}
                </label>
                <input
                  type="email"
                  placeholder={t.appointmentPlaceholderEmail}
                  value={appointmentEmail}
                  onChange={(e) => setAppointmentEmail(e.target.value)}
                  className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.appointmentDateLabel}
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.appointmentDeptLabel}
                </label>
                <select
                  value={appointmentService}
                  onChange={(e) => setAppointmentService(e.target.value)}
                  className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-white"
                >
                  {t.appointmentDeptOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.appointmentMsgLabel}
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder={t.appointmentPlaceholderMsg}
                  value={appointmentMsg}
                  onChange={(e) => setAppointmentMsg(e.target.value)}
                  className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAppointment}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md transition-colors"
              >
                {isSubmittingAppointment
                  ? t.appointmentSubmitting
                  : t.appointmentSubmitBtn}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 7. Client Reviews Section */}
      <section className="bg-slate-50 py-20 border-y border-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              {t.reviewsTitle}
            </h2>
            <div className="h-1 w-20 bg-teal-700 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-4 text-xs md:text-sm">
              {t.reviewsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(reviews.length > 0 ? reviews : []).map((rev, idx) => (
              <motion.div
                key={rev._id || rev.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs italic leading-relaxed">
                    &ldquo;{rev.reviewText}&rdquo;
                  </p>
                </div>

                <div className="flex items-center space-x-3.5 mt-6 pt-4 border-t border-slate-50">
                  <img
                    src={getImageUrl(rev.imageUrl)}
                    alt={rev.clientName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">
                      {rev.clientName}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      {rev.clientRole}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Blogs Section */}
      <section
        id="blogs"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            {t.blogsTitle}
          </h2>
          <div className="h-1 w-20 bg-teal-700 mx-auto mt-4 rounded-full" />
          <p className="text-slate-500 mt-4 text-xs md:text-sm">
            {t.blogsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(blogs.length > 0 ? blogs : []).map((post, idx) => (
            <motion.div
              key={post._id || post.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden border border-teal-50 shadow-sm flex flex-col md:flex-row hover:shadow-md transition-shadow"
            >
              <div className="w-full md:w-48 h-40 bg-slate-100 flex-shrink-0">
                <img
                  src={getImageUrl(post.imageUrl)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">
                    {language === 'bn' ? 'পোস্ট করেছেন:' : 'Posted by:'} {post.author}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base mt-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>
                <Link
                  href={`/blogs/${post._id || post.id}`}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 mt-4 flex items-center space-x-1"
                >
                  <span>{t.blogsReadFull}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 9. Contact Page Section (Details, Form, Map Pointer) */}
      <section
        id="contact"
        className="bg-slate-50 py-20 border-t border-teal-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              {t.contactTitle}
            </h2>
            <div className="h-1 w-20 bg-teal-700 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-4 text-xs">
              {t.contactSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Office Details Card */}
            <div className="bg-white p-8 rounded-2xl border border-teal-50 shadow-sm space-y-6 lg:col-span-1">
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-1">
                  {t.contactHeadOffice}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {t.footerOfficeAddress}
                </p>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="text-xs">
                  <span className="text-slate-400 block">
                    {t.contactHelpline}
                  </span>
                  <span className="font-bold text-slate-800">
                    +৮৮০১৭৮৯-৬৫০৯৬৯
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block">{t.contactEmailLabel}</span>
                  <span className="font-bold text-slate-800 font-mono w-full break-all">
                    info@mcesbd.com
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block">
                    {t.contactWhatsAppLabel}
                  </span>
                  <span className="font-bold text-slate-800">
                    +৮৮০১৭৮৯-৬৫০৯৬৯
                  </span>
                </div>
              </div>

              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex items-center space-x-3 text-xs text-teal-850">
                <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span>
                  {t.contactHoursNotice}
                </span>
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="bg-white p-8 rounded-2xl border border-teal-50 shadow-sm lg:col-span-1">
              <h3 className="font-bold text-slate-800 text-base mb-4">
                {t.contactFormTitle}
              </h3>

              {contactSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-bold">
                  {contactSuccess}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder={t.contactFieldName}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder={t.contactFieldPhone}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <textarea
                    required
                    rows="3"
                    placeholder={t.contactFieldMsg}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-md transition-colors"
                >
                  {isSubmittingContact ? t.contactSubmitting : t.contactSubmitBtn}
                </button>
              </form>
            </div>

            {/* Google Map Pointer Integration */}
            <div className="rounded-2xl overflow-hidden border border-teal-50 shadow-sm lg:col-span-1 h-[320px] bg-slate-100 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.128795551939!2d90.3888636154316!3d23.751688594247547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8a5369c0d4f%3A0xe5a363a032dfa9a3!2sPanthapath%20Signal!5e0!3m2!1sen!2sbd!4v1655000000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
