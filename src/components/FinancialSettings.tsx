import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  CreditCard,
  Smartphone,
  Save,
  Wallpaper,
  Key,
  Globe,
  Upload,
  Check,
  Server,
  Zap,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Calculator,
  MapPin,
  Car,
  Bike,
  Package,
  Copy,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { calculateTripFare } from '../utils/fareCalculator';
import {
  VENEZUELA_STATES,
  INITIAL_STATE_RATES,
  createDefaultStateServiceFares,
  INITIAL_UNIVERSITY_STATE_RATES,
  createDefaultUniversityFare,
} from '../data/mockData';
import {
  StateRatesMap,
  ServiceType,
  ServiceFareConfig,
  StateUniversityRatesMap,
  UniversityFareConfig,
} from '../types';
import { UniversityTariffModal } from './UniversityTariffModal';

export const FinancialSettings: React.FC = () => {
  const {
    config,
    updateConfig,
    brandingMedia,
    updateBrandingMedia,
    apiConfig,
    updateApiConfig,
    setIsWebGuideModalOpen,
  } = useAdmin();

  // Active sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'financial' | 'branding' | 'apiKeys'>('financial');

  // Local state for Financials & Service Rates
  const [bcvRateInput, setBcvRateInput] = useState(config.bcvRate.toString());
  const [commissionInput, setCommissionInput] = useState(config.commissionPercent.toString());
  const [thresholdInput, setThresholdInput] = useState(config.negativeBalanceThreshold.toString());
  const [adminEmailInput, setAdminEmailInput] = useState(config.adminEmail);

  // Service Pricing & Rates State
  const [baseFareInput, setBaseFareInput] = useState((config.baseFareUSD ?? 2.00).toString());
  const [baseDistanceInput, setBaseDistanceInput] = useState((config.baseDistanceKm ?? 3.0).toString());
  const [additionalKmRateInput, setAdditionalKmRateInput] = useState((config.additionalKmRateUSD ?? 0.50).toString());

  // Live Fare Calculator Simulator State
  const [testDistanceKm, setTestDistanceKm] = useState<number>(5.0);

  // Venezuela State-Based Service Fares State
  const [stateRates, setStateRates] = useState<StateRatesMap>(
    config.stateRates || INITIAL_STATE_RATES
  );
  const [universityStateRates, setUniversityStateRates] = useState<StateUniversityRatesMap>(
    config.universityStateRates || INITIAL_UNIVERSITY_STATE_RATES
  );
  const [universityNationalEnabled, setUniversityNationalEnabled] = useState<boolean>(
    config.universityNationalEnabled ?? true
  );
  const [selectedState, setSelectedState] = useState<string>('Distrito Capital');
  const [selectedService, setSelectedService] = useState<ServiceType>('taxi');
  const [stateSearchTerm, setStateSearchTerm] = useState<string>('');
  const [showFullRatesTable, setShowFullRatesTable] = useState<boolean>(false);

  // University Tariff Modal State
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState<boolean>(false);
  const [universityModalState, setUniversityModalState] = useState<string>('Distrito Capital');

  // Helper to get rates safely for a state & service
  const getFareForStateService = (stateName: string, service: ServiceType): ServiceFareConfig => {
    const defaults = createDefaultStateServiceFares(stateName)[service];
    if (stateRates && stateRates[stateName] && stateRates[stateName][service]) {
      return {
        ...defaults,
        ...stateRates[stateName][service],
      };
    }
    return defaults;
  };

  // Helper to get university rates safely for a state
  const getUniversityFareForState = (stateName: string): UniversityFareConfig => {
    const defaultVal = createDefaultUniversityFare(stateName);
    if (universityStateRates && universityStateRates[stateName]) {
      const current = universityStateRates[stateName];
      return {
        ...defaultVal,
        ...current,
        taxi: { ...defaultVal.taxi, ...(current.taxi || {}) },
        mototaxi: { ...defaultVal.mototaxi, ...(current.mototaxi || {}) },
        delivery: { ...defaultVal.delivery, ...(current.delivery || {}) },
      };
    }
    return defaultVal;
  };

  const handleOpenUniversityModal = (stateName: string) => {
    setUniversityModalState(stateName);
    setIsUniversityModalOpen(true);
  };

  const handleSaveUniversityFare = (stateName: string, updatedConfig: UniversityFareConfig) => {
    setUniversityStateRates((prev) => ({
      ...prev,
      [stateName]: updatedConfig,
    }));
  };

  const handleApplyUniversityFareToAllStates = (configToApply: UniversityFareConfig) => {
    const updatedMap: StateUniversityRatesMap = {};
    VENEZUELA_STATES.forEach((st) => {
      updatedMap[st] = JSON.parse(JSON.stringify({
        ...configToApply,
        notes: `Modalidad Tarifa Universitaria activa para ${st}. Aplica exclusivamente a direcciones de campus o centros académicos.`,
      }));
    });
    setUniversityStateRates(updatedMap);
  };

  // Handler to update a field in stateRates
  const handleUpdateStateServiceFare = (
    stateName: string,
    service: ServiceType,
    field: keyof ServiceFareConfig,
    value: number
  ) => {
    setStateRates((prev) => {
      const currentStateFares = prev[stateName]
        ? { ...prev[stateName] }
        : createDefaultStateServiceFares(stateName);

      const currentServiceFare = currentStateFares[service]
        ? { ...currentStateFares[service] }
        : { baseFareUSD: 2.5, baseDistanceKm: 3.0, additionalKmRateUSD: 0.6 };

      currentServiceFare[field] = isNaN(value) ? 0 : Math.max(0, value);
      currentStateFares[service] = currentServiceFare;

      return {
        ...prev,
        [stateName]: currentStateFares,
      };
    });
  };

  // Copy rates of selected state to all states
  const handleCopyRatesToAllStates = (sourceState: string) => {
    const sourceFares = stateRates[sourceState] || createDefaultStateServiceFares(sourceState);
    if (!window.confirm(`¿Desea aplicar las tarifas de "${sourceState}" a los 24 estados de Venezuela?`)) {
      return;
    }

    const updatedMap: StateRatesMap = {};
    VENEZUELA_STATES.forEach((st) => {
      updatedMap[st] = JSON.parse(JSON.stringify(sourceFares));
    });
    setStateRates(updatedMap);
  };

  // Reset selected state to defaults
  const handleResetStateRates = (stateName: string) => {
    const defaultFares = createDefaultStateServiceFares(stateName);
    setStateRates((prev) => ({
      ...prev,
      [stateName]: defaultFares,
    }));
  };

  // Pago Móvil form state
  const [pagoBank, setPagoBank] = useState(config.pagoMovil.bankName);
  const [pagoPhone, setPagoPhone] = useState(config.pagoMovil.phone);
  const [pagoCif, setPagoCif] = useState(config.pagoMovil.cif);
  const [pagoHolder, setPagoHolder] = useState(config.pagoMovil.holderName);

  // Gateways toggle state
  const [gateways, setGateways] = useState(config.gateways);

  // Local state for Branding / Wallpaper (Admin Panel)
  const [tempBgImage, setTempBgImage] = useState(
    brandingMedia.backgroundImageUrl || brandingMedia.imageUrl
  );
  const [tempCardImage, setTempCardImage] = useState(brandingMedia.imageUrl);
  const [tempTitle, setTempTitle] = useState(brandingMedia.videoTitle || 'Plataforma Oficial Vixy');

  // Local state for API Keys & Interconnections
  const [backendUrlInput, setBackendUrlInput] = useState(apiConfig.backendApiUrl);
  const [prodApiKeyInput, setProdApiKeyInput] = useState(apiConfig.prodApiKey);
  const [mapsApiKeyInput, setMapsApiKeyInput] = useState(apiConfig.googleMapsApiKey);
  const [webhookSecretInput, setWebhookSecretInput] = useState(apiConfig.paymentWebhookSecret);
  const [driverSyncInput, setDriverSyncInput] = useState(apiConfig.driverAppSyncEndpoint);
  const [passengerSyncInput, setPassengerSyncInput] = useState(apiConfig.passengerAppSyncEndpoint);
  const [fcmKeyInput, setFcmKeyInput] = useState(apiConfig.fcmServerKey);
  const [isProdMode, setIsProdMode] = useState(apiConfig.productionMode);

  // Toggle visibility for secret keys
  const [showApiKeys, setShowApiKeys] = useState(false);

  const handleSaveFinancials = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(bcvRateInput);
    const comm = parseFloat(commissionInput);
    const thresh = parseFloat(thresholdInput);
    const baseFare = parseFloat(baseFareInput);
    const baseDist = parseFloat(baseDistanceInput);
    const addKmRate = parseFloat(additionalKmRateInput);

    if (isNaN(rate) || rate <= 0) {
      alert('Por favor ingrese un valor válido para la tasa BCV.');
      return;
    }
    if (isNaN(baseFare) || baseFare < 0) {
      alert('Por favor ingrese una tarifa mínima base válida.');
      return;
    }
    if (isNaN(baseDist) || baseDist <= 0) {
      alert('Por favor ingrese una distancia base válida.');
      return;
    }
    if (isNaN(addKmRate) || addKmRate < 0) {
      alert('Por favor ingrese un costo por km adicional válido.');
      return;
    }

    updateConfig({
      bcvRate: rate,
      commissionPercent: !isNaN(comm) ? comm : config.commissionPercent,
      negativeBalanceThreshold: !isNaN(thresh) ? thresh : config.negativeBalanceThreshold,
      adminEmail: adminEmailInput.trim(),
      baseFareUSD: baseFare,
      baseDistanceKm: baseDist,
      additionalKmRateUSD: addKmRate,
      stateRates: stateRates,
      universityStateRates: universityStateRates,
      universityNationalEnabled: universityNationalEnabled,
      pagoMovil: {
        bankName: pagoBank.trim(),
        bankCode: pagoBank.slice(0, 4),
        phone: pagoPhone.trim(),
        cif: pagoCif.trim(),
        holderName: pagoHolder.trim(),
      },
      gateways,
    });
  };

  const handleGatewayToggle = (key: keyof typeof gateways) => {
    setGateways((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandingMedia({
      backgroundImageUrl: tempBgImage.trim(),
      imageUrl: tempCardImage.trim(),
      videoTitle: tempTitle.trim(),
    });
  };

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTempBgImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTempCardImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiConfig({
      backendApiUrl: backendUrlInput.trim(),
      prodApiKey: prodApiKeyInput.trim(),
      googleMapsApiKey: mapsApiKeyInput.trim(),
      paymentWebhookSecret: webhookSecretInput.trim(),
      driverAppSyncEndpoint: driverSyncInput.trim(),
      passengerAppSyncEndpoint: passengerSyncInput.trim(),
      fcmServerKey: fcmKeyInput.trim(),
      productionMode: isProdMode,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Panel de Configuración General, Fondo e Interconexiones
            </h2>
            <p className="text-xs text-slate-500">
              Gestión de parámetros financieros, personalización de fondo y claves API de producción.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsWebGuideModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-2 transition shrink-0"
        >
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Guía de Despliegue Web</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('financial')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'financial'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tasa BCV & Pasarelas de Pago</span>
        </button>

        <button
          onClick={() => setActiveSubTab('branding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'branding'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallpaper className="w-4 h-4" />
          <span>Fondo de Pantalla & Marca (Admin)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('apiKeys')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'apiKeys'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Claves API e Interconexión de Apps</span>
        </button>
      </div>

      {/* TAB 1: FINANCIAL CONFIGURATION */}
      {activeSubTab === 'financial' && (
        <form onSubmit={handleSaveFinancials} className="space-y-6">
          {/* Economic Parameters */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Parámetros Económicos y Tasa de Cambio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* BCV Dollar Rate */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Tasa del Dólar BCV (VES per USD):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={bcvRateInput}
                    onChange={(e) => setBcvRateInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-600 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">
                    Bs/$
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Ajuste diario según tasa oficial publicado por el Banco Central de Venezuela.
                </p>
              </div>

              {/* Company Commission % */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Porcentaje de Comisión Empresa (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Porcentaje libremente ajustable según variaciones de la economía.
                </p>
              </div>

              {/* Negative Balance Alert Threshold */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Límite Alerta Saldo Negativo (USD):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-red-600 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">
                    USD
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Límite por defecto asignado a -0.50$ para notificaciones automáticas.
                </p>
              </div>
            </div>
          </div>

          {/* Tarificación de Servicios por Estado de Venezuela y Tipo de Servicio */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xs">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>Tarifas por Estado de Venezuela y Tipo de Servicio</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure la tarifa mínima y el costo por kilómetro diferenciado para <strong>Taxi</strong>, <strong>Moto Taxi</strong> y <strong>Delivery</strong> en cada uno de los 24 estados de Venezuela.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  24 Estados Activos
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullRatesTable(!showFullRatesTable)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-600" />
                  <span>{showFullRatesTable ? 'Ocultar Matriz' : 'Ver Matriz Nacional'}</span>
                </button>
              </div>
            </div>

            {/* National Master Box for Modalidad Tarifa Universitaria */}
            <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-purple-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/30">
                    <GraduationCap className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">
                        🎓 Modalidad Tarifa Universitaria (Independiente)
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/30">
                        Solo Direcciones Universitarias
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-200 mt-0.5">
                      Esta modificación de tarifa es independiente y aplica <strong>ÚNICAMENTE</strong> a viajes cuya dirección de origen o destino marcada por el usuario sea un campus universitario o centro académico.
                    </p>
                  </div>
                </div>

                {/* Master National Toggle Switch */}
                <div className="flex items-center gap-3 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-purple-700/50 shrink-0">
                  <span className="text-xs font-extrabold text-purple-200">
                    Estado Nacional:
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={universityNationalEnabled}
                      onChange={(e) => setUniversityNationalEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                  <span className={`px-2 py-0.5 rounded text-xs font-extrabold font-mono ${
                    universityNationalEnabled ? 'bg-emerald-500 text-white' : 'bg-red-900 text-red-200'
                  }`}>
                    {universityNationalEnabled ? 'ACTIVA NACIONAL' : 'SUSPENDIDA NACIONAL'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-2 text-purple-200 text-[11px]">
                  <span>📍 Configuración de Modalidad Universitaria para <strong>{selectedState}</strong>:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    getUniversityFareForState(selectedState).enabled
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {getUniversityFareForState(selectedState).enabled ? 'Activa en ' + selectedState : 'Inactiva en ' + selectedState}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenUniversityModal(selectedState)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm border border-purple-300/40"
                >
                  <GraduationCap className="w-4 h-4 text-purple-100" />
                  <span>🎓 Configurar Modalidad Tarifa Universitaria ({selectedState})</span>
                </button>
              </div>
            </div>

            {/* State Selection Bar */}
            <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>Seleccione el Estado a Configurar:</span>
                </label>

                {/* State Search & Select */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar estado..."
                      value={stateSearchTerm}
                      onChange={(e) => setStateSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="p-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-900 focus:outline-none focus:border-purple-600"
                  >
                    {VENEZUELA_STATES.filter((st) =>
                      st.toLowerCase().includes(stateSearchTerm.toLowerCase())
                    ).map((st) => (
                      <option key={st} value={st}>
                        📍 {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick State Pill Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">Estados Destacados:</span>
                {[
                  'Distrito Capital',
                  'Miranda',
                  'Carabobo',
                  'Zulia',
                  'Aragua',
                  'Lara',
                  'Mérida',
                  'Táchira',
                  'Nueva Esparta',
                  'La Guaira',
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedState(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      selectedState === st
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-50'
                    }`}
                  >
                    <span>{st}</span>
                    {selectedState === st && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Currently Selected State Banner & Action Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-600 text-white rounded-lg font-bold">📍</span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Configurando Tarifas para: <span className="text-purple-700 underline">{selectedState}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Los cambios aplicados a este estado se guardarán al pulsar el botón "Guardar Configuración".
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenUniversityModal(selectedState)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-900 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs border border-purple-400"
                  title={`Abrir Configuración de Modalidad Tarifa Universitaria para ${selectedState}`}
                >
                  <GraduationCap className="w-4 h-4 text-purple-200" />
                  <span>🎓 Modalidad Tarifa Universitaria</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    getUniversityFareForState(selectedState).enabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {getUniversityFareForState(selectedState).enabled ? 'Activa' : 'Inactiva'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyRatesToAllStates(selectedState)}
                  className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition flex items-center gap-1.5 border border-purple-300"
                  title="Copiar las tarifas actuales de este estado a los 24 estados de Venezuela"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Aplicar a los 24 Estados</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleResetStateRates(selectedState)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
                  title="Restablecer tarifas de este estado a los valores recomendados por defecto"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restablecer Estado</span>
                </button>
              </div>
            </div>

            {/* Service Type Selector Tabs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedService('taxi')}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
                    selectedService === 'taxi'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>🚗 Taxi (Vehicular)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedService('mototaxi')}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
                    selectedService === 'mototaxi'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>🏍️ Moto Taxi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedService('delivery')}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
                    selectedService === 'delivery'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>📦 Delivery / Envíos</span>
                </button>
              </div>

              {/* Service Pricing Inputs for Selected State & Service */}
              {(() => {
                const currentFare = getFareForStateService(selectedState, selectedService);
                const serviceLabel =
                  selectedService === 'taxi'
                    ? 'Taxi (Vehicular)'
                    : selectedService === 'mototaxi'
                    ? 'Moto Taxi'
                    : 'Delivery / Envíos';

                return (
                  <div className="p-4 bg-slate-50/60 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>Valores de Tarifa para <strong>{serviceLabel}</strong> en <strong>{selectedState}</strong></span>
                      </h4>
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-md">
                        Tarificación Oficial
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Base Minimum Fare */}
                      <div className="space-y-1.5 p-3.5 bg-white border border-purple-200 rounded-xl shadow-2xs">
                        <label className="font-bold text-slate-800 block flex items-center justify-between">
                          <span>Tarifa Mínima Base (USD):</span>
                          <span className="text-[10px] text-purple-600 font-bold">Base Fija</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.10"
                            min="0"
                            value={currentFare.baseFareUSD}
                            onChange={(e) =>
                              handleUpdateStateServiceFare(
                                selectedState,
                                selectedService,
                                'baseFareUSD',
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full p-3 bg-purple-50/30 border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-600"
                            required
                          />
                          <span className="absolute right-3 top-3 text-[10px] text-purple-600 font-bold">
                            USD ($)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Monto mínimo a cobrar por la carrera o servicio inicial en {selectedState}.
                        </p>
                      </div>

                      {/* Base Distance Included */}
                      <div className="space-y-1.5 p-3.5 bg-white border border-blue-200 rounded-xl shadow-2xs">
                        <label className="font-bold text-slate-800 block flex items-center justify-between">
                          <span>Km Incluidos en Tarifa Base:</span>
                          <span className="text-[10px] text-blue-600 font-bold">Tramo Inicial</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={currentFare.baseDistanceKm}
                            onChange={(e) =>
                              handleUpdateStateServiceFare(
                                selectedState,
                                selectedService,
                                'baseDistanceKm',
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full p-3 bg-blue-50/30 border border-blue-300 rounded-xl text-xs font-mono font-bold text-blue-900 focus:outline-none focus:border-blue-600"
                            required
                          />
                          <span className="absolute right-3 top-3 text-[10px] text-blue-600 font-bold">
                            Km
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Distancia que ya incluye el monto de la tarifa mínima inicial.
                        </p>
                      </div>

                      {/* Additional Km Rate */}
                      <div className="space-y-1.5 p-3.5 bg-white border border-emerald-200 rounded-xl shadow-2xs">
                        <label className="font-bold text-slate-800 block flex items-center justify-between">
                          <span>Costo por Km Adicional (USD):</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Km Extra</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            value={currentFare.additionalKmRateUSD}
                            onChange={(e) =>
                              handleUpdateStateServiceFare(
                                selectedState,
                                selectedService,
                                'additionalKmRateUSD',
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full p-3 bg-emerald-50/30 border border-emerald-300 rounded-xl text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:border-emerald-600"
                            required
                          />
                          <span className="absolute right-3 top-3 text-[10px] text-emerald-600 font-bold">
                            USD/Km
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Cobro por cada km recorrido que exceda los km incluidos.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Live Interactive Tariff Simulator for Selected State & Service */}
            {(() => {
              const currentFare = getFareForStateService(selectedState, selectedService);
              const currentBcv = parseFloat(bcvRateInput) || config.bcvRate;
              const currentCommPercent = parseFloat(commissionInput) || config.commissionPercent;

              const simResult = calculateTripFare(
                testDistanceKm,
                currentFare.baseFareUSD,
                currentFare.baseDistanceKm,
                currentFare.additionalKmRateUSD,
                currentBcv,
                currentCommPercent
              );

              return (
                <div className="mt-4 p-5 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Simulador de Cotización en Vivo</span>
                          <span className="text-[10px] font-semibold text-purple-400 bg-purple-900/60 px-2 py-0.5 rounded-md">
                            📍 {selectedState} ({selectedService.toUpperCase()})
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Cotización automática en dólares y Bolívares a tasa oficial BCV ({currentBcv.toFixed(2)} Bs/$)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Distancia simulada:</span>
                      {[1.5, 3.0, 5.0, 10.0, 15.0, 25.0].map((kmVal) => (
                        <button
                          key={kmVal}
                          type="button"
                          onClick={() => setTestDistanceKm(kmVal)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                            testDistanceKm === kmVal
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {kmVal} Km
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distance Slider Input */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-5 space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">Recorrido del Viaje:</span>
                        <span className="text-purple-300 font-extrabold font-mono">{testDistanceKm.toFixed(1)} Km</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="50"
                        step="0.5"
                        value={testDistanceKm}
                        onChange={(e) => setTestDistanceKm(parseFloat(e.target.value) || 1)}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>0.5 Km</span>
                        <span>25 Km</span>
                        <span>50 Km</span>
                      </div>
                    </div>

                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Cliente Fare Box */}
                      <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1 text-blue-400">
                            👤 Pasajero ({selectedService})
                          </span>
                          <span>Precio Final</span>
                        </div>
                        <div className="text-lg font-black text-white font-mono">
                          ${simResult.totalFareUSD.toFixed(2)} USD
                        </div>
                        <div className="text-xs font-extrabold text-emerald-400 font-mono">
                          Bs. {simResult.totalFareVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                        </div>
                        <p className="text-[9px] text-slate-400 pt-1 border-t border-slate-700/60">
                          {simResult.extraKm > 0 ? (
                            <>Base (${simResult.baseFareUSD.toFixed(2)}) + {simResult.extraKm.toFixed(1)} Km extra × ${simResult.additionalKmRateUSD.toFixed(2)}</>
                          ) : (
                            <>Tarifa Mínima Base (Cubierto por primeros {simResult.baseDistanceKm} Km)</>
                          )}
                        </p>
                      </div>

                      {/* Conductor Fare Box */}
                      <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1 text-purple-400">
                            🚗 Conductor / Repartidor
                          </span>
                          <span>Ganancia Neta</span>
                        </div>
                        <div className="text-lg font-black text-purple-300 font-mono">
                          ${simResult.driverEarningsUSD.toFixed(2)} USD
                        </div>
                        <div className="text-xs font-extrabold text-purple-400 font-mono">
                          Bs. {simResult.driverEarningsVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                        </div>
                        <p className="text-[9px] text-slate-400 pt-1 border-t border-slate-700/60">
                          Comisión Vixy ({currentCommPercent}%): -${simResult.companyCommissionUSD.toFixed(2)} USD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* National Tariff Overview Table (Collapsible) */}
            {showFullRatesTable && (
              <div className="p-4 bg-slate-900 text-white border border-slate-800 rounded-2xl space-y-3 mt-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Matriz Completa de Tarifas de los 24 Estados de Venezuela</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Haga clic en un estado para cargarlo directamente en el editor
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-800/90 sticky top-0 text-[10px] uppercase font-bold text-slate-300">
                      <tr>
                        <th className="p-2.5">Estado</th>
                        <th className="p-2.5 text-blue-300">🚗 Taxi (Base / +Km)</th>
                        <th className="p-2.5 text-purple-300">🏍️ Moto Taxi (Base / +Km)</th>
                        <th className="p-2.5 text-emerald-300">📦 Delivery (Base / +Km)</th>
                        <th className="p-2.5 text-amber-300">🎓 Modalidad Universitaria</th>
                        <th className="p-2.5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                      {VENEZUELA_STATES.map((st) => {
                        const fares = getFareForStateService(st, 'taxi');
                        const motoFares = getFareForStateService(st, 'mototaxi');
                        const delivFares = getFareForStateService(st, 'delivery');
                        const uniFare = getUniversityFareForState(st);
                        const isSelected = selectedState === st;

                        return (
                          <tr
                            key={st}
                            onClick={() => setSelectedState(st)}
                            className={`cursor-pointer transition ${
                              isSelected ? 'bg-purple-950/70 text-white font-bold' : 'hover:bg-slate-800/60'
                            }`}
                          >
                            <td className="p-2.5 font-sans font-semibold flex items-center gap-1.5">
                              <span>{isSelected ? '📍' : '▫️'}</span>
                              <span>{st}</span>
                            </td>
                            <td className="p-2.5">
                              ${fares.baseFareUSD.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans">({fares.baseDistanceKm}km)</span> +${fares.additionalKmRateUSD.toFixed(2)}/km
                            </td>
                            <td className="p-2.5">
                              ${motoFares.baseFareUSD.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans">({motoFares.baseDistanceKm}km)</span> +${motoFares.additionalKmRateUSD.toFixed(2)}/km
                            </td>
                            <td className="p-2.5">
                              ${delivFares.baseFareUSD.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans">({delivFares.baseDistanceKm}km)</span> +${delivFares.additionalKmRateUSD.toFixed(2)}/km
                            </td>
                            <td className="p-2.5">
                              {uniFare.enabled ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold font-sans bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                  <span>Activa</span>
                                  <span className="text-slate-300 font-mono">(${uniFare.taxi.baseFareUSD.toFixed(2)})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 text-[10px] font-sans bg-slate-800 px-2 py-0.5 rounded">
                                  Inactiva
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-right flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenUniversityModal(st);
                                }}
                                className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-sans text-[10px] font-bold flex items-center gap-1"
                                title="Configurar Modalidad Tarifa Universitaria"
                              >
                                <GraduationCap className="w-3 h-3 text-amber-100" />
                                <span>🎓 Universitaria</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedState(st);
                                }}
                                className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-sans text-[10px] font-bold"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pago Móvil & Admin Contact Details */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Datos Oficiales para Pago Móvil Bolívares y Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Banco Receptor Pago Móvil:
                </label>
                <input
                  type="text"
                  value={pagoBank}
                  onChange={(e) => setPagoBank(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Teléfono Pago Móvil:
                </label>
                <input
                  type="text"
                  value={pagoPhone}
                  onChange={(e) => setPagoPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  RIF o Cédula del Titular:
                </label>
                <input
                  type="text"
                  value={pagoCif}
                  onChange={(e) => setPagoCif(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Nombre del Titular de la Cuenta:
                </label>
                <input
                  type="text"
                  value={pagoHolder}
                  onChange={(e) => setPagoHolder(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 block">
                  Correo Electrónico Administrativo de Notificaciones:
                </label>
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Gateway Toggles */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Modificación de Pasarelas y Métodos de Pago Activos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div
                onClick={() => handleGatewayToggle('pagoMovil')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  gateways.pagoMovil
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>📱 Pago Móvil VES</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    gateways.pagoMovil
                      ? 'bg-emerald-600 border-emerald-600 text-white font-black'
                      : 'border-slate-300'
                  }`}
                >
                  {gateways.pagoMovil && '✓'}
                </span>
              </div>

              <div
                onClick={() => handleGatewayToggle('zelle')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  gateways.zelle
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>💜 Zelle USD</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    gateways.zelle
                      ? 'bg-emerald-600 border-emerald-600 text-white font-black'
                      : 'border-slate-300'
                  }`}
                >
                  {gateways.zelle && '✓'}
                </span>
              </div>

              <div
                onClick={() => handleGatewayToggle('binancePay')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  gateways.binancePay
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>🟡 Binance Pay (USDT)</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    gateways.binancePay
                      ? 'bg-emerald-600 border-emerald-600 text-white font-black'
                      : 'border-slate-300'
                  }`}
                >
                  {gateways.binancePay && '✓'}
                </span>
              </div>

              <div
                onClick={() => handleGatewayToggle('efectivo')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  gateways.efectivo
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>💵 Efectivo USD / VES</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    gateways.efectivo
                      ? 'bg-emerald-600 border-emerald-600 text-white font-black'
                      : 'border-slate-300'
                  }`}
                >
                  {gateways.efectivo && '✓'}
                </span>
              </div>

              <div
                onClick={() => handleGatewayToggle('tarjeta')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  gateways.tarjeta
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>💳 Tarjeta de Débito/Crédito</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    gateways.tarjeta
                      ? 'bg-emerald-600 border-emerald-600 text-white font-black'
                      : 'border-slate-300'
                  }`}
                >
                  {gateways.tarjeta && '✓'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              Guardar Todos los Cambios Financieros
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: BRANDING & WALLPAPER (ADMINISTRATOR ONLY) */}
      {activeSubTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Wallpaper className="w-4 h-4 text-purple-600" />
                  Personalización de Fondo de Pantalla e Imagen de Inicio (Panel Admin)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta configuración se administra exclusivamente desde el panel de control y aplica inmediatamente a la pantalla de inicio y entorno web.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Controls Column */}
              <div className="space-y-4">
                {/* 1. Full Page Background */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-900 block flex items-center gap-2">
                    <Wallpaper className="w-4 h-4 text-purple-600" />
                    Imagen de Fondo de la Página Web:
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Sube una imagen desde tu equipo o pega una URL directa (JPG/PNG/WebP).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempBgImage}
                      onChange={(e) => setTempBgImage(e.target.value)}
                      placeholder="https://ejemplo.com/fondo.jpg"
                      className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <label className="px-3 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1 shrink-0 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBgFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Banner Card Image */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-900 block flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    Imagen de la Tarjeta Promocional / Portada:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempCardImage}
                      onChange={(e) => setTempCardImage(e.target.value)}
                      placeholder="https://ejemplo.com/portada.jpg"
                      className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <label className="px-3 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1 shrink-0 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCardFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Title */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-900 block">
                    Título de la Presentación Corporativa:
                  </label>
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Preview Column */}
              <div className="space-y-3">
                <p className="font-bold text-slate-700">Vista Previa del Fondo de Pantalla:</p>
                <div className="rounded-2xl border border-purple-900/50 bg-black p-4 text-white space-y-3 shadow-xl relative overflow-hidden aspect-video flex flex-col justify-end">
                  {tempBgImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 filter blur-[1px] scale-105"
                      style={{ backgroundImage: `url('${tempBgImage}')` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="relative z-10 flex items-center gap-3 bg-black/60 p-2.5 rounded-xl border border-purple-500/30 backdrop-blur-md">
                    {tempCardImage && (
                      <img
                        src={tempCardImage}
                        alt="Preview"
                        className="w-16 h-10 object-cover rounded-lg border border-purple-400"
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{tempTitle}</p>
                      <p className="text-[10px] text-purple-300">Vixy Venezuela - Entorno de Producción Web</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Guardar Fondo de Pantalla e Imagen de Marca
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: API KEYS & APP INTERCONNECTIONS (PRODUCTION) */}
      {activeSubTab === 'apiKeys' && (
        <form onSubmit={handleSaveApiKeys} className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  Claves de Conexión, API e Interconexiones con Otras Aplicaciones (Producción)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conectores para la app móvil de conductores, app de pasajeros, webhooks de bancos y servidores backend.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {showApiKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showApiKeys ? 'Ocultar Claves' : 'Mostrar Claves'}</span>
                </button>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-emerald-800">Modo Producción</span>
                  <input
                    type="checkbox"
                    checked={isProdMode}
                    onChange={(e) => setIsProdMode(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Backend API Server URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  URL del Servidor API Principal (Node / Express):
                </label>
                <input
                  type="url"
                  value={backendUrlInput}
                  onChange={(e) => setBackendUrlInput(e.target.value)}
                  placeholder="https://vhixy.site"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  Dominio principal para peticiones REST de clientes y conductores.
                </p>
              </div>

              {/* Vixy Production API Secret Key */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Clave Secreta Vixy API (Bearer Secret Token):
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={prodApiKeyInput}
                  onChange={(e) => setProdApiKeyInput(e.target.value)}
                  placeholder="vixy_live_sec_..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  Usado para encriptación de payloads e interconexión segura.
                </p>
              </div>

              {/* Google Maps Platform API Key */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-red-600" />
                  Google Maps Platform API Key (Geolocalización):
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={mapsApiKeyInput}
                  onChange={(e) => setMapsApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  Requerido para cálculo de distancias, autocomplete de direcciones y mapa en vivo.
                </p>
              </div>

              {/* Payment Webhook Secret */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Firma Secreta Webhook Pago Móvil / Bancos:
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={webhookSecretInput}
                  onChange={(e) => setWebhookSecretInput(e.target.value)}
                  placeholder="whsec_vixy_..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  Valida la autenticidad de notificaciones de pago enviadas por la API bancaria.
                </p>
              </div>

              {/* Driver Mobile App Sync Endpoint */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Endpoint Sincronización App Conductores (Android/iOS):
                </label>
                <input
                  type="text"
                  value={driverSyncInput}
                  onChange={(e) => setDriverSyncInput(e.target.value)}
                  placeholder="https://vhixy.site/v1/drivers/sync"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              {/* Passenger Mobile App Sync Endpoint */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Endpoint Sincronización App Pasajeros (Android/iOS):
                </label>
                <input
                  type="text"
                  value={passengerSyncInput}
                  onChange={(e) => setPassengerSyncInput(e.target.value)}
                  placeholder="https://vhixy.site/v1/passengers/sync"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              {/* FCM Server Key */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">
                  Firebase Cloud Messaging (FCM) Server Key (Push Notifications):
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={fcmKeyInput}
                  onChange={(e) => setFcmKeyInput(e.target.value)}
                  placeholder="AAAA..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWebGuideModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs flex items-center gap-2 transition"
              >
                <Globe className="w-4 h-4" />
                <span>Ver Instrucciones de Despliegue Web</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Claves de Conexión e Interconexiones
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Configuración de Modalidad Tarifa Universitaria por Estado */}
      <UniversityTariffModal
        isOpen={isUniversityModalOpen}
        onClose={() => setIsUniversityModalOpen(false)}
        stateName={universityModalState}
        standardStateFares={
          stateRates[universityModalState] || createDefaultStateServiceFares(universityModalState)
        }
        universityFareConfig={getUniversityFareForState(universityModalState)}
        bcvRate={parseFloat(bcvRateInput) || config.bcvRate}
        nationalEnabled={universityNationalEnabled}
        onToggleNational={(enabled) => setUniversityNationalEnabled(enabled)}
        onSave={handleSaveUniversityFare}
        onApplyToAllStates={handleApplyUniversityFareToAllStates}
      />
    </div>
  );
};
