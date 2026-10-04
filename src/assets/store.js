import { create } from 'zustand'
import { GalaxyApi } from '../api/galaxy'
import { USER_COLORS } from './constants'
import { fromServerBody, toServerBodyPatch, toServerBodyRequest } from './mapServerBody'

// Body shape:
// { id, name, kind: 'self'|'family'|'friend'|'work'|'acquaintance',
//   role?: 'sun'|'moon'|'sibling'|..., relation: 'positive'|'negative'|'love'|'work',
//   sign, radius, color, texture?, angle, speed, position? (acquaintances) }
export const useGalaxy = create((set) => ({
  bodies: [],
  loading: false,
  error: null,
  selectedId: null,
  select: (id) => set({ selectedId: id }),

  // Fetches the signed-in user's galaxy and replaces the local sample data with it.
  loadGalaxy: async () => {
    set({ loading: true, error: null })
    try {
      const galaxy = await GalaxyApi.get()
      const me = {
        id: 'me',
        name: 'Me',
        kind: 'self',
        sign: galaxy.selfSign.toLowerCase(),
        radius: 1.3,
        color: USER_COLORS[galaxy.selfColor.toLowerCase()],
      }
      set({ bodies: [me, ...galaxy.bodies.map(fromServerBody)], loading: false })
    } catch {
      set({ error: 'Could not load your galaxy', loading: false })
    }
  },

  addBody: async (body) => {
    const created = await GalaxyApi.addBody(toServerBodyRequest(body))
    set((s) => ({ bodies: [...s.bodies, fromServerBody(created)] }))
  },

  updateBody: async (id, patch) => {
    set((s) => ({ bodies: s.bodies.map((b) => (b.id === id ? { ...b, ...patch } : b)) })) // optimistic
    if (id === 'me') return
    const updated = await GalaxyApi.patchBody(id, toServerBodyPatch(patch))
    set((s) => ({ bodies: s.bodies.map((b) => (b.id === id ? fromServerBody(updated) : b)) }))
  },

  deleteBody: async (id) => {
    await GalaxyApi.deleteBody(id)
    set((s) => ({ bodies: s.bodies.filter((b) => b.id !== id) }))
  },
}))
