'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Menu, X, User, LogOut, FileText, Bell } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../utils/translations';
import Image from 'next/image';

export default function Navbar() {
  const { user, logout, initializeAuth, unreadCount, language, setLanguage } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const t = translations[language] || translations['bn'];

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Don't show public navbar on admin dashboard pages to keep admin UI clean
  if (pathname?.startsWith('/dashboard') && user?.role === 'admin') {
    return null;
  }

  const navItems = [
    { name: t.navHome, path: '/' },
    { name: t.navCirculars, path: '/circulars' },
    { name: t.navPackages, path: '/#tour-packages' },
    { name: t.navTracking, path: '/#passport-track' },
    { name: t.navBlog, path: '/#blogs' },
    { name: t.navGallery, path: '/gallery' },
    { name: t.navContact, path: '/#contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-teal-50 shadow-sm" id="main_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-teal-700 text-white rounded-tr-xl rounded-bl-xl shadow-md">
                <Image width={40} height={40} src="/logo.jpeg" alt="MCES Logo" className='rounded' />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-800 to-emerald-600 bg-clip-text text-transparent">
                MCES TRAVEL
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-5 items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-teal-700 ${
                  pathname === item.path ? 'text-teal-800 font-semibold border-b-2 border-teal-700 pb-1' : 'text-slate-600'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Language Toggle Button */}
            <div className="border-l border-slate-250 h-5 pl-4 flex items-center">
              <button
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                id="language_toggle_btn"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-teal-200 text-teal-800 hover:bg-teal-50 hover:text-teal-900 transition-colors bg-teal-50/45 cursor-pointer shadow-xs"
                title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
              </button>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4 pl-2">
                {user.role === 'admin' ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-1 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm"
                  >
                    <span>{t.navAdminPanel}</span>
                    {unreadCount > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white font-bold animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link
                    href="/user-dashboard"
                    className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold curvy-button shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.navUserPanel}</span>
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.navLogout}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-teal-700 hover:bg-teal-50 border border-teal-200 text-xs font-semibold curvy-button"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/login?tab=register"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Switcher for Mobile */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              id="language_toggle_mobile_btn"
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full border border-teal-100 text-teal-800 bg-teal-50/50"
            >
              <Globe className="w-3 h-3 text-teal-600" />
              <span>{language === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 border-b border-teal-50 px-2 pt-2 pb-4 space-y-1 sm:px-3 shadow-lg" id="mobile_navbar_menu">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/50"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 pb-2 border-t border-slate-100 flex flex-col space-y-2 px-3">
            {user ? (
              <>
                <span className="text-sm font-semibold text-slate-600">{t.navWelcome}, {user.name}</span>
                {user.role === 'admin' ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center px-4 py-2.5 bg-teal-700 text-white rounded-md text-sm font-semibold"
                  >
                    {t.navAdminPanel}
                  </Link>
                ) : (
                  <Link
                    href="/user-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center px-4 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-semibold"
                  >
                    {t.navUserPanel}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    router.push('/');
                  }}
                  className="w-full text-center px-4 py-2.5 border border-red-200 text-red-600 rounded-md text-sm font-semibold cursor-pointer"
                >
                  {t.navLogout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 border border-teal-200 text-teal-700 rounded-md text-sm font-semibold"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/login?tab=register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-teal-700 text-white rounded-md text-sm font-semibold"
                >
                  {t.navRegister}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
