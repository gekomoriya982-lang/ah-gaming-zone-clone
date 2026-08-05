import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Calendar, Loader2, Shield, AlertTriangle, MessageSquare, Send, Zap, Crown as CrownIcon } from 'lucide-react'
import { usePanel } from '../context/PanelContext'
import { toast } from 'sonner'

export default function PanelExpired() {
  const { config, updateExpiry, verifyPin, daysRemaining, isExpired } = usePanel()
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [extending, setExtending] = useState(false)
  const [extendDays, setExtendDays] = useState(30)
  const expiryFormatted = config.expiry_date ? new Date(config.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'

  const handleUnlock = () => {
    if (verifyPin(pin.trim())) {
      setUnlocked(true)
      toast.success('Admin unlocked')
    } else {
      toast.error('Wrong admin PIN')
    }
  }

  const handleExtend = async (days) => {
    if (!verifyPin(pin.trim())) { toast.error('Wrong admin PIN'); return }
    setExtending(true)
    try {
      let newExpiry
      if (days === 'life') {
        newExpiry = '2099-12-31'
      } else {
        const base = config.expiry_date ? new Date(config.expiry_date) : new Date()
        base.setDate(base.getDate() + days)
        newExpiry = base.toISOString().split('T')[0]
      }
      await updateExpiry(newExpiry)
      toast.success(days === 'life' ? 'Lifetime unlocked' : `Extended to ${newExpiry}`)
    } catch (err) { toast.error('Failed — check Firebase RTDB access') }
    finally { setExtending(false) }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-destructive/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-primary/6 rounded-full blur-[100px]" />
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 mx-5 w-full max-w-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-3xl border border-destructive/20 bg-card/60 backdrop-blur-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-destructive/60 via-destructive to-destructive/60" />
            <div className="p-6 space-y-5">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                  <Shield className="h-10 w-10 text-destructive" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-xl font-black text-foreground tracking-tight">Panel Expired</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">Hey <span className="font-bold text-foreground">{config.admin_name}</span>, your panel license expired on <span className="font-bold text-destructive">{expiryFormatted}</span>.</p>
              </div>
              <div className="w-full rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Self-host renew</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Admin PIN se yahin se plan laga sakte ho. Default PIN first setup: <span className="font-mono text-foreground">admin123</span></p>
              </div>
              <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Admin PIN" className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm text-center font-mono tracking-widest outline-none focus:border-primary/40" autoFocus />
              <button onClick={handleUnlock} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold">Unlock</button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-destructive/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-primary/6 rounded-full blur-[100px]" />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 mx-5 w-full max-w-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-3xl border border-destructive/20 bg-card/60 backdrop-blur-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-destructive/60 via-destructive to-destructive/60" />
          <div className="p-6 space-y-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                <Shield className="h-10 w-10 text-destructive" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-xl font-black text-foreground tracking-tight">Panel Expired</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">Hey <span className="font-bold text-foreground">{config.admin_name}</span>, your panel license expired on <span className="font-bold text-destructive">{expiryFormatted}</span>.</p>
            </div>
            <div className="w-full rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Self-host renew</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Admin PIN se yahin se plan laga sakte ho. Default PIN first setup: <span className="font-mono text-foreground">admin123</span></p>
            </div>
            <div className="w-full space-y-2">
              <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Admin PIN" className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm text-center font-mono tracking-widest outline-none focus:border-primary/40" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleExtend(30)} disabled={extending} className="py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">{extending ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : '+30 Days'}</button>
                <button onClick={() => handleExtend('life')} disabled={extending} className="py-2.5 rounded-xl bg-secondary border border-border text-xs font-bold disabled:opacity-50">Lifetime</button>
              </div>
            </div>
            <div className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_25px_hsl(var(--primary)/0.25)] hover:scale-[1.02] active:scale-[0.97] transition-all">
              <CrownIcon className="h-4 w-4" />
              Admin Unlock / Extend
            </div>
            <a href={`https://t.me/${config.contact_telegram}`} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border bg-secondary/40 text-sm font-bold text-foreground hover:border-primary/40 transition-colors">
              <MessageSquare className="h-4 w-4 text-primary" />
              Message @{config.contact_telegram} on Telegram
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}