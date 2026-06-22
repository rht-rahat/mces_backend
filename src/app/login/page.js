'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/navigation';
import { Globe, Mail, Lock, User, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { API_BASE } from '../../hooks/useApi';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, user } = useStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setTimeout(() => {
        setActiveTab('register');
      }, 0);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/user-dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const isLogin = activeTab === 'login';
    const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'আবেদনটি সম্পন্ন করা যায়নি।');
      }

      setAuth(data.user, data.token);
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/user-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'নেটওয়ার্ক কানেকশন চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white p-8 md:p-10 rounded-2xl curvy-card border border-teal-50 shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-teal-50 text-teal-700 rounded-tr-2xl rounded-bl-2xl shadow-sm mb-4">
            <Globe className="w-8 h-8 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">MCES গ্লোবাল প্যানেল</h2>
          <p className="text-xs text-slate-400 mt-1">আপনার অ্যাকাউন্ট লগইন অথবা নতুন রেজিস্টার করুন।</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'login' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            লগইন
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            রেজিস্টার
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার নাম *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="সম্পূর্ণ নাম লিখুন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ইমেইল এড্রেস *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">পাসওয়ার্ড *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md flex items-center justify-center space-x-1 transition-colors"
          >
            <span>{isLoading ? 'প্রসেসিং হচ্ছে...' : activeTab === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-slate-400">
          <p>অ্যাডমিন প্যানেল এক্সেস করতে ইমেইল: <span className="font-bold text-slate-600">admin@mces.com</span> পাসওয়ার্ড: <span className="font-bold text-slate-600">admin</span> দিন।</p>
        </div>

      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="text-sm font-semibold text-teal-800">লোডিং হচ্ছে...</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
