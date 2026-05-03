import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface DashboardStats {
  total_licenses: number;
  active_devices: number;
  total_devices: number;
  todays_logs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getStats();
        const payload = response.data;
        if (payload.success && payload.data) {
          setStats(payload.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded mx-6 mt-6">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Licenses */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Licenses</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?.total_licenses || 0}</p>
        </div>

        {/* Card 2: Active Devices */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 border-l-4 border-l-emerald-500 hover:border-slate-600 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Devices</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{stats?.active_devices || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Unexpired sessions</p>
        </div>

        {/* Card 3: Total Devices */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Devices</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?.total_devices || 0}</p>
        </div>

        {/* Card 4: Today's Logs */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 border-l-4 border-l-blue-500 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Today's Logs</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">{stats?.todays_logs || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Login attempts today</p>
        </div>
      </div>
    </div>
  );
}
