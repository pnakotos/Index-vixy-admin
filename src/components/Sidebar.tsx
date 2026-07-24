import React from 'react';
import {
  LayoutDashboard,
  Car,
  Users,
  CreditCard,
  MapPin,
  AlertTriangle,
  Settings,
  Send,
  MessageSquare,
  ShieldCheck,
  History,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadEmergenciesCount,
    pendingPaymentsCount,
    pendingDriversCount,
    negativeBalanceDriversCount,
    currentBackendUser,
    setIsWebGuideModalOpen,
  } = useAdmin();

  const p = currentBackendUser.permissions;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Resumen General',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowed: p.dashboard,
    },
    {
      id: 'drivers',
      label: 'Conductores',
      icon: <Car className="w-4 h-4" />,
      allowed: p.drivers,
      badge: pendingDriversCount > 0 ? `${pendingDriversCount} Pend.` : null,
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800',
    },
    {
      id: 'drivers_negative',
      label: 'Desactivados (-$0.50)',
      icon: <ShieldAlert className="w-4 h-4 text-purple-400" />,
      allowed: p.drivers,
      badge: negativeBalanceDriversCount > 0 ? `${negativeBalanceDriversCount}` : null,
      badgeColor: 'bg-purple-600 text-white font-mono',
    },
    {
      id: 'clients',
      label: 'Pasajeros / Clientes',
      icon: <Users className="w-4 h-4" />,
      allowed: p.clients,
    },
    {
      id: 'payments',
      label: 'Verificación de Pagos',
      icon: <CreditCard className="w-4 h-4" />,
      allowed: p.payments,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount}` : null,
      badgeColor: 'bg-purple-900/80 text-purple-200 border-purple-700',
    },
    {
      id: 'map',
      label: 'Mapa en Vivo',
      icon: <MapPin className="w-4 h-4" />,
      allowed: p.map,
    },
    {
      id: 'emergencies',
      label: 'Alertas de Emergencia',
      icon: <AlertTriangle className="w-4 h-4" />,
      allowed: p.emergencies,
      badge: unreadEmergenciesCount > 0 ? `${unreadEmergenciesCount} SOS` : null,
      badgeColor: 'bg-red-600 text-white animate-pulse',
    },
    {
      id: 'financesConfig',
      label: 'Tasa BCV & Pagos',
      icon: <Settings className="w-4 h-4" />,
      allowed: p.financesConfig,
    },
    {
      id: 'notifications',
      label: 'Notificaciones Push',
      icon: <Send className="w-4 h-4" />,
      allowed: p.notifications,
    },
    {
      id: 'reviews',
      label: 'Comentarios y Reseñas',
      icon: <MessageSquare className="w-4 h-4" />,
      allowed: p.reviews,
    },
    {
      id: 'userManagement',
      label: 'Niveles de Acceso',
      icon: <ShieldCheck className="w-4 h-4" />,
      allowed: p.userManagement,
    },
    {
      id: 'auditLogs',
      label: 'Logs de Auditoría',
      icon: <History className="w-4 h-4" />,
      allowed: p.auditLogs,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-zinc-950 border-r border-purple-900/40 shrink-0 p-3 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-purple-400">
          Navegación Principal
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            if (!item.allowed) return null;

            const isActive =
              activeTab === item.id ||
              (item.id === 'drivers' && activeTab === 'drivers_negative');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-purple-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      isActive
                        ? 'bg-black text-purple-300 border-purple-900'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="mt-6 p-3 rounded-xl bg-zinc-900 border border-purple-900/40 text-zinc-400 text-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-white">
          <span>Vixy Backend</span>
          <span className="text-[10px] text-purple-300 bg-purple-950 border border-purple-800 px-1.5 py-0.2 rounded font-mono">
            En Línea
          </span>
        </div>
        <button
          onClick={() => setIsWebGuideModalOpen(true)}
          className="w-full py-1.5 px-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 rounded-lg text-[11px] font-bold text-purple-200 flex items-center justify-center gap-1.5 transition"
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>Montar en Sitio Web</span>
        </button>
      </div>
    </aside>
  );
};
