import api from './axios';
import { Notification, NotificationPreference } from '../types';

export const getNotifications = (page = 1, pageSize = 20) =>
  api.get<Notification[]>(`/api/notifications?page=${page}&pageSize=${pageSize}`);

export const getAll = () =>
  api.get<Notification[]>('/api/notifications');

export const getUnreadCount = () =>
  api.get<{ count: number }>('/api/notifications/unread-count');

export const markAsRead = (id: number) =>
  api.post(`/api/notifications/${id}/read`);

export const markAllAsRead = () =>
  api.post('/api/notifications/read-all');

export const deleteNotification = (id: number) =>
  api.delete(`/api/notifications/${id}`);

export const getPreferences = () =>
  api.get<NotificationPreference>('/api/notifications/preferences');

export const updatePreferences = (data: NotificationPreference) =>
  api.put('/api/notifications/preferences', data);
