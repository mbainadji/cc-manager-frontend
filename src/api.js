import axios from 'axios'

const KEY = 'ccm_user'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

const readSession = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}

api.interceptors.request.use((config) => {
  const token = readSession()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const session = readSession()
    if (err.response?.status === 401 && session?.token) {
      localStorage.removeItem(KEY)
      window.location.href = session.role === 'professor' ? '/professeur' : '/'
    }
    return Promise.reject(err)
  },
)

export const errorMessage = (err) =>
  err.response?.data?.message ?? 'Impossible de joindre le serveur'

export default api