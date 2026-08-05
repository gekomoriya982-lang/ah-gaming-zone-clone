import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, Search, Filter, Globe, User, MapPin, Clock, Download, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function LoginHistory() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const sessionRef = ref(db, 'login_history')
    const unsub = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val() || {}
      const allSessions = Object.entries(data).map(([id, session]) => ({
        id,
        ...session,
        loginAt_formatted: session.loginAt ? new Date(session.loginAt).toLocaleString() : 'Unknown'
      })).sort((a, b) => (b.loginAt || 0) - (a.loginAt || 0))
      setSessions(allSessions)
      setLoading(false)
    })
    return () => off(sessionRef, 'value', unsub)
  }, [])

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.ip?.includes(search) || s.hostname?.toLowerCase().includes(search.toLowerCase()) || s.userAgent?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const exportData = () => {
    const csv = ['ID,IP,Hostname,User Agent,Login Time'].concat(
      filteredSessions.map(s => `${s.id},${s.ip},${s.hostname},"${s.userAgent}",${s.loginAt_formatted}`)
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `login-history-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported to CSV')
  }

  if (loading) {
    return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Login History</h1><p className="text-sm text-muted-foreground mt-1">{sessions.length} total sessions</p></div>
        <button onClick={exportData} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search sessions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {filteredSessions.length === 0 ? <div className="p-10 text-center"><History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No login history found</p></div> : filteredSessions.map((session) => (
            <motion.div key={session.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Globe className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-mono">{session.loginAt_formatted}</span>
                        <span className="font-mono text-sm text-foreground">{session.ip}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{session.hostname}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground truncate max-w-[600px]">{session.userAgent}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigator.clipboard.writeText(session.ip)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Copy IP"><CheckCircle className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}