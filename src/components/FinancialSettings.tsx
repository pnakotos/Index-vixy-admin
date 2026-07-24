import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  CreditCard,
  Mail,
  Building2,
  Check,
  Save,
  Percent,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const FinancialSettings: React.FC = () => {
  const { config, updateConfig } = useAdmin();

  // Local state for forms
  const [bcvRateInput, setBcvRateInput] = useState(config.bcvRate.toString());
  const [commissionInput, setCommissionInput] = useState(config.commissionPercent.toString());
  const [thresholdInput, setThresholdInput] = useState(config.negativeBalanceThreshold.toString());
  const [adminEmailInput, setAdminEmailInput] = useState(config.adminEmail);

  // Pago Móvil form state
  const [pagoBank, setPagoBank] = useState(config.pagoMovil.bankName);
  const [pagoPhone, setPagoPhone] = useState(config.pagoMovil.phone);
  const [pagoCif, setPagoCif] = useState(config.pagoMovil.cif);
  const [pagoHolder, setPagoHolder] = useState(config.pagoMovil.holderName);

  // Gateways toggle state
  const [gateways, setGateways] = useState(config.gateways);

  const handleSaveFinancials = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(bcvRateInput);
    const comm = parseFloat(commissionInput);
    const thresh = parseFloat(thresholdInput);

    if (isNaN(rate) || rate <= 0) {
      alert('Por favor ingrese un valor válido para la tasa BCV.');
      return;
    }

    updateConfig({
      bcvRate: rate,
      commissionPercent: !isNaN(comm) ? comm : config.commissionPercent,
      negativeBalanceThreshold: !isNaN(thresh) ? thresh : config.negativeBalanceThreshold,
      adminEmail: adminEmailInput.trim(),
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">
            Configuración Financiera, Tasa BCV y Pasarelas de Pago
          </h2>
          <p className="text-xs text-slate-500">
            Ajuste del valor del dólar BCV, porcentaje de comisión de la empresa y datos de recarga
          </p>
        </div>
      </div>

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
            {/* Pago Movil */}
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
                  gateways.pagoMovil ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'border-slate-300'
                }`}
              >
                {gateways.pagoMovil && '✓'}
              </span>
            </div>

            {/* Zelle */}
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
                  gateways.zelle ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'border-slate-300'
                }`}
              >
                {gateways.zelle && '✓'}
              </span>
            </div>

            {/* Binance Pay */}
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
                  gateways.binancePay ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'border-slate-300'
                }`}
              >
                {gateways.binancePay && '✓'}
              </span>
            </div>

            {/* Cash */}
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
                  gateways.efectivo ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'border-slate-300'
                }`}
              >
                {gateways.efectivo && '✓'}
              </span>
            </div>

            {/* Card */}
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
                  gateways.tarjeta ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'border-slate-300'
                }`}
              >
                {gateways.tarjeta && '✓'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
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
    </div>
  );
};
