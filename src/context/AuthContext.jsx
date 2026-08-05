import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { getDatabase, ref, get, set, push, update, remove, onValue, off } from 'firebase/database'
import { initFirebase, getAuthInstance, getDbInstance } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initFirebase()
        const auth = getAuthInstance()
        const db = getDbInstance()
        
        if (!auth) {
          setLoading(false)
          setAuthReady(true)
          return
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser)
          setLoading(false)
        })

        setAuthReady(true)
        
        return () => unsubscribe()
      } catch (e) {
        console.warn('Firebase init failed:', e)
        setLoading(false)
        setAuthReady(true)
      }
    }

    initAuth()
  }, [])

  const signIn = useCallback(async (email, password) => {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase not initialized')
    setError(null)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      setUser(result.user)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    const auth = getAuthInstance()
    if (!auth) return
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    signIn,
    signOut,
    auth: getAuthInstance(),
    db: getDbInstance()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export { getDbInstance as db }