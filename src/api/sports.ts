import api from './axios';
import { Sport } from '../types';

export const getAll = (includeInactive = false) =>
  api.get<Sport[]>(`/api/sports?includeInactive=${includeInactive}`);

export const create = (data: { name: string; icon?: string }) =>
  api.post<Sport>('/api/sports', data);

export const update = (id: number, data: { name: string; icon?: string; isActive?: boolean }) =>
  api.put<Sport>(`/api/sports/${id}`, data);
