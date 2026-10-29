import { useState } from 'react'
import { AuthContext } from './AuthContext'

const KEY = 'ccm_user'

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(read)

  const login = (data) => {
    localStorage.setItem(KEY, JSON.stringify(data))
    setUser(data)
  }
  const logout = () => {
    localStorage.removeItem(KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}