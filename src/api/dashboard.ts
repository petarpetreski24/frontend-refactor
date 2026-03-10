import api from './axios';
import { DashboardData } from '../types';

export const getDashboard = () => api.get<DashboardData>('/api/dashboard');
