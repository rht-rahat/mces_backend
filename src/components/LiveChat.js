'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, PhoneCall } from 'lucide-react';
import { api, API_BASE } from '../hooks/useApi';
import { usePathname } from 'next/navigation';

export default function LiveChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(() => {
    if (typeof window === 'undefined') return '';
    let storedId = localStorage.getItem('mces_chat_userId');
    if (!storedId) {
      storedId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      localStorage.setItem('mces_chat_userId', storedId);
    }
    return storedId;
  });
  const [senderName, setSenderName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('mces_chat_name') || '';
  });
  const [hasDetails, setHasDetails] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('mces_chat_name');
  });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  const WHATSAPP_NUMBER = '+8801789650969'; // MCES Support WhatsApp
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hello%20MCES%20Support!%20I%20have%20a%20query.`;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 2. Fetch Chat History and Establish SSE connection when chat is open and we have user details
  useEffect(() => {
    if (!isOpen || !userId || !hasDetails) return;

    // Fetch history
    api.getChatHistory(userId)
      .then(history => {
        setMessages(history);
        scrollToBottom();
      })
      .catch(err => console.error('Error loading chat history:', err));

    // Connect to SSE stream
    const sseUrl = `${API_BASE}/messages/stream/${userId}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message && message.sender) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === message.id || m._id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      } catch (e) {
        // Ping or parse failure
      }
    };

    eventSource.onerror = () => {
      console.error('Chat SSE connection error. Reconnecting...');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, userId, hasDetails]);

  // 3. Scroll to bottom on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartChat = (e) => {
    e.preventDefault();
    if (!senderName.trim()) return;
    
    localStorage.setItem('mces_chat_name', senderName);
    setHasDetails(true);
  };

  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!inputMessage.trim()) return;

  const payload = {
    senderName,
    userId,
    message: inputMessage
  };

  // অপটিমিস্টিক আপডেট: ব্যাকএন্ডে যাওয়ার আগেই ইউজারের স্ক্রিনে মেসেজটি দেখান
  const temporaryMsg = {
    ...payload,
    sender: 'user',
    id: 'temp_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  setMessages(prev => [...prev, temporaryMsg]);
  setInputMessage('');

  try {
    await api.sendUserMessage(payload);
    scrollToBottom();
  } catch (error) {
    console.error('Failed to send message:', error);
    // মেসেজ সেন্ড ফেল হলে লিস্ট থেকে অস্থায়ী মেসেজটি রিমুভ করতে পারেন
  }
};

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
      
      {/* Expanded Chat Bubble */}
      {isOpen && (
        <div className="w-[340px] md:w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl border border-teal-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <div>
                <h4 className="text-sm font-semibold">লাইভ চ্যাট সাপোর্ট</h4>
                <p className="text-[10px] text-teal-200">১ মিনিটেই ইনস্ট্যান্ট রেসপন্স</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-teal-700/50 rounded-full text-white/85 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col">
            {!hasDetails ? (
              // Name Intake Form
              <form onSubmit={handleStartChat} className="m-auto w-full max-w-[280px] space-y-4 text-center">
                <div className="p-3 bg-teal-50 rounded-full text-teal-700 w-fit mx-auto">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">চ্যাট শুরু করুন</h5>
                  <p className="text-xs text-slate-500 mt-1">আমাদের একজন পরামর্শকের সাথে সরাসরি কথা বলতে আপনার নামটি লিখুন।</p>
                </div>
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম লিখুন..."
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-600 bg-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
                >
                  চ্যাট কনফার্ম করুন
                </button>
              </form>
            ) : (
              // Message List
              <div className="space-y-3 flex-1">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 mt-8">
                    কোন মেসেজ নেই। নিচে আপনার প্রশ্নটি লিখে পাঠান।
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSelf = msg.sender === 'user';
                    return (
                      <div
                        key={msg._id || msg.id || index}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[9px] text-slate-400 mb-0.5 px-1">
                          {isSelf ? 'আপনি' : msg.senderName}
                        </span>
                        <div
                          className={`max-w-[75%] px-3.5 py-2 text-xs rounded-2xl shadow-sm ${
                            isSelf
                              ? 'bg-teal-700 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Footer Input */}
          {hasDetails && (
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                placeholder="মেসেজ লিখুন..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-teal-600"
              />
              <button
                type="submit"
                className="p-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors shadow-sm focus:outline-none"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

        </div>
      )}

      {/* Action Buttons: WhatsApp & Live Chat */}
      <div className="flex space-x-2">
        {/* WhatsApp Direct Link Button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
          title="হোয়াটসঅ্যাপে যোগাযোগ করুন"
        >
          <PhoneCall className="w-5 h-5" />
        </a>

        {/* Live Chat Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center ${
            isOpen ? 'rotate-90 bg-slate-800 hover:bg-slate-900' : ''
          }`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>
      </div>

    </div>
  );
}
