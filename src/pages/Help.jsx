import { useState } from 'react'
import { HelpCircle, Mail, MessageSquare, BookOpen, Shield, AlertTriangle, CheckCircle, ChevronRight, Github, Twitter, ExternalLink, Zap, Smartphone, Database, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

const faqs = [
  { q: 'How do I set up the panel for the first time?', a: 'Visit the panel URL. If not configured, you\'ll see the Panel Setup page. Enter your admin name and select an expiry date. The default admin PIN will be "admin123" — change it immediately in Admin Central > Security.' },
  { q: 'What are the default credentials?', a: 'Default admin PIN: admin123. There is no default email/password — you configure the admin name and expiry on first setup. Firebase credentials must be set via environment variables.' },
  { q: 'How do I connect an Android device?', a: 'Build the APK with your google-services.json and the panel\'s Firebase config. Install on target device. The device will register automatically via FCM and appear in the Devices page.' },
  { q: 'Why is my device showing offline?', a: 'Device may have no internet, FCM token expired, or app killed by battery optimization. Check device logs and ensure autostart permissions are granted.' },
  { q: 'How do I send bulk SMS?', a: 'Go to Bulk SMS page. Add recipients (one per line: number,var1,var2...). Write message using {{1}}, {{2}} for variables. Set SMS per device limit. Click Send.' },
  { q: 'What data can I export?', a: 'Export Data page allows full backup (JSON) of all devices, forms, SMS, calls, sessions, and config. Individual exports available for devices, forms, and SMS.' },
  { q: 'How do I clone the panel to another Firebase project?', a: 'Admin Central > Clone tab shows the checklist and environment variables. Create new Firebase project, set env vars on Netlify, deploy. No code changes needed.' },
  { q: 'Is this legal to use?', a: 'This software is for authorized security testing and education only. Unauthorized access to devices or data is illegal. Always obtain written permission before testing.' },
]

const docs = [
  { title: 'Getting Started', href: '#', desc: 'Initial panel setup and configuration' },
  { title: 'Device Management', href: '#', desc: 'Adding, monitoring, and managing devices' },
  { title: 'Commands Reference', href: '#', desc: 'Available device commands and parameters' },
  { title: 'Firebase Setup', href: '#', desc: 'Configuring Firebase projects and rules' },
  { title: 'APK Building', href: '#', desc: 'Building and signing Android APKs' },
  { title: 'Security Best Practices', href: '#', desc: 'Securing your panel and data' },
]

export default function Help() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="p-5 space-y-8 max-w-4xl">
      <div><h1 className="text-2xl font-black text-foreground">Help & Documentation</h1><p className="text-sm text-muted-foreground mt-1">Find answers and learn how to use the panel</p></div>

      <div className="grid md:grid-cols-3 gap-4">
        <a href="https://t.me/Zone8095" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all group">
          <MessageSquare className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-foreground mb-1">Telegram Support</h3>
          <p className="text-sm text-muted-foreground">Contact @Zone8095 for direct support</p>
        </a>
        <a href="#" className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all group">
          <Github className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-foreground mb-1">GitHub Repository</h3>
          <p className="text-sm text-muted-foreground">Source code and issue tracker</p>
        </a>
        <a href="#" className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all group">
          <BookOpen className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-foreground mb-1">Documentation</h3>
          <p className="text-sm text-muted-foreground">Full guides and API reference</p>
        </a>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2></div>
        <div className="divide-y divide-border/50">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 text-left flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <span className="font-medium text-foreground pr-4">{faq.q}</span>
                <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-6 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Documentation</h2></div>
        <div className="divide-y divide-border/50">
          {docs.map((doc, i) => (
            <a key={i} href={doc.href} className="p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between">
              <div><p className="font-medium text-foreground">{doc.title}</p><p className="text-sm text-muted-foreground">{doc.desc}</p></div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-destructive" /> Legal Notice</h2>
        <p className="text-sm text-muted-foreground mt-2">This panel is for authorized security research and educational purposes only. Unauthorized access to devices, data interception, or any malicious activity violates laws including but not limited to the Computer Fraud and Abuse Act (CFAA), GDPR, and local cybercrime statutes. The developers assume no liability for misuse. Always obtain explicit written authorization before testing.</p>
      </div>
    </div>
  )
}