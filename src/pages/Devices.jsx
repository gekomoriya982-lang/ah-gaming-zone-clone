import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Smartphone, Wifi, WifiOff, Search, Filter, MoreVertical, Trash2, Edit, Eye, Download, Copy, AlertTriangle } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, update, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const usersRef = ref(db, 'users')
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      const devicesList = Object.entries(data).map(([id, device]) => ({
        id, ...device,
        last_seen_formatted: device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'
      })).sort((a, b) => (b.last_seen || 0) - (a.last_seen || 0))
      setDevices(devicesList)
      setLoading(false)
    })
    return () => off(usersRef, 'value', unsub)
  }, [])

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.id.toLowerCase().includes(search.toLowerCase()) ||
      `${device.brand} ${device.model}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'online' && device.online) || (filter === 'offline' && !device.online)
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (id) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDevices.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredDevices.map(d => d.id)))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this device? This action cannot be undone.')) return
    setDeleting(id)
    try { await remove(ref(db, `users/${id}`)); toast.success('Device deleted') }
    catch (err) { toast.error('Failed to delete device') }
    finally { setDeleting(null) }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} devices? This action cannot be undone.`)) return
    try { await Promise.all([...selectedIds].map(id => remove(ref(db, `users/${id}`)))); toast.success(`${selectedIds.size} devices deleted`); setSelectedIds(new Set()) }
    catch (err) { toast.error('Failed to delete devices') }
  }

  if (loading) {
    return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Devices</h1><p className="text-sm text-muted-foreground mt-1">{devices.length} total {devices.filter(d => d.online).length} online</p></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search devices..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"><option value="all">All Devices</option><option value="online">Online Only</option><option value="offline">Offline Only</option></select>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          {selectedIds.size > 0 && <div className="flex items-center gap-3"><span className="text-sm font-medium">{selectedIds.size} selected</span><button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"><Trash2 className="h-4 w-4 inline mr-1" /> Delete</button></div>}
        </div>
        <div className="divide-y divide-border/50">
          {filteredDevices.length === 0 ? <div className="p-10 text-center"><Smartphone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No devices found</p></div> : filteredDevices.map((device) => <motion.div key={device.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={selectedIds.has(device.id) ? 'bg-primary/5' : ''}><div className="p-4 hover:bg-secondary/30 transition-colors"><div className="flex items-center gap-4"><input type="checkbox" checked={selectedIds.has(device.id)} onChange={() => toggleSelect(device.id)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" /><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Smartphone className="h-6 w-6 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><Link to={`/view/${device.id}`} className="font-semibold text-foreground hover:text-primary truncate block">{device.brand} {device.model}</Link><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${device.online ? 'bg-green-500/10 text-green-500' : 'bg-muted-foreground/10 text-muted-foreground'}`}><span className={`h-1.5 w-1.5 rounded-full ${device.online ? 'bg-green-500' : 'bg-muted-foreground'}`} />{device.online ? 'Online' : 'Offline'}</span></div><div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground"><span className="font-mono truncate max-w-[200px]">{device.id}</span><span>Last seen: {device.last_seen_formatted}</span>{device.fcm && <span className="font-mono truncate max-w-[200px]">FCM: {device.fcm.slice(0, 20)}...</span>}</div></div><div className="flex items-center gap-2"><Link to={`/view/${device.id}`} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="View"><Eye className="h-4 w-4" /></Link><button disabled={deleting === device.id} onClick={() => handleDelete(device.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">{deleting === device.id ? <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></div></div></div></motion.div>)}
        </div>
      </div>
    </div>
  )
}