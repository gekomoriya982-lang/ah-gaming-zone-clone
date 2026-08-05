import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ref, get, set, update, onValue, off } from 'firebase/database'
import { getDbInstance, initFirebase, getAuthInstance } from '../firebase'

const defaultPlans = [
  { id: 'monthly', name: '1 Month', days: 30, price: 250, description: '30 days full access' },
  { id: 'lifetime', name: 'Lifetime', days: 36500, price: 999, description: 'Unlimited forever access' }
]

const defaultConfig = {
  admin_name: '',
  expiry_date: '',
  contact_telegram: 'Zone8095',
  contact_note: '',
  admin_pin: '',
  plans: defaultPlans
}

const PanelContext = createContext(null)

export function PanelProvider({ children }) {
  const [config, setConfig] = useState({ ...defaultConfig })
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(null)
  let unsubscribe = null

  const checkExpiry = useCallback((expiryDate) => {
    if (!expiryDate) return { isExpired: false, daysRemaining: null }
    const exp = new Date(expiryDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    exp.setHours(0, 0, 0, 0)
    const diff = exp.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return { isExpired: now > exp, daysRemaining: days }
  }, [])

  useEffect(() => {
    const initPanel = async () => {
      try {
        await initFirebase()
      } catch (e) {
        console.warn('Firebase init failed in panel:', e)
      }
      
      const db = getDbInstance()
      
      if (!db) {
        setLoading(false)
        return
      }

      const configRef = ref(db, 'panel_config')
      unsubscribe = onValue(configRef, (snapshot) => {
        const data = snapshot.val()
        if (data && data.admin_name && data.expiry_date) {
          const parsedConfig = {
            admin_name: data.admin_name || '',
            expiry_date: data.expiry_date || '',
            contact_telegram: data.contact_telegram || 'Zone8095',
            contact_note: data.contact_note || '',
            admin_pin: data.admin_pin || '',
            plans: Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : defaultPlans
          }
          setConfig(parsedConfig)
          setIsConfigured(true)
          const { isExpired, daysRemaining } = checkExpiry(parsedConfig.expiry_date)
          setIsExpired(isExpired)
          setDaysRemaining(daysRemaining)
        } else {
          setConfig({ ...defaultConfig })
          setIsConfigured(false)
          setIsExpired(false)
          setDaysRemaining(null)
        }
        setLoading(false)
      })

      return () => {
        if (unsubscribe) off(configRef, 'value', unsubscribe)
      }
    }

    initPanel()
  }, [checkExpiry])

  const verifyPin = useCallback((pin) => {
    return config.admin_pin ? pin === config.admin_pin : pin === 'admin123'
  }, [config.admin_pin])

  const updateExpiry = useCallback(async (newExpiry) => {
    const db = getDbInstance()
    if (!db) throw new Error('Database not initialized')
    await update(ref(db, 'panel_config'), { expiry_date: newExpiry })
    const { isExpired, daysRemaining } = checkExpiry(newExpiry)
    setIsExpired(isExpired)
    setDaysRemaining(daysRemaining)
    setConfig(prev => ({ ...prev, expiry_date: newExpiry }))
  }, [checkExpiry])

  const updateAdminPin = useCallback(async (newPin) => {
    const db = getDbInstance()
    if (!db) throw new Error('Database not initialized')
    await set(ref(db, 'panel_config/admin_pin'), newPin.trim())
    setConfig(prev => ({ ...prev, admin_pin: newPin.trim() }))
  }, [])

  const updateContact = useCallback(async (telegram, note) => {
    const db = getDbInstance()
    if (!db) throw new Error('Database not initialized')
    await update(ref(db, 'panel_config'), { 
      contact_telegram: telegram.trim().replace(/^@/, ''),
      contact_note: note?.trim() || ''
    })
    setConfig(prev => ({ 
      ...prev, 
      contact_telegram: telegram.trim().replace(/^@/, ''),
      contact_note: note?.trim() || ''
    }))
  }, [])

  const updatePlans = useCallback(async (plans) => {
    const db = getDbInstance()
    if (!db) throw new Error('Database not initialized')
    await set(ref(db, 'panel_config/plans'), plans)
    setConfig(prev => ({ ...prev, plans }))
  }, [])

  const initializePanel = useCallback(async (adminName, expiryDate) => {
    const db = getDbInstance()
    if (!db) throw new Error('Database not initialized')
    const panelConfig = {
      admin_name: adminName.trim(),
      expiry_date: expiryDate,
      contact_telegram: 'Zone8095',
      contact_note: '',
      admin_pin: 'admin123',
      plans: defaultPlans
    }
    await set(ref(db, 'panel_config'), panelConfig)
    setConfig(panelConfig)
    setIsConfigured(true)
    const { isExpired, daysRemaining } = checkExpiry(expiryDate)
    setIsExpired(isExpired)
    setDaysRemaining(daysRemaining)
    return true
  }, [checkExpiry])

  const value = {
    config,
    loading,
    isConfigured,
    isExpired,
    daysRemaining,
    verifyPin,
    updateExpiry,
    updateAdminPin,
    updateContact,
    updatePlans,
    initializePanel,
    checkExpiry
  }

  return (
    <PanelContext.Provider value={value}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  const context = useContext(PanelContext)
  if (!context) {
    throw new Error('usePanel must be used within PanelProvider')
  }
  return context
}