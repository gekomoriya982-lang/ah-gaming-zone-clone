import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, FileText, Search, X, CheckCircle, AlertCircle, Loader2, Plus, Minus, Trash2, Copy, Smartphone, Zap, Settings, RotateCcw } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, set, push, update, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function BulkSMS() {
  const [devices, setDevices] = useState([])
  const [recipients, setRecipients] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 })
  const [results, setResults] = useState([])
  const [smsLimit, setSmsLimit] = useState(50)
  const [excludeIds, setExcludeIds] = useState(new Set())
  const [showExclude, setShowExclude] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [variables, setVariables] = useState([])
  const [variableHeaders, setVariableHeaders] = useState([])
  const sendingRef = useRef(false)

  useEffect(() => {
    if (!db) return
    const usersRef = ref(db, 'users')
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      const deviceList = Object.entries(data)
        .filter(([, device]) => device.fcm && device.online && !excludeIds.has(device.id))
        .map(([id, device]) => ({ id, name: `${device.brand} ${device.model}`, brand: device.brand, model: device.model, fcm: device.fcm, online: device.online }))
      setDevices(deviceList)
    })
    return () => off(usersRef, 'value', unsub)
  }, [excludeIds])

  const parseCSV = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.trim().split('\n')
        if (lines.length < 2) { reject(new Error('CSV must have header and at least one row')); return }
        const headers = lines[0].split(',').map(h => h.trim())
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj = {}
          headers.forEach((h, i) => { obj[h] = values[i] || '' })
          return obj
        })
        const phoneHeader = headers.find(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('number') || h.toLowerCase().includes('mobile'))
        if (!phoneHeader) { reject(new Error('No phone/number column found')); return }
        const varHeaders = headers.filter(h => h !== phoneHeader)
        setVariableHeaders(varHeaders)
        setVariables(varHeaders)
        const formatted = rows.map((row, i) => `${row[phoneHeader]},${varHeaders.map(h => row[h] || '').join(',')}`).join('\n')
        setRecipients(formatted)
        resolve()
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }, [])

  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    parseCSV(file).catch(err => toast.error(err.message))
    e.target.value = ''
  }

  const replaceVariables = (template, vars) => {
    return template.replace(/\{\{(\d+)\}\}/g, (_, idx) => vars[parseInt(idx) - 1] || `{{${idx}}}`)
  }

  const sendSMS = async (fcmToken, number, text) => {
    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=YOUR_FCM_SERVER_KEY'
        },
        body: JSON.stringify({
          to: fcmToken,
          data: { type: 'sms', number, message: text, sim: 'sim1' }
        })
      })
      const result = await response.json()
      return { success: response.ok && result.success === 1, error: result.error }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const handleSend = async () => {
    if (!recipients.trim() || !message.trim() || devices.length === 0) {
      toast.error('Fill all fields and ensure devices are available')
      return
    }

    const lines = recipients.trim().split('\n').filter(l => l.trim())
    if (lines.length === 0) { toast.error('No recipients'); return }
    if (lines.length > devices.length * smsLimit) {
      toast.error(`Max ${devices.length * smsLimit} SMS allowed (${smsLimit} per device)`)
      return
    }

    sendingRef.current = true
    setSending(true)
    setProgress({ sent: 0, failed: 0, total: lines.length })
    setResults([])

    const deviceIndex = { current: 0 }
    const deviceCounts = {}

    for (let i = 0; i < lines.length && sendingRef.current; i++) {
      const line = lines[i]
      const [number, ...vars] = line.split(',').map(s => s.trim())
      const finalMessage = replaceVariables(message, vars)

      if (deviceIndex.current >= devices.length) {
        deviceIndex.current = 0
      }

      const device = devices[deviceIndex.current]
      deviceIndex.current++

      const result = await sendSMS(device.fcm, number, finalMessage)
      const logEntry = { device: device.name, number, message: finalMessage, status: result.success ? 'ok' : 'fail', error: result.error, time: Date.now() }
      setResults(prev => [...prev, logEntry])

      if (result.success) setProgress(p => ({ ...p, sent: p.sent + 1 }))
      else setProgress(p => ({ ...p, failed: p.failed + 1 }))

      await new Promise(r => setTimeout(r, 200))
    }

    setSending(false)
    toast.success(`Done! ${progress.sent} sent, ${progress.failed} failed`)
  }

  const handleStop = () => {
    sendingRef.current = false
    setSending(false)
  }

  const toggleExclude = (id) => {
    setExcludeIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  if (!db) return <div className="p-5 text-center text-muted-foreground">Firebase not configured</div>

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Bulk SMS</h1><p className="text-sm text-muted-foreground mt-1">{devices.length} active devices • {devices.length * smsLimit} SMS capacity</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Recipients</h2>
            <div className="flex items-center gap-2">
              <input type="file" accept=".csv" onChange={handleCSVUpload} id="csv-upload" className="hidden" />
              <button onClick={() => document.getElementById('csv-upload').click()} className="px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2"><FileText className="h-4 w-4" /> Upload CSV</button>
              <span className="text-sm text-muted-foreground">Columns: phone, var1, var2... Use {{1}}, {{2}} in message</span>
            </div>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="+919876543210,John,Delhi\n+919876543211,Jane,Mumbai"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">One per line: number,var1,var2... Variables become {{1}}, {{2}} in message</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Message</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hello {{1}}, your order for {{2}} is confirmed!"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {variableHeaders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {variableHeaders.map((h, i) => (
                  <button key={h} onClick={() => setMessage(message + `{{${i + 1}}}`)} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">{{{i + 1}}} {h}</button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="number" value={smsLimit} onChange={e => setSmsLimit(Math.max(1, Math.min(100, parseInt(e.target.value))))} min="1" max="100" className="w-20 px-2 py-1.5 rounded-lg bg-secondary/50 border border-border" /> SMS per device limit</label>
            </div>
          </div>

          {sending && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Sending Progress</h2>
              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.total > 0 ? (progress.sent + progress.failed) / progress.total * 100 : 0}%` }}
                  className="h-full bg-primary transition-all duration-300"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-500"><CheckCircle className="h-4 w-4 inline mr-1" /> {progress.sent} sent</span>
                <span className="text-destructive"><AlertCircle className="h-4 w-4 inline mr-1" /> {progress.failed} failed</span>
                <span className="text-muted-foreground">{progress.sent + progress.failed} / {progress.total}</span>
              </div>
              <button onClick={handleStop} className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors">Stop Sending</button>
            </div>
          )}

          {!sending && results.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Results</h2>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((r, i) => (
                  <div key={i} className={`p-3 rounded-xl ${r.status === 'ok' ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={r.status === 'ok' ? 'text-green-500' : 'text-destructive'}>
                          {r.status === 'ok' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        </span>
                        <span className="font-mono text-sm">{r.number}</span>
                        <span className="text-[11px] text-muted-foreground">{r.device}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{r.error || 'OK'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Devices</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{devices.length} available</span>
              <button onClick={() => setShowExclude(!showExclude)} className="text-sm text-primary hover:underline">{showExclude ? 'Hide' : 'Show'} Excluded</button>
            </div>
            {showExclude && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {devices.map(d => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50">
                    <input type="checkbox" checked={excludeIds.has(d.id)} onChange={() => toggleExclude(d.id)} className="h-4 w-4" />
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium truncate">{d.name}</span>
                  </div>
                ))}
              </div>
            )}
            {!showExclude && devices.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {devices.map(d => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium truncate">{d.name}</span>
                    <span className="text-[10px] text-green-500">Online</span>
                  </div>
                ))}
              </div>
            )}
            {devices.length === 0 && <p className="text-center text-muted-foreground py-8">No online devices with FCM tokens</p>}
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !recipients.trim() || !message.trim() || devices.length === 0}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {sending ? 'Sending...' : 'Send Bulk SMS'}
          </button>
        </div>
      </div>
    </div>
  )
}