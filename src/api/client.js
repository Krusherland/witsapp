// Thin fetch wrapper: same-origin session cookie auth + Spring Security's CSRF cookie handshake.
function readCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed with status ${status}`)
    this.status = status
    this.fieldErrors = body?.fieldErrors || null
  }
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const isMutation = method !== 'GET' && method !== 'HEAD'
  const finalHeaders = { ...headers }
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json'
  if (isMutation) {
    const csrfToken = readCookie('XSRF-TOKEN')
    if (csrfToken) finalHeaders['X-XSRF-TOKEN'] = csrfToken
  }

  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) throw new ApiError(response.status, data)
  return data
}
