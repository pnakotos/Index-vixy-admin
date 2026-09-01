import React, { useState } from 'react';
import {
  Car,
  AlertTriangle,
  Siren,
  Volume2,
  VolumeX,
  LogOut,
  Edit2,
  Check,
  X,
  UserCheck,
  ShieldAlert,
  KeyRound,
  Globe,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const Navbar: React.FC = () => {
  const {
    config,
    updateConfig,
    unreadEmergenciesCount,
    pendingPaymentsCount,
    negativeBalanceDriversCount,
    currentBackendUser,
    logout,
    setIsChangePasswordModalOpen,
    soundEnabled,
    setSoundEnabled,
    setActiveTab,
  } = useAdmin();

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(config.bcvRate.toString());

  const handleSaveRate = () => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      updateConfig({ bcvRate: val });
      setIsEditingRate(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 border-b border-purple-900/50 backdrop-blur-md px-4 lg:px-6 py-3 shadow-lg shadow-purple-950/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-purple-600/30">
            <Car className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                VIXY <span className="text-purple-400">ADMINISTRATIVO</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                v2.5 WEB
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Gestión de Taxis, Moto Taxis, Delivery y Clientes
            </p>
          </div>
        </div>

        {/* Center Financial Ticker & Alerts */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Tasa BCV Dollar Rate Control */}
          <div className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-purple-900/50 px-3 py-1.5 rounded-xl transition-all">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              💵 Tasa BCV:
            </span>

            {isEditingRate ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-20 px-2 py-0.5 bg-black border border-purple-500 text-purple-300 rounded text-xs font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveRate}
                  title="Guardar Tasa"
                  className="p-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingRate(false)}
                  title="Cancelar"
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-purple-300 font-mono">
                  {(config?.bcvRate ?? 58.50).toFixed(2)} VES/$
                </span>
                <button
                  onClick={() => {
                    setTempRate((config?.bcvRate ?? 58.50).toString());
                    setIsEditingRate(true);
                  }}
                  className="text-zinc-500 hover:text-purple-400 transition p-0.5"
                  title="Cambiar valor del dólar BCV"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Negative Balance Driver Alert Badge */}
          {currentBackendUser?.permissions?.drivers && (
          <button
            onClick={() => setActiveTab('drivers_negative')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              negativeBalanceDriversCount > 0
                ? 'bg-purple-950/80 border-purple-600 text-purple-200 hover:bg-purple-900 shadow-md shadow-purple-900/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
            title="Conductores con saldo de comisión negativo (<= -$0.50)"
          >
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Desactivados (-$0.50):</span>
            <span className="font-extrabold px-1.5 py-0.2 rounded bg-purple-600 text-white font-mono">
              {negativeBalanceDriversCount}
            </span>
          </button>
          )}

          {/* Emergency Alert Siren Badge */}
          {currentBackendUser?.permissions?.emergencies && (
          <button
            onClick={() => setActiveTab('emergencies')}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              unreadEmergenciesCount > 0
                ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-md shadow-red-500/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Alertas de Emergencia en Pantalla"
          >
            <Siren className={`w-4 h-4 ${unreadEmergenciesCount > 0 ? 'text-white' : 'text-purple-400'}`} />
            <span>Emergencias</span>
            {unreadEmergenciesCount > 0 && (
              <span className="bg-white text-red-600 font-extrabold px-1.5 py-0.2 rounded-full text-[10px]">
                {unreadEmergenciesCount}
              </span>
            )}
          </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 transition"
            title={soundEnabled ? 'Sonido de alertas activado' : 'Sonido silenciado'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>
        </div>

        {/* User Badge & Change Password & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-purple-900/40 px-3 py-1.5 rounded-xl transition text-left"
            title="Cambiar contraseña de Súperusuario Root"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-800 shrink-0">
              {(currentBackendUser?.name || 'A').charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                {currentBackendUser?.name || 'Administrador'}
                <KeyRound className="w-3 h-3 text-purple-400 ml-1" />
              </p>
              <p className="text-[10px] text-purple-400 font-medium">
                {currentBackendUser?.role || 'Super Admin'}
              </p>
            </div>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-zinc-400 border border-zinc-800 rounded-xl text-xs font-semibold transition"
            title="Cerrar sesión del panel administrativo"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
