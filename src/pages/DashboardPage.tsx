import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { BarChart3, Key, Users, Clock } from 'lucide-react';

interface Stats {
  totalLicenses: number;
  activeLicenses: number;
  totalDevices: number;
  logsToday: number;
}

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
      const logsResponse = await apiClient.getLogs(5);
      const logs = logsResponse.data.data || [];

      const now = new Date();
      const activeLicenses = licenses.filter((l: any) => !l.revoked && new Date(l.expires_at) > now).length;
      const totalDevices = licenses.reduce((sum: number, l: any) => sum + (l.device_count || 0), 0);

      setStats({
        totalLicenses: licenses.length,
        activeLicenses,
        totalDevices,
        logsToday: logs.length,
      });
      setRecentLogs(logs);
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
      {/* ... Activity Table ... */}
    </div>
  );
}