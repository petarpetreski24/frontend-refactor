export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePhotoUrl?: string;
  locationCity?: string;
  locationLat?: number;
  locationLng?: number;
  role: string;
  isActive: boolean;
  emailConfirmed: boolean;
  avgRatingAsOrganizer?: number;
  avgRatingAsParticipant?: number;
  favoriteSports: UserFavoriteSport[];
  createdAt: string;
}

export interface UserPublic {
  id: number;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePhotoUrl?: string;
  locationCity?: string;
  avgRatingAsOrganizer?: number;
  avgRatingAsParticipant?: number;
  favoriteSports: UserFavoriteSport[];
  totalEventsParticipated: number;
  totalEventsOrganized: number;
}

export interface UserFavoriteSport {
  id: number;
  sportId: number;
  sportName: string;
  sportIcon?: string;
  skillLevel: string;
}

export interface Sport {
  id: number;
  name: string;
  icon?: string;
  isActive: boolean;
}

export interface SportEvent {
  id: number;
  organizerId: number;
  organizerName: string;
  organizerPhotoUrl?: string;
  organizerRating?: number;
  sportId: number;
  sportName: string;
  sportIcon?: string;
  title: string;
  description: string;
  eventDate: string;
  durationMinutes: number;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  maxParticipants: number;
  currentParticipants: number;
  minSkillLevel?: string;
  status: string;
  avgRating?: number;
  createdAt: string;
}

export interface EventApplication {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  userPhotoUrl?: string;
  userAvgRating?: number;
  userSkillLevel?: string;
  status: string;
  appliedAt: string;
  resolvedAt?: string;
}

export interface EventComment {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  userPhotoUrl?: string;
  content: string;
  createdAt: string;
}

export interface EventRating {
  id: number;
  eventId: number;
  reviewerId: number;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ParticipantRating {
  id: number;
  eventId: number;
  raterId: number;
  raterName: string;
  participantId: number;
  participantName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RatableParticipant {
  userId: number;
  userName: string;
  userPhotoUrl?: string;
  avgRating?: number;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  referenceEventId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  emailOnApplication: boolean;
  emailOnApproval: boolean;
  emailOnEventUpdate: boolean;
  emailOnEventReminder: boolean;
  emailOnNewComment: boolean;
}

export interface DashboardData {
  upcomingEvents: SportEvent[];
  suggestedEvents: SportEvent[];
  pendingApplications: PendingApplication[];
  stats: DashboardStats;
  recentNotifications: Notification[];
}

export interface DashboardStats {
  totalEventsParticipated: number;
  totalEventsOrganized: number;
  avgRating?: number;
}

export interface PendingApplication {
  applicationId: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  userPhotoUrl?: string;
  userAvgRating?: number;
  appliedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface EventSearchParams {
  keyword?: string;
  sportIds?: number[];
  dateFrom?: string;
  dateTo?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  availableOnly?: boolean;
  minSkillLevel?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface EventSearchResponse {
  items: SportEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalSports: number;
  activeEvents: number;
  totalComments: number;
  totalRatings: number;
  newUsersThisMonth: number;
  newEventsThisMonth: number;
  topSports: { sportName: string; count: number }[];
}

export interface AdminUser extends User {
  totalEventsParticipated: number;
  totalEventsOrganized: number;
  eventsOrganized: number;
  eventsParticipated: number;
}

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
export const SKILL_LEVEL_LABELS: Record<string, string> = {
  Beginner: 'Почетник',
  Intermediate: 'Средно напредно',
  Advanced: 'Напредно',
  Professional: 'Професионално',
};
export const EVENT_STATUS_LABELS: Record<string, string> = {
  Open: 'Отворен',
  Full: 'Полн',
  InProgress: 'Во тек',
  Completed: 'Завршен',
  Cancelled: 'Откажан',
};
