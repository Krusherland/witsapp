import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/client'
import AuthConstellation from '../assets/AuthConstellation'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setError('Password must contain at least one letter and one number')
      return
    }
    try {
      await register(email.trim(), password, confirmPassword, displayName.trim())
      navigate('/onboarding')
    } catch (err) {
      const detail = err instanceof ApiError && err.fieldErrors ? Object.values(err.fieldErrors)[0] : null
      setError(detail || (err instanceof ApiError ? err.message : 'Registration failed'))
    }
  }

  return (
    <AuthConstellation characterCount={displayName.length + email.length + password.length + confirmPassword.length}>
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Create your galaxy</h2>
        {error && <span className="error-text">{error}</span>}
        <input placeholder="Nickname (min 3 chars)" minLength={3} maxLength={60} value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 8 chars, letter + number)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit">Register</button>
        <span>Already have an account? <Link to="/login">Log in</Link></span>
      </form>
    </AuthConstellation>
  )
}
