// Firebase wrapper to avoid Vite resolution issues
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your-project-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "...",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:...:web:..."
}

let auth = null
let db = null
let initialized = false

export async function initFirebase() {
  if (initialized) return
  
  try {
    const app = initializeApp(firebaseConfig)
    const { getAuth, setPersistence, browserLocalPersistence } = await import('firebase/auth')
    const { getDatabase } = await import('firebase/database')
    
    auth = getAuth(app)
    db = getDatabase(app)
    setPersistence(auth, browserLocalPersistence)
    initialized = true
  } catch (e) {
    console.warn('Firebase initialization failed:', e)
  }
}

export function getAuthInstance() {
  return auth
}

export function getDbInstance() {
  return db
}

export function isFirebaseInitialized() {
  return initialized
}