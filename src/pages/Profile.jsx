import { useState } from 'react'
import { User, Save, Loader2, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePanel } from '../context/PanelContext'
import { toast } from 'sonner'

export default function Profile() {
  const { user } = useAuth()
  const { config, updateContact, updateAdminPin } = usePanel()
  const [showPin, setShowPin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(config.admin_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [telegram, setTelegram] = useState(config.contact_telegram || '')
  const [note, setNote] = useState(config.contact_note || '')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // In a real app, you'd update the user profile in Firebase Auth
      toast.success('Profile saved (UI only)')
    } catch (err) { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleSaveContact = async () => {
    setSaving(true)
    try { await updateContact(telegram, note); toast.success('Contact saved') }
    catch (err) { toast.error('Failed to save contact') }
    finally { setSaving(false) }
  }

  const handleUpdatePin = async () => {
    if (newPin.length < 4) { toast.error('PIN min 4 chars'); return }
    if (newPin !== confirmPin) { toast.error('PINs do not match'); return }
    setSaving(true)
    try { await updateAdminPin(newPin); toast.success('Admin PIN updated'); setNewPin(''); setConfirmPin('') }
    catch (err) { toast.error('Failed to update PIN') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-5 space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-black text-foreground">Profile</h1><p className="text-sm text-muted-foreground mt-1">Manage your account settings</p></div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-bold text-foreground">Account Info</h2>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black">{name?.charAt(0)?.toUpperCase() || 'A'}</div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{name || 'Admin'}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
            <p className="text-sm text-primary mt-1">Panel Administrator</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-foreground block mb-1">Display Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium text-foreground block mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border" /></div>
        </div>
        <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-bold text-foreground">Contact Settings</h2>
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-foreground block mb-1">Telegram Username</label><input type="text" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium text-foreground block mb-1">Contact Note</label><textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Additional info..." className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <button onClick={handleSaveContact} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Contact'}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-bold text-foreground">Security</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
            <p className="text-sm font-bold text-foreground">Current Admin PIN</p>
            <p className="font-mono text-foreground mt-1">{config.admin_pin ? 'Custom PIN set' : 'Default: admin123'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-foreground block mb-1">New PIN</label><input type={showPin ? 'text' : 'password'} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="Min 4 chars" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" /></div>
            <div><label className="text-sm font-medium text-foreground block mb-1">Confirm PIN</label><input type={showPin ? 'text' : 'password'} value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Confirm" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" /></div>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={showPin} onChange={e => setShowPin(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" /><span className="text-sm">Show PIN</span></label>
          <button onClick={handleUpdatePin} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Updating...' : 'Update PIN'}</button>
        </div>
      </div>
    </div>
  )
}