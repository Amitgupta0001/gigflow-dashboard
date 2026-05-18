import api from './api';
import { ApiResponse, User } from '../types';

interface AuthData {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthData> {
    const res = await api.post<ApiResponse<AuthData>>('/api/auth/login', { email, password });
    return res.data.data;
  },

  async register(name: string, email: string, password: string, adminSecret?: string): Promise<AuthData> {
    const res = await api.post<ApiResponse<AuthData>>('/api/auth/register', {
      name,
      email,
      password,
      ...(adminSecret && { adminSecret }),
    });
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    return res.data.data.user;
  },
};
