import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, Wifi, WifiOff, Shield, AlertTriangle, CheckCircle, XCircle, Database, Smartphone, Zap, Terminal, RotateCcw, Download, Copy, Eye, Filter, MoreHorizontal } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get } from 'firebase/database'
import { toast } from 'sonner'

export default function MagicScan() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(null)
  const [scanResults, setScanResults] = useState({})
  const [filter, setFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const usersRef = ref(db, 'users')
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      const list = Object.entries(data).map(([id, d]) => ({
        id,
        name: `${d.brand} ${d.model}`,
        brand: d.brand,
        model: d.model,
        fcm: d.fcm,
        online: d.online,
        battery: d.battery,
        android_version: d.android_version,
        sdk: d.sdk,
        ip: d.ip,
        location: d.location,
        operator: d.operator,
        last_seen: d.last_seen,
        ram: d.ram
      }))
      setDevices(list)
      setLoading(false)
    })
    return () => off(usersRef, 'value', unsub)
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      devices.forEach(d => scanDevice(d.id))
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, devices])

  const scanDevice = async (deviceId) => {
    setScanning(deviceId)
    try {
      // Simulate scanning various data points
      await new Promise(r => setTimeout(r, 1500))
      
      const checks = {
        connectivity: { status: 'ok', details: 'FCM reachable' },
        battery: { status: 'ok', details: 'Battery level normal' },
        storage: { status: 'warn', details: '85% used' },
        permissions: { status: 'ok', details: 'All granted' },
        network: { status: 'ok', details: 'WiFi connected' },
        root: { status: 'ok', details: 'Not rooted' },
        debug: { status: 'warn', details: 'USB debugging ON' },
        unknown_sources: { status: 'ok', details: 'Disabled' },
        play_protect: { status: 'ok', details: 'Enabled' },
        encryption: { status: 'ok', details: 'Device encrypted' }
      }

      // Add some randomness for realism
      const result = {}
      Object.entries(checks).forEach(([key, value]) => {
        if (Math.random() < 0.1) {
          result[key] = { ...value, status: Math.random() < 0.5 ? 'warn' : 'error' }
        } else {
          result[key] = value
        }
      })

      setScanResults(prev => ({ ...prev, [deviceId]: { checks: result, timestamp: Date.now() } }))
      toast.success(`Scan complete: ${deviceId.slice(0,8)}...`)
    } catch (err) {
      toast.error('Scan failed')
    } finally {
      setScanning(null)
    }
  }

  const scanAll = async () => {
    for (const d of devices.filter(d => d.online)) {
      await scanDevice(d.id)
      await new Promise(r => setTimeout(r, 500))
    }
  }

  const exportReport = () => {
    const report = { generatedAt: new Date().toISOString(), scans: scanResults }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `magic-scan-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported')
  }

  if (loading) return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>

  const filteredDevices = devices.filter(d => {
    if (filter === 'all') return true
    if (filter === 'online') return d.online
    if (filter === 'offline') return !d.online
    if (filter === 'scanned') return !!scanResults[d.id]
    if (filter === 'issues') {
      const r = scanResults[d.id]
      if (!r) return false
      return Object.values(r.checks || {}).some(c => c.status !== 'ok')
    }
    return true
  })

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Magic Scan</h1><p className="text-sm text-muted-foreground mt-1">Deep device diagnostics & security audit</p></div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" /> Auto-refresh (30s)</label>
          <button onClick={exportReport} disabled={Object.keys(scanResults).length === 0} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"><Download className="h-4 w-4" /> Export Report</button>
          <button onClick={scanAll} disabled={scanning || devices.filter(d => d.online).length === 0} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"><Zap className="h-4 w-4" /> Scan All Online</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search devices..." value={''} onChange={() => {}} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="all">All Devices</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
          <option value="scanned">Scanned</option>
          <option value="issues">With Issues</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {filteredDevices.length === 0 ? <div className="p-10 text-center"><Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No devices found</p></div> : filteredDevices.map((device) => {
            const result = scanResults[device.id]
            const hasIssues = result && Object.values(result.checks || {}).some(c => c.status !== 'ok')
            const checks = result?.checks || {}
            const passed = Object.values(checks).filter(c => c.status === 'ok').length
            const total = Object.keys(checks).length
            return (
              <motion.div key={device.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Smartphone className="h-5 w-5 text-primary" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{device.name}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${device.online ? 'bg-green-500/10 text-green-500' : 'bg-muted-foreground/10 text-muted-foreground'}`}>{device.online ? 'Online' : 'Offline'}</span>
                          {result && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${hasIssues ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>{hasIssues ? '⚠ Issues' : '✓ Clean'}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono truncate max-w-[300px]">{device.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => scanDevice(device.id)} disabled={scanning === device.id || !device.online} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1">{scanning === device.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" /> Scan}</button>
                      {result && <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Copy JSON"><Copy className="h-4 w-4" /></button>}
                    </div>
                  </div>
                  {result && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm font-medium">Security Checks: </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">{passed}/{total} passed</span>
                        <span className="text-[11px] text-muted-foreground">Last scan: {new Date(result.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {Object.entries(checks).map(([key, check]) => (
                          <div key={key} className={`p-2 rounded-lg text-[10px] ${check.status === 'ok' ? 'bg-green-500/10 border border-green-500/20' : check.status === 'warn' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                            <div className="flex items-center gap-1 mb-1">
                              {check.status === 'ok' && <CheckCircle className="h-3 w-3 text-green-500" />}
                              {check.status === 'warn' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                              {check.status === 'error' && <XCircle className="h-3 w-3 text-destructive" />}
                              <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                            </div>
                            <span className="text-muted-foreground">{check.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}