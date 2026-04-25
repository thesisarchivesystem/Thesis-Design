import api from './api';

type AuthRole = 'student' | 'faculty' | 'vpaa';

type ResetPasswordPayload = {
  identifier?: string;
  role?: AuthRole;
  password?: string;
  new_password?: string;
  newPassword?: string;
  password_confirmation?: string;
  confirm_password?: string;
  token?: string;
  [key: string]: unknown;
};

export const authService = {
  async login(identifier: string, password: string) {
    const { data } = await api.post('/auth/login', { identifier, password });
    return data;
  },

  async forgotPassword(identifier: string, role: AuthRole) {
    const { data } = await api.post('/auth/forgot-password', { identifier, role });
    return data;
  },

  async resetPassword(payloadOrIdentifier: ResetPasswordPayload | string, password?: string, role?: AuthRole) {
    const payload: ResetPasswordPayload =
      typeof payloadOrIdentifier === 'string'
        ? {
            identifier: payloadOrIdentifier,
            password,
            new_password: password,
            role,
          }
        : payloadOrIdentifier;

    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async getCurrentUser() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
