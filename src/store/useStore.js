import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Language State (Multi-language: 'bn' or 'en')
  language: 'bn',
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mces_lang', language);
    }
    set({ language });
  },

  // Auth State
  user: null,
  token: null,
  isInitialized: false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('mces_token', token);
      } else {
        localStorage.removeItem('mces_token');
      }
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mces_token');
    }
    set({ user: null, token: null });
  },
  initializeAuth: async () => {
    // Load persisted language
    if (typeof window !== 'undefined') {
      const persistedLang = localStorage.getItem('mces_lang');
      if (persistedLang) {
        set({ language: persistedLang });
      }
    }

    if (get().isInitialized) return;
    set({ isInitialized: true });
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('mces_token');
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          set({ user, token });
        } else {
          localStorage.removeItem('mces_token');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    }
  },

  // Notification State
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },
  addNotification: (notification) => {
    set(state => {
      const exists = state.notifications.some(n => n.id === notification.id || n._id === notification.id);
      if (exists) return state; // Avoid duplicate appends
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    });
  },

  // Chat State
  threads: [],
  activeThread: null,
  messages: [],
  setThreads: (threads) => set({ threads }),
  setActiveThread: (activeThread) => set({ activeThread }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set(state => {
    // Avoid duplicates
    const exists = state.messages.some(m => m.id === message.id || m._id === message.id);
    if (exists) return state;
    
    // Update threads list in real-time as new messages arrive
    const updatedThreads = state.threads.map(thread => {
      if (thread.userId === message.userId) {
        return {
          ...thread,
          lastMessage: message.message,
          updatedAt: message.createdAt,
          senderName: message.sender === 'user' ? message.senderName : thread.senderName
        };
      }
      return thread;
    });

    // If this thread isn't in our active threads, add it
    const threadExists = state.threads.some(t => t.userId === message.userId);
    if (!threadExists && message.sender === 'user') {
      updatedThreads.unshift({
        userId: message.userId,
        senderName: message.senderName,
        lastMessage: message.message,
        updatedAt: message.createdAt
      });
    }

    return { 
      messages: [...state.messages, message],
      threads: updatedThreads
    };
  })
}));

export default useStore;
