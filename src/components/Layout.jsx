import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Smartphone, MessageSquare, Settings,
  FileText, Link2, Send, MessageCircle, Palette, Info,
  History, Download, UserCog, Shield, HelpCircle,
  Terminal, Plus, LogOut, Menu, X, ChevronRight,
  Crown, Star, Zap, ShieldCheck, Database
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePanel } from '../context/PanelContext'
import { toast } from 'sonner'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['admin', 'user'] },
  { label: 'Devices', icon: Smartphone, path: '/devices', roles: ['admin', 'user'] },
  { label: 'Messages', icon: MessageSquare, path: '/messages', roles: ['admin', 'user'] },
  { label: 'Bulk SMS', icon: Send, path: '/bulk-sms', roles: ['admin'] },
  { label: 'All Forms', icon: FileText, path: '/all-forms', roles: ['admin'] },
  { label: 'Manage Links', icon: Link2, path: '/manage-links', roles: ['admin'] },
  { label: 'All Sent SMS', icon: MessageCircle, path: '/all-sent-sms', roles: ['admin'] },
  { label: 'Customize', icon: Palette, path: '/customize', roles: ['admin'] },
  { label: 'Login History', icon: History, path: '/login-history', roles: ['admin'] },
  { label: 'Export Data', icon: Download, path: '/export-data', roles: ['admin'] },
  { label: 'Admin Central', icon: Shield, path: '/admin-central', roles: ['admin'] },
  { label: 'Profile', icon: UserCog, path: '/profile', roles: ['admin', 'user'] },
  { label: 'Help', icon: HelpCircle, path: '/help', roles: ['admin', 'user'] },
  { label: 'Fox Dev', icon: Terminal, path: '/fox-dev', roles: ['admin'] },
  { label: 'Add Account', icon: Plus, path: '/add-account', roles: ['admin'] },
  { label: 'APKs', icon: Database, path: '/apks', roles: ['admin'] },
  { label: 'Magic Clear', icon: Zap, path: '/magic-clear', roles: ['admin'] },
  { label: 'Magic Scan', icon: ShieldCheck, path: '/magic-scan', roles: ['admin'] },
]

const bottomItems = [
  { label: 'About', icon: Info, path: '/about', roles: ['admin', 'user'] },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const { config, isExpired } = usePanel()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  const filteredItems = navItems.filter(item => item.roles.includes('admin'))

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed lg:relative z-50 w-64 min-h-screen bg-card border-r border-border flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-black text-lg text-foreground">AH GAMING</span>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom items */}
        <div className="p-3 space-y-1 border-t border-border">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
              {config.admin_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{config.admin_name || 'Admin'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isExpired ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive">
                    <Crown className="h-3 w-3" />
                    <span>Expired</span>
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow">
                      <Star className="h-3 w-3" />
                      <span>VIP3 · Premium</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="relative mt-2">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="flex-1 text-left">Logout</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Confirm Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-0">
        {/* Top bar mobile */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-black text-foreground">AH GAMING ZONE</h1>
          </div>
          <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center" />
        </header>

        <main className="flex-1 pt-14 lg:pt-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
