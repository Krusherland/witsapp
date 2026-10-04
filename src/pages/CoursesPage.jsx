import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CourseApi } from '../api/courses'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    CourseApi.list().then(setCourses).catch(() => setError('Could not load courses'))
  }, [])

  if (error) return <p className="error-text">{error}</p>

  return (
    <div className="course-grid">
      {courses.map((course) => (
        <Link key={course.id} to={`/courses/${course.slug}`} className="course-card">
          {course.coverImageUrl && <img src={course.coverImageUrl} alt={course.title} />}
          <div className="body">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <span className="price">
              {(course.priceCents / 100).toFixed(2)} {course.currency}
            </span>
          </div>
        </Link>
      ))}
      {courses.length === 0 && <p>No courses published yet.</p>}
    </div>
  )
}
