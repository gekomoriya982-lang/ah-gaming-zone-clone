import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Settings, Save, Shield, Bell, Globe, Palette, Database, Key, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePanel } from '../context/PanelContext'
import { db } from '../context/AuthContext'
import { ref, get, set, update, onValue, off } from 'firebase/database'
import { toast } from 'sonner'

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'firebase', label: 'Firebase', icon: Database },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function Settings() {
  const { user } = useAuth()
  const { config, updateContact, updateAdminPin, updatePlans, verifyPin } = usePanel()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [telegram, setTelegram] = useState(config.contact_telegram || '')
  const [note, setNote] = useState(config.contact_note || '')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [plans, setPlans] = useState(config.plans || [])
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '', authDomain: '', databaseURL: '', projectId: '',
    storageBucket: '', messagingSenderId: '', appId: ''
  })

  useEffect(() => { setTelegram(config.contact_telegram || '') }, [config.contact_telegram])
  useEffect(() => { setNote(config.contact_note || '') }, [config.contact_note])
  useEffect(() => { setPlans(config.plans || []) }, [config.plans])

  const handleSaveContact = async () => {
    setSaving(true)
    try { await updateContact(telegram, note); toast.success('Contact saved') }
    catch (err) { toast.error('Failed to save contact') }
    finally { setSaving(false) }
  }

  const handleUpdatePin = async () => {
    if (newPin.length < 4) { setPinError('PIN must be at least 4 characters'); return }
    if (newPin !== confirmPin) { setPinError('PINs do not match'); return }
    setPinError('')
    setSaving(true)
    try { await updateAdminPin(newPin); toast.success('Admin PIN updated'); setNewPin(''); setConfirmPin('') }
    catch (err) { toast.error('Failed to update PIN') }
    finally { setSaving(false) }
  }

  const handleSavePlans = async () => {
    setSaving(true)
    try { await updatePlans(plans); toast.success('Plans saved') }
    catch (err) { toast.error('Failed to save plans') }
    finally { setSaving(false) }
  }

  const addPlan = () => {
    setPlans(prev => [...prev, { id: `plan_${Date.now()}`, name: 'New Plan', days: 30, price: 0, description: '' }])
  }

  const removePlan = (id) => {
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Settings</h1><p className="text-sm text-muted-foreground mt-1">Manage panel configuration</p></div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-48 flex-shrink-0">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <nav className="p-2 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-2xl border border-border bg-card overflow-hidden p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Telegram Contact</label>
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Used for admin notifications and support link</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Contact Note</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Additional contact information..."
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button onClick={handleSaveContact} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">Security Settings</h2>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">Current Admin PIN</p>
                        <p className="text-sm text-muted-foreground">{config.admin_pin ? 'Custom PIN set' : 'Default: admin123'}</p>
                      </div>
                      <Shield className="h-8 w-8 text-primary/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">New PIN</label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={(e) => { setNewPin(e.target.value); setPinError('') }}
                        placeholder="Min 4 characters"
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Confirm PIN</label>
                      <input
                        type="password"
                        value={confirmPin}
                        onChange={(e) => { setConfirmPin(e.target.value); setPinError('') }}
                        placeholder="Confirm new PIN"
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  {pinError && <p className="text-sm text-destructive">{pinError}</p>}
                  <button onClick={handleUpdatePin} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {saving ? 'Updating...' : 'Update PIN'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">Notification Settings</h2>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground">Notification settings are managed via Firebase. Configure telegram_settings, notification_settings, and tg_bot in the Firebase console.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'firebase' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">Firebase Configuration</h2>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-4">Set these via environment variables (VITE_FIREBASE_*) or Netlify environment variables.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium text-foreground block mb-1">API Key</label><input type="password" value={firebaseConfig.apiKey} onChange={e => setFirebaseConfig({...firebaseConfig, apiKey: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                      <div><label className="text-sm font-medium text-foreground block mb-1">Auth Domain</label><input type="text" value={firebaseConfig.authDomain} onChange={e => setFirebaseConfig({...firebaseConfig, authDomain: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                      <div><label className="text-sm font-medium text-foreground block mb-1">Database URL</label><input type="text" value={firebaseConfig.databaseURL} onChange={e => setFirebaseConfig({...firebaseConfig, databaseURL: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                      <div><label className="text-sm font-medium text-foreground block mb-1">Project ID</label><input type="text" value={firebaseConfig.projectId} onChange={e => setFirebaseConfig({...firebaseConfig, projectId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                      <div><label className="text-sm font-medium text-foreground block mb-1">Storage Bucket</label><input type="text" value={firebaseConfig.storageBucket} onChange={e => setFirebaseConfig({...firebaseConfig, storageBucket: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                      <div><label className="text-sm font-medium text-foreground block mb-1">Messaging Sender ID</label><input type="text" value={firebaseConfig.messagingSenderId} onChange={e => setFirebaseConfig({...firebaseConfig, messagingSenderId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                      <div><label className="text-sm font-medium text-foreground block mb-1">App ID</label><input type="text" value={firebaseConfig.appId} onChange={e => setFirebaseConfig({...firebaseConfig, appId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">Appearance</h2>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground">Theme customization is available in the Customize page.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}