import { useState } from 'react'
import { useGalaxy } from './store'
import { ApiError } from '../api/client'
import { RELATIONS, SIGN_COLORS } from './constants'

const SIGNS = Object.keys(SIGN_COLORS)
const RELATION_TYPES = Object.keys(RELATIONS)

// Orbit placement defaults; body size is decided server-side by kind/role (see BodySizing in wits-api).
const KIND_DEFAULTS = {
  family: () => ({ angle: Math.random() * Math.PI * 2, speed: 0.1 }),
  friend: () => ({ angle: Math.random() * Math.PI * 2, speed: 0.08 }),
  work: () => ({ angle: Math.random() * Math.PI * 2, speed: 0.06 }),
  acquaintance: () => ({
    position: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 30],
  }),
}

function Field({ label, children }) {
  return (
    <label className="add-field">
      <small>{label}</small>
      {children}
    </label>
  )
}

function AddBodyForm({ onDone }) {
  const addBody = useGalaxy((s) => s.addBody)
  const parentCount = useGalaxy((s) => s.bodies.filter((b) => b.kind === 'family' && (b.role === 'sun' || b.role === 'moon')).length)
  const parentsFull = parentCount >= 2
  const [name, setName] = useState('')
  const [kind, setKind] = useState('friend')
  const [role, setRole] = useState('sibling')
  const [relation, setRelation] = useState('positive')
  const [sign, setSign] = useState('leo')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const effectiveRole = parentsFull && role !== 'sibling' ? 'sibling' : role

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await addBody({
        name: name.trim(),
        kind,
        role: kind === 'family' ? effectiveRole : undefined,
        relation,
        sign,
        color: SIGN_COLORS[sign],
        ...KIND_DEFAULTS[kind](),
      })
      setName('')
      onDone?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add that relationship')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="galaxy-add-form" onSubmit={onSubmit}>
      <strong>New relationship</strong>
      <Field label="Name">
        <input placeholder="Who is it?" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
      </Field>
      <Field label="Type">
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="family">Family</option>
          <option value="friend">Friend</option>
          <option value="work">Labor dependence</option>
          <option value="acquaintance">Acquaintance</option>
        </select>
      </Field>
      {kind === 'family' && (
        <Field label="Role">
          <select value={effectiveRole} onChange={(e) => setRole(e.target.value)}>
            <option value="sibling">Sibling / other</option>
            <option value="sun" disabled={parentsFull}>Sun (Father)</option>
            <option value="moon" disabled={parentsFull}>Moon (Mother)</option>
          </select>
          {parentsFull && <small className="add-hint">You already have two parents.</small>}
        </Field>
      )}
      <Field label="Relation">
        <select value={relation} onChange={(e) => setRelation(e.target.value)}>
          {RELATION_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Zodiac sign">
        <select value={sign} onChange={(e) => setSign(e.target.value)}>
          {SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <button type="submit" disabled={busy}>Add to galaxy</button>
      {error && <span className="error-text">{error}</span>}
    </form>
  )
}

function AddMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="add-menu">
      <button
        type="button"
        className={`add-fab${open ? ' open' : ''}`}
        aria-expanded={open}
        aria-label={open ? 'Close add menu' : 'Add a relationship'}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="add-fab-icon">+</span>
        <span className="add-fab-label">Add</span>
      </button>
      {open && <AddBodyForm onDone={() => setOpen(false)} />}
    </div>
  )
}
function SelectedBodyPanel() {
  const selectedId = useGalaxy((s) => s.selectedId)
  const body = useGalaxy((s) => s.bodies.find((b) => b.id === s.selectedId))
  const updateBody = useGalaxy((s) => s.updateBody)
  const deleteBody = useGalaxy((s) => s.deleteBody)
  const select = useGalaxy((s) => s.select)

  if (!selectedId || !body || body.kind === 'self') return null

  return (
    <div className="galaxy-selected-panel">
      <strong>{body.name}</strong>
      <div className="hud-stats">
        <div className="hud-stat"><small>Type</small><span>{body.kind}</span></div>
        <div className="hud-stat"><small>Sign</small><span>{body.sign ?? '—'}</span></div>
      </div>
      <label>
        Relation
        <select value={body.relation} onChange={(e) => updateBody(body.id, { relation: e.target.value })}>
          {RELATION_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      <button onClick={async () => { await deleteBody(body.id); select(null) }}>Remove</button>
    </div>
  )
}

export default function GalaxyControls() {
  return (
    <div className="galaxy-controls">
      <AddMenu />
      <SelectedBodyPanel />
    </div>
  )
}
