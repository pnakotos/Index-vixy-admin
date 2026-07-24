import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Check,
  X,
  Lock,
  Key,
  Shield,
  User,
  Power,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminRole, BackendUserPermissions, BackendUser } from '../types';

export const UserPermissionsView: React.FC = () => {
  const {
    backendUsers,
    addBackendUser,
    updateBackendUserPermissions,
    toggleBackendUserActive,
    currentBackendUser,
    setCurrentBackendUser,
  } = useAdmin();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<AdminRole>('Despacho y Soporte');

  // Permissions state for new user
  const [permissionsInput, setPermissionsInput] = useState<BackendUserPermissions>({
    dashboard: true,
    drivers: true,
    clients: true,
    payments: false,
    map: true,
    emergencies: true,
    financesConfig: false,
    earningsAudit: false,
    notifications: true,
    reviews: true,
    userManagement: false,
    auditLogs: false,
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;

    addBackendUser({
      name: nameInput.trim(),
      email: emailInput.trim(),
      role: roleInput,
      isActive: true,
      permissions: permissionsInput,
    });

    setNameInput('');
    setEmailInput('');
    setIsCreateModalOpen(false);
  };

  const permissionLabels: Record<keyof BackendUserPermissions, string> = {
    dashboard: 'Resumen Dashboard',
    drivers: 'Conductores y Expedientes',
    clients: 'Clientes y Pasajeros',
    payments: 'Verificación de Pagos',
    map: 'Mapa en Vivo',
    emergencies: 'Alertas de Emergencia',
    financesConfig: 'Tasa BCV y Pagos',
    earningsAudit: 'Auditoría de Ganancias',
    notifications: 'Notificaciones Push',
    reviews: 'Comentarios y Reseñas',
    userManagement: 'Gestión de Permisos',
    auditLogs: 'Logs de Auditoría',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Niveles de Acceso y Gestión de Permisos Administrativos
          </h2>
          <p className="text-xs text-slate-500">
            Creación de usuarios del backend y personalización granular de permisos por módulo
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Crear Usuario Administrativo
        </button>
      </div>

      {/* Backend Users Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backendUsers.map((user) => {
          const isCurrentSession = user.id === currentBackendUser.id;

          return (
            <div
              key={user.id}
              className={`p-5 rounded-2xl border space-y-4 transition-all ${
                isCurrentSession
                  ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {user.role}
                </span>

                <div className="flex items-center gap-1.5">
                  {isCurrentSession && (
                    <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                      Sesión Actual
                    </span>
                  )}
                  <button
                    onClick={() => toggleBackendUserActive(user.id)}
                    className={`p-1 rounded text-xs transition ${
                      user.isActive ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                    title={user.isActive ? 'Desactivar acceso' : 'Activar acceso'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Profile details */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 font-black text-blue-600 flex items-center justify-center text-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{user.name}</h3>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              {/* Active Permissions Checklist Grid */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Módulos Habilitados:
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {(Object.keys(user.permissions) as (keyof BackendUserPermissions)[]).map(
                    (pKey) => {
                      const isAllowed = user.permissions[pKey];
                      return (
                        <div
                          key={pKey}
                          onClick={() => {
                            const updated = {
                              ...user.permissions,
                              [pKey]: !user.permissions[pKey],
                            };
                            updateBackendUserPermissions(user.id, updated, user.role);
                          }}
                          className={`p-1.5 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                            isAllowed
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                          }`}
                        >
                          <span className="truncate pr-1">{permissionLabels[pKey]}</span>
                          <span>{isAllowed ? '✓' : '✕'}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Action */}
              {!isCurrentSession && (
                <button
                  onClick={() => setCurrentBackendUser(user)}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  Cambiar a este usuario (Simular)
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE BACKEND USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Crear Nuevo Usuario del Backend
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ej. Sofia Rodriguez"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Correo Electrónico Corporativo:
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="sofia.rodriguez@vixytaxi.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rol Asignado:
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as AdminRole)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Super Admin">Super Admin (Acceso Total)</option>
                  <option value="Finanzas">Finanzas (Tasa BCV y Verificación de Pagos)</option>
                  <option value="Despacho y Soporte">Despacho y Soporte (Monitoreo y Alertas)</option>
                  <option value="Verificador">Verificador (Pagos de Clientes y Conductores)</option>
                </select>
              </div>

              {/* Permissions Matrix Checkboxes */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">
                  Permisos de Módulo Personalizados:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(permissionsInput) as (keyof BackendUserPermissions)[]).map(
                    (pKey) => (
                      <label
                        key={pKey}
                        className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={permissionsInput[pKey]}
                          onChange={(e) =>
                            setPermissionsInput((prev) => ({
                              ...prev,
                              [pKey]: e.target.checked,
                            }))
                          }
                          className="accent-blue-600"
                        />
                        <span className="text-slate-700 font-medium">{permissionLabels[pKey]}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
