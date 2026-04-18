import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { BarChart3, Key, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Stats {
  totalLicenses: number;
  activeLicenses: number;
  totalDevices: number;
  logsToday: number;
}

// Helper to correctly parse device counts from Supabase 
// (handles both nested relation and direct count)
const getDeviceCount = (l: any) => {
  if (typeof l.device_count === 'number') return l.device_count;
  if (Array.isArray(l.devices)) return l.devices[0]?.count || 0;
  if (l.devices && typeof l.devices.count === 'number') return l.devices.count;
  return 0;
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const licensesResponse = await apiClient.getLicenses();
      const licenses = licensesResponse.data.data || [];
      
      // Fetch 100 logs to have a realistic count of "Today's Logs"
      const logsResponse = await apiClient.getLogs(100);
      const logs = logsResponse.data.data || [];

      const now = new Date();
      const todayStr = now.toDateString();

      const activeLicenses = licenses.filter((l: any) => !l.revoked && new Date(l.expires_at) > now).length;
      
      // Fixed device count aggregation
      const totalDevices = licenses.reduce((sum: number, l: any) => sum + getDeviceCount(l), 0);
      
      // Fixed today's logs calculation
      const logsToday = logs.filter((l: any) => new Date(l.timestamp).toDateString() === todayStr).length;

      setStats({
        totalLicenses: licenses.length,
        activeLicenses,
        totalDevices,
        logsToday,
      });
      
      setRecentLogs(logs.slice(0, 5)); // Show top 5 in table
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-slate-400 font-mono">Loading Data...</div>;

  const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl"><Icon className="text-blue-400" size={24} /></div>
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Key} label="Total Keys" value={stats?.totalLicenses || 0} />
        <StatCard icon={BarChart3} label="Active" value={stats?.activeLicenses || 0} />
        <StatCard icon={Users} label="Devices" value={stats?.totalDevices || 0} />
        <StatCard icon={Clock} label="Today's Logs" value={stats?.logsToday || 0} />
      </div>
      
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">License</th>
                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">
                      {log.license_key?.substring(0, 12)}...
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        log.status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No recent activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
