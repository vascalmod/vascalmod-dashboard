import React, { useEffect, useState } from 'react';
// Import your Axios client
import { apiClient } from '../lib/api'; 

// Define strict types to match your backend response
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
        // Use your existing Axios setup
        const response = await apiClient.getLicenses();
        
        // Axios stores the payload in `response.data`
        // Your backend returns `{ success: true, data: [...] }`
        const payload = response.data;

        if (payload.success && payload.data) {
          setLicenses(payload.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err: any) {
        // Handle Axios errors cleanly
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-600 animate-pulse">Loading licenses...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">License Management</h1>
        <div className="text-sm text-gray-500">
          Total Licenses: {licenses.length}
        </div>
      </div>
      
      <div className="grid gap-6">
        {licenses.map((license) => (
          <div key={license.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            {/* Header: License Info & Global Device Count */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-mono font-bold text-gray-800">{license.key}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    Plan: {license.plan}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    {license.duration_text}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-right flex flex-col items-end">
                <div className="text-lg font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                  Active Devices: <span className="text-blue-600 font-bold ml-1">{license.active_devices_text}</span>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  license.status === 'Active' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {license.status}
                </span>
              </div>
            </div>

            {/* Body: Associated Devices Table */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                Activated Devices 
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {license.devices.length}
                </span>
              </h3>
              
              {license.devices.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm text-gray-600 border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">Hardware ID (HWID)</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">First Activated</th>
                        <th className="px-4 py-3 font-semibold text-gray-900">Exact Expiry Date</th>
                        <th className="px-4 py-3 font-semibold text-center text-gray-700">Device Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {license.devices.map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{device.hwid}</td>
                          <td className="px-4 py-3">{new Date(device.activated_at).toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {new Date(device.expires_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                              device.status === 'Active' 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
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
