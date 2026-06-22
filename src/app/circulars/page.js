"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  MapPin,
  Globe,
  Users,
  ArrowLeft,
  Filter,
  BookOpen,
} from "lucide-react";
import { api } from "../../hooks/useApi";
import useStore from "../../store/useStore";
import { translations } from "../../utils/translations";

function CircularsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { language } = useStore();
  const t = translations[language] || translations["bn"];

  // Filters state
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [jobCategory, setJobCategory] = useState(
    searchParams.get("category") || "",
  );
  const [selectedCirc, setSelectedCirc] = useState(null); // Detail view

  // Fetch circulars with filters
  const { data: circulars = [], isLoading } = useQuery({
    queryKey: ["circulars", country, jobCategory],
    queryFn: () => api.getCirculars({ country, jobCategory }),
  });

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("/") ? `http://localhost:5000${url}` : url;
  };

  const countries = [
    "Australia",
    "Bahamas",
    "Belarus",
    "Denmark",
    "Dubai (UAE)",
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
  ].sort();

  const categories = [
    "Construction",
    "Caregiver",
    "Car Wash",
    "Driving",
    "Hospitality",
    "IT/Engineering",
  ].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Detail Modal / Overlay View */}
      {selectedCirc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedCirc(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 rotate-90" />
            </button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={getImageUrl(selectedCirc.imageUrl)}
                alt={selectedCirc.title}
                className="w-full md:w-56 h-40 object-cover rounded-xl bg-slate-100"
              />
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-md">
                    {selectedCirc.country}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {selectedCirc.jobCategory}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedCirc.title}
                </h2>
                <p className="text-teal-850 text-xs md:text-sm font-extrabold bg-teal-50/50 py-1.5 px-3 rounded-lg w-fit">
                  {language === 'bn' ? 'বেতন পরিসীমা:' : 'Salary Range:'} {selectedCirc.salaryRange}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>{t.requirementsTitle}</span>
              </h3>
              <ul className="space-y-2.5 text-slate-650 text-xs md:text-sm list-disc pl-5">
                {selectedCirc.requirements?.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedCirc(null)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl"
              >
                {t.closeBtn}
              </button>
              <Link
                href="/#appointment-form"
                onClick={() => setSelectedCirc(null)}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-sm"
              >
                {t.applyBtn}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
          {t.circsPanelTitle}
        </h1>
        <div className="h-1 w-24 bg-teal-700 mx-auto mt-4 rounded-full" />
        <p className="text-slate-500 mt-4 text-xs md:text-sm">
          {t.circsPanelSubtitle}
        </p>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-700 text-sm font-semibold mb-2 md:mb-0">
          <Filter className="w-5 h-5 text-teal-700" />
          <span>{t.circsFilterHeader}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Country Filter */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-teal-700 bg-white min-w-[200px]"
          >
            <option value="">{t.circsCountryFilter}</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={jobCategory}
            onChange={(e) => setJobCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-teal-700 bg-white min-w-[200px]"
          >
            <option value="">{t.circsCategoryFilter}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="text-sm font-semibold text-teal-800 animate-pulse">
            {t.circsLoading}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {circulars.map((circ) => (
            <div
              key={circ._id || circ.id}
              className="bg-white rounded-2xl overflow-hidden border border-teal-50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="relative h-44 w-full bg-slate-100">
                <img
                  src={getImageUrl(circ.imageUrl)}
                  alt={circ.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-teal-700 text-white text-[10px] font-bold rounded-full">
                  {circ.country}
                </span>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                    {language === 'bn' ? 'ক্যাটাগরি:' : 'Category:'} {circ.jobCategory}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 leading-snug">
                    {circ.title}
                  </h3>
                  <p className="text-teal-850 font-extrabold text-xs mt-3 bg-teal-50/50 py-1.5 px-3 rounded-lg w-fit">
                    {language === 'bn' ? 'বেতন:' : 'Salary:'} {circ.salaryRange}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCirc(circ)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 focus:outline-none"
                  >
                    {t.circsReqs}
                  </button>
                  <Link
                    href="/#appointment-form"
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm"
                  >
                    {t.circsApplyBtn}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {circulars.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-400 text-xs md:text-sm bg-white border border-teal-50 rounded-2xl">
              {t.circsNoCircs}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Circulars() {
  const { language } = useStore();
  const t = translations[language] || translations["bn"];

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <span className="text-sm font-semibold text-teal-800">
            {t.circsLoading}
          </span>
        </div>
      }
    >
      <CircularsContent />
    </Suspense>
  );
}
