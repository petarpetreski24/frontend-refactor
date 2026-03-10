import api from './axios';
import { EventRating, ParticipantRating, RatableParticipant } from '../types';

export const rateEvent = (eventId: number, data: { rating: number; comment?: string }) =>
  api.post<EventRating>(`/api/events/${eventId}/ratings`, data);

export const getEventRatings = (eventId: number) =>
  api.get<EventRating[]>(`/api/events/${eventId}/ratings`);

export const rateParticipant = (eventId: number, data: { participantId: number; rating: number; comment?: string }) =>
  api.post<ParticipantRating>(`/api/events/${eventId}/ratings/participants`, data);

export const getParticipantRatings = (eventId: number) =>
  api.get<ParticipantRating[]>(`/api/events/${eventId}/ratings/participants`);

export const getRatableParticipants = (eventId: number) =>
  api.get<RatableParticipant[]>(`/api/events/${eventId}/ratings/ratable-participants`);
