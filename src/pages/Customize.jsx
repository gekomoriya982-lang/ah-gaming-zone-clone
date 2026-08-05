import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, Save, Image, Zap, Sun, Moon, Monitor, Smartphone, Check, X, Loader2 } from 'lucide-react'
import { usePanel } from '../context/PanelContext'
import { db } from '../context/AuthContext'
import { ref, get, set, update, onValue, off } from 'firebase/database'
import { toast } from 'sonner'

const themes = [
  { id: 'amoled', name: 'AMOLED Black', background: '0 0% 0%', card: '0 0% 4%', secondary: '240 8% 12%', muted: '240 6% 12%', border: '240 6% 14%', popover: '240 6% 9%', sidebar_bg: '240 6% 5%' },
  { id: 'dark_gray', name: 'Dark Gray', background: '0 0% 7%', card: '0 0% 10%', secondary: '0 0% 14%', muted: '0 0% 14%', border: '0 0% 18%', popover: '0 0% 11%', sidebar_bg: '0 0% 8%' },
  { id: 'midnight', name: 'Midnight Blue', background: '230 25% 5%', card: '230 25% 8%', secondary: '230 20% 14%', muted: '230 15% 14%', border: '230 15% 18%', popover: '230 20% 10%', sidebar_bg: '230 25% 6%' },
  { id: 'charcoal', name: 'Charcoal', background: '220 10% 4%', card: '220 10% 8%', secondary: '220 8% 14%', muted: '220 6% 13%', border: '220 8% 17%', popover: '220 10% 10%', sidebar_bg: '220 10% 5%' },
  { id: 'deep_ocean', name: 'Deep Ocean', background: '210 30% 3%', card: '210 28% 7%', secondary: '210 22% 13%', muted: '210 18% 12%', border: '210 18% 16%', popover: '210 25% 9%', sidebar_bg: '210 28% 4%' },
  { id: 'light', name: 'Clean White', background: '0 0% 100%', card: '0 0% 97%', secondary: '0 0% 93%', muted: '0 0% 93%', border: '0 0% 85%', popover: '0 0% 98%', sidebar_bg: '0 0% 96%', foreground: '0 0% 8%', card_foreground: '0 0% 8%', muted_foreground: '0 0% 40%', secondary_foreground: '0 0% 20%', popover_foreground: '0 0% 8%', sidebar_foreground: '0 0% 20%', sidebar_accent_foreground: '0 0% 8%' },
  { id: 'warm_yellow', name: 'Warm Yellow', background: '45 40% 96%', card: '45 35% 92%', secondary: '45 30% 87%', muted: '45 25% 88%', border: '45 20% 80%', popover: '45 35% 94%', sidebar_bg: '45 35% 93%', foreground: '30 20% 12%', card_foreground: '30 20% 12%', muted_foreground: '30 15% 40%', secondary_foreground: '30 18% 20%', popover_foreground: '30 20% 12%', sidebar_foreground: '30 18% 20%', sidebar_accent_foreground: '30 20% 12%' },
  { id: 'forest_green', name: 'Forest Green', background: '150 20% 4%', card: '150 18% 8%', secondary: '150 14% 14%', muted: '150 12% 13%', border: '150 12% 18%', popover: '150 16% 10%', sidebar_bg: '150 18% 5%' },
]

