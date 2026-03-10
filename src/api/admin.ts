import api from './axios';
import { AdminStats, AdminUser } from '../types';

export const getStats = () => api.get<AdminStats>('/api/admin/stats');

export const getUsers = (search?: string, role?: string, page = 1, pageSize = 20) => {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (role) query.set('role', role);
  query.set('page', page.toString());
  query.set('pageSize', pageSize.toString());
  return api.get<{ items: AdminUser[]; totalCount: number }>(`/api/admin/users?${query.toString()}`);
};

export const deactivateUser = (id: number) => api.post(`/api/admin/users/${id}/deactivate`);
export const deleteUser = (id: number) => api.delete(`/api/admin/users/${id}`);
export const deleteEvent = (id: number) => api.delete(`/api/admin/events/${id}`);
export const deleteComment = (id: number) => api.delete(`/api/admin/comments/${id}`);
