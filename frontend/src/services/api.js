import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

// Attach auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medpredict_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error'
    return Promise.reject(new Error(message))
  }
)

// ─── Auth ────────────────────────────────────────────────
export function register(email, password) {
  return api.post('/auth/register', { email, password })
}

export function login(email, password) {
  return api.post('/auth/login', { email, password })
}

// ─── Symptoms ────────────────────────────────────────────
export function checkSymptoms(symptoms) {
  return api.post('/symptoms', { symptoms })
}

// ─── MCQ ─────────────────────────────────────────────────
export function classifyMCQ(payload) {
  return api.post('/mcq', payload)
}

// ─── Flashcards ──────────────────────────────────────────
export function generateFlashcards(input) {
  return api.post('/flashcards', { input })
}

// ─── Textbook RAG ────────────────────────────────────────
export function uploadTextbook(file) {
  const formData = new FormData()
  formData.append('pdf', file)
  return api.post('/textbook/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

export function searchTextbook(fileId, query) {
  return api.post('/textbook/search-rag', { fileId, query })
}

export function askTextbook(fileId, query) {
  return api.post('/textbook/ask', { fileId, query })
}

export function generateTextbookQuiz(fileId, topic) {
  return api.post('/textbook/quiz', { fileId, topic })
}

// ─── Quizzes ─────────────────────────────────────────────
export function createQuiz(title, questionIds) {
  return api.post('/quizzes', { title, questionIds })
}

export function listQuizzes() {
  return api.get('/quizzes')
}

export function getQuiz(id) {
  return api.get(`/quizzes/${id}`)
}

// ─── Simulation ──────────────────────────────────────────
export function loadCase(filename) {
  return api.get(`/cases/${filename}`)
}

export function saveSimulationRun(payload) {
  return api.post('/simulation-runs', payload)
}

export function getFeedback(timeline, prompt) {
  return api.post('/feedback', { timeline, prompt })
}

export default api
