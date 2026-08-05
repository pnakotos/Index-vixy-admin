import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  X,
  Check,
  AlertCircle,
  Calculator,
  Car,
  Bike,
  Package,
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
  Globe,
  Copy,
  Info,
} from 'lucide-react';
import {
  UniversityFareConfig,
  StateServiceFares,
  ServiceType,
  ServiceFareConfig,
} from '../types';
import { calculateTripFare } from '../utils/fareCalculator';

interface UniversityTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  stateName: string;
  standardStateFares: StateServiceFares;
  universityFareConfig: UniversityFareConfig;
  bcvRate: number;
  nationalEnabled?: boolean;
  onToggleNational?: (enabled: boolean) => void;
  onSave: (stateName: string, updatedConfig: UniversityFareConfig) => void;
  onApplyToAllStates: (configToApply: UniversityFareConfig) => void;
}

export const UniversityTariffModal: React.FC<UniversityTariffModalProps> = ({
  isOpen,
  onClose,
  stateName,
  standardStateFares,
  universityFareConfig,
  bcvRate,
  nationalEnabled = true,
  onToggleNational,
  onSave,
  onApplyToAllStates,
}) => {
  if (!isOpen) return null;

  // Local state initialized with current state university config
  const [config, setConfig] = useState<UniversityFareConfig>(() => ({
    ...universityFareConfig,
    taxi: { ...universityFareConfig.taxi },
    mototaxi: { ...universityFareConfig.mototaxi },
    delivery: { ...universityFareConfig.delivery },
    allowedUniversities: [...(universityFareConfig.allowedUniversities || [])],
  }));

  const [activeTab, setActiveTab] = useState<ServiceType | 'info'>('taxi');
  const [newUniName, setNewUniName] = useState('');
  const [simDistanceKm, setSimDistanceKm] = useState<number>(5.0);

  // Sync state when props change
  useEffect(() => {
    setConfig({
      ...universityFareConfig,
      taxi: { ...universityFareConfig.taxi },
      mototaxi: { ...universityFareConfig.mototaxi },
      delivery: { ...universityFareConfig.delivery },
      allowedUniversities: [...(universityFareConfig.allowedUniversities || [])],
    });
  }, [universityFareConfig, stateName]);

  // Update a specific service field
  const handleUpdateServiceField = (
    service: ServiceType,
    field: keyof ServiceFareConfig,
    val: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: isNaN(val) ? 0 : Math.max(0, val),
      },
    }));
  };

  // Apply quick discount percentage to a service
  const handleApplyDiscountPercent = (service: ServiceType, percent: number) => {
    const std = standardStateFares[service];
    const factor = 1 - percent / 100;
    setConfig((prev) => ({
      ...prev,
      [service]: {
        baseFareUSD: +(std.baseFareUSD * factor).toFixed(2),
        baseDistanceKm: std.baseDistanceKm,
        additionalKmRateUSD: +(std.additionalKmRateUSD * factor).toFixed(2),
      },
    }));
  };

  // Set quick fixed base fare
  const handleSetFixedBaseFare = (service: ServiceType, fixedBase: number) => {
    setConfig((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        baseFareUSD: fixedBase,
      },
    }));
  };

  // Add university code
  const handleAddUniversity = () => {
    const trimmed = newUniName.trim().toUpperCase();
    if (trimmed && !config.allowedUniversities.includes(trimmed)) {
      setConfig((prev) => ({
        ...prev,
        allowedUniversities: [...prev.allowedUniversities, trimmed],
      }));
      setNewUniName('');
    }
  };

  // Remove university code
  const handleRemoveUniversity = (uniName: string) => {
    setConfig((prev) => ({
      ...prev,
      allowedUniversities: prev.allowedUniversities.filter((u) => u !== uniName),
    }));
  };

  // Save handler
  const handleSaveModal = () => {
    onSave(stateName, config);
    onClose();
  };

  // Apply to all states handler
  const handleApplyAllModal = () => {
    if (
      window.confirm(
        `¿Desea aplicar esta misma configuración de Modalidad Tarifa Universitaria (${stateName}) a los 24 estados de Venezuela?`
      )
    ) {
      onApplyToAllStates(config);
      onClose();
    }
  };

  // Helper to calculate discount vs standard rate for a service
  const getDiscountStats = (service: ServiceType) => {
    const std = standardStateFares[service];
    const uni = config[service];

    const baseSavingsUSD = std.baseFareUSD - uni.baseFareUSD;
    const baseDiscountPct = std.baseFareUSD > 0
      ? Math.round((baseSavingsUSD / std.baseFareUSD) * 100)
      : 0;

    const stdSim = calculateTripFare(simDistanceKm, std.baseFareUSD, std.baseDistanceKm, std.additionalKmRateUSD, bcvRate, 12.5);
    const uniSim = calculateTripFare(simDistanceKm, uni.baseFareUSD, uni.baseDistanceKm, uni.additionalKmRateUSD, bcvRate, 12.5);
    const totalSavingsUSD = stdSim.totalFareUSD - uniSim.totalFareUSD;
    const totalSavingsVES = stdSim.totalFareVES - uniSim.totalFareVES;

    return {
      baseDiscountPct,
      stdSim,
      uniSim,
      totalSavingsUSD,
      totalSavingsVES,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-400/30">
              <GraduationCap className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Modalidad Tarifa Universitaria
                </span>
                <span className="text-xs text-slate-300 font-mono">📍 {stateName}</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                Modalidad Tarifa Universitaria — Estado {stateName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Important Rule Banner: Destination/Origin requirement */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5">
                <span>Condición Exclusiva de Dirección Universitaria</span>
              </h4>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Esta modificación de tarifa es <strong>independiente de las demás tarifas</strong> y se aplica <strong>ÚNICAMENTE a los viajes donde la dirección de origen o destino marcada por el usuario corresponda a un campus universitario</strong> o centro académico registrado.
              </p>
            </div>
          </div>

          {/* National & State Activation Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* National Switch */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 border border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-300">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Nivel Nacional:</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {nationalEnabled ? 'Modalidad Universitaria activa a nivel nacional' : 'Modalidad Universitaria suspendida a nivel nacional'}
                </p>
              </div>

              {onToggleNational && (
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nationalEnabled}
                    onChange={(e) => onToggleNational(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              )}
            </div>

            {/* State-Level Independent Switch */}
            <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-950">
                  <GraduationCap className="w-4 h-4 text-purple-700" />
                  <span>Estado {stateName}:</span>
                </div>
                <p className="text-[10px] text-purple-800">
                  {config.enabled ? 'Activa independientemente en este estado' : 'Inactiva independientemente en este estado'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Service Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('taxi')}
              className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === 'taxi'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>🚗 Taxi (Universidad)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mototaxi')}
              className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === 'mototaxi'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>🏍️ Moto Taxi (Universidad)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === 'delivery'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>📦 Delivery (Universidad)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Universidades</span>
            </button>
          </div>

          {/* Tab Content for Services (Taxi / Mototaxi / Delivery) */}
          {activeTab !== 'info' && (() => {
            const currentService = activeTab;
            const currentFare = config[currentService];
            const stdFare = standardStateFares[currentService];
            const stats = getDiscountStats(currentService);

            return (
              <div className="space-y-5">
                {/* Standard vs University Comparison Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Tarifa Estándar Base (Para viajes sin dirección universitaria)
                    </span>
                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-2">
                      <span>Mínima: <strong>${stdFare.baseFareUSD.toFixed(2)} USD</strong> ({stdFare.baseDistanceKm} Km)</span>
                      <span>•</span>
                      <span>+Km Extra: <strong>${stdFare.additionalKmRateUSD.toFixed(2)} USD/Km</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 font-extrabold text-xs border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Diferencial Universitario: {stats.baseDiscountPct > 0 ? `-${stats.baseDiscountPct}%` : 'Personalizado'}
                    </span>
                  </div>
                </div>

                {/* Quick Presets Buttons */}
                <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-purple-900 block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Ajustes Rápidos de Modalidad Tarifa Universitaria:</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={() => handleApplyDiscountPercent(currentService, 15)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-300 hover:bg-purple-600 hover:text-white font-bold text-purple-900 transition"
                    >
                      -15%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyDiscountPercent(currentService, 20)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-300 hover:bg-purple-600 hover:text-white font-bold text-purple-900 transition"
                    >
                      -20%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyDiscountPercent(currentService, 25)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-300 hover:bg-purple-600 hover:text-white font-bold text-purple-900 transition"
                    >
                      -25% (Recomendado)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyDiscountPercent(currentService, 30)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-300 hover:bg-purple-600 hover:text-white font-bold text-purple-900 transition"
                    >
                      -30%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetFixedBaseFare(currentService, 1.50)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-800 hover:text-white font-bold text-slate-800 transition"
                    >
                      Fijo $1.50 Mínimo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetFixedBaseFare(currentService, 1.00)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-800 hover:text-white font-bold text-slate-800 transition"
                    >
                      Fijo $1.00 Mínimo
                    </button>
                  </div>
                </div>

                {/* Form Inputs for University Fares */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* University Base Fare */}
                  <div className="space-y-1.5 p-3.5 bg-white border border-purple-200 rounded-xl shadow-2xs">
                    <label className="font-bold text-slate-800 block flex items-center justify-between">
                      <span>Tarifa Mínima Universitaria ($):</span>
                      <span className="text-[10px] text-purple-600 font-bold">USD</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={currentFare.baseFareUSD}
                        onChange={(e) =>
                          handleUpdateServiceField(
                            currentService,
                            'baseFareUSD',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full p-3 bg-purple-50/40 border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-600"
                        required
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-purple-600 font-bold">
                        USD ($)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Precio especial cuando el viaje sea hacia/desde una universidad en {stateName}.
                    </p>
                  </div>

                  {/* University Base Distance */}
                  <div className="space-y-1.5 p-3.5 bg-white border border-blue-200 rounded-xl shadow-2xs">
                    <label className="font-bold text-slate-800 block flex items-center justify-between">
                      <span>Km Incluidos (Universidad):</span>
                      <span className="text-[10px] text-blue-600 font-bold">Km</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={currentFare.baseDistanceKm}
                        onChange={(e) =>
                          handleUpdateServiceField(
                            currentService,
                            'baseDistanceKm',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full p-3 bg-blue-50/40 border border-blue-300 rounded-xl text-xs font-mono font-bold text-blue-900 focus:outline-none focus:border-blue-600"
                        required
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-blue-600 font-bold">
                        Km
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Distancia inicial cubierta en la tarifa mínima universitaria.
                    </p>
                  </div>

                  {/* University Additional Km Rate */}
                  <div className="space-y-1.5 p-3.5 bg-white border border-emerald-200 rounded-xl shadow-2xs">
                    <label className="font-bold text-slate-800 block flex items-center justify-between">
                      <span>+Km Adicional (Universidad) ($):</span>
                      <span className="text-[10px] text-emerald-600 font-bold">USD/Km</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={currentFare.additionalKmRateUSD}
                        onChange={(e) =>
                          handleUpdateServiceField(
                            currentService,
                            'additionalKmRateUSD',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full p-3 bg-emerald-50/40 border border-emerald-300 rounded-xl text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:border-emerald-600"
                        required
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-emerald-600 font-bold">
                        USD/Km
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Costo por cada km extra en viajes con dirección a/desde campus.
                    </p>
                  </div>
                </div>

                {/* Live Comparison Simulator Box */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white">
                        Simulador Comparativo: Dirección Convencional vs Dirección Universitaria
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[10px]">Distancia:</span>
                      {[2.0, 5.0, 10.0, 15.0].map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => setSimDistanceKm(km)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            simDistanceKm === km
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {km}Km
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Standard Price */}
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">🏠 Dirección Normal ({simDistanceKm} Km)</span>
                      <div className="text-base font-extrabold text-slate-200 font-mono">
                        ${stats.stdSim.totalFareUSD.toFixed(2)} USD
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bs. {stats.stdSim.totalFareVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                      </div>
                    </div>

                    {/* University Price */}
                    <div className="p-3 bg-purple-950/80 rounded-xl border border-purple-700 space-y-1">
                      <span className="text-[10px] text-purple-300 font-bold block flex items-center justify-between">
                        <span>🎓 Dirección a/desde Universidad</span>
                        <span className="text-[9px] bg-purple-700 text-white px-1.5 py-0.2 rounded font-mono">PRECIO ESPECIAL</span>
                      </span>
                      <div className="text-base font-extrabold text-purple-200 font-mono">
                        ${stats.uniSim.totalFareUSD.toFixed(2)} USD
                      </div>
                      <div className="text-[10px] text-purple-300 font-mono">
                        Bs. {stats.uniSim.totalFareVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                      </div>
                    </div>

                    {/* Savings */}
                    <div className="p-3 bg-emerald-950/80 rounded-xl border border-emerald-700 space-y-1">
                      <span className="text-[10px] text-emerald-300 font-bold block">💚 Beneficio por Dirección Universitaria</span>
                      <div className="text-base font-extrabold text-emerald-200 font-mono">
                        -${stats.totalSavingsUSD.toFixed(2)} USD
                      </div>
                      <div className="text-[10px] text-emerald-300 font-mono">
                        Ahorro de Bs. {stats.totalSavingsVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tab Content for Universities & Verification */}
          {activeTab === 'info' && (
            <div className="space-y-5 text-xs">
              {/* Verification Requirement Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      Exigir Verificación de Carné Estudiantil Universitario
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Además de marcar la dirección de la universidad, el usuario debe tener su carné estudiantil activo para activar la tarifa.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.requireStudentVerification ?? true}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        requireStudentVerification: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Universities List Management */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                  <span>Sedes y Campus Universitarios Registrados en {stateName}</span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">
                    {config.allowedUniversities.length} Registradas
                  </span>
                </h4>

                <p className="text-[11px] text-slate-500">
                  Direcciones vinculadas a estas instituciones aplicarán automáticamente la Modalidad Tarifa Universitaria.
                </p>

                {/* Add university input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ej. UCV, USB, UCAB, LUZ, ULA, UNEFA..."
                    value={newUniName}
                    onChange={(e) => setNewUniName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUniversity();
                      }
                    }}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddUniversity}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Campus</span>
                  </button>
                </div>

                {/* Universities Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  {config.allowedUniversities.map((uni) => (
                    <span
                      key={uni}
                      className="px-3 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>🏛️ {uni}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUniversity(uni)}
                        className="text-purple-400 hover:text-red-600 transition p-0.5"
                        title="Eliminar universidad"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Note / Terms for Students */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block text-xs">
                  Condiciones e Instrucciones para la Modalidad Tarifa Universitaria ({stateName}):
                </label>
                <textarea
                  rows={2}
                  value={config.notes || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ej. Aplica únicamente a viajes que indiquen origen o destino en un campus universitario reconocido..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleApplyAllModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-300"
          >
            <Copy className="w-4 h-4 text-slate-600" />
            <span>Aplicar a los 24 Estados</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveModal}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Modalidad Tarifa Universitaria ({stateName})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
