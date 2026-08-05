import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, Link2, Send, Trash2, Eye, Copy, ExternalLink, Plus, X, Check, Loader2 } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, set, remove, update } from 'firebase/database'
import { toast } from 'sonner'

export default function ManageLinks() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newLink, setNewLink] = useState({ deviceId: '', expiresIn: 24 })
  const [creating, setCreating] = useState(false)
  const [devices, setDevices] = useState([])

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const usersRef = ref(db, 'users')
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      const deviceList = Object.entries(data).map(([id, device]) => ({ id, name: `${device.brand} ${device.model}`, online: device.online }))
      setDevices(deviceList)

      const allLinks = []
      Object.entries(data).forEach(([deviceId, device]) => {
        if (device.links) {
          Object.entries(device.links).forEach(([linkId, link]) => {
            allLinks.push({
              id: `${deviceId}_${linkId}`,
              deviceId,
              deviceName: `${device.brand} ${device.model}`,
              linkId,
              url: link.url,
              createdAt: link.createdAt,
              expiresAt: link.expiresAt,
              clicks: link.clicks || 0,
              active: link.active !== false,
              createdAt_formatted: link.createdAt ? new Date(link.createdAt).toLocaleString() : 'Unknown',
              expiresAt_formatted: link.expiresAt ? new Date(link.expiresAt).toLocaleString() : 'Never'
            })
          })
        }
      })
      allLinks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setLinks(allLinks)
      setLoading(false)
    })
    return () => off(usersRef, 'value', unsub)
  }, [])

  const handleCreateLink = async () => {
    if (!newLink.deviceId) { toast.error('Select a device'); return }
    setCreating(true)
    try {
      const linkId = `link_${Date.now()}`
      const expiresAt = Date.now() + (newLink.expiresIn * 60 * 60 * 1000)
      const url = `${window.location.origin}/?link=${linkId}_${deviceId}@temp.darkxpanel.dev`
      await set(ref(db, `users/${newLink.deviceId}/links/${linkId}`), {
        url, createdAt: Date.now(), expiresAt, clicks: 0, active: true
      })
      toast.success('Link created')
      setShowCreate(false)
      setNewLink({ deviceId: '', expiresIn: 24 })
    } catch (err) { toast.error('Failed to create link') }
    finally { setCreating(false) }
  }

  const handleToggleActive = async (link) => {
    const [deviceId, linkId] = link.id.split('_')
    try {
      await update(ref(db, `users/${deviceId}/links/${linkId}`), { active: !link.active })
      toast.success(link.active ? 'Link deactivated' : 'Link activated')
    } catch (err) { toast.error('Failed to update link') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this link?')) return
    const [deviceId, linkId] = id.split('_')
    try { await remove(ref(db, `users/${deviceId}/links/${linkId}`)); toast.success('Link deleted') }
    catch (err) { toast.error('Failed to delete link') }
  }

  if (loading) {
    return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Manage Links</h1><p className="text-sm text-muted-foreground mt-1">{links.length} total links</p></div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="h-4 w-4" /> Create Link</button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {links.length === 0 && !showCreate ? <div className="p-10 text-center"><Link2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No links created yet</p><button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">Create First Link</button></div> : null}
          {links.map((link) => (
            <motion.div key={link.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Link2 className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={link.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary hover:underline truncate block max-w-[300px]">{link.url}</Link>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${link.active ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>{link.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground">
                        <span>{link.deviceName}</span>
                        <span>Clicks: {link.clicks}</span>
                        <span>Created: {link.createdAt_formatted}</span>
                        <span>Expires: {link.expiresAt_formatted}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigator.clipboard.writeText(link.url)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Copy URL"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => handleToggleActive(link)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title={link.active ? 'Deactivate' : 'Activate'}>{link.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}</button>
                    <button onClick={() => handleDelete(link.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Create New Link</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Select Device</label>
                <select value={newLink.deviceId} onChange={e => setNewLink({...newLink, deviceId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Choose device...</option>
                  {devices.map(d => <option key={d.id} value={d.id}>{d.name} {d.online ? '🟢' : '🔴'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Expires In (hours)</label>
                <input type="number" value={newLink.expiresIn} onChange={e => setNewLink({...newLink, expiresIn: parseInt(e.target.value)})} min="1" max="8760" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateLink} disabled={creating} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{creating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Create Link'}</button>
                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}