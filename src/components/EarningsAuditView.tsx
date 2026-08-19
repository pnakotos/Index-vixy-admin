import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Car,
  Filter,
  Search,
  ArrowUpRight,
  PieChart,
  Users,
  Award,
  Clock,
  Download,
  Building2,
  Tag,
  CreditCard,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { CompletedService } from '../types';

export const EarningsAuditView: React.FC = () => {
  const { completedServices, config, drivers, clients } = useAdmin();

  // Filters state
  const [periodFilter, setPeriodFilter] = useState<'diario' | 'mensual' | 'anual' | 'todos'>('diario');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subTab, setSubTab] = useState<'resumen' | 'conductores' | 'pasajeros' | 'servicios'>('resumen');

  // Filtered Services based on Period
  const filteredServices = useMemo(() => {
    return completedServices.filter((srv) => {
      // Period filtering
      if (periodFilter === 'diario') {
        if (selectedDate && srv.date !== selectedDate) return false;
      } else if (periodFilter === 'mensual') {
        if (selectedMonth && !srv.date.startsWith(selectedMonth)) return false;
      } else if (periodFilter === 'anual') {
        if (selectedYear && !srv.date.startsWith(selectedYear)) return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDriver = srv.driverName.toLowerCase().includes(q);
        const matchClient = srv.clientName.toLowerCase().includes(q);
        const matchOrigin = srv.origin.toLowerCase().includes(q);
        const matchDest = srv.destination.toLowerCase().includes(q);
        const matchId = srv.id.toLowerCase().includes(q);
        if (!matchDriver && !matchClient && !matchOrigin && !matchDest && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [completedServices, periodFilter, selectedDate, selectedMonth, selectedYear, searchQuery]);

  // Overall KPIs calculated from filteredServices
  const totalServicesCount = filteredServices.length;
  const totalBilledUSD = filteredServices.reduce((acc, curr) => acc + curr.fareUSD, 0);
  const totalBilledVES = totalBilledUSD * config.bcvRate;
  const totalCommissionUSD = filteredServices.reduce((acc, curr) => acc + curr.commissionUSD, 0);
  const totalCommissionVES = totalCommissionUSD * config.bcvRate;
  const totalDriverEarningsUSD = filteredServices.reduce((acc, curr) => acc + curr.driverEarningsUSD, 0);

  // Grouped by Driver
  const driverBreakdown = useMemo(() => {
    const map: {
      [driverId: string]: {
        driverId: string;
        driverName: string;
        category: string;
        servicesCount: number;
        totalBilledUSD: number;
        commissionUSD: number;
        driverEarningsUSD: number;
      };
    } = {};

    filteredServices.forEach((srv) => {
      if (!map[srv.driverId]) {
        map[srv.driverId] = {
          driverId: srv.driverId,
          driverName: srv.driverName,
          category: srv.driverCategory,
          servicesCount: 0,
          totalBilledUSD: 0,
          commissionUSD: 0,
          driverEarningsUSD: 0,
        };
      }
      map[srv.driverId].servicesCount += 1;
      map[srv.driverId].totalBilledUSD += srv.fareUSD;
      map[srv.driverId].commissionUSD += srv.commissionUSD;
      map[srv.driverId].driverEarningsUSD += srv.driverEarningsUSD;
    });

    return Object.values(map).sort((a, b) => b.commissionUSD - a.commissionUSD);
  }, [filteredServices]);

  // Grouped by Client / Passenger
  const clientBreakdown = useMemo(() => {
    const map: {
      [clientId: string]: {
        clientId: string;
        clientName: string;
        clientPhone: string;
        servicesCount: number;
        totalSpentUSD: number;
        commissionGeneratedUSD: number;
      };
    } = {};

    filteredServices.forEach((srv) => {
      if (!map[srv.clientId]) {
        map[srv.clientId] = {
          clientId: srv.clientId,
          clientName: srv.clientName,
          clientPhone: srv.clientPhone,
          servicesCount: 0,
          totalSpentUSD: 0,
          commissionGeneratedUSD: 0,
        };
      }
      map[srv.clientId].servicesCount += 1;
      map[srv.clientId].totalSpentUSD += srv.fareUSD;
      map[srv.clientId].commissionGeneratedUSD += srv.commissionUSD;
    });

    return Object.values(map).sort((a, b) => b.totalSpentUSD - a.totalSpentUSD);
  }, [filteredServices]);

  // Grouped by Period Breakdown (Diario / Mensual / Anual) for charts or timeline list
  const timelineBreakdown = useMemo(() => {
    const map: {
      [key: string]: {
        periodKey: string;
        servicesCount: number;
        billedUSD: number;
        commissionUSD: number;
        driverEarningsUSD: number;
      };
    } = {};

    filteredServices.forEach((srv) => {
      let key = srv.date;
      if (periodFilter === 'mensual') {
        key = srv.date.substring(0, 7); // YYYY-MM
      } else if (periodFilter === 'anual') {
        key = srv.date.substring(0, 4); // YYYY
      }

      if (!map[key]) {
        map[key] = {
          periodKey: key,
          servicesCount: 0,
          billedUSD: 0,
          commissionUSD: 0,
          driverEarningsUSD: 0,
        };
      }
      map[key].servicesCount += 1;
      map[key].billedUSD += srv.fareUSD;
      map[key].commissionUSD += srv.commissionUSD;
      map[key].driverEarningsUSD += srv.driverEarningsUSD;
    });

    return Object.values(map).sort((a, b) => b.periodKey.localeCompare(a.periodKey));
  }, [filteredServices, periodFilter]);

  // Top performing driver
  const topDriver = driverBreakdown[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-zinc-950 to-black p-6 rounded-3xl border border-purple-900/60 shadow-xl shadow-purple-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/40">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Auditoría de Ganancias y Comisiones
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Control analítico de ingresos Vixy, comisiones retendidas y volumen por conductor y pasajero.
          </p>
        </div>

        {/* BCV Exchange Rate Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-zinc-900/90 rounded-2xl border border-purple-900/40 text-right">
            <p className="text-[10px] uppercase font-mono tracking-wider text-purple-300">Tasa Oficial BCV</p>
            <p className="text-sm font-black text-white font-mono">
              Bs. {config.bcvRate.toFixed(2)} <span className="text-[10px] text-zinc-400">/ USD</span>
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar & Period Filters */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-purple-900/40 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Period Mode Selectors */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black rounded-xl border border-purple-900/50 w-full md:w-auto">
            <button
              onClick={() => setPeriodFilter('diario')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodFilter === 'diario'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Vista Diaria</span>
            </button>
            <button
              onClick={() => setPeriodFilter('mensual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodFilter === 'mensual'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Vista Mensual</span>
            </button>
            <button
              onClick={() => setPeriodFilter('anual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodFilter === 'anual'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Vista Anual</span>
            </button>
            <button
              onClick={() => setPeriodFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodFilter === 'todos'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Histórico Completo</span>
            </button>
          </div>

          {/* Date Picker Input depending on period */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {periodFilter === 'diario' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 font-medium">Día:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-black border border-purple-900/60 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {periodFilter === 'mensual' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 font-medium">Mes:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 bg-black border border-purple-900/60 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {periodFilter === 'anual' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 font-medium">Año:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1.5 bg-black border border-purple-900/60 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            )}

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conductor, cliente, origen..."
                className="w-full pl-8 pr-3 py-1.5 bg-black border border-purple-900/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ganancias Netas Vixy (Comisiones) */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-purple-900/60 space-y-2 relative overflow-hidden shadow-lg shadow-purple-950/20">
          <div className="flex items-center justify-between text-xs font-bold text-purple-300">
            <span>Comisiones Vixy (Ganancias)</span>
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              ${totalCommissionUSD.toFixed(2)} <span className="text-xs text-purple-400 font-sans">USD</span>
            </div>
            <div className="text-xs font-mono text-purple-300 mt-1">
              Bs. {totalCommissionVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">Ingreso directo neto retenido por comisiones</p>
        </div>

        {/* KPI 2: Total Facturado en Servicios */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-purple-900/60 space-y-2 shadow-lg shadow-purple-950/20">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>Volumen Total Facturado</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-purple-900/40 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              ${totalBilledUSD.toFixed(2)} <span className="text-xs text-zinc-400 font-sans">USD</span>
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1">
              Bs. {totalBilledVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">Monto total pagado por pasajeros en viajes</p>
        </div>

        {/* KPI 3: Cantidad de Servicios Completes */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-purple-900/60 space-y-2 shadow-lg shadow-purple-950/20">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>Servicios / Carreras</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-purple-900/40 text-purple-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {totalServicesCount} <span className="text-xs text-zinc-400 font-sans">servicios</span>
            </div>
            <div className="text-xs text-purple-300 mt-1">
              Promedio: ${(totalServicesCount ? totalBilledUSD / totalServicesCount : 0).toFixed(2)} / viaje
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">Carreras finalizadas en el período seleccionado</p>
        </div>

        {/* KPI 4: Top Conductor */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-purple-900/60 space-y-2 shadow-lg shadow-purple-950/20">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>Mayor Generador</span>
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          {topDriver ? (
            <div>
              <div className="text-sm font-extrabold text-white truncate">
                {topDriver.driverName}
              </div>
              <div className="text-xs font-mono text-purple-300 mt-0.5">
                ${topDriver.commissionUSD.toFixed(2)} en comisiones ({topDriver.servicesCount} viajes)
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Sin datos de conductores en el período</p>
          )}
          <p className="text-[10px] text-zinc-500">Conductor con mayor aporte de comisiones</p>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-purple-900/40 pb-2">
        <button
          onClick={() => setSubTab('resumen')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
            subTab === 'resumen'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Resumen por Período</span>
        </button>

        <button
          onClick={() => setSubTab('conductores')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
            subTab === 'conductores'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Ganancias por Conductor ({driverBreakdown.length})</span>
        </button>

        <button
          onClick={() => setSubTab('pasajeros')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
            subTab === 'pasajeros'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Ganancias por Pasajero ({clientBreakdown.length})</span>
        </button>

        <button
          onClick={() => setSubTab('servicios')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
            subTab === 'servicios'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Historial Detallado ({filteredServices.length})</span>
        </button>
      </div>

      {/* SubTab 1: Resumen por Período */}
      {subTab === 'resumen' && (
        <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Desglose Temporal ({periodFilter.toUpperCase()})
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Resumen consolidado de comisiones y facturación agrupado por línea de tiempo.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-mono text-[11px] uppercase">
                  <th className="p-3">Período / Fecha</th>
                  <th className="p-3">Servicios Completados</th>
                  <th className="p-3">Facturación Total ($)</th>
                  <th className="p-3">Comisión Vixy ($)</th>
                  <th className="p-3">Comisión Vixy (Bs BCV)</th>
                  <th className="p-3">Ingreso Neto Conductores ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono">
                {timelineBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-zinc-500 font-sans">
                      No hay registros para el período seleccionado.
                    </td>
                  </tr>
                ) : (
                  timelineBreakdown.map((item) => (
                    <tr key={item.periodKey} className="hover:bg-purple-950/20 transition">
                      <td className="p-3 font-bold text-white flex items-center gap-2 font-sans">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>{item.periodKey}</span>
                      </td>
                      <td className="p-3 text-zinc-300">{item.servicesCount} carreras</td>
                      <td className="p-3 font-bold text-white">${(item.billedUSD ?? 0).toFixed(2)}</td>
                      <td className="p-3 font-bold text-purple-300">${(item.commissionUSD ?? 0).toFixed(2)}</td>
                      <td className="p-3 text-purple-400">
                        Bs. {((item.commissionUSD ?? 0) * (config?.bcvRate ?? 58.5)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-emerald-400">${(item.driverEarningsUSD ?? 0).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Ganancias por Conductor */}
      {subTab === 'conductores' && (
        <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-400" />
              Ganancias Generadas por Conductor
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Análisis individual de rendimiento por conductor, viajes completados y aporte en comisiones.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-mono text-[11px] uppercase">
                  <th className="p-3">Conductor</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Viajes</th>
                  <th className="p-3">Total Facturado ($)</th>
                  <th className="p-3">Comisión para Vixy ($)</th>
                  <th className="p-3">Comisión en Bs (BCV)</th>
                  <th className="p-3">Ganancia Conductor ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {driverBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-zinc-500">
                      Sin datos de conductores en este rango.
                    </td>
                  </tr>
                ) : (
                  driverBreakdown.map((drv) => {
                    const matchedDriverObj = drivers.find((d) => d.id === drv.driverId);
                    return (
                      <tr key={drv.driverId} className="hover:bg-purple-950/20 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={matchedDriverObj?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-purple-800"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{drv.driverName}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">{drv.driverId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-900 border border-purple-800 text-purple-300">
                            {drv.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-zinc-300">{drv.servicesCount}</td>
                        <td className="p-3 font-mono font-bold text-white">${(drv.totalBilledUSD ?? 0).toFixed(2)}</td>
                        <td className="p-3 font-mono font-black text-purple-300">
                          ${(drv.commissionUSD ?? 0).toFixed(2)}
                        </td>
                        <td className="p-3 font-mono text-purple-400">
                          Bs. {((drv.commissionUSD ?? 0) * (config?.bcvRate ?? 58.5)).toFixed(2)}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          ${(drv.driverEarningsUSD ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Ganancias por Pasajero / Cliente */}
      {subTab === 'pasajeros' && (
        <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Ganancias Generadas por Pasajero / Cliente
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Volumen consumido por cliente y comisiones Vixy derivadas de sus traslados.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-mono text-[11px] uppercase">
                  <th className="p-3">Pasajero / Cliente</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3">Servicios Solicitados</th>
                  <th className="p-3">Total Gastado ($)</th>
                  <th className="p-3">Total Gastado (Bs BCV)</th>
                  <th className="p-3">Comisión Generada a Vixy ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {clientBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-zinc-500">
                      Sin datos de pasajeros en este rango.
                    </td>
                  </tr>
                ) : (
                  clientBreakdown.map((cli) => {
                    const matchedClientObj = clients.find((c) => c.id === cli.clientId);
                    return (
                      <tr key={cli.clientId} className="hover:bg-purple-950/20 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={matchedClientObj?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-purple-800"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{cli.clientName}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">{cli.clientId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-zinc-400">{cli.clientPhone}</td>
                        <td className="p-3 font-mono font-bold text-zinc-300">{cli.servicesCount}</td>
                        <td className="p-3 font-mono font-bold text-white">${(cli.totalSpentUSD ?? 0).toFixed(2)}</td>
                        <td className="p-3 font-mono text-zinc-400">
                          Bs. {((cli.totalSpentUSD ?? 0) * (config?.bcvRate ?? 58.5)).toFixed(2)}
                        </td>
                        <td className="p-3 font-mono font-black text-purple-300">
                          ${(cli.commissionGeneratedUSD ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 4: Historial Detallado de Servicios */}
      {subTab === 'servicios' && (
        <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Registro Detallado de Servicios Completados
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Auditoría transacción por transacción de cada tarifa, comisión y medio de pago.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-mono text-[11px] uppercase">
                  <th className="p-3">ID / Fecha</th>
                  <th className="p-3">Conductor</th>
                  <th className="p-3">Pasajero</th>
                  <th className="p-3">Ruta (Origen &rarr; Destino)</th>
                  <th className="p-3">Tarifa Total</th>
                  <th className="p-3">Comisión Vixy</th>
                  <th className="p-3">Método Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-zinc-500">
                      No se encontraron servicios finalizados en el filtro.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((srv) => (
                    <tr key={srv.id} className="hover:bg-purple-950/20 transition">
                      <td className="p-3 font-mono">
                        <p className="font-bold text-white text-xs">{srv.id}</p>
                        <p className="text-[10px] text-zinc-400">{srv.date} {srv.time}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-white text-xs">{srv.driverName}</p>
                        <span className="text-[9px] uppercase font-bold text-purple-300 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800">
                          {srv.driverCategory}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-white text-xs">{srv.clientName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{srv.clientPhone}</p>
                      </td>
                      <td className="p-3 text-[11px] max-w-xs">
                        <p className="text-zinc-300 truncate">📍 {srv.origin}</p>
                        <p className="text-purple-300 truncate">🏁 {srv.destination}</p>
                      </td>
                      <td className="p-3 font-mono">
                        <p className="font-bold text-white">${(srv.fareUSD ?? 0).toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-400">Bs. {(srv.fareVES ?? 0).toFixed(2)}</p>
                      </td>
                      <td className="p-3 font-mono">
                        <p className="font-black text-purple-300">
                          ${(srv.commissionUSD ?? 0).toFixed(2)} ({srv.commissionPercent ?? 12.5}%)
                        </p>
                        <p className="text-[10px] text-purple-400">Bs. {(srv.commissionVES ?? 0).toFixed(2)}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-purple-900/40 text-xs font-bold text-zinc-300">
                          {srv.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
