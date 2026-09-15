import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle specific errors here
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  register: (userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }) => api.post('/auth/register', userData).then(res => res.data),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/me').then(res => res.data),
  updateProfile: (data: { bio?: string; avatarUrl?: string }) =>
    api.put('/users/me', data).then(res => res.data),
};

// Follow endpoints
export const followAPI = {
  follow: (userId: string) => api.post(`/follows/${userId}`).then(res => res.data),
  unfollow: (userId: string) => api.delete(`/follows/${userId}`).then(res => res.data),
  getFollowers: () => api.get('/follows/followers').then(res => res.data),
  getFollowing: () => api.get('/follows/following').then(res => res.data),
};

// Notification endpoints
export const notificationAPI = {
  getNotifications: () => api.get('/notifications').then(res => res.data),
  getUnreadCount: () => api.get('/notifications/unread-count').then(res => res.data),
  markAsRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`).then(res => res.data),
  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`).then(res => res.data),
  markAllAsRead: () => api.post('/notifications/read-all').then(res => res.data),
};

// Order endpoints (if needed)
export const orderAPI = {
  getMyOrders: () => api.get('/orders/mine').then(res => res.data),
  getSellerOrders: () => api.get('/orders/seller').then(res => res.data),
};

// Product endpoints
export const productAPI = {
  list: (params: { q?: string; categoryId?: string; page?: number; size?: number; sort?: string }) =>
    api.get('/products', { params }).then(res => res.data),
  get: (id: string) => api.get(`/products/${id}`).then(res => res.data),
};

// Combine all for convenience
export const apiClient = {
  auth: authAPI,
  user: userAPI,
  follow: followAPI,
  notification: notificationAPI,
  order: orderAPI,
  product: productAPI,
};

// For direct use in components, we can export individual functions
export const getProfile = userAPI.getProfile;
export const updateProfile = userAPI.updateProfile;
export const follow = followAPI.follow;
export const unfollow = followAPI.unfollow;
export const getFollowers = followAPI.getFollowers;
export const getFollowing = followAPI.getFollowing;
export const getNotifications = notificationAPI.getNotifications;
export const getUnreadCount = notificationAPI.getUnreadCount;
export const markNotificationAsRead = notificationAPI.markAsRead;
export const deleteNotification = notificationAPI.deleteNotification;
export const markAllNotificationsAsRead = notificationAPI.markAllAsRead;
export const listProducts = productAPI.list;
export const getProduct = productAPI.get;
export default api;
