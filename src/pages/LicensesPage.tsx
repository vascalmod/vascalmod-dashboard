import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface Device {
  id: string;
  hwid: string;
  activated_at: string;
  expires_at: string;
  status: 'Active' | 'Expired';
}

interface License {
  id: string;
  key: string;
  plan: string;
  active_devices_text: string;
  duration_text: string;
  status: 'Active' | 'Revoked';
  devices: Device[];
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await apiClient.getLicenses();
        const payload = response.data;
        if (payload.success && payload.data) {
          setLicenses(payload.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading licenses...</div>;
  if (error) return <div className="p-8 text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded mx-6 mt-6">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">License Management</h1>
        <div className="text-sm text-slate-400">
          Total Licenses: {licenses.length}
        </div>
      </div>
      
      <div className="grid gap-6">
        {licenses.map((license) => (
          <div key={license.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all">
            {/* Header: License Info & Global Device Count */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-mono font-bold text-slate-200">{license.key}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-slate-400 uppercase tracking-wide font-semibold">
                    Plan: {license.plan}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm text-slate-400">
                    {license.duration_text}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-right flex flex-col items-end">
                <div className="text-lg font-medium text-slate-300 bg-slate-700/50 px-3 py-1 rounded-md border border-slate-600">
                  Active Devices: <span className="text-blue-400 font-bold ml-1">{license.active_devices_text}</span>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  license.status === 'Active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {license.status}
                </span>
              </div>
            </div>

            {/* Body: Associated Devices Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                Activated Devices 
                <span className="bg-slate-700 text-slate-400 py-0.5 px-2 rounded-full text-xs">
                  {license.devices.length}
                </span>
              </h3>
              
              {license.devices.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-700">
                  <table className="w-full text-left text-sm text-slate-300 border-collapse">
                    <thead className="bg-slate-700/50 border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-300">Hardware ID (HWID)</th>
                        <th className="px-4 py-3 font-semibold text-slate-300">First Activated</th>
                        <th className="px-4 py-3 font-semibold text-slate-200">Exact Expiry Date</th>
                        <th className="px-4 py-3 font-semibold text-center text-slate-300">Device Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {license.devices.map((device) => (
                        <tr key={device.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{device.hwid}</td>
                          <td className="px-4 py-3">
                            {new Date(device.activated_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'medium' })}
                            <span className="text-xs text-slate-500 ml-1">PHT</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-200">
                            {new Date(device.expires_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'medium' })}
                            <span className="text-xs text-slate-500 ml-1">PHT</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                              device.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {device.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                  No devices have been activated on this license yet.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
