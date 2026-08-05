import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Save, Calendar, MessageSquare, Lock, Plus, Trash2, Copy, ExternalLink, Loader2, Crown, Star, Zap, Database, Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react'
import { usePanel } from '../context/PanelContext'
import { db } from '../context/AuthContext'
import { ref, get, set, update, push, remove } from 'firebase/database'
import { toast } from 'sonner'

const defaultPlans = [
  { id: 'monthly', name: '1 Month', days: 30, price: 250, description: '30 days full access' },
  { id: 'lifetime', name: 'Lifetime', days: 36500, price: 999, description: 'Unlimited forever access' }
]

export default function AdminCentral() {
  const { config, verifyPin, updateExpiry, updateAdminPin, updateContact, updatePlans, isExpired, daysRemaining, config: panelConfig } = usePanel()
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [activeTab, setActiveTab] = useState('plans')
  const [saving, setSaving] = useState(false)
  const [telegram, setTelegram] = useState(config.contact_telegram || 'Zone8095')
  const [note, setNote] = useState(config.contact_note || '')
  const [expiryDate, setExpiryDate] = useState(config.expiry_date || '')
  const [newPin, setNewPin] = useState('')
  const [plans, setPlans] = useState(config.plans || defaultPlans)
  const [showChecklist, setShowChecklist] = useState(false)

  const handleUnlock = () => {
    if (verifyPin(pin.trim())) {
      setUnlocked(true)
      toast.success('Admin Central unlocked')
    } else {
      toast.error('Wrong admin PIN')
    }
  }

  const handleApplyPlan = async (plan) => {
    setSaving(true)
    try {
      if (plan.days >= 10000) {
        await updateExpiry('2099-12-31')
        toast.success(`${plan.name} applied · Lifetime`)
      } else {
        const newDate = new Date()
        newDate.setDate(newDate.getDate() + plan.days)
        const expiryStr = newDate.toISOString().split('T')[0]
        await updateExpiry(expiryStr)
        toast.success(`${plan.name} applied · expires ${expiryStr}`)
      }
    } catch (err) { toast.error('Failed to apply plan') }
    finally { setSaving(false) }
  }

  const handleSetExpiry = async () => {
    if (!expiryDate) { toast.error('Pick a date'); return }
    setSaving(true)
    try { await updateExpiry(expiryDate); toast.success(`Expiry set to ${expiryDate}`) }
    catch (err) { toast.error('Failed to save expiry') }
    finally { setSaving(false) }
  }

  const handleSaveContact = async () => {
    setSaving(true)
    try { await updateContact(telegram, note); toast.success('Contact saved') }
    catch (err) { toast.error('Failed to save contact') }
    finally { setSaving(false) }
  }

  const handleUpdatePin = async () => {
    if (newPin.trim().length < 4) { toast.error('PIN min 4 chars'); return }
    setSaving(true)
    try { await updateAdminPin(newPin.trim()); toast.success('Admin PIN updated'); setNewPin('') }
    catch (err) { toast.error('Failed to update PIN') }
    finally { setSaving(false) }
  }

  const handleSavePlans = async () => {
    setSaving(true)
    try { await updatePlans(plans); toast.success('Plans saved') }
    catch (err) { toast.error('Failed to save plans') }
    finally { setSaving(false) }
  }

  const addPlan = () => setPlans(p => [...p, { id: `plan_${Date.now()}`, name: 'New Plan', days: 30, price: 0, description: '' }])
  const removePlan = (id) => setPlans(p => p.filter(x => x.id !== id))

  const checklist = `1. Naya Firebase project banao + Realtime Database ON
2. Project settings → Web app add → pehle k values copy
3. Project settings → Service accounts → Generate new private key (JSON)
4. Netlify pe naya site / same repo → Environment variables set karo (dekh neeche)
5. Deploy → Panel pe pehli baar Admin name + expiry setup
6. APK alag project ke liye naya google-services.json + rebuild`

  const envVars = `VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=YOUR.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://YOUR-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=YOUR
VITE_FIREBASE_STORAGE_BUCKET=YOUR.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
VITE_FIREBASE_SA_JSON={"type":"service_account",...full json...}`

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm rounded-3xl border border-primary/20 bg-card/60 backdrop-blur-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="h-9 w-9 rounded-xl bg-secondary/60 flex items-center justify-center"><Shield className="h-4 w-4" /></button>
            <div><h1 className="text-base font-black text-foreground">Admin Central</h1><p className="text-[10px] text-muted-foreground">PIN required · default first time: admin123</p></div>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto"><Shield className="h-7 w-7 text-primary" /></div>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUnlock()} placeholder="Admin PIN" className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm text-center font-mono tracking-widest outline-none focus:border-primary/40" autoFocus />
          <button onClick={handleUnlock} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold">Unlock</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Admin Central</h1><p className="text-sm text-muted-foreground mt-1">Panel management & configuration</p></div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-48 flex-shrink-0">
          <div className="rounded-2xl border border-border bg-card overflow-hidden sticky top-20">
            <nav className="p-2 space-y-1">
              {['plans', 'expiry', 'contact', 'security', 'clone'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                  {tab === 'plans' && <Crown className="h-5 w-5" />}
                  {tab === 'expiry' && <Calendar className="h-5 w-5" />}
                  {tab === 'contact' && <MessageSquare className="h-5 w-5" />}
                  {tab === 'security' && <Lock className="h-5 w-5" />}
                  {tab === 'clone' && <Database className="h-5 w-5" />}
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'plans' && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground">Subscription Plans</h2>
              <p className="text-sm text-muted-foreground">Manage available plans for panel subscriptions</p>
              <div className="space-y-3">
                {plans.map((plan, i) => (
                  <div key={plan.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">{plan.days >= 10000 ? <Crown className="h-5 w-5 text-yellow-500" /> : <Star className="h-5 w-5 text-primary" />}</div>
                        <div><input value={plan.name} onChange={e => setPlans(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className="font-bold text-foreground bg-transparent border-none focus:outline-none" /></div>
                      </div>
                      <button onClick={() => removePlan(plan.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div><label className="text-[10px] text-muted-foreground block mb-1">Days</label><input type="number" value={plan.days} onChange={e => setPlans(p => p.map((x, j) => j === i ? { ...x, days: parseInt(e.target.value) || 0 } : x))} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm" /></div>
                      <div><label className="text-[10px] text-muted-foreground block mb-1">Price (₹)</label><input type="number" value={plan.price} onChange={e => setPlans(p => p.map((x, j) => j === i ? { ...x, price: parseInt(e.target.value) || 0 } : x))} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm" /></div>
                      <div className="md:col-span-2"><label className="text-[10px] text-muted-foreground block mb-1">Description</label><input value={plan.description} onChange={e => setPlans(p => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm" /></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={addPlan} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Add Plan</button>
                <button onClick={handleSavePlans} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Plans'}</button>
              </div>
            </div>
          )}

          {activeTab === 'expiry' && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground">Panel Expiry</h2>
              <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                <p className="text-sm font-bold text-foreground">Current Status</p>
                <div className="flex items-center gap-4 mt-2">
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-destructive/10 text-destructive"><AlertTriangle className="h-4 w-4" /> Expired</span>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-green-500/10 text-green-500"><CheckCircle className="h-4 w-4" /> Active</span>
                      {daysRemaining !== null && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-yellow-500/10 text-yellow-500"><Crown className="h-3 w-3" /> {daysRemaining} days left</span>}
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Set Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <button onClick={handleSetExpiry} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Set Expiry'}</button>
              </div>
              <div className="flex gap-3">
                {defaultPlans.map(plan => (
                  <button key={plan.id} onClick={() => handleApplyPlan(plan)} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2">{plan.days >= 10000 ? <Crown className="h-4 w-4 text-yellow-500" /> : <Star className="h-4 w-4" />} {plan.name}</button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground">Contact & Support</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Telegram Username</label>
                  <input type="text" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Contact Note</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Additional contact information..." className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <button onClick={handleSaveContact} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Contact'}</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground">Change Admin PIN</h2>
              <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                <p className="text-sm font-bold text-foreground">Current PIN</p>
                <p className="font-mono text-foreground mt-1">{config.admin_pin ? 'Custom PIN set' : 'Default: admin123'}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">New PIN (min 4 chars)</label>
                  <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="Enter new PIN" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                </div>
                <button onClick={handleUpdatePin} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Updating...' : 'Update PIN'}</button>
              </div>
            </div>
          )}

          {activeTab === 'clone' && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground">Clone → Deploy New Instance</h2>
              <p className="text-sm text-muted-foreground">Same panel code, different Firebase + Netlify site. Set env vars and deploy — no source code changes needed.</p>
              <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-3 text-sm font-mono">
                <p className="font-bold">Netlify Environment Variables:</p>
                <pre className="whitespace-pre-wrap text-[10px] bg-background/80 p-3 rounded-lg overflow-x-auto">{envVars}</pre>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-3 text-sm font-mono">
                <p className="font-bold">Deployment Checklist:</p>
                <pre className="whitespace-pre-wrap text-[10px] bg-background/80 p-3 rounded-lg overflow-x-auto">{checklist}</pre>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigator.clipboard.writeText(envVars)} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"><Copy className="h-4 w-4" /> Copy Env Vars</button>
                <button onClick={() => navigator.clipboard.writeText(checklist)} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"><Copy className="h-4 w-4" /> Copy Checklist</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}