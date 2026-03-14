// API base URL — change this after deploying backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  async generate(topic, imageCount, settings) {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, image_count: imageCount, settings })
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  },

  async getJob(jobId) {
    const res = await fetch(`${BASE_URL}/api/job/${jobId}`)
    if (!res.ok) throw new Error(`Job not found`)
    return res.json()
  },

  async getJobs() {
    const res = await fetch(`${BASE_URL}/api/jobs`)
    return res.json()
  },

  async testWordPress(settings) {
    const res = await fetch(`${BASE_URL}/api/test-wordpress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    return res.json()
  }
}

// Settings stored in localStorage
export const settingsStorage = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('blog_studio_settings') || '{}')
    } catch { return {} }
  },
  save(settings) {
    localStorage.setItem('blog_studio_settings', JSON.stringify(settings))
  },
  clear() {
    localStorage.removeItem('blog_studio_settings')
  }
}
