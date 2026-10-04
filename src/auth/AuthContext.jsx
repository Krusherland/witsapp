import { useEffect, useState } from 'react'
import { AuthApi } from '../api/auth'
import { AuthContext } from './authContextInstance'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AuthApi.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const loggedIn = await AuthApi.login(email, password)
    setUser(loggedIn)
    return loggedIn
  }

  async function register(email, password, confirmPassword, displayName) {
    const created = await AuthApi.register(email, password, confirmPassword, displayName)
    setUser(created)
    return created
  }

  async function logout() {
    await AuthApi.logout()
    setUser(null)
  }

  async function updateProfile(gender, birthdate) {
    const updated = await AuthApi.updateProfile(gender, birthdate)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
