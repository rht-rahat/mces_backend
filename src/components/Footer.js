'use client';

import Link from "next/link";
import { Globe, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import useStore from "../store/useStore";
import { translations } from "../utils/translations";
import { usePathname } from "next/navigation";

export default function Footer() {
  const { language } = useStore();
  const t = translations[language] || translations["bn"];
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Tagline */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-1 bg-teal-600 text-white rounded-tr-lg rounded-bl-lg">
                {/* <Globe className="w-5 h-5" /> */}
                <Image
                  src="/logo.jpeg"
                  alt=""
                  width={60}
                  height={60}
                  // className="w-10 h-10"
                />
              </div>
              <span className=" font-bold text-white">MCES INTERNATIONAL OVERSEAS TRAVEL AGENCY</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.footerBrandDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footerQuickLinks}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/circulars"
                  className="hover:text-teal-400 transition-colors"
                >
                  {t.navCirculars}
                </Link>
              </li>
              <li>
                <Link
                  href="/#tour-packages"
                  className="hover:text-teal-400 transition-colors"
                >
                  {t.navPackages}
                </Link>
              </li>
              <li>
                <Link
                  href="/#passport-track"
                  className="hover:text-teal-400 transition-colors"
                >
                  {t.navTracking}
                </Link>
              </li>
              <li>
                <Link
                  href="/#blogs"
                  className="hover:text-teal-400 transition-colors"
                >
                  {t.navBlog}
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-teal-400 transition-colors"
                >
                  {t.navGallery}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footerServices}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>{language === 'bn' ? "ভিসা প্রসেসিং সেবা" : "Visa Processing Services"}</li>
              <li>{language === 'bn' ? "পড়াশোনার জন্য বিদেশে ভর্তি" : "Study Admissions Abroad"}</li>
              <li>{language === 'bn' ? "পাসপোর্ট ম্যানেজমেন্ট" : "Passport Management"}</li>
              <li>{language === 'bn' ? "লাইভ কনসালট্যান্ট সাপোর্ট" : "Live Consultant Helpline"}</li>
            </ul>
          </div>

          {/* Office details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footerOfficeDetails}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span>
                  {t.footerOfficeAddress}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span>+৮৮০১৭৮৯-৬৫০৯৬৯</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span>info@mcesbd.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{t.footerWhatsApp} +৮৮০১৭৮৯-৬৫০৯৬৯</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MCES Global. {t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
