import React from 'react';
import {
  DollarSign,
  Car,
  Users,
  AlertTriangle,
  CreditCard,
  Send,
  CheckCircle2,
  TrendingUp,
  Siren,
  ShieldAlert,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const DashboardOverview: React.FC = () => {
  const {
    config,
    drivers,
    clients,
    payments,
    emergencies,
    setActiveTab,
    pendingPaymentsCount,
    pendingDriversCount,
    negativeBalanceDriversCount,
    unreadEmergenciesCount,
  } = useAdmin();

  // Financial Calculations
  const verifiedCommissionPaymentsUSD = payments
    .filter((p) => p.type === 'driver_commission' && p.status === 'verificado')
    .reduce((sum, p) => sum + p.amountUSD, 0);

  // Simulated total trips revenue commission
  const totalCompletedTrips = drivers.reduce((sum, d) => sum + d.completedTrips, 0);
  const estimatedCommissionEarnedUSD = totalCompletedTrips * 0.75 + verifiedCommissionPaymentsUSD;
  const estimatedCommissionEarnedVES = estimatedCommissionEarnedUSD * config.bcvRate;

  // Driver Debt (Negative balance total)
  const totalDriverDebtUSD = drivers
    .filter((d) => d.balanceUSD < 0)
    .reduce((sum, d) => sum + Math.abs(d.balanceUSD), 0);
  const totalDriverDebtVES = totalDriverDebtUSD * config.bcvRate;

  // Fleet counts
  const taxiCount = drivers.filter((d) => d.category === 'taxi' && d.status === 'activo').length;
  const motoTaxiCount = drivers.filter((d) => d.category === 'mototaxi' && d.status === 'activo').length;
  const deliveryCount = drivers.filter((d) => d.category === 'delivery' && d.status === 'activo').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Pending Emergencies or Negative Balances exist */}
      {(unreadEmergenciesCount > 0 || negativeBalanceDriversCount > 0) && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-red-50 border border-red-200 rounded-2xl gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl border border-red-500 animate-pulse">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">
                Atención Requerida en la Plataforma
              </h3>
              <p className="text-xs text-red-700">
                Hay {unreadEmergenciesCount} alerta(s) de emergencia en curso y{' '}
                {negativeBalanceDriversCount} conductor(es) con saldo negativo mayor a -$0.50.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadEmergenciesCount > 0 && (
              <button
                onClick={() => setActiveTab('emergencies')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Atender Emergencias ({unreadEmergenciesCount})
              </button>
            )}
            {negativeBalanceDriversCount > 0 && (
              <button
                onClick={() => setActiveTab('drivers_negative')}
                className="px-3 py-1.5 bg-white hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold transition"
              >
                Ver Saldos Negativos ({negativeBalanceDriversCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Earnings Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ganancias Totales Comisiones
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              ${estimatedCommissionEarnedUSD.toFixed(2)}
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-1 font-mono">
              ≈ {estimatedCommissionEarnedVES.toLocaleString('es-VE', { maximumFractionDigits: 2 })} VES
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Comisión fijada al <strong className="text-blue-600">{config.commissionPercent}%</strong>
          </p>
        </div>

        {/* Driver Debt / Negative Balance Total */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden group hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deuda Conductores (Saldo Neg.)
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-red-600 font-mono">
              -${totalDriverDebtUSD.toFixed(2)}
            </p>
            <p className="text-xs font-semibold text-red-600/80 mt-1 font-mono">
              ≈ -{totalDriverDebtVES.toLocaleString('es-VE', { maximumFractionDigits: 2 })} VES
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Umbral de alerta: <strong className="text-red-600">-$0.50 USD</strong>
          </p>
        </div>

        {/* Pending Payments to Verify */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pagos Pendientes Verificación
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-black text-blue-600">
              {pendingPaymentsCount}
            </p>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
            >
              Revisar <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Comprobantes de Pago Móvil / Zelle
          </p>
        </div>

        {/* Fleet & Users Summary */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Flota y Clientes
            </span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500">Conductores Activos:</p>
              <p className="text-lg font-extrabold text-slate-900">
                {drivers.filter((d) => d.status === 'activo').length}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Clientes Totales:</p>
              <p className="text-lg font-extrabold text-slate-900">{clients.length}</p>
            </div>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold mt-2">
            {pendingDriversCount} conductor(es) pend. aprobación
          </p>
        </div>
      </div>

      {/* Vehicle Category Fleet Breakdown & Currency Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Category Distribution */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              Distribución de Flota Vixy
            </h3>
            <button
              onClick={() => setActiveTab('drivers')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Gestionar
            </button>
          </div>

          <div className="space-y-3">
            {/* Taxi */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Servicio de Taxi</p>
                  <p className="text-[10px] text-slate-500">Automóviles sedan y hatchbacks</p>
                </div>
              </div>
              <span className="text-sm font-black text-amber-700 font-mono">
                {taxiCount} Unid.
              </span>
            </div>

            {/* Moto Taxi */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="text-xs">🏍️</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Servicio de Moto Taxi</p>
                  <p className="text-[10px] text-slate-500">Transporte rápido de pasajeros</p>
                </div>
              </div>
              <span className="text-sm font-black text-blue-700 font-mono">
                {motoTaxiCount} Unid.
              </span>
            </div>

            {/* Delivery */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="text-xs">📦</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Servicio de Delivery</p>
                  <p className="text-[10px] text-slate-500">Envío y entrega de encomiendas</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-700 font-mono">
                {deliveryCount} Unid.
              </span>
            </div>
          </div>
        </div>

        {/* Currency & Financial Settings Summary */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Tasa de Cambio & Parámetros
            </h3>
            <button
              onClick={() => setActiveTab('financesConfig')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Ajustar
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Tasa Oficial Banco Central:</span>
              <span className="text-sm font-extrabold text-emerald-600 font-mono">
                {config.bcvRate.toFixed(2)} VES / USD
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Comisión de la Empresa:</span>
              <span className="text-sm font-extrabold text-blue-600 font-mono">
                {config.commissionPercent}% por carrera
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Límite Saldo Negativo:</span>
              <span className="text-sm font-extrabold text-red-600 font-mono">
                {config.negativeBalanceThreshold.toFixed(2)} USD
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-slate-500 font-medium">Pago Móvil Receptor de Comisiones:</p>
              <p className="font-bold text-slate-800">
                {config.pagoMovil.bankName} ({config.pagoMovil.phone})
              </p>
              <p className="text-[10px] text-slate-500">
                RIF: {config.pagoMovil.cif} - {config.pagoMovil.holderName}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Acciones Rápidas del Backend
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => setActiveTab('payments')}
              className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verificar Comprobantes de Pago
              </span>
              <span className="px-2 py-0.5 bg-emerald-200/60 rounded text-[10px] text-emerald-900 font-extrabold">
                {pendingPaymentsCount} Pend.
              </span>
            </button>

            <button
              onClick={() => setActiveTab('drivers')}
              className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition"
            >
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-600" />
                Aprobar Nuevos Conductores
              </span>
              <span className="px-2 py-0.5 bg-amber-200/60 rounded text-[10px] text-amber-900 font-extrabold">
                {pendingDriversCount} Solicitudes
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <Send className="w-4 h-4 text-blue-600" />
              Enviar Notificación Push masiva
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <Users className="w-4 h-4 text-slate-600" />
              Ver Mapa de Conductores en Vivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
