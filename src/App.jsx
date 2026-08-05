import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import AllForms from './pages/AllForms'
import ManageLinks from './pages/ManageLinks'
import AllSentSMS from './pages/AllSentSMS'
import BulkSMS from './pages/BulkSMS'
import Customize from './pages/Customize'
import About from './pages/About'
import LoginHistory from './pages/LoginHistory'
import ExportData from './pages/ExportData'
import AdminCentral from './pages/AdminCentral'
import PanelSetup from './pages/PanelSetup'
import PanelExpired from './pages/PanelExpired'
import ViewDevice from './pages/ViewDevice'
import Profile from './pages/Profile'
import Help from './pages/Help'
import FoxDev from './pages/FoxDev'
import AddAccount from './pages/AddAccount'
import EditAccount from './pages/EditAccount'
import APKs from './pages/APKs'
import MagicClear from './pages/MagicClear'
import MagicScan from './pages/MagicScan'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PanelProvider } from './context/PanelContext'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <PanelSetup /> : <Navigate to="/" />} />
      <Route path="/expired" element={<PanelExpired />} />
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/view/:deviceId" element={<ViewDevice />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/all-forms" element={<AllForms />} />
        <Route path="/manage-links" element={<ManageLinks />} />
        <Route path="/all-sent-sms" element={<AllSentSMS />} />
        <Route path="/bulk-sms" element={<BulkSMS />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/about" element={<About />} />
        <Route path="/login-history" element={<LoginHistory />} />
        <Route path="/export-data" element={<ExportData />} />
        <Route path="/admin-central" element={<AdminCentral />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
        <Route path="/fox-dev" element={<FoxDev />} />
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/edit-account/:accountId" element={<EditAccount />} />
        <Route path="/apks" element={<APKs />} />
        <Route path="/magic-clear" element={<MagicClear />} />
        <Route path="/magic-scan" element={<MagicScan />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <PanelProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster 
            position="bottom-right" 
            toastOptions={{ 
              className: 'bg-card border-border',
              duration: 5000 
            }} 
          />
        </div>
      </PanelProvider>
    </AuthProvider>
  )
}

export default App
