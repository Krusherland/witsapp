import { apiFetch } from './client'

export const CourseApi = {
  list: () => apiFetch('/courses'),
  detail: (slug) => apiFetch(`/courses/${slug}`),
  checkout: (courseId) => apiFetch('/checkout', { method: 'POST', body: { courseId } }),
  getProgress: (courseId) => apiFetch(`/courses/${courseId}/progress`),
  updateProgress: (chapterId, lastPositionSeconds, completed) =>
    apiFetch(`/chapters/${chapterId}/progress`, { method: 'PUT', body: { lastPositionSeconds, completed } }),
}
