import { apiFetch } from './client'

export const GalaxyApi = {
  get: () => apiFetch('/galaxy'),
  updateSettings: (selfColor, selfSign) =>
    apiFetch('/galaxy/settings', { method: 'PUT', body: { selfColor, selfSign } }),
  addBody: (body) => apiFetch('/galaxy/bodies', { method: 'POST', body }),
  patchBody: (id, patch) => apiFetch(`/galaxy/bodies/${id}`, { method: 'PATCH', body: patch }),
  deleteBody: (id) => apiFetch(`/galaxy/bodies/${id}`, { method: 'DELETE' }),
}
