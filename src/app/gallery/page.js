'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  X, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Tag,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translations';
import { api } from '../../hooks/useApi';

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

export default function GalleryPage() {
  const { user, language } = useStore();
  const t = translations[language] || translations['bn'];
  const isAdmin = user && user.role === 'admin';

  // State
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    let active = true;
    const initialLoad = async () => {
      try {
        const data = await api.getGallery();
        if (active) {
          if (data && data.length > 0) {
            setImages(data);
          } else {
            const localSaved = JSON.parse(localStorage.getItem('mces_local_gallery') || '[]');
            setImages([...localSaved, ...DEFAULT_GALLERY]);
          }
        }
      } catch (err) {
        if (active) {
          const localSaved = JSON.parse(localStorage.getItem('mces_local_gallery') || '[]');
          setImages([...localSaved, ...DEFAULT_GALLERY]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    initialLoad();
    return () => {
      active = false;
    };
  }, []);

  // Lightbox navigation
  const openLightbox = (img, index) => {
    setSelectedImage(img);
    setSelectedIndex(index);
  };

  const handlePrevImage = () => {
    if (selectedIndex > 0) {
      setSelectedImage(images[selectedIndex - 1]);
      setSelectedIndex(selectedIndex - 1);
    } else {
      setSelectedImage(images[images.length - 1]);
      setSelectedIndex(images.length - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedIndex < images.length - 1) {
      setSelectedImage(images[selectedIndex + 1]);
      setSelectedIndex(selectedIndex + 1);
    } else {
      setSelectedImage(images[0]);
      setSelectedIndex(0);
    }
  };

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-black text-slate-100 pb-24">
      {/* Decorative immersive top banner */}
      <div className="relative py-24 md:py-32 overflow-hidden border-b border-teal-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0f766e15,#00000000_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#0d948810,#00000000_40%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>{language === 'bn' ? 'ফটো আর্কাভ ও গ্যালারি' : 'Photo Archive & Gallery'}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-100">
              {language === 'bn' ? 'আমাদের সোনালী মুহূর্তগুলো' : 'Captured Success Stories'}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
          >
            {language === 'bn' 
              ? 'আমাদের গ্রাহক ও দক্ষ জনশক্তির বিদেশ যাত্রা, ট্রেনিং সেশন ও ভিসা সফলতার এক মনোরম চিত্রশালা।'
              : 'Witness the live moments of visa key handovers, departure briefings, and success milestones of our valuable clients.'}
          </motion.p>

          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <a 
                href="/dashboard"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-full text-xs font-black shadow-lg shadow-teal-900/30 transition-all hover:scale-105"
              >
                <span>{language === 'bn' ? 'ড্যাশবোর্ড এডিট করতে যান' : 'Go to Edit Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Grid display without any controls or filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/60 space-y-4 animate-pulse">
                <div className="aspect-video bg-slate-800 rounded-xl"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-800 rounded-md w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded-md w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/20 rounded-3xl border border-slate-800/80 space-y-4 max-w-xl mx-auto">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-400 text-sm">
              {language === 'bn' ? 'কোনো ছবি পাওয়া যায়নি।' : 'No photos available.'}
            </h3>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {images.map((img, index) => (
              <motion.div
                variants={itemVariants}
                key={img._id || img.id || index}
                onClick={() => openLightbox(img, index)}
                className="group relative bg-[#0d1520] rounded-3xl overflow-hidden border border-slate-800/55 shadow-xl transition-all cursor-pointer hover:border-teal-500/50 hover:shadow-teal-950/20 p-3.5 hover:-translate-y-1"
                whileHover={{ scale: 1.015 }}
              >
                {/* Visual Image container with elegant gradient blur borders */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950">
                  <img
                    src={img.imageUrl}
                    alt={language === 'bn' ? img.titleBn : img.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  
                  {/* Category overlay tab wrapper */}
                  <span className="absolute top-3.5 left-3.5 px-3 py-1 text-[10px] font-black tracking-widest rounded-lg bg-teal-950/90 border border-teal-800/30 text-teal-300 backdrop-blur-md flex items-center space-x-1.5 uppercase shadow-md">
                    <Tag className="w-2.5 h-2.5" />
                    <span>{language === 'bn' ? (img.categoryBn || img.category) : img.category}</span>
                  </span>

                  {/* Dark elegant mask with light zoom icon indicator */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-350 flex items-center justify-center">
                    <motion.div 
                      className="p-3 bg-teal-400/10 border border-teal-400/45 rounded-full text-teal-200 backdrop-blur-sm shadow-xl"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Maximize2 className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                {/* Info block */}
                <div className="mt-4 px-1 pb-1 space-y-1.5">
                  <h3 className="font-bold text-slate-200 text-sm md:text-base leading-snug group-hover:text-teal-300 transition-colors line-clamp-1">
                    {language === 'bn' ? (img.titleBn || img.title) : (img.title || img.titleBn)}
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium pb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span>{img.date || '2026-06-17'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Multi-feature full screen preview Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/98 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0" onClick={() => setSelectedImage(null)}></div>
            
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative max-w-6xl w-full bg-[#070b12] rounded-3xl overflow-hidden border border-slate-800/70 shadow-2xl z-110 flex flex-col md:flex-row max-h-[85vh] md:max-h-[80vh] md:aspect-16/9"
            >
              {/* Image viewport */}
              <div className="relative flex-1 bg-black flex items-center justify-center group overflow-hidden h-[50vh] md:h-auto">
                <img
                  src={selectedImage.imageUrl}
                  alt={language === 'bn' ? selectedImage.titleBn : selectedImage.title}
                  className="max-h-[50vh] md:max-h-[80vh] w-full h-full object-contain"
                />

                {/* Left Switch Trigger */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 p-3 bg-slate-900/70 hover:bg-teal-700/80 hover:text-white text-slate-300 rounded-full border border-slate-800/40 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Switch Trigger */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 p-3 bg-slate-900/70 hover:bg-teal-700/80 hover:text-white text-slate-300 rounded-full border border-slate-800/40 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Sidebar card detailing details */}
              <div className="w-full md:w-96 bg-[#090f19] p-6 md:p-8 text-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/85">
                <div className="space-y-5">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] font-black tracking-widest rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 uppercase">
                    <Tag className="w-3 h-3 text-teal-400" />
                    <span>{language === 'bn' ? (selectedImage.categoryBn || selectedImage.category) : selectedImage.category}</span>
                  </div>

                  <h2 className="text-lg md:text-xl font-extrabold tracking-tight leading-snug text-slate-100">
                    {language === 'bn' ? (selectedImage.titleBn || selectedImage.title) : (selectedImage.title || selectedImage.titleBn)}
                  </h2>

                  <div className="pt-2 flex items-center space-x-2 text-xs text-slate-400 font-medium">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{selectedImage.date || '2026-06-17'}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80 flex items-center">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-full py-3 bg-slate-900 hover:bg-teal-900 border border-slate-800 hover:border-teal-700 text-teal-300 hover:text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center uppercase tracking-wider"
                  >
                    {language === 'bn' ? 'ফিরে যান' : 'Close Slide'}
                  </button>
                </div>
              </div>

              {/* Close Button overlay */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-red-900/60 text-slate-300 hover:text-white rounded-full border border-slate-800/55 backdrop-blur-xs transition-colors cursor-pointer z-120"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
