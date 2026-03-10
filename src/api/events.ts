import api from './axios';
import { SportEvent, EventSearchParams, EventSearchResponse } from '../types';

export const create = (data: {
  sportId: number; title: string; description: string; eventDate: string;
  durationMinutes: number; locationAddress: string; locationLat: number;
  locationLng: number; maxParticipants: number; minSkillLevel?: string;
}) => api.post<SportEvent>('/api/events', data);

export const getById = (id: number) => api.get<SportEvent>(`/api/events/${id}`);

export const update = (id: number, data: {
  sportId: number; title: string; description: string; eventDate: string;
  durationMinutes: number; locationAddress: string; locationLat: number;
  locationLng: number; maxParticipants: number; minSkillLevel?: string;
}) => api.put<SportEvent>(`/api/events/${id}`, data);

export const cancel = (id: number) => api.post(`/api/events/${id}/cancel`);

export const search = (params: EventSearchParams) => {
  const query = new URLSearchParams();
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.sportIds?.length) params.sportIds.forEach(id => query.append('sportIds', id.toString()));
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.lat !== undefined) query.set('lat', params.lat.toString());
  if (params.lng !== undefined) query.set('lng', params.lng.toString());
  if (params.radiusKm) query.set('radiusKm', params.radiusKm.toString());
  if (params.availableOnly) query.set('availableOnly', 'true');
  if (params.minSkillLevel) query.set('minSkillLevel', params.minSkillLevel);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  query.set('page', (params.page || 1).toString());
  query.set('pageSize', (params.pageSize || 12).toString());
  return api.get<EventSearchResponse>(`/api/events/search?${query.toString()}`);
};

export const getMyEvents = (status?: string) =>
  api.get<SportEvent[]>(`/api/events/my${status ? `?status=${status}` : ''}`);

export const getMyOrganized = () =>
  api.get<SportEvent[]>('/api/events/my?type=organized');

export const getMyParticipating = () =>
  api.get<SportEvent[]>('/api/events/my?type=participating');
