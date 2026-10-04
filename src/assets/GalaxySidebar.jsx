import { useMemo, useState } from 'react'
import { useGalaxy } from './store'
import { RELATIONS } from './constants'

const ELEMENTS = {
  fire: ['aries', 'leo', 'sagittarius'],
  earth: ['taurus', 'virgo', 'capricorn'],
  air: ['gemini', 'libra', 'aquarius'],
  water: ['cancer', 'scorpio', 'pisces'],
}
const elementOf = (sign) => Object.keys(ELEMENTS).find((e) => ELEMENTS[e].includes(sign))
const FRIENDLY = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' }

// Cosmic affinity between two signs: same element or complementary element (fire/air, earth/water) is harmonious.
function affinity(a, b) {
  const ea = elementOf(a)
  const eb = elementOf(b)
  if (!ea || !eb) return 0.5
  if (ea === eb) return 1
  return FRIENDLY[ea] === eb ? 0.85 : 0.35
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'family', label: 'Family', match: (b) => b.kind === 'family' },
  { id: 'friend', label: 'Friends', match: (b) => b.kind === 'friend' },
  { id: 'love', label: 'Love', match: (b) => b.relation === 'love' },
  { id: 'work', label: 'Work', match: (b) => b.kind === 'work' },
]

function stats(list) {
  const total = list.length
  const bad = list.filter((b) => b.relation === 'negative').length
  const good = total - bad
  return { total, bad, good, health: total ? Math.round((good / total) * 100) : null }
}

function verdict(health) {
  if (health == null) return 'Nothing here yet'
  if (health >= 85) return 'Thriving'
  if (health >= 65) return 'Healthy'
  if (health >= 40) return 'Strained'
  return 'Needs care'
}

function Meter({ label, value, sub }) {
  const color = value == null ? '#5b628a' : value >= 65 ? '#5ee6a8' : value >= 40 ? '#ffc24d' : '#ff4d5e'
  return (
    <div className="meter">
      <div className="meter-head">
        <span>{label}</span>
        <b style={{ color }}>{value == null ? '—' : `${value}%`}</b>
      </div>
      <div className="meter-track"><i style={{ width: `${value ?? 0}%`, background: color, boxShadow: `0 0 8px ${color}` }} /></div>
      {sub && <small>{sub}</small>}
    </div>
  )
}

function BodyRow({ body, selfSign }) {
  const select = useGalaxy((s) => s.select)
  const selectedId = useGalaxy((s) => s.selectedId)
  const harmony = Math.round(affinity(selfSign, body.sign) * 100)
  return (
    <button className={`insight-row${selectedId === body.id ? ' active' : ''}`} onClick={() => select(body.id)}>
      <i style={{ background: RELATIONS[body.relation]?.color ?? '#fff' }} />
      <span className="insight-name">{body.name}</span>
      <small>{body.relation} · {harmony}% harmony</small>
    </button>
  )
}

export default function GalaxySidebar() {
  const bodies = useGalaxy((s) => s.bodies)
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState('overview')

  const { self, others } = useMemo(
    () => ({ self: bodies.find((b) => b.kind === 'self'), others: bodies.filter((b) => b.kind !== 'self') }),
    [bodies],
  )
  const selfSign = self?.sign

  const overall = stats(others)
  const byTab = TABS.slice(1).map((t) => ({ ...t, ...stats(others.filter(t.match)) }))
  const harmonyAvg = others.length
    ? Math.round((others.reduce((sum, b) => sum + affinity(selfSign, b.sign), 0) / others.length) * 100)
    : null
  const strongest = others.filter((b) => b.relation !== 'negative' && b.sign)
    .sort((a, b) => affinity(selfSign, b.sign) - affinity(selfSign, a.sign))[0]
  const toNurture = others.filter((b) => b.relation === 'negative')

  const active = TABS.find((t) => t.id === tab)
  const list = active.match ? others.filter(active.match) : []
  const activeStats = active.match ? stats(list) : null

  return (
    <aside className={`insights${open ? '' : ' collapsed'}`}>
      <button className="insights-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle analysis panel">
        {open ? '‹' : '›'}
      </button>
      {open && (
        <div className="insights-body">
          <strong className="insights-title">Galaxy analysis</strong>
          <div className="insights-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {tab === 'overview' ? (
            <>
              <Meter label="Overall bond health" value={overall.health} sub={`${overall.good} good · ${overall.bad} strained of ${overall.total}`} />
              <Meter label="Cosmic harmony" value={harmonyAvg} sub="Zodiac element match with your sign" />
              {byTab.map((t) => <Meter key={t.id} label={t.label} value={t.health} sub={t.total ? `${t.total} bodies` : 'None yet'} />)}
              {strongest && <p className="insight-note">Strongest cosmic match: <b>{strongest.name}</b></p>}
              {toNurture.length > 0 && (
                <p className="insight-note warn">To nurture: <b>{toNurture.map((b) => b.name).join(', ')}</b></p>
              )}
            </>
          ) : (
            <>
              <Meter label={`${active.label} health`} value={activeStats.health} sub={verdict(activeStats.health)} />
              <div className="insight-list">
                {list.length === 0 && <p className="insight-note">No {active.label.toLowerCase()} relationships yet.</p>}
                {list.map((b) => <BodyRow key={b.id} body={b} selfSign={selfSign} />)}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  )
}