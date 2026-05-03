import React, { useState } from 'react';
import { apiClient } from '../lib/api';

export default function CreateLicensePage() {
  const [plan, setPlan] = useState('custom');
  const [maxDevices, setMaxDevices] = useState(1);
  const [customDays, setCustomDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    setCreatedKey('');
    try {
      const response = await apiClient.createLicense(
        plan,
        maxDevices,
        false,
        customDays,
        hours,
        minutes
      );
      const payload = response.data;
      if (payload.success && payload.data) {
        setCreatedKey(payload.data.license_key);
      } else {
        throw new Error(payload.error || 'Failed to create license');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Create License</h1>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
        {/* Preset Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Preset Duration
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: '1D', label: '1 Day' },
              { value: '3D', label: '3 Days' },
              { value: '7D', label: '7 Days' },
              { value: '30D', label: '30 Days' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPlan(p.value)}
                className={`px-4 py-3 rounded-lg text-sm font-semibold border transition-all ${
                  plan === p.value
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-500 uppercase font-bold">or custom</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        {/* Custom Duration */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Days
            </label>
            <input
              type="number"
              min={0}
              value={customDays}
              onChange={(e) => {
                setCustomDays(parseInt(e.target.value) || 0);
                setPlan('custom');
              }}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hours
            </label>
            <input
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => {
                setHours(parseInt(e.target.value) || 0);
                setPlan('custom');
              }}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Minutes (Debug)
            </label>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => {
                setMinutes(parseInt(e.target.value) || 0);
                setPlan('custom');
              }}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Max Devices */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Max Devices
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxDevices}
            onChange={(e) => setMaxDevices(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Summary */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <p className="text-sm text-slate-300">
            Duration:{' '}
            <span className="text-white font-semibold">
              {plan !== 'custom'
                ? plan
                : `${customDays}d ${hours}h ${minutes}m`}
            </span>
          </p>
          <p className="text-sm text-slate-300 mt-1">
            Devices:{' '}
            <span className="text-white font-semibold">{maxDevices}</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Created Key */}
        {createdKey && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-400 font-medium mb-1">
              License Created!
            </p>
            <p className="text-lg font-mono text-white font-bold tracking-wider">
              {createdKey}
            </p>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 text-white font-bold rounded-lg transition-all active:scale-95"
        >
          {creating ? 'Creating...' : 'Create License'}
        </button>
      </div>
    </div>
  );
}
