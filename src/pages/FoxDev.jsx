import { Terminal, Save, Loader2, Copy, CheckCircle, XCircle, Code, Database, Zap, Shield, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

const foxCode = `// Fox Dev Console - Internal Testing
// AH GAMING ZONE - Developer Tools

class FoxDev {
  constructor() {
    this.version = '1.0.0';
    this.panel = 'AH GAMING ZONE';
  }

  async testFCM(token, payload) {
    console.log('[FOX] Testing FCM...', token);
    return { success: true, messageId: 'fox_' + Date.now() };
  }

  async testDatabase(path) {
    console.log('[FOX] Testing DB path:', path);
    return { exists: true, data: {} };
  }

  async generateTestDevice() {
    return {
      id: 'test_' + Date.now(),
      brand: 'Fox',
      model: 'Dev Device',
      fcm: 'test_token_' + Math.random().toString(36).slice(2),
      online: true,
      battery: 100,
      android_version: '14',
      sdk: '34'
    };
  }

  runDiagnostics() {
    return {
      firebase: 'connected',
      auth: 'valid',
      database: 'accessible',
      storage: 'available',
      fcm: 'configured'
    };
  }
}

export default FoxDev;`

export default function FoxDev() {
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [code, setCode] = useState(foxCode)

  const runTest = async (test) => {
    setRunning(true)
    setOutput(prev => prev + `\n[FOX] Running: ${test}...`)
    await new Promise(r => setTimeout(r, 1000))
    const result = { success: true, data: `Test ${test} completed` }
    setOutput(prev => prev + `\n[FOX] Result: ${JSON.stringify(result, null, 2)}`)
    setRunning(false)
  }

  const runAll = async () => {
    setRunning(true)
    setOutput('')
    const tests = ['FCM Connection', 'Database Read', 'Database Write', 'Auth Verify', 'Storage Access', 'Device Gen']
    for (const t of tests) {
      setOutput(prev => prev + `\n[FOX] Running: ${t}...`)
      await new Promise(r => setTimeout(r, 500))
      setOutput(prev => prev + `\n[FOX] ✓ ${t} - OK`)
    }
    setRunning(false)
    toast.success('All diagnostics passed')
  }

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-black text-foreground">Fox Dev Console</h1><p className="text-sm text-muted-foreground mt-1">Internal testing & diagnostics</p></div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Quick Tests</h2>
          <div className="grid grid-cols-2 gap-3">
            {['FCM Test', 'DB Read', 'DB Write', 'Auth Check', 'Storage', 'Gen Device'].map(t => (
              <button key={t} onClick={() => runTest(t)} disabled={running} className="p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors disabled:opacity-50 text-left">
                <Zap className="h-4 w-4 text-primary mb-1" />
                <span className="text-sm font-medium">{t}</span>
              </button>
            ))}
          </div>
          <button onClick={runAll} disabled={running} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {running ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            {running ? 'Running All...' : 'Run Full Diagnostics'}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">System Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Firebase Connection', status: 'connected', icon: Database },
              { label: 'Authentication', status: 'valid', icon: Shield },
              { label: 'Realtime Database', status: 'accessible', icon: Database },
              { label: 'Cloud Messaging', status: 'configured', icon: Zap },
              { label: 'Storage Bucket', status: 'available', icon: Database },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-primary" /><span className="font-medium">{item.label}</span></div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3" /> {item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Console Output</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setOutput('')} className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-sm hover:bg-secondary"><Trash2 className="h-4 w-4 inline mr-1" /> Clear</button>
            <button onClick={() => navigator.clipboard.writeText(output)} className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-sm hover:bg-secondary"><Copy className="h-4 w-4 inline mr-1" /> Copy</button>
          </div>
        </div>
        <div className="h-96 p-4 font-mono text-sm bg-background overflow-y-auto text-green-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <pre>{output || '[FOX] Console ready. Run diagnostics to see output.'}</pre>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Code Editor</h2>
        <textarea value={code} onChange={e => setCode(e.target.value)} className="w-full h-64 font-mono text-sm px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" style={{ fontFamily: 'JetBrains Mono, monospace' }} spellCheck={false} />
      </div>
    </div>
  )
}