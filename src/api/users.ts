import api from './axios';
import { User, UserPublic, UserFavoriteSport } from '../types';

export const getProfile = () => api.get<User>('/api/users/me');

export const getPublicProfile = (id: number) => api.get<UserPublic>(`/api/users/${id}`);

export const updateProfile = (data: {
  firstName: string; lastName: string; phone?: string; bio?: string;
  locationCity?: string; locationLat?: number; locationLng?: number;
}) => api.put<User>('/api/users/me', data);

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put('/api/users/me/password', data);

export const uploadPhoto = (formData: FormData) =>
  api.post<{ profilePhotoUrl: string }>('/api/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getFavoriteSports = () => api.get<UserFavoriteSport[]>('/api/users/me/favorite-sports');

export const updateFavoriteSports = (favoriteSports: { sportId: number; skillLevel: string }[]) =>
  api.put('/api/users/me/favorite-sports', { favoriteSports });

export const addFavoriteSport = (sportId: number, skillLevel: string) =>
  api.post('/api/users/me/favorite-sports', { sportId, skillLevel });

export const removeFavoriteSport = (sportId: number) =>
  api.delete(`/api/users/me/favorite-sports/${sportId}`);
