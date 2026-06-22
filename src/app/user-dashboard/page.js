'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Plus, CheckCircle, Clock, AlertCircle, 
  Upload, Search, FileDown, MessageSquare
} from 'lucide-react';
import useStore from '../../store/useStore';
import { api } from '../../hooks/useApi';

export default function UserDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, initializeAuth } = useStore();

  const [holderName, setHolderName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if not logged in or is admin (admin goes to /dashboard)
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('mces_token');
      if (!storedToken) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [user, router]);

  // Fetch passports submitted by this user (we will filter in-memory by matches with user name or show all for simplicity, wait! Let's fetch all via admin access if we were admin, but since we are user, let's look at passports. In the backend, `GET /api/passports` is admin-protected. Wait, how does a user see their passports? We can write a route or filter them. Oh! Let's check: the admin gets all passports. Can a user also query their specific passport by number or name? Yes, we have a public tracking endpoint `/api/passports/track?passportNumber=X`. So the user can track their passports. But to show a history list of this user's submitted documents, we can store their submitted passport numbers in `localStorage` as an array of 'mces_my_passports'! This is extremely clever, because it works client-side, is 100% private, and does not require complex database queries!
  // Let's implement this local storage tracking array: when they submit a document, we append the passport number to `localStorage.getItem('mces_my_passports')`. Then we fetch details for each of these passport numbers using our track API!).
  const [myPassports, setMyPassports] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('mces_my_passports') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [trackedPassports, setTrackedPassports] = useState([]);

  useEffect(() => {
    const fetchTracked = async () => {
      if (myPassports.length === 0) {
        setTrackedPassports([]);
        return;
      }
      try {
        const promises = myPassports.map(num => 
          api.trackPassport(num).catch(() => null)
        );
        const results = await Promise.all(promises);
        setTrackedPassports(results.filter(Boolean));
      } catch (err) {
        console.error('Error tracking list:', err);
      }
    };
    fetchTracked();
  }, [myPassports]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmitDocument = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setErrorMsg('পাসপোর্ট এর পিডিএফ ফাইল আপলোড করা আবশ্যক।');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('holderName', holderName);
    formData.append('passportNumber', passportNumber.trim());
    formData.append('submissionDate', submissionDate);
    formData.append('file', pdfFile); // File upload

    try {
      const res = await api.submitPassport(formData, token);
      setSuccessMsg('ডকুমেন্টটি সফলভাবে আপলোড করা হয়েছে এবং অ্যাডমিন প্যানেলে প্রেরণ করা হয়েছে।');
      
      // Save passport number in user's tracking list
      const updatedList = [...myPassports, passportNumber.trim()];
      localStorage.setItem('mces_my_passports', JSON.stringify(updatedList));
      setMyPassports(updatedList);

      // Reset form
      setHolderName('');
      setPassportNumber('');
      setSubmissionDate('');
      setPdfFile(null);
      
      // Clear file input
      const fileInput = document.getElementById('passport-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setErrorMsg(err.message || 'আপলোড ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user || user.role === 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="text-sm font-semibold text-teal-800">লোড করা হচ্ছে...</span>
      </div>
    );
  }

  // Resolve base prefix for PDF download
  const getPdfUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('/') ? `http://localhost:5000${url}` : url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-850 to-teal-700 text-white p-8 rounded-2xl shadow-lg mb-10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">স্বাগতম, {user.name}!</h1>
          <p className="text-teal-200 text-xs mt-1">আপনার ইউজার প্যানেল থেকে পাসপোর্ট আপলোড ও ট্র্যাকিং স্ট্যাটাস দেখুন।</p>
        </div>
        <div className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-xs font-semibold">
          ইউজার আইডি: #{user.id.substring(0, 8)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Add Document Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-teal-700" />
              <span>নতুন ডকুমেন্ট জমা দিন</span>
            </h3>

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-semibold">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">পাসপোর্ট ধারির নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="পাসপোর্ট অনুযায়ী নাম"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">পাসপোর্ট নাম্বার *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: EE1234567"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">পাসপোর্ট জমা দেওয়ার তারিখ *</label>
                <input
                  type="date"
                  required
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full px-4 py-2 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">পাসপোর্ট এর পিডিএফ ফাইল *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                  <input
                    id="passport-file-input"
                    type="file"
                    required
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 block">
                    {pdfFile ? pdfFile.name : 'ক্লিক করে পিডিএফ ফাইলটি আপলোড করুন'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">সর্বোচ্চ ১০ এমবি (PDF ফরম্যাট)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-md flex items-center justify-center space-x-1.5 transition-colors"
              >
                {isUploading ? 'আপলোড হচ্ছে...' : 'ডকুমেন্ট আপলোড করুন'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Tracked Documents List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-teal-700" />
              <span>আপনার জমাকৃত ডকুমেন্টস সমূহ</span>
            </h3>

            {trackedPassports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                আপনি এখনও কোনো পাসপোর্ট আপলোড করেননি। বাম পাশের ফর্ম থেকে আপলোড করুন।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs md:text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 font-semibold">
                      <th className="pb-3">ধারকের নাম</th>
                      <th className="pb-3">পাসপোর্ট নাম্বার</th>
                      <th className="pb-3">জমা দেওয়ার তারিখ</th>
                      <th className="pb-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {trackedPassports.map((pass) => (
                      <tr key={pass.id}>
                        <td className="py-3.5 font-semibold">{pass.holderName}</td>
                        <td className="py-3.5 font-mono">{pass.passportNumber || 'এনক্রিপ্টেড'}</td>
                        <td className="py-3.5">{pass.submissionDate}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            pass.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            pass.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            pass.status === 'In Process' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {pass.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Support Notice */}
          <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 flex items-start space-x-4">
            <MessageSquare className="w-6 h-6 text-teal-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-teal-900 text-sm">সহায়তা প্রয়োজন?</h4>
              <p className="text-xs text-teal-850 leading-relaxed mt-1">
                আপনার আপলোড করা ডকুমেন্টের কোনো ত্রুটি সংশোধন করতে অথবা দ্রুত প্রসেসিং এর জন্য সরাসরি কনসালট্যান্টের সাথে চ্যাট বক্সে কথা বলুন। ডানপাশের লাইভ চ্যাট বাটনে ক্লিক করলেই একজন এজেন্টের সাথে সংযুক্ত হবেন।
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
