import { apiFetch } from './client'

export const AuthApi = {
  register: (email, password, confirmPassword, displayName) =>
    apiFetch('/auth/register', { method: 'POST', body: { email, password, confirmPassword, displayName } }),
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),
  updateProfile: (gender, birthdate) => apiFetch('/auth/me', { method: 'PATCH', body: { gender, birthdate } }),
}
