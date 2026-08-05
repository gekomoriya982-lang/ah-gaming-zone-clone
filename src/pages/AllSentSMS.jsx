import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, Filter, Trash2, Eye, Copy, Download, MoreVertical, RefreshCw } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function AllSentSMS() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState(new Set())

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const sendsmsRef = ref(db, 'sendsms')
    const unsub = onValue(sendsmsRef, (snapshot) => {
      const data = snapshot.val() || {}
      const allMessages = []
      Object.entries(data).forEach(([deviceId, deviceSms]) => {
        Object.entries(deviceSms || {}).forEach(([msgId, msg]) => {
          allMessages.push({
            id: `${deviceId}_${msgId}`,
            deviceId,
            deviceName: msg.device || 'Unknown',
            ...msg,
            timestamp_formatted: msg.time ? new Date(msg.time).toLocaleString() : 'Unknown'
          })
        })
      })
      allMessages.sort((a, b) => (b.time || 0) - (a.time || 0))
      setMessages(allMessages)
      setLoading(false)
    })
    return () => off(sendsmsRef, 'value', unsub)
  }, [])

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.number?.toLowerCase().includes(search.toLowerCase()) ||
      msg.message?.toLowerCase().includes(search.toLowerCase()) ||
      msg.deviceName?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'success' && msg.success) || (filter === 'failed' && !msg.success)
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (id) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    const [deviceId, msgId] = id.split('_')
    try { await remove(ref(db, `sendsms/${deviceId}/${msgId}`)); toast.success('Message deleted') }
    catch (err) { toast.error('Failed to delete message') }
  }

  const exportData = () => {
    const csv = ['Device,Number,Message,SIM,Status,Success,Time,Error'].concat(
      filteredMessages.map(m => `${m.deviceName},${m.number},"${m.message}",${m.sim},${m.status},${m.success},${m.timestamp_formatted},${m.error || ''}`)
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sent-sms-${Date.now()}.csv`
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
        <div><h1 className="text-2xl font-black text-foreground">All Sent SMS</h1><p className="text-sm text-muted-foreground mt-1">{messages.length} total • {messages.filter(m => m.success).length} success • {messages.filter(m => !m.success).length} failed</p></div>
        <button onClick={exportData} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"><option value="all">All</option><option value="success">Success</option><option value="failed">Failed</option></select>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {filteredMessages.length === 0 ? <div className="p-10 text-center"><Send className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No sent messages found</p></div> : filteredMessages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Send className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${msg.success ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>{msg.success ? 'Sent' : 'Failed'}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{msg.timestamp_formatted}</span>
                        <span className="font-semibold text-foreground truncate max-w-[200px]">{msg.deviceName}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground">
                        <span>To: <span className="font-mono">{msg.number}</span></span>
                        <span>SIM: {msg.sim}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground break-all truncate max-w-[600px]">{msg.message}</p>
                      {msg.error && <p className="mt-1 text-sm text-destructive">Error: {msg.error}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigator.clipboard.writeText(msg.message)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Copy Message"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(msg.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
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