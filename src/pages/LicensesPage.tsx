import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { Plus, RefreshCw, Copy, Check, X, Trash2 } from 'lucide-react';

export function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    plan: 'standard', 
    max_devices: '3', 
    strict_mode: false 
  });

  useEffect(() => { loadLicenses(); }, []);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLicenses();
      setLicenses(response.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      const el = document.createElement('textarea');
      el.value = key;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createLicense(formData.plan, parseInt(formData.max_devices), formData.strict_mode);
      setShowCreateModal(false);
      setFormData({ plan: 'standard', max_devices: '3', strict_mode: false });
      loadLicenses();
    } catch (err) { alert('Creation failed'); }
  };

  const handleRevoke = async (key: string) => {
    if (!confirm('Are you sure you want to revoke this license?')) return;
    try {
      await apiClient.revokeLicense(key);
      loadLicenses();
    } catch (err) { alert('Revoke failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">License Management</h1>
        <div className="flex gap-2">
          <button onClick={loadLicenses} className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all active:scale-95">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold active:scale-95 transition-all">
            <Plus size={20} /><span>Create</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-4 text-slate-400 text-xs font-bold uppercase">License Key</th>
                <th className="px-4 py-4 text-slate-400 text-xs font-bold uppercase">Plan</th>
                <th className="px-4 py-4 text-slate-400 text-xs font-bold uppercase">Status</th>
                <th className="px-4 py-4 text-slate-400 text-xs font-bold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {licenses.map((license) => (
                <tr key={license.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">{license.key.substring(0, 10)}...</code>
                      <button onClick={() => handleCopy(license.key)} className="p-1.5 text-slate-400 hover:text-white transition-all">
                        {copiedKey === license.key ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-slate-300 text-sm font-medium capitalize">{license.plan}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${license.revoked ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {license.revoked ? 'Revoked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {!license.revoked && (
                      <button 
                        onClick={() => handleRevoke(license.key)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Revoke License"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">New License</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateLicense} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Plan Duration</label>
                <select 
                  value={formData.plan} 
                  onChange={(e) => setFormData({...formData, plan: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                >
                  <option value="trial">Trial (24h)</option>
                  <option value="standard">Standard (30d)</option>
                  <option value="premium">Premium (90d)</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Device Limit</label>
                <input 
                  type="number"
                  value={formData.max_devices}
                  onChange={(e) => setFormData({...formData, max_devices: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  min="1"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <input 
                  type="checkbox" 
                  id="strict_mode"
                  checked={formData.strict_mode}
                  onChange={(e) => setFormData({...formData, strict_mode: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500"
                />
                <label htmlFor="strict_mode" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Strict Mode (Lock to Device/HWID)
                </label>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl active:scale-95 transition-all">
                Generate Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}