import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthConstellation from '../assets/AuthConstellation'
import PlanetPreview from '../assets/PlanetPreview'
import { GENDER_COLORS, SIGN_COLORS, USER_COLORS } from '../assets/constants'
import { zodiacSignFromDate } from '../assets/zodiac'
import { GalaxyApi } from '../api/galaxy'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'nonbinary', label: 'Non-binary / other' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()
  const [gender, setGender] = useState('male')
  const [birthdate, setBirthdate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const sign = useMemo(() => zodiacSignFromDate(birthdate) ?? 'leo', [birthdate])
  const colorKey = GENDER_COLORS[gender]
  const planetColor = USER_COLORS[colorKey]
  const mistColor = SIGN_COLORS[sign]

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await updateProfile(gender.toUpperCase(), birthdate)
      await GalaxyApi.updateSettings(colorKey.toUpperCase(), sign.toUpperCase())
      navigate('/galaxy')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your galaxy')
    } finally {
      setBusy(false)
    }
  }


  return (
    <AuthConstellation characterCount={gender.length + birthdate.length}>
      <div className="onboarding-grid">
        <form className="auth-form onboarding-form" onSubmit={onSubmit}>
          <h2>Customize your planet</h2>
          {error && <span className="error-text">{error}</span>}

          <label className="onboarding-field">
            Gender
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </label>

          <label className="onboarding-field">
            Birthdate
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>

          <p className="onboarding-hint">
            Star sign: <strong>{birthdate ? sign : '—'}</strong>
          </p>

          <button type="submit" disabled={busy}>Enter your galaxy</button>
        </form>

        <div className="planet-preview">
          <PlanetPreview color={planetColor} mistColor={mistColor} />
        </div>
      </div>
    </AuthConstellation>
  )
}