export default function Customize() {
  const { config, loading } = usePanel()
  const [panelName, setPanelName] = useState(config.panel_name || 'AH GAMING ZONE')
  const [bgImageUrl, setBgImageUrl] = useState(config.bg_image_url || '')
  const [accentHex, setAccentHex] = useState(config.accent_hex || '#7c3aed')
  const [gradientFrom, setGradientFrom] = useState(config.gradient_from || '#7c3aed')
  const [gradientTo, setGradientTo] = useState(config.gradient_to || '#ec4899')
  const [gradientEnabled, setGradientEnabled] = useState(config.gradient_enabled || false)
  const [themeMode, setThemeMode] = useState(config.theme_mode || 'amoled')
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')

  const applyTheme = (theme) => {
    const root = document.documentElement
    Object.entries(theme).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'name') {
        root.style.setProperty(`--${key.replace(/_/g, '-')}`, value)
      }
    })
    if (theme.foreground) root.style.setProperty('--foreground', theme.foreground)
    if (theme.card_foreground) root.style.setProperty('--card-foreground', theme.card_foreground)
    if (theme.muted_foreground) root.style.setProperty('--muted-foreground', theme.muted_foreground)
    if (theme.secondary_foreground) root.style.setProperty('--secondary-foreground', theme.secondary_foreground)
    if (theme.popover_foreground) root.style.setProperty('--popover-foreground', theme.popover_foreground)
    if (theme.sidebar_foreground) root.style.setProperty('--sidebar-foreground', theme.sidebar_foreground)
    if (theme.sidebar_accent_foreground) root.style.setProperty('--sidebar-accent-foreground', theme.sidebar_accent_foreground)
    if (theme.sidebar_bg) root.style.setProperty('--sidebar-background', theme.sidebar_bg)
  }

  useEffect(() => {
    const theme = themes.find(t => t.id === themeMode)
    if (theme) applyTheme(theme)
  }, [themeMode])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = {
        panel_name: panelName,
        bg_image_url: bgImageUrl,
        accent_hex: accentHex,
        gradient_from: gradientFrom,
        gradient_to: gradientTo,
        gradient_enabled: gradientEnabled,
        theme_mode: themeMode
      }
      if (db) {
        await update(ref(db, 'panel_customization'), updates)
      }
      toast.success('Customization saved')
    } catch (err) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-foreground">Customize</h1><p className="text-sm text-muted-foreground mt-1">Personalize your panel appearance</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground">General</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Panel Name</label>
                <input type="text" value={panelName} onChange={e => setPanelName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Background Image URL</label>
                <input type="url" value={bgImageUrl} onChange={e => setBgImageUrl(e.target.value)} placeholder="https://example.com/bg.jpg" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground">Colors & Gradient</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Accent Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={accentHex} onChange={e => setAccentHex(e.target.value)} className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                  <input type="text" value={accentHex} onChange={e => setAccentHex(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={gradientEnabled} onChange={e => setGradientEnabled(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm font-medium">Enable Gradient</span>
                </label>
              </div>
              {gradientEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Gradient From</label>
                    <div className="flex items-center gap-4">
                      <input type="color" value={gradientFrom} onChange={e => setGradientFrom(e.target.value)} className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                      <input type="text" value={gradientFrom} onChange={e => setGradientFrom(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Gradient To</label>
                    <div className="flex items-center gap-4">
                      <input type="color" value={gradientTo} onChange={e => setGradientTo(e.target.value)} className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                      <input type="text" value={gradientTo} onChange={e => setGradientTo(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                    </div>
                  </div>
                </div>
              )}
              {gradientEnabled && (
                <div className="h-4 rounded-xl bg-gradient-to-r" style={{ from: gradientFrom, to: gradientTo }} />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground">Theme</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setThemeMode(theme.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${themeMode === theme.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <div className="h-8 w-full rounded-lg mb-2" style={{ background: `hsl(${theme.background})` }} />
                  <p className="text-sm font-medium text-foreground">{theme.name}</p>
                  <p className="text-[10px] text-muted-foreground">{theme.id}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 sticky top-20">
            <h2 className="text-lg font-bold text-foreground">Live Preview</h2>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setPreviewMode('desktop')} className={`px-3 py-1.5 rounded-lg text-sm ${previewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}><Monitor className="h-4 w-4 inline mr-1" /> Desktop</button>
              <button onClick={() => setPreviewMode('mobile')} className={`px-3 py-1.5 rounded-lg text-sm ${previewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}><Smartphone className="h-4 w-4 inline mr-1" /> Mobile</button>
            </div>
            <div className={`rounded-xl border border-border overflow-hidden ${previewMode === 'mobile' ? 'max-w-xs mx-auto' : ''}`}>
              <div className="bg-background min-h-[300px] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Palette className="h-4 w-4 text-primary-foreground" /></div>
                  <span className="font-black text-lg text-foreground">{panelName}</span>
                </div>
                <div className="space-y-3">
                  <div className="h-10 w-full rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">Primary Button</div>
                  <div className="h-10 w-full rounded-xl border border-border bg-secondary/50 flex items-center justify-center text-secondary-foreground text-sm font-medium">Secondary Button</div>
                  <div className="h-10 w-full rounded-xl bg-secondary/30 border border-border flex items-center px-4 text-foreground placeholder:text-muted-foreground" style={{ background: `hsl(var(--secondary))` }}>Input Field</div>
                  <div className="h-24 w-full rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground">Card Component</div>
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving...' : 'Save Customization'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}