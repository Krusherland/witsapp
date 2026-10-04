// Maps a birthdate (YYYY-MM-DD string) to a lowercase zodiac sign key matching SIGN_COLORS.
const SIGN_CUTOFFS = [
  { sign: 'capricorn', month: 1, day: 19 },
  { sign: 'aquarius', month: 2, day: 18 },
  { sign: 'pisces', month: 3, day: 20 },
  { sign: 'aries', month: 4, day: 19 },
  { sign: 'taurus', month: 5, day: 20 },
  { sign: 'gemini', month: 6, day: 20 },
  { sign: 'cancer', month: 7, day: 22 },
  { sign: 'leo', month: 8, day: 22 },
  { sign: 'virgo', month: 9, day: 22 },
  { sign: 'libra', month: 10, day: 22 },
  { sign: 'scorpio', month: 11, day: 21 },
  { sign: 'sagittarius', month: 12, day: 21 },
  { sign: 'capricorn', month: 12, day: 31 },
]

export function zodiacSignFromDate(dateStr) {
  if (!dateStr) return null
  const date = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  const month = date.getMonth() + 1
  const day = date.getDate()
  const cutoff = SIGN_CUTOFFS.find(({ month: m, day: d }) => month < m || (month === m && day <= d))
  return cutoff ? cutoff.sign : 'capricorn'
}
