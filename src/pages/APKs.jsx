import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileBox, Download, Upload, Loader2, Trash2, Settings, Code, CheckCircle, XCircle, AlertTriangle, Hash, Copy } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, push, remove, set } from 'firebase/database'
import { toast } from 'sonner'

export default function APKs() {
  const [apks, setApks] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [formData, setFormData] = useState({
    version: '', versionCode: 1, changelog: '', file: null
  })

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const apksRef = ref(db, 'apks')
    const unsub = onValue(apksRef, (snapshot) => {
      const data = snapshot.val() || {}
      const list = Object.entries(data).map(([id, apk]) => ({ id, ...apk })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setApks(list)
      setLoading(false)
    })
    return () => off(apksRef, 'value', unsub)
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setFormData(prev => ({ ...prev, file }))
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!formData.file) { toast.error('Select APK file'); return }
    if (!formData.version) { toast.error('Enter version'); return }
    setUploading(true)
    try {
      const file = formData.file
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1]
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(base64))
        const hashArray = Array.from(new Uint8Array(hash))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        
        await push(ref(db, 'apks'), {
          version: formData.version,
          versionCode: formData.versionCode,
          changelog: formData.changelog,
          fileName: file.name,
          fileSize: file.size,
          hash: hashHex,
          base64: base64,
          createdAt: Date.now()
        })
        toast.success('APK uploaded')
        setShowUpload(false)
        setFormData({ version: '', versionCode: 1, changelog: '', file: null })
      }
      reader.readAsDataURL(file)
    } catch (err) { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this APK?')) return
    try { await remove(ref(db, `apks/${id}`)); toast.success('APK deleted') }
    catch (err) { toast.error('Failed to delete') }
  }

  const downloadAPK = (apk) => {
    if (!apk.base64) { toast.error('No file data'); return }
    const byteCharacters = atob(apk.base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i)
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/vnd.android.package-archive' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = apk.fileName || `apk-${apk.version}.apk`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started')
  }

  if (loading) return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">APK Management</h1><p className="text-sm text-muted-foreground mt-1">{apks.length} APKs stored</p></div>
        <button onClick={() => setShowUpload(true)} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Upload className="h-4 w-4" /> Upload APK</button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {apks.length === 0 ? <div className="p-10 text-center"><FileBox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No APKs uploaded</p><button onClick={() => setShowUpload(true)} className="mt-4 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">Upload First APK</button></div> : apks.map(apk => (
            <motion.div key={apk.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileBox className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{apk.fileName || `APK v${apk.version}`}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">v{apk.version}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/50 text-muted-foreground">Code: {apk.versionCode}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Size: {(apk.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(apk.createdAt).toLocaleString()}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">SHA256: {apk.hash?.slice(0, 16)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => downloadAPK(apk)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Download"><Download className="h-4 w-4" /></button>
                    <button onClick={() => navigator.clipboard.writeText(apk.hash)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Copy Hash"><Hash className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(apk.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                {apk.changelog && <div className="px-4 pb-4 border-t border-border/50"><p className="text-sm text-muted-foreground">{apk.changelog}</p></div>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Upload APK</h2>
              <button onClick={() => setShowUpload(false)} className="p-2 rounded-lg hover:bg-secondary"><XCircle className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div><label className="text-sm font-medium block mb-1">Version *</label><input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} placeholder="1.0.0" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
              <div><label className="text-sm font-medium block mb-1">Version Code *</label><input type="number" value={formData.versionCode} onChange={e => setFormData({...formData, versionCode: parseInt(e.target.value)})} min="1" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
              <div><label className="text-sm font-medium block mb-1">Changelog</label><textarea value={formData.changelog} onChange={e => setFormData({...formData, changelog: e.target.value})} rows={3} placeholder="What's new?" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <div><label className="text-sm font-medium block mb-1">APK File *</label><input type="file" accept=".apk" onChange={handleFileChange} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{uploading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Upload APK'}</button>
                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary transition-colors">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}