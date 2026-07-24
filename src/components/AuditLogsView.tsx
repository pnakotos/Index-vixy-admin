import React, { useState } from 'react';
import { History, Search, ShieldAlert, Filter, User } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('todos');

  const filteredLogs = auditLogs.filter((log) => {
    if (moduleFilter !== 'todos' && log.module !== moduleFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.adminUser.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Log de Accesos y Auditoría de Actividades
          </h2>
          <p className="text-xs text-slate-500">
            Registro detallado de acciones realizadas por los administradores en el sistema
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por usuario o acción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Fecha y Hora</th>
                <th className="p-4">Usuario Administrativo</th>
                <th className="p-4">Módulo</th>
                <th className="p-4">Acción Realizada</th>
                <th className="p-4">Detalles</th>
                <th className="p-4">Dirección IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.map((log, index) => (
                <tr key={`${log.id}-${index}`} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-4 font-sans font-extrabold text-slate-900">
                    <div>{log.adminUser}</div>
                    <span className="text-[10px] text-blue-600 font-mono font-normal">
                      [{log.adminRole}]
                    </span>
                  </td>
                  <td className="p-4 font-sans">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-600 font-sans">{log.action}</td>
                  <td className="p-4 font-sans text-slate-600 max-w-xs">{log.details}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
