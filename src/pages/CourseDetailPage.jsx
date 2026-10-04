import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CourseApi } from '../api/courses'
import { ApiError } from '../api/client'

export default function CourseDetailPage() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)
  const [activeChapter, setActiveChapter] = useState(null)
  const [error, setError] = useState(null)
  const [checkoutError, setCheckoutError] = useState(null)

  useEffect(() => {
    CourseApi.detail(slug).then(setCourse).catch(() => setError('Course not found'))
  }, [slug])

  async function onBuy() {
    setCheckoutError(null)
    try {
      const { redirectUrl } = await CourseApi.checkout(course.id)
      window.location.href = redirectUrl
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : 'Checkout failed')
    }
  }

  if (error) return <p className="error-text">{error}</p>
  if (!course) return <p>Loading…</p>

  return (
    <div>
      <div style={{ padding: '1.5rem' }}>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        {!course.enrolled && (
          <>
            <button onClick={onBuy}>
              Buy for {(course.priceCents / 100).toFixed(2)} {course.currency}
            </button>
            {checkoutError && <p className="error-text">{checkoutError}</p>}
          </>
        )}
      </div>

      {activeChapter && (
        <div style={{ padding: '0 1.5rem' }}>
          <iframe className="video-frame" src={activeChapter.playbackUrl} title={activeChapter.title}
            allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        </div>
      )}

      <div className="chapter-list">
        {course.chapters.map((chapter) => (
          <div key={chapter.id} className={`chapter-row ${chapter.locked ? 'locked' : ''}`}>
            <span>{chapter.position + 1}.</span>
            <span style={{ flex: 1 }}>{chapter.title}</span>
            {chapter.locked ? (
              <span>🔒</span>
            ) : (
              <button onClick={() => setActiveChapter(chapter)}>Play</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
