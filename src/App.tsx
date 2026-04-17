import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LicensesPage } from './pages/LicensesPage';
import { LogsPage } from './pages/LogsPage';
import { LogOut, Menu, LayoutDashboard, Key, FileText, X } from 'lucide-react';
import { useState } from 'react';

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Explicitly defining all routes for the menu
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/licenses', label: 'Licenses', icon: Key },
    { href: '/admin/logs', label: 'Logs', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between z-[60] shrink-0">
        <h1 className="text-xl font-bold text-blue-400">License Mgr</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 md:hidden"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 md:hidden z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed md:relative top-16 md:top-0 left-0 h-[calc(100%-4rem)] md:h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-50 flex flex-col overflow-hidden ${
            sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-64 md:translate-x-0'
          }`}
        >
          <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700 bg-slate-800 shrink-0 pb-8 md:pb-4">
            <div className="mb-4 px-2">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Admin Account</p>
              <p className="text-sm text-slate-300 truncate font-mono">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/admin/login';
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all font-bold active:scale-95"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-slate-950">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/licenses" element={<ProtectedRoute><AdminLayout><LicensesPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute><AdminLayout><LogsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}