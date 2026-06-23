import api from './axios';
import { AxiosResponse } from 'axios';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const authApi = {
  register: (data: RegisterPayload): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),
  login: (data: LoginPayload): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  logout: (): Promise<AxiosResponse> => api.post('/auth/logout'),
  me: (): Promise<AxiosResponse<{ success: boolean; data: User }>> => api.get('/auth/me'),
};

export default authApi;