import { useEffect } from 'react'
import Galaxy from '../assets/Galaxy'
import GalaxyControls from '../assets/GalaxyControls'
import GalaxySidebar from '../assets/GalaxySidebar'
import { useGalaxy } from '../assets/store'

export default function GalaxyPage() {
  const loadGalaxy = useGalaxy((s) => s.loadGalaxy)
  const loading = useGalaxy((s) => s.loading)
  const error = useGalaxy((s) => s.error)

  useEffect(() => {
    loadGalaxy()
  }, [loadGalaxy])

  return (
    <div style={{ height: 'calc(100vh - 56px)', position: 'relative' }}>
      {loading && <div className="galaxy-status">Loading your galaxy…</div>}
      {error && <div className="galaxy-status error-text">{error}</div>}
      <Galaxy />
      <GalaxySidebar />
      <GalaxyControls />
    </div>
  )
}
