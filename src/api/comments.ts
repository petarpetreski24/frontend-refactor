import api from './axios';
import { EventComment } from '../types';

export const getComments = (eventId: number) =>
  api.get<EventComment[]>(`/api/events/${eventId}/comments`);

export const createComment = (eventId: number, content: string) =>
  api.post<EventComment>(`/api/events/${eventId}/comments`, { content });

export const deleteComment = (eventId: number, commentId: number) =>
  api.delete(`/api/events/${eventId}/comments/${commentId}`);
