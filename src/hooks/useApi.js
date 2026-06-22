export const API_BASE = 'http://localhost:5000/api';

// Helper to construct authorization header
const getHeaders = (token) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// General fetch wrapper with JSON parse & error check
const apiCall = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Banners
  getSliders: () => apiCall(`${API_BASE}/sliders`),
  addSlider: (formData, token) => apiCall(`${API_BASE}/sliders`, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData
  }),
  updateSlider: (id, formData, token) => apiCall(`${API_BASE}/sliders/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: formData
  }),
  deleteSlider: (id, token) => apiCall(`${API_BASE}/sliders/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Tour Packages
  getPackages: () => apiCall(`${API_BASE}/packages`),
  getPackage: (id) => apiCall(`${API_BASE}/packages/${id}`),
  addPackage: (formData, token) => apiCall(`${API_BASE}/packages`, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData
  }),
  updatePackage: (id, formData, token) => apiCall(`${API_BASE}/packages/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: formData
  }),
  deletePackage: (id, token) => apiCall(`${API_BASE}/packages/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Job Circulars
  getCirculars: (params = {}) => {
    const url = new URL(`${API_BASE}/circulars`);
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    return apiCall(url.toString());
  },
  getCircular: (id) => apiCall(`${API_BASE}/circulars/${id}`),
  addCircular: (formData, token) => apiCall(`${API_BASE}/circulars`, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData
  }),
  updateCircular: (id, formData, token) => apiCall(`${API_BASE}/circulars/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: formData
  }),
  deleteCircular: (id, token) => apiCall(`${API_BASE}/circulars/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Reviews
  getReviews: () => apiCall(`${API_BASE}/reviews`),
  addReview: (formData, token) => apiCall(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData
  }),
  deleteReview: (id, token) => apiCall(`${API_BASE}/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Blogs
  getBlogs: () => apiCall(`${API_BASE}/blogs`),
  getBlog: (id) => apiCall(`${API_BASE}/blogs/${id}`),
  addBlog: (formData, token) => apiCall(`${API_BASE}/blogs`, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData
  }),
  deleteBlog: (id, token) => apiCall(`${API_BASE}/blogs/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Gallery
  getGallery: () => apiCall(`${API_BASE}/gallery`),
  addGallery: (formData, token) => apiCall(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData
  }),
  deleteGallery: (id, token) => apiCall(`${API_BASE}/gallery/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Passports & Tracking
  submitPassport: (formData, token) => apiCall(`${API_BASE}/passports`, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData
  }),
  getPassports: (search = '', token) => {
    const url = search ? `${API_BASE}/passports?search=${encodeURIComponent(search)}` : `${API_BASE}/passports`;
    return apiCall(url, { headers: getHeaders(token) });
  },
  trackPassport: (passportNumber) => 
    apiCall(`${API_BASE}/passports/track?passportNumber=${encodeURIComponent(passportNumber)}`),
  updatePassportStatus: (id, status, token) => apiCall(`${API_BASE}/passports/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getHeaders(token)
    },
    body: JSON.stringify({ status })
  }),
  deletePassport: (id, token) => apiCall(`${API_BASE}/passports/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Contact Form & Appointment Booking
  submitContact: (data) => apiCall(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getAppointments: (token) => apiCall(`${API_BASE}/contact?type=appointment`, {
    headers: getHeaders(token)
  }),
  updateAppointmentStatus: (id, status, token) => apiCall(`${API_BASE}/contact/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getHeaders(token)
    },
    body: JSON.stringify({ status })
  }),

  // Notifications (Admin Only)
  getNotifications: (token) => apiCall(`${API_BASE}/notifications`, {
    headers: getHeaders(token)
  }),
  markNotificationRead: (id, token) => apiCall(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders(token)
  }),
  clearNotifications: (token) => apiCall(`${API_BASE}/notifications/clear`, {
    method: 'DELETE',
    headers: getHeaders(token)
  }),

  // Chat Support
  getChatThreads: (token) => apiCall(`${API_BASE}/messages/threads`, {
    headers: getHeaders(token)
  }),
  getChatHistory: (userId) => apiCall(`${API_BASE}/messages/history/${userId}`),
  sendUserMessage: (data) => apiCall(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  sendAdminReply: (data, token) => apiCall(`${API_BASE}/messages/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getHeaders(token)
    },
    body: JSON.stringify(data)
  })
};