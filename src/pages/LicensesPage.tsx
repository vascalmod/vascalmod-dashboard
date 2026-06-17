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
  name: string | null;
  plan: string;
  features: string | null;
  revoked: boolean;
  active_devices_text: string;
  duration_text: string;
  status: 'Active' | 'Revoked';
  devices: Device[];
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
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

  useEffect(() => { loadData(); }, []);

  const doAction = async (id: string, action: () => Promise<any>) => {
    setBusy((prev) => ({ ...prev, [id]: true }));
    try {
      await action();
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Action failed');
    } finally {
      setBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading licenses...</div>;
  if (error) return <div className="p-8 text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded mx-6 mt-6">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">License Management</h1>
        <div className="text-sm text-slate-400">Total Licenses: {licenses.length}</div>
      </div>
      
      <div className="grid gap-6">
        {licenses.map((license) => (
          <div key={license.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-mono font-bold text-slate-200">{license.key}</h2>
                {license.name && <p className="text-sm text-slate-400 mt-0.5">{license.name}</p>}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm text-slate-400 uppercase tracking-wide font-semibold">Plan: {license.plan}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm text-slate-400">{license.duration_text}</span>
                  {license.features && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-mono max-w-[200px] truncate" title={license.features}>
                        {license.features}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                <div className="text-lg font-medium text-slate-300 bg-slate-700/50 px-3 py-1 rounded-md border border-slate-600">
                  Active Devices: <span className="text-blue-400 font-bold ml-1">{license.active_devices_text}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Lock / Unlock button */}
                  {license.revoked ? (
                    <button
                      onClick={() => doAction(`unlock-${license.key}`, () => apiClient.unlockLicense(license.key))}
                      disabled={busy[`unlock-${license.key}`]}
                      className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                      {busy[`unlock-${license.key}`] ? '...' : 'Unlock'}
                    </button>
                  ) : (
                    <button
                      onClick={() => doAction(`lock-${license.key}`, () => apiClient.lockLicense(license.key))}
                      disabled={busy[`lock-${license.key}`]}
                      className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50"
                    >
                      {busy[`lock-${license.key}`] ? '...' : 'Lock'}
                    </button>
                  )}
                  {/* Reset Devices button */}
                  {license.devices.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Remove all devices from this license? Remaining time will carry over to the next device.')) {
                          doAction(`reset-${license.key}`, () => apiClient.resetDevices(license.key));
                        }
                      }}
                      disabled={busy[`reset-${license.key}`]}
                      className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50"
                    >
                      {busy[`reset-${license.key}`] ? '...' : 'Reset Devices'}
                    </button>
                  )}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    license.status === 'Active' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {license.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Devices Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                Activated Devices 
                <span className="bg-slate-700 text-slate-400 py-0.5 px-2 rounded-full text-xs">{license.devices.length}</span>
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
                        <th className="px-4 py-3 font-semibold text-center text-slate-300">Action</th>
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
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm('Remove this device? Remaining time will carry over for the next device.')) {
                                  doAction(`dev-${device.id}`, () => apiClient.removeDevice(device.id, license.key));
                                }
                              }}
                              disabled={busy[`dev-${device.id}`]}
                              className="px-2 py-1 text-xs font-bold uppercase rounded-md bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50"
                            >
                              {busy[`dev-${device.id}`] ? '...' : 'Remove'}
                            </button>
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
