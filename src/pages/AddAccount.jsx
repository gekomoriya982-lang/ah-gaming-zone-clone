import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, Loader2, Trash2, Eye, Copy, Key, Database, Zap, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, push, set, remove, update } from 'firebase/database'
import { toast } from 'sonner'

export default function AddAccount() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    label: '', projectId: '', apiKey: '', authDomain: '', databaseURL: '',
    storageBucket: '', messagingSenderId: '', appId: '', email: '', password: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const accountsRef = ref(db, 'security_settings/linked_accounts')
    const unsub = onValue(accountsRef, (snapshot) => {
      const data = snapshot.val() || {}
      const list = Object.entries(data).map(([id, acc]) => ({ id, ...acc }))
      setAccounts(list)
      setLoading(false)
    })
    return () => off(accountsRef, 'value', unsub)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.label || !formData.projectId || !formData.apiKey || !formData.databaseURL || !formData.email || !formData.password) {
      toast.error('Fill all required fields'); return
    }
    setSaving(true)
    try {
      if (editingId) {
        await update(ref(db, `security_settings/linked_accounts/${editingId}`), formData)
        toast.success('Account updated')
      } else {
        await push(ref(db, 'security_settings/linked_accounts'), { ...formData, addedAt: new Date().toISOString() })
        toast.success('Account added')
      }
      setShowForm(false)
      resetForm()
    } catch (err) { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleEdit = (acc) => {
    setEditingId(acc.id)
    setFormData({ label: acc.label || '', projectId: acc.projectId || '', apiKey: acc.apiKey || '', authDomain: acc.authDomain || '', databaseURL: acc.databaseURL || '', storageBucket: acc.storageBucket || '', messagingSenderId: acc.messagingSenderId || '', appId: acc.appId || '', email: acc.email || '', password: acc.password || '' })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this account?')) return
    try { await remove(ref(db, `security_settings/linked_accounts/${id}`)); toast.success('Account deleted') }
    catch (err) { toast.error('Failed to delete') }
  }

  const resetForm = () => {
    setFormData({ label: '', projectId: '', apiKey: '', authDomain: '', databaseURL: '', storageBucket: '', messagingSenderId: '', appId: '', email: '', password: '' })
    setEditingId(null)
  }

  if (loading) return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Add Account</h1><p className="text-sm text-muted-foreground mt-1">Manage linked Firebase accounts</p></div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="h-4 w-4" /> Add Account</button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {accounts.length === 0 ? <div className="p-10 text-center"><Database className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground">No linked accounts</p><button onClick={() => { resetForm(); setShowForm(true) }} className="mt-4 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">Add First Account</button></div> : accounts.map(acc => (
            <motion.div key={acc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Database className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="font-semibold text-foreground">{acc.label}</p>
                      <p className="text-sm text-muted-foreground font-mono truncate max-w-[300px]">{acc.projectId}</p>
                      <p className="text-[11px] text-muted-foreground">{acc.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(acc)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => navigator.clipboard.writeText(acc.password)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Copy Password"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(acc.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-xl">
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Account' : 'Add Firebase Account'}</h2>
              <button onClick={() => { setShowForm(false); resetForm() }} className="p-2 rounded-lg hover:bg-secondary"><XCircle className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Label *</label><input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="My Firebase Project" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
                <div><label className="text-sm font-medium block mb-1">Project ID *</label><input type="text" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} placeholder="my-project" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
                <div><label className="text-sm font-medium block mb-1">API Key *</label><input type="password" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} placeholder="AIza..." className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
                <div><label className="text-sm font-medium block mb-1">Auth Domain *</label><input type="text" value={formData.authDomain} onChange={e => setFormData({...formData, authDomain: e.target.value})} placeholder="my-project.firebaseapp.com" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
                <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Database URL *</label><input type="url" value={formData.databaseURL} onChange={e => setFormData({...formData, databaseURL: e.target.value})} placeholder="https://my-project-default-rtdb.firebaseio.com" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
                <div><label className="text-sm font-medium block mb-1">Storage Bucket</label><input type="text" value={formData.storageBucket} onChange={e => setFormData({...formData, storageBucket: e.target.value})} placeholder="my-project.appspot.com" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                <div><label className="text-sm font-medium block mb-1">Messaging Sender ID</label><input type="text" value={formData.messagingSenderId} onChange={e => setFormData({...formData, messagingSenderId: e.target.value})} placeholder="123456789" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">App ID</label><input type="text" value={formData.appId} onChange={e => setFormData({...formData, appId: e.target.value})} placeholder="1:123456789:web:abc123" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                <div><label className="text-sm font-medium block mb-1">Email *</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="admin@example.com" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
                <div><label className="text-sm font-medium block mb-1">Password *</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : editingId ? 'Update Account' : 'Add Account'}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary transition-colors">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}