// One color per star sign, used for each planet's surrounding mist.
export const SIGN_COLORS = {
  aries: '#ff4d3d', taurus: '#6fcf6a', gemini: '#ffe14d', cancer: '#b8c8ff',
  leo: '#ff9f2e', virgo: '#a8d98a', libra: '#ff8fc7', scorpio: '#b02a4f',
  sagittarius: '#a96bff', capricorn: '#6b7f8f', aquarius: '#3fd8ff', pisces: '#5f7bff',
}

// The user's own planet: blue, red or violet.
export const USER_COLORS = { blue: '#3a6bff', red: '#e0403a', violet: '#8a52e8' }

// Default planet color suggested by the onboarding gender choice (user can still override it later).
export const GENDER_COLORS = { male: 'blue', female: 'red', nonbinary: 'violet' }

// Beam look per relationship type.
export const RELATIONS = {
  positive: { color: '#5ee6a8', speed: 0.12, width: 0.16, pulse: 0.0 },
  negative: { color: '#ff4d5e', speed: 0.22, width: 0.26, pulse: 0.5 },
  love:     { color: '#ff5fb0', speed: 0.10, width: 0.14, pulse: 0.6 },
  work:     { color: '#ffc24d', speed: 0.16, width: 0.10, pulse: 0.0 },
}

// A glowing luminary (sun/moon) "lights off" to this dead-star tint when its relation turns negative.
export const EXTINGUISHED_COLOR = '#2a0a0f'

// Orbit rings (acquaintances have no ring; they float freely in space).
export const ORBITS = {
  family: { radius: 4,  squash: 0.92, tilt: 0.10 },
  friend: { radius: 7,  squash: 0.88, tilt: -0.14 },
  work:   { radius: 10, squash: 0.85, tilt: 0.20 },
}
