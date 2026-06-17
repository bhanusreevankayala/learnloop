import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Classes
export const classAPI = {
  create: (data) => api.post('/classes', data),
  getAll: () => api.get('/classes'),
  get: (id) => api.get(`/classes/${id}`),
  update: (id, data) => api.put(`/classes/${id}`, data),
  join: (joinCode) => api.post('/classes/join', { joinCode }),
  removeStudent: (classId, studentId) => api.delete(`/classes/${classId}/students/${studentId}`),
  delete: (id) => api.delete(`/classes/${id}`),
};

// Quizzes
export const quizAPI = {
  create: (data) => api.post('/quizzes', data),
  getAll: (params) => api.get('/quizzes', { params }),
  get: (id) => api.get(`/quizzes/${id}`),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  publish: (id) => api.put(`/quizzes/${id}/publish`),
  close: (id) => api.put(`/quizzes/${id}/close`),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

// Submissions
export const submissionAPI = {
  submit: (data) => api.post('/submissions', data),
  getMy: (params) => api.get('/submissions/my', { params }),
  get: (id) => api.get(`/submissions/${id}`),
  getByQuiz: (quizId) => api.get(`/submissions/quiz/${quizId}`),
  getByClass: (classId) => api.get(`/submissions/class/${classId}`),
};

// Materials
export const materialAPI = {
  create: (data) => api.post('/materials', data),
  getAll: (params) => api.get('/materials', { params }),
  get: (id) => api.get(`/materials/${id}`),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  sendAnnouncement: (data) => api.post('/notifications/announce', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Analytics
export const analyticsAPI = {
  getStudentAnalytics: () => api.get('/analytics/student/me'),
  getStudentAnalyticsById: (id) => api.get(`/analytics/student/${id}`),
  getClassAnalytics: (classId) => api.get(`/analytics/class/${classId}`),
  getSchoolAnalytics: () => api.get('/analytics/school'),
};

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getClasses: () => api.get('/admin/classes'),
  getStats: () => api.get('/admin/stats'),
};