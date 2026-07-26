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
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { calculateTripFare } from '../utils/fareCalculator';

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

          {/* Tarificación de Servicios por Distancia y Kilometraje */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-600" />
                <span>Tarifas de Servicios y Precio por Kilómetro (Pasajeros & Conductores)</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                Aplica a Taxi, Mototaxi y Delivery
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Ajuste los valores de la tarifa mínima inicial y el cobro por kilómetro recorrido. Estos parámetros calculan automáticamente el costo total del servicio en dólares (USD) y su conversión oficial en Bolívares (VES) según la tasa BCV.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Costo Mínimo Base */}
              <div className="space-y-1.5 p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl">
                <label className="font-bold text-slate-800 block flex items-center justify-between">
                  <span>Costo Mínimo Base (USD):</span>
                  <span className="text-[10px] text-purple-600 font-bold">Mínimo Fijo</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={baseFareInput}
                    onChange={(e) => setBaseFareInput(e.target.value)}
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-600"
                    required
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-purple-600 font-bold">
                    USD ($)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Costo mínimo garantizado por los primeros kilómetros de la carrera (Por defecto: $2.00 USD).
                </p>
              </div>

              {/* Kilómetros Incluidos en Tarifa Mínima */}
              <div className="space-y-1.5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl">
                <label className="font-bold text-slate-800 block flex items-center justify-between">
                  <span>Km Incluidos en Tarifa Mínima:</span>
                  <span className="text-[10px] text-blue-600 font-bold">Tramo Inicial</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={baseDistanceInput}
                    onChange={(e) => setBaseDistanceInput(e.target.value)}
                    className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs font-mono font-bold text-blue-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-blue-600 font-bold">
                    Km
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Distancia en kilómetros cubierta dentro del costo mínimo inicial (Por defecto: 3.0 Km).
                </p>
              </div>

              {/* Costo por Km Adicional */}
              <div className="space-y-1.5 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <label className="font-bold text-slate-800 block flex items-center justify-between">
                  <span>Costo por Km Adicional (USD):</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Km Extra</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={additionalKmRateInput}
                    onChange={(e) => setAdditionalKmRateInput(e.target.value)}
                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-emerald-600 font-bold">
                    USD/Km
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Monto adicionado por cada km extra luego de superar los km base (Por defecto: $0.50 / Km).
                </p>
              </div>
            </div>

            {/* Live Interactive Tariff Simulator */}
            {(() => {
              const currentBase = parseFloat(baseFareInput) || 2.0;
              const currentBaseDist = parseFloat(baseDistanceInput) || 3.0;
              const currentAddRate = parseFloat(additionalKmRateInput) || 0.50;
              const currentBcv = parseFloat(bcvRateInput) || config.bcvRate;
              const currentCommPercent = parseFloat(commissionInput) || config.commissionPercent;

              const simResult = calculateTripFare(
                testDistanceKm,
                currentBase,
                currentBaseDist,
                currentAddRate,
                currentBcv,
                currentCommPercent
              );

              return (
                <div className="mt-4 p-5 bg-slate-900 text-white rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Simulador / Cotizador en Vivo de Carreras</h4>
                        <p className="text-[10px] text-slate-400">Verifique el cálculo que verán Clientes y Conductores en sus aplicaciones</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Distancias rápidas:</span>
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
                        <span className="text-slate-300">Distancia Simulada del Viaje:</span>
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
                            👤 Pasajero / Cliente
                          </span>
                          <span>Precio Total</span>
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
                            🚗 Conductor / Chofer
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
                          Comisión Vixy ({currentCommPercent}%): -${simResult.companyCommissionUSD.toFixed(2)} USD (Bs. {simResult.companyCommissionVES.toFixed(2)})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Information Sync Banner */}
                  <div className="p-3 bg-purple-950/60 border border-purple-800/60 rounded-xl text-[10px] text-purple-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Sincronización Transparente Automática:</strong> Al guardar este ajuste, se actualiza la matriz de cálculo en la API central (<code className="text-purple-300">{apiConfig.backendApiUrl}</code>) para cotizar las solicitudes de pasajeros y acreditar las ganancias netas de los conductores en Bolívares a Tasa BCV ({currentBcv.toFixed(2)} Bs/$).
                    </span>
                  </div>
                </div>
              );
            })()}
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
    </div>
  );
};
