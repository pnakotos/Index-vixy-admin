import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Key,
  Lock,
  Eye,
  EyeOff,
  Clock,
  RefreshCw,
  Power,
  Shield,
  User,
  Check,
  AlertCircle,
  Calendar,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminRole, BackendUserPermissions, BackendUser } from '../types';

export const UserPermissionsView: React.FC = () => {
  const {
    backendUsers,
    addBackendUser,
    updateBackendUserPermissions,
    toggleBackendUserActive,
    updateBackendUserPassword,
    deleteBackendUser,
    currentBackendUser,
    setCurrentBackendUser,
  } = useAdmin();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<AdminRole>('Despacho y Soporte');

  // Password & Security State
  const [passwordInput, setPasswordInput] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [mustChangePasswordInput, setMustChangePasswordInput] = useState(true);
  const [expirationDaysInput, setExpirationDaysInput] = useState<30 | 90>(90);

  // Edit password modal state
  const [editingUserForPassword, setEditingUserForPassword] = useState<BackendUser | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [newExpirationForUser, setNewExpirationForUser] = useState<30 | 90>(90);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Delete user modal state
  const [userToDelete, setUserToDelete] = useState<BackendUser | null>(null);

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
    if (!nameInput.trim() || !emailInput.trim() || !passwordInput.trim()) return;

    addBackendUser({
      name: nameInput.trim(),
      email: emailInput.trim(),
      role: roleInput,
      isActive: true,
      password: passwordInput.trim(),
      mustChangePassword: mustChangePasswordInput,
      passwordExpirationDays: expirationDaysInput,
      permissions: permissionsInput,
    });

    setNameInput('');
    setEmailInput('');
    setPasswordInput('123456');
    setMustChangePasswordInput(true);
    setExpirationDaysInput(90);
    setIsCreateModalOpen(false);
  };

  const handleSaveUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserForPassword || !newPasswordForUser.trim()) return;

    updateBackendUserPassword(
      editingUserForPassword.id,
      newPasswordForUser.trim(),
      newExpirationForUser
    );

    setEditingUserForPassword(null);
    setNewPasswordForUser('');
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
            Niveles de Acceso y Gestión de Usuarios con Claves
          </h2>
          <p className="text-xs text-slate-500">
            Creación de usuarios con clave de inicio de sesión, cambio obligatorio en el primer ingreso y tiempos de expiración fijos (30 o 90 días máximo).
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Crear Usuario con Clave
        </button>
      </div>

      {/* Backend Users Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {backendUsers.map((user) => {
          const isCurrentSession = currentBackendUser ? user.id === currentBackendUser.id : false;
          const userPass = user.password || '123456';
          const expiration = user.passwordExpirationDays || 90;

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
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">{user.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Security & Password Info Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-blue-600" /> Clave Asignada:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {visiblePasswords[user.id] ? userPass : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setVisiblePasswords((prev) => ({
                          ...prev,
                          [user.id]: !prev[user.id],
                        }))
                      }
                      className="p-1 text-slate-400 hover:text-slate-600 transition"
                      title={visiblePasswords[user.id] ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {visiblePasswords[user.id] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-amber-500" /> Cambio 1er Ingreso:
                  </span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    user.mustChangePassword
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {user.mustChangePassword ? 'Obligatorio Pendiente' : 'Completado'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-600" /> Expiración Fija:
                  </span>
                  <span className="font-bold text-slate-800">
                    {expiration} días max.
                  </span>
                </div>

                <button
                  onClick={() => {
                    setEditingUserForPassword(user);
                    setNewPasswordForUser(userPass);
                    setNewExpirationForUser(expiration);
                  }}
                  className="w-full mt-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-blue-700 transition flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Restablecer / Editar Clave
                </button>
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
              {!isCurrentSession ? (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setCurrentBackendUser(user)}
                    className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Iniciar Sesión
                  </button>

                  {user.id !== 'usr-root' && (
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center"
                      title="Eliminar usuario administrativo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold italic">Sesión administrativa activa</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE BACKEND USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Crear Usuario Administrativo con Clave
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
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
                  placeholder="sofia.rodriguez@vhixy.site"
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
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                >
                  <option value="Super Admin">Super Admin (Acceso Total)</option>
                  <option value="Finanzas">Finanzas (Tasa BCV y Verificación de Pagos)</option>
                  <option value="Despacho y Soporte">Despacho y Soporte (Monitoreo y Alertas)</option>
                  <option value="Verificador">Verificador (Pagos de Clientes y Conductores)</option>
                </select>
              </div>

              {/* Password & Security Configuration */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                <p className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Configuración de Clave de Inicio de Sesión
                </p>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Clave Inicial de Acceso:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    El usuario usará esta clave para su primer inicio de sesión.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={mustChangePasswordInput}
                    onChange={(e) => setMustChangePasswordInput(e.target.checked)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-slate-800 font-semibold">
                    Exigir cambio de clave al iniciar sesión por primera vez
                  </span>
                </label>

                {/* Expiration fixed: 30 days or 90 days max */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-800 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Tiempo Fijo de Expiración de la Clave:
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label
                      onClick={() => setExpirationDaysInput(30)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition ${
                        expirationDaysInput === 30
                          ? 'bg-blue-600 text-white font-bold border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="expiration"
                        checked={expirationDaysInput === 30}
                        onChange={() => setExpirationDaysInput(30)}
                        className="hidden"
                      />
                      <span>📅 30 Días</span>
                    </label>

                    <label
                      onClick={() => setExpirationDaysInput(90)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition ${
                        expirationDaysInput === 90
                          ? 'bg-blue-600 text-white font-bold border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="expiration"
                        checked={expirationDaysInput === 90}
                        onChange={() => setExpirationDaysInput(90)}
                        className="hidden"
                      />
                      <span>🗓️ 90 Días (Máximo)</span>
                    </label>
                  </div>
                </div>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/30"
                >
                  Crear Usuario con Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT/RESET USER PASSWORD MODAL */}
      {editingUserForPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                Actualizar Clave de {editingUserForPassword.name}
              </h3>
              <button
                onClick={() => setEditingUserForPassword(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserPassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nueva Clave de Acceso:
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={newPasswordForUser}
                    onChange={(e) => setNewPasswordForUser(e.target.value)}
                    placeholder="Ingrese nueva clave"
                    className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tiempo de Expiración Fijo:
                </label>
                <select
                  value={newExpirationForUser}
                  onChange={(e) => setNewExpirationForUser(Number(e.target.value) as 30 | 90)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none font-medium"
                >
                  <option value={30}>30 Días</option>
                  <option value={90}>90 Días (Máximo permitidos)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Al actualizar la clave, se exigirá al usuario que la re-cambie obligatoriamente la próxima vez que inicie sesión.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUserForPassword(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/30"
                >
                  Guardar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Eliminar Usuario Administrativo
                </h3>
                <p className="text-xs text-slate-500">
                  Esta acción revocará inmediatamente todos los permisos del usuario.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nombre:</span>
                <strong className="text-slate-900">{userToDelete.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Correo Electrónico:</span>
                <strong className="text-slate-900">{userToDelete.email}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Rol Asignado:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{userToDelete.role}</span>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                ¿Estás seguro de que deseas eliminar permanentemente al usuario administrativo <strong>{userToDelete.name}</strong>? Esta acción no se puede revertir.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBackendUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
