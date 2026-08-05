import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, Users, Shield, Zap, Globe, Code, Heart, Mail, Twitter, Github, ExternalLink } from 'lucide-react'

const team = [
  { name: 'Zone8095', role: 'Founder & Lead Developer', bio: 'Full-stack developer with expertise in React, Firebase, and Android security research.', avatar: 'Z' },
  { name: 'AH Gaming Team', role: 'Security Researchers', bio: 'Specialized in mobile application security, reverse engineering, and C2 infrastructure.', avatar: 'AH' },
]

export default function About() {
  return (
    <div className="p-5 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-foreground">About AH GAMING ZONE</h1>
        <p className="text-sm text-muted-foreground mt-1">Advanced Android RAT Panel - Research & Educational Purpose</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Project Overview</h2>
        <div className="prose text-muted-foreground space-y-3">
          <p>AH GAMING ZONE is a comprehensive Android Remote Administration Tool (RAT) command and control panel built for security research and educational purposes. The panel provides real-time management of connected Android devices through Firebase Cloud Messaging (FCM) and Realtime Database.</p>
          <p><strong>Key Features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Real-time device monitoring and management</li>
            <li>SMS interception and sending capabilities</li>
            <li>Call log access and monitoring</li>
            <li>Phishing form capture (credentials, OTPs, card details)</li>
            <li>Contact and SMS forwarding</li>
            <li>Bulk SMS broadcasting</li>
            <li>Telegram bot integration for notifications</li>
            <li>Multi-account Firebase project support</li>
            <li>Customizable themes and branding</li>
            <li>APK building and distribution pipeline</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Technology Stack</h2>
        <div className="flex flex-wrap gap-3">
          {['React 18', 'Firebase Auth', 'Firebase RTDB', 'Firebase FCM', 'Firebase Storage', 'Tailwind CSS', 'Framer Motion', 'Radix UI', 'Vite', 'Netlify'].map(tech => (
            <span key={tech} className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-border text-sm font-medium">{tech}</span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-bold text-foreground">Team</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {team.map((member) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-black text-xl flex-shrink-0">{member.avatar}</div>
              <div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary mt-0.5">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-1">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Links & Resources</h2>
        <div className="flex flex-wrap gap-3">
          <a href="https://t.me/Zone8095" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm hover:bg-secondary transition-colors"><Mail className="h-4 w-4" /> Telegram</a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm hover:bg-secondary transition-colors"><Twitter className="h-4 w-4" /> Twitter</a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm hover:bg-secondary transition-colors"><Github className="h-4 w-4" /> GitHub</a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm hover:bg-secondary transition-colors"><ExternalLink className="h-4 w-4" /> Documentation</a>
        </div>
      </div>

      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <Shield className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground mb-2">Legal Disclaimer</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          This software is intended for authorized security testing and educational purposes only.
          Unauthorized access to devices, data theft, or any malicious use is strictly prohibited
          and may violate local, national, and international laws. The developers assume no liability
          for misuse of this software. Always obtain proper authorization before testing.
        </p>
      </div>
    </div>
  )
}