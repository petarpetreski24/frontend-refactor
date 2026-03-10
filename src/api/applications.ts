import api from './axios';
import { EventApplication } from '../types';

export const apply = (eventId: number) =>
  api.post<EventApplication>(`/api/events/${eventId}/applications`);

export const getEventApplications = (eventId: number) =>
  api.get<EventApplication[]>(`/api/events/${eventId}/applications`);

export const getMyApplication = (eventId: number) =>
  api.get<EventApplication | null>(`/api/events/${eventId}/applications/my`);

export const approve = (eventId: number, applicationId: number) =>
  api.post<EventApplication>(`/api/events/${eventId}/applications/${applicationId}/approve`);

export const reject = (eventId: number, applicationId: number) =>
  api.post<EventApplication>(`/api/events/${eventId}/applications/${applicationId}/reject`);

export const cancelApplication = (eventId: number, applicationId: number) =>
  api.post(`/api/events/${eventId}/applications/${applicationId}/cancel`);

export const removeParticipant = (eventId: number, userId: number, reason?: string) =>
  api.delete(`/api/events/${eventId}/applications/participants/${userId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
