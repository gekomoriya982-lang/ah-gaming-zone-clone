import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, XCircle, Eye, Trash2, Database, Key, Copy } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, update, remove } from 'firebase/database'
import { toast } from 'sonner'

export default function EditAccount() {
  const { accountId } = useParams()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    label: '', projectId: '', apiKey: '', authDomain: '', databaseURL: '',
    storageBucket: '', messagingSenderId: '', appId: '', email: '', password: ''
  })

  useEffect(() => {
    if (!db || !accountId) { setLoading(false); return }
    const accountRef = ref(db, `security_settings/linked_accounts/${accountId}`)
    const unsub = onValue(accountRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setAccount(data)
        setFormData({
          label: data.label || '', projectId: data.projectId || '', apiKey: data.apiKey || '',
          authDomain: data.authDomain || '', databaseURL: data.databaseURL || '',
          storageBucket: data.storageBucket || '', messagingSenderId: data.messagingSenderId || '',
          appId: data.appId || '', email: data.email || '', password: data.password || ''
        })
      } else {
        setAccount(null)
      }
      setLoading(false)
    })
    return () => off(accountRef, 'value', unsub)
  }, [accountId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accountId) return
    setSaving(true)
    try {
      await update(ref(db, `security_settings/linked_accounts/${accountId}`), formData)
      toast.success('Account updated')
    } catch (err) { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this account?')) return
    if (!accountId) return
    try { await remove(ref(db, `security_settings/linked_accounts/${accountId}`)); toast.success('Account deleted'); window.history.back() }
    catch (err) { toast.error('Failed to delete') }
  }

  if (loading) return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  if (!account) return <div className="p-5 text-center"><h2 className="text-lg font-bold">Account Not Found</h2></div>

  return (
    <div className="p-5 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Edit Account</h1><p className="text-sm text-muted-foreground mt-1">{account.label}</p></div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Label *</label><input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
            <div><label className="text-sm font-medium block mb-1">Project ID *</label><input type="text" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
            <div><label className="text-sm font-medium block mb-1">API Key *</label><input type={showPassword ? 'text' : 'password'} value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
            <div><label className="text-sm font-medium block mb-1">Auth Domain *</label><input type="text" value={formData.authDomain} onChange={e => setFormData({...formData, authDomain: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Database URL *</label><input type="url" value={formData.databaseURL} onChange={e => setFormData({...formData, databaseURL: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
            <div><label className="text-sm font-medium block mb-1">Storage Bucket</label><input type="text" value={formData.storageBucket} onChange={e => setFormData({...formData, storageBucket: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="text-sm font-medium block mb-1">Messaging Sender ID</label><input type="text" value={formData.messagingSenderId} onChange={e => setFormData({...formData, messagingSenderId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">App ID</label><input type="text" value={formData.appId} onChange={e => setFormData({...formData, appId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="text-sm font-medium block mb-1">Email *</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
            <div>
              <label className="text-sm font-medium block mb-1">Password *</label>
              <div className="flex gap-2">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors">{showPassword ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save Changes'}</button>
            <button type="button" onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors">Delete Account</button>
          </div>
        </form>
      </div>
    </div>
  )
}