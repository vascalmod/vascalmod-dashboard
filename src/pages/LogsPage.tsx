import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { format } from 'date-fns';
import { RefreshCw, Globe } from 'lucide-react';

interface LocationData {
  country: string;
  city: string;
  isp: string;
  ip: string;
}

interface Log {
  id: string;
  license_key: string;
  hwid: string;
  ip: string;
  status: string;
  location: LocationData;
  timestamp: string;
}

export function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    country: '',
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
  });

  useEffect(() => {
    loadLogs();
  }, [filters, pagination.offset]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLogs(
        pagination.limit,
        pagination.offset,
        filters.status || undefined,
        filters.country || undefined
      );
      setLogs(response.data.data || []);
      setPagination((p) => ({ ...p, total: response.data.total }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Login Logs</h1>
        <button
          onClick={loadLogs}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 min-h-[40px]"
        >
          <RefreshCw size={18} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPagination((p) => ({ ...p, offset: 0 }));
            }}
            className="w-full px-3 md:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm md:text-base focus:outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Country
          </label>
          <input
            type="text"
            placeholder="e.g., United States"
            value={filters.country}
            onChange={(e) => {
              setFilters({ ...filters, country: e.target.value });
              setPagination((p) => ({ ...p, offset: 0 }));
            }}
            className="w-full px-3 md:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm md:text-base focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Results per page
          </label>
          <select
            value={pagination.limit}
            onChange={(e) =>
              setPagination((p) => ({
                ...p,
                limit: parseInt(e.target.value),
                offset: 0,
              }))
            }
            className="w-full px-3 md:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm md:text-base focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No logs found</div>
      ) : (
        <>
          <div className="bg-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 md:px-4 text-slate-300 font-semibold text-sm md:text-base">
                    Time
                  </th>
                  <th className="text-left py-3 px-3 md:px-4 text-slate-300 font-semibold text-sm md:text-base">
                    License
                  </th>
                  <th className="hidden sm:table-cell text-left py-3 px-3 md:px-4 text-slate-300 font-semibold text-sm md:text-base">
                    HWID
                  </th>
                  <th className="hidden md:table-cell text-left py-3 px-3 md:px-4 text-slate-300 font-semibold text-sm md:text-base">
                    IP
                  </th>
                  <th className="hidden lg:table-cell text-left py-3 px-3 md:px-4 text-slate-300 font-semibold text-sm md:text-base">
                    Location
                  </th>
                  <th className="text-left py-3 px-3 md:px-4 text-slate-300 font-semibold text-sm md:text-base">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-700/50">
                    <td className="py-3 px-3 md:px-4 text-slate-300 text-xs md:text-sm whitespace-nowrap">
                      {format(new Date(log.timestamp), 'MMM dd HH:mm')}
                    </td>
                    <td className="py-3 px-3 md:px-4 text-slate-100 font-mono text-xs md:text-sm">
                      {log.license_key.substring(0, 12)}...
                    </td>
                    <td className="hidden sm:table-cell py-3 px-3 md:px-4 text-slate-300 text-xs md:text-sm">
                      {log.hwid.substring(0, 10)}...
                    </td>
                    <td className="hidden md:table-cell py-3 px-3 md:px-4 text-slate-300 text-xs md:text-sm">
                      {log.ip}
                    </td>
                    <td className="hidden lg:table-cell py-3 px-3 md:px-4 text-slate-300 text-xs md:text-sm">
                      {log.location?.city}, {log.location?.country}
                    </td>
                    <td className="py-3 px-3 md:px-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${statusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-slate-400 text-sm">
              Showing {pagination.offset + 1} to{' '}
              {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    offset: Math.max(0, p.offset - p.limit),
                  }))
                }
                disabled={pagination.offset === 0}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    offset: p.offset + p.limit,
                  }))
                }
                disabled={
                  pagination.offset + pagination.limit >= pagination.total
                }
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
