import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  ShieldCheck,
  X,
  Check,
  Save,
  Plus,
  Trash2,
  Edit2,
  Copy,
  AlertCircle,
  Eye,
  Info,
  HelpCircle,
  Building,
  CheckCircle2,
  QrCode,
  Wallet,
  Landmark,
  Banknote,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { VENEZUELAN_BANKS } from '../data/mockData';
import {
  PagoMovilConfig,
  ZelleConfig,
  BinancePayConfig,
  BankTransferConfig,
  CashPaymentConfig,
  CardPosConfig,
  CustomPaymentMethod,
} from '../types';

interface PaymentMethodsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'pagoMovil' | 'zelle' | 'binancePay' | 'bankTransfer' | 'cashPayment' | 'cardPos' | 'custom';
}

export const PaymentMethodsEditorModal: React.FC<PaymentMethodsEditorModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'pagoMovil',
}) => {
  const {
    config,
    updatePaymentGatewayConfig,
    togglePaymentGateway,
    addCustomPaymentMethod,
    updateCustomPaymentMethod,
    deleteCustomPaymentMethod,
    showToast,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<
    'pagoMovil' | 'zelle' | 'binancePay' | 'bankTransfer' | 'cashPayment' | 'cardPos' | 'custom'
  >(initialTab);

  // --- LOCAL FORMS STATE ---
  // Pago Móvil
  const [pmBank, setPmBank] = useState(config.pagoMovil.bankName || '0102 - Banco de Venezuela');
  const [pmCode, setPmCode] = useState(config.pagoMovil.bankCode || '0102');
  const [pmPhone, setPmPhone] = useState(config.pagoMovil.phone || '');
  const [pmCif, setPmCif] = useState(config.pagoMovil.cif || '');
  const [pmHolder, setPmHolder] = useState(config.pagoMovil.holderName || '');
  const [pmInstructions, setPmInstructions] = useState(
    config.pagoMovil.instructions || 'Reportar los 6 o 12 dígitos de la referencia tras transferir.'
  );

  // Zelle
  const [zelleEmail, setZelleEmail] = useState(config.zelle?.email || 'pagos@vhixy.site');
  const [zelleHolder, setZelleHolder] = useState(config.zelle?.holderName || 'Vixy Mobility Corp');
  const [zellePhone, setZellePhone] = useState(config.zelle?.phone || '');
  const [zelleMemo, setZelleMemo] = useState(
    config.zelle?.memoRequirement || 'Colocar únicamente tu número de teléfono registrado'
  );
  const [zelleInstructions, setZelleInstructions] = useState(
    config.zelle?.instructions || 'No colocar palabras como taxi o carrera en el concepto.'
  );

  // Binance Pay
  const [binancePayId, setBinancePayId] = useState(config.binancePay?.payId || '298371904');
  const [binanceEmail, setBinanceEmail] = useState(config.binancePay?.email || 'binance@vhixy.site');
  const [binanceNickname, setBinanceNickname] = useState(config.binancePay?.nickname || 'VixyOfficial');
  const [binanceNetworks, setBinanceNetworks] = useState(
    config.binancePay?.supportedNetworks || 'USDT (Red BEP20 o TRC20)'
  );
  const [binanceWallet, setBinanceWallet] = useState(
    config.binancePay?.walletAddress || '0x71C28B5E89a1739c9fA44Bf28e281B94C849B11'
  );
  const [binanceQrUrl, setBinanceQrUrl] = useState(config.binancePay?.qrImageUrl || '');
  const [binanceInstructions, setBinanceInstructions] = useState(
    config.binancePay?.instructions || 'Transferencia directa por Binance Pay sin comisión interna.'
  );

  // Transferencia Bancaria
  const [btBank, setBtBank] = useState(config.bankTransfer?.bankName || '0102 - Banco de Venezuela');
  const [btCode, setBtCode] = useState(config.bankTransfer?.bankCode || '0102');
  const [btAccount, setBtAccount] = useState(
    config.bankTransfer?.accountNumber || '01020182740001892044'
  );
  const [btType, setBtType] = useState<'corriente' | 'ahorro'>(
    config.bankTransfer?.accountType || 'corriente'
  );
  const [btCif, setBtCif] = useState(config.bankTransfer?.cif || 'J-501239874');
  const [btHolder, setBtHolder] = useState(
    config.bankTransfer?.holderName || 'Vixy Servicios C.A.'
  );
  const [btInstructions, setBtInstructions] = useState(
    config.bankTransfer?.instructions || 'Acreditación inmediata para mismo banco.'
  );

  // Efectivo
  const [cashCurrencies, setCashCurrencies] = useState<string[]>(
    config.cashPayment?.acceptedCurrencies || ['USD', 'VES', 'EUR']
  );
  const [cashMaxDenomination, setCashMaxDenomination] = useState(
    config.cashPayment?.maxBillDenomination || 'Billetes de $50 y $100 requieren aviso previo'
  );
  const [cashInstructions, setCashInstructions] = useState(
    config.cashPayment?.instructions || 'Entregar monto exacto o acordar vuelto. No se reciben billetes rotos.'
  );

  // Punto de Venta / Tarjetas
  const [posProcessor, setPosProcessor] = useState(
    config.cardPos?.processorName || 'Punto de Venta Inalámbrico / MegaSoft POS'
  );
  const [posTerminalId, setPosTerminalId] = useState(config.cardPos?.terminalId || 'POS-VIXY-8842');
  const [posSurcharge, setPosSurcharge] = useState(
    (config.cardPos?.surchargePercent ?? 0).toString()
  );
  const [posInstructions, setPosInstructions] = useState(
    config.cardPos?.instructions || 'Cobro directo al conductor o taquilla administrativa.'
  );

  // Custom Method Form Modal / State
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customCurrency, setCustomCurrency] = useState<'VES' | 'USD' | 'EUR' | 'USDT' | 'OTRA'>('USD');
  const [customIdentifier, setCustomIdentifier] = useState('');
  const [customHolder, setCustomHolder] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customEnabled, setCustomEnabled] = useState(true);

  if (!isOpen) return null;

  // --- SAVE HANDLERS ---
  const handleSavePagoMovil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmPhone.trim() || !pmCif.trim() || !pmHolder.trim()) {
      alert('Por favor complete todos los datos requeridos de Pago Móvil.');
      return;
    }
    const derivedCode = pmBank.slice(0, 4);
    updatePaymentGatewayConfig(
      'pagoMovil',
      {
        bankName: pmBank.trim(),
        bankCode: derivedCode,
        phone: pmPhone.trim(),
        cif: pmCif.trim(),
        holderName: pmHolder.trim(),
        instructions: pmInstructions.trim(),
      },
      config.gateways.pagoMovil
    );
  };

  const handleSaveZelle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zelleEmail.trim() || !zelleHolder.trim()) {
      alert('Por favor ingrese el correo y titular de Zelle.');
      return;
    }
    updatePaymentGatewayConfig(
      'zelle',
      {
        email: zelleEmail.trim(),
        holderName: zelleHolder.trim(),
        phone: zellePhone.trim(),
        memoRequirement: zelleMemo.trim(),
        instructions: zelleInstructions.trim(),
      },
      config.gateways.zelle
    );
  };

  const handleSaveBinancePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!binancePayId.trim()) {
      alert('Por favor ingrese el Pay ID de Binance.');
      return;
    }
    updatePaymentGatewayConfig(
      'binancePay',
      {
        payId: binancePayId.trim(),
        email: binanceEmail.trim(),
        nickname: binanceNickname.trim(),
        supportedNetworks: binanceNetworks.trim(),
        walletAddress: binanceWallet.trim(),
        qrImageUrl: binanceQrUrl.trim(),
        instructions: binanceInstructions.trim(),
      },
      config.gateways.binancePay
    );
  };

  const handleSaveBankTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!btAccount.trim() || btAccount.replace(/\D/g, '').length < 20) {
      alert('El número de cuenta bancaria debe contener exactamente 20 dígitos.');
      return;
    }
    const derivedCode = btBank.slice(0, 4);
    updatePaymentGatewayConfig(
      'bankTransfer',
      {
        bankName: btBank.trim(),
        bankCode: derivedCode,
        accountNumber: btAccount.replace(/\D/g, ''),
        accountType: btType,
        cif: btCif.trim(),
        holderName: btHolder.trim(),
        instructions: btInstructions.trim(),
      },
      config.gateways.bankTransfer ?? true
    );
  };

  const handleSaveCash = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashCurrencies.length === 0) {
      alert('Seleccione al menos una moneda aceptada en efectivo.');
      return;
    }
    updatePaymentGatewayConfig(
      'cashPayment',
      {
        acceptedCurrencies: cashCurrencies,
        maxBillDenomination: cashMaxDenomination.trim(),
        instructions: cashInstructions.trim(),
      },
      config.gateways.efectivo
    );
  };

  const handleSavePos = (e: React.FormEvent) => {
    e.preventDefault();
    const surcharge = parseFloat(posSurcharge);
    updatePaymentGatewayConfig(
      'cardPos',
      {
        processorName: posProcessor.trim(),
        terminalId: posTerminalId.trim(),
        surchargePercent: !isNaN(surcharge) ? surcharge : 0,
        instructions: posInstructions.trim(),
      },
      config.gateways.tarjeta
    );
  };

  const handleToggleCurrency = (curr: string) => {
    setCashCurrencies((prev) =>
      prev.includes(curr) ? prev.filter((c) => c !== curr) : [...prev, curr]
    );
  };

  const handleOpenAddCustom = () => {
    setEditingCustomId(null);
    setCustomName('');
    setCustomCurrency('USD');
    setCustomIdentifier('');
    setCustomHolder('');
    setCustomDetails('');
    setCustomInstructions('');
    setCustomEnabled(true);
    setIsAddingCustom(true);
  };

  const handleOpenEditCustom = (method: CustomPaymentMethod) => {
    setEditingCustomId(method.id);
    setCustomName(method.name);
    setCustomCurrency(method.currency);
    setCustomIdentifier(method.identifier);
    setCustomHolder(method.holderName);
    setCustomDetails(method.details || '');
    setCustomInstructions(method.instructions || '');
    setCustomEnabled(method.enabled);
    setIsAddingCustom(true);
  };

  const handleSaveCustomMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customIdentifier.trim() || !customHolder.trim()) {
      alert('Por favor complete los campos obligatorios del método de pago.');
      return;
    }

    if (editingCustomId) {
      updateCustomPaymentMethod(editingCustomId, {
        name: customName.trim(),
        currency: customCurrency,
        identifier: customIdentifier.trim(),
        holderName: customHolder.trim(),
        details: customDetails.trim(),
        instructions: customInstructions.trim(),
        enabled: customEnabled,
      });
    } else {
      addCustomPaymentMethod({
        name: customName.trim(),
        currency: customCurrency,
        identifier: customIdentifier.trim(),
        holderName: customHolder.trim(),
        details: customDetails.trim(),
        instructions: customInstructions.trim(),
        enabled: customEnabled,
      });
    }
    setIsAddingCustom(false);
    setEditingCustomId(null);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copiado al portapapeles: ${label}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-purple-900/40 bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-700 text-purple-300 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Editor y Administrador de Métodos de Pago
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Cuentas Receptoras
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Actualice los datos de Pago Móvil, Zelle, Binance Pay, transferencias y cuentas de recarga.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition border border-transparent hover:border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex items-center gap-1.5 p-3 px-5 border-b border-purple-900/30 bg-black/40 overflow-x-auto shrink-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('pagoMovil')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'pagoMovil'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-purple-300" />
            <span>📱 Pago Móvil (VES)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.gateways.pagoMovil ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('zelle')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'zelle'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-purple-300" />
            <span>💜 Zelle (USD)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.gateways.zelle ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('binancePay')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'binancePay'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>🟡 Binance Pay (USDT)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.gateways.binancePay ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bankTransfer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'bankTransfer'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Landmark className="w-4 h-4 text-blue-400" />
            <span>🏛️ Transferencia VES</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.gateways.bankTransfer ?? true ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cashPayment')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'cashPayment'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>💵 Efectivo</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.gateways.efectivo ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cardPos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'cardPos'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>💳 Tarjeta / POS</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.gateways.tarjeta ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Plus className="w-4 h-4 text-pink-400" />
            <span>➕ Otros Métodos ({config.customPaymentMethods?.length || 0})</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PAGO MÓVIL */}
          {activeTab === 'pagoMovil' && (
            <form onSubmit={handleSavePagoMovil} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-900/80 text-purple-300 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Configuración de Pago Móvil Interbancario (VES)
                    </h4>
                    <p className="text-xs text-purple-200">
                      Datos bancarios mostrados a conductores y pasajeros para recargar saldo y abonar comisiones.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePaymentGateway('pagoMovil')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    config.gateways.pagoMovil
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{config.gateways.pagoMovil ? 'Método ACTIVO' : 'Método INACTIVO'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Banco Selector */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Banco Receptor Pago Móvil:
                  </label>
                  <select
                    value={pmBank}
                    onChange={(e) => {
                      setPmBank(e.target.value);
                      setPmCode(e.target.value.slice(0, 4));
                    }}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    {VENEZUELAN_BANKS.map((b) => (
                      <option key={b.code} value={b.name}>
                        🏛️ {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Número de Teléfono Asociado:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 0412-5550199"
                    value={pmPhone}
                    onChange={(e) => setPmPhone(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                  <p className="text-[10px] text-zinc-400">
                    Formato de 11 dígitos venezolano (0412, 0414, 0424, 0416, 0426).
                  </p>
                </div>

                {/* Cédula o RIF */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Cédula o RIF del Titular:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. J-501239874 o V-18920455"
                    value={pmCif}
                    onChange={(e) => setPmCif(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                  <p className="text-[10px] text-zinc-400">
                    Indicar V-, J-, E- o G- antes del número de identificación.
                  </p>
                </div>

                {/* Titular */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Nombre Completo del Titular o Razón Social:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Vixy Servicios C.A."
                    value={pmHolder}
                    onChange={(e) => setPmHolder(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Instrucciones */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Instrucciones / Nota visible en la App para el Usuario:
                  </label>
                  <textarea
                    rows={2}
                    value={pmInstructions}
                    onChange={(e) => setPmInstructions(e.target.value)}
                    placeholder="Ej. Una vez realizado el pago, reporte el número de referencia de 6 o 12 dígitos..."
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* LIVE PREVIEW CARD */}
              <div className="p-4 bg-zinc-900/80 border border-purple-900/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-purple-900/40 pb-2">
                  <span className="font-extrabold text-purple-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Vista Previa en App Pasajero / Conductor
                  </span>
                  <span className="text-[10px] text-zinc-400">Tasa Oficial: {config.bcvRate.toFixed(2)} Bs/$</span>
                </div>
                <div className="p-3 bg-black/70 rounded-xl border border-zinc-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Banco:</span>
                    <strong className="text-purple-300">{pmBank}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Teléfono:</span>
                    <span className="text-emerald-400 font-bold">{pmPhone || '0412-5550199'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Cédula / RIF:</span>
                    <span className="text-white font-bold">{pmCif || 'J-501239874'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Beneficiario:</span>
                    <span className="text-zinc-200">{pmHolder || 'Vixy Servicios C.A.'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Datos de Pago Móvil
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ZELLE */}
          {activeTab === 'zelle' && (
            <form onSubmit={handleSaveZelle} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-900/80 text-purple-300 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Configuración de Zelle Directo (USD)
                    </h4>
                    <p className="text-xs text-purple-200">
                      Cuenta bancaria oficial en Estados Unidos para pagos en dólares estadounidenses.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePaymentGateway('zelle')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    config.gateways.zelle
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{config.gateways.zelle ? 'Método ACTIVO' : 'Método INACTIVO'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Correo Zelle */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Correo Electrónico Receptor Zelle:
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. pagos@vhixy.site"
                    value={zelleEmail}
                    onChange={(e) => setZelleEmail(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Titular Zelle */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Nombre del Titular / Beneficiario Zelle:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Vixy Mobility Corp"
                    value={zelleHolder}
                    onChange={(e) => setZelleHolder(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Teléfono Asociado Zelle */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Teléfono Zelle (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. +1 (305) 890-1234"
                    value={zellePhone}
                    onChange={(e) => setZellePhone(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Requisito de Concepto / Memo */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Requisito de Concepto / Memo:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Colocar únicamente tu número celular registrado"
                    value={zelleMemo}
                    onChange={(e) => setZelleMemo(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Instrucciones Zelle */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Instrucciones Especiales de Zelle:
                  </label>
                  <textarea
                    rows={2}
                    value={zelleInstructions}
                    onChange={(e) => setZelleInstructions(e.target.value)}
                    placeholder="Ej. No incluir palabras relacionadas a taxi, transporte ni comisiones..."
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* LIVE PREVIEW CARD */}
              <div className="p-4 bg-zinc-900/80 border border-purple-900/60 rounded-2xl space-y-3">
                <span className="font-extrabold text-xs text-purple-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Ficha de Pago Zelle para Pasajeros y Conductores
                </span>
                <div className="p-3 bg-black/70 rounded-xl border border-zinc-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Correo Zelle:</span>
                    <strong className="text-emerald-400">{zelleEmail}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Titular de Cuenta:</span>
                    <span className="text-white font-bold">{zelleHolder}</span>
                  </div>
                  {zellePhone && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Teléfono:</span>
                      <span className="text-zinc-200">{zellePhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Concepto / Nota:</span>
                    <span className="text-amber-300 text-[11px]">{zelleMemo}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Datos de Zelle
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BINANCE PAY */}
          {activeTab === 'binancePay' && (
            <form onSubmit={handleSaveBinancePay} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-950/30 border border-amber-800/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-900/80 text-amber-300 rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Configuración de Binance Pay y Cripto (USDT)
                    </h4>
                    <p className="text-xs text-amber-200">
                      Recepción de USDT a través de Binance Pay ID o billetera criptográfica directa.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePaymentGateway('binancePay')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    config.gateways.binancePay
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{config.gateways.binancePay ? 'Método ACTIVO' : 'Método INACTIVO'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Binance Pay ID */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Binance Pay ID (8 o 9 dígitos):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 298371904"
                    value={binancePayId}
                    onChange={(e) => setBinancePayId(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Nickname / Alias */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Nickname / Alias Binance:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. VixyOfficial"
                    value={binanceNickname}
                    onChange={(e) => setBinanceNickname(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Correo Binance */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Correo Asociado Binance:
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. binance@vhixy.site"
                    value={binanceEmail}
                    onChange={(e) => setBinanceEmail(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Redes Soportadas */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Redes Cripto Compatibles:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. USDT (BEP20 / TRC20 / Polygon)"
                    value={binanceNetworks}
                    onChange={(e) => setBinanceNetworks(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Dirección de Billetera USDT */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Dirección de Billetera USDT Corporativa (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 0x71C28B5E89a1739c9fA44Bf28e281B94C849B11"
                    value={binanceWallet}
                    onChange={(e) => setBinanceWallet(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* QR Code URL */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    URL Imagen Código QR Binance Pay:
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={binanceQrUrl}
                    onChange={(e) => setBinanceQrUrl(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Instrucciones */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Instrucciones de Pago Cripto:
                  </label>
                  <textarea
                    rows={2}
                    value={binanceInstructions}
                    onChange={(e) => setBinanceInstructions(e.target.value)}
                    placeholder="Ej. Enviar comprobante con el Order ID o ID de transacción..."
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* LIVE PREVIEW CARD */}
              <div className="p-4 bg-zinc-900/80 border border-amber-900/40 rounded-2xl space-y-3">
                <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Visualización Binance Pay en la Aplicación
                </span>
                <div className="p-3 bg-black/70 rounded-xl border border-zinc-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Binance Pay ID:</span>
                    <strong className="text-amber-400 font-black">{binancePayId}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Alias / Nickname:</span>
                    <span className="text-white font-bold">{binanceNickname}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Redes:</span>
                    <span className="text-purple-300 text-[11px]">{binanceNetworks}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Datos Binance Pay
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: TRANSFERENCIA BANCARIA NACIONAL */}
          {activeTab === 'bankTransfer' && (
            <form onSubmit={handleSaveBankTransfer} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-950/30 border border-blue-800/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-900/80 text-blue-300 rounded-xl">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Configuración de Transferencia Bancaria Nacional (VES)
                    </h4>
                    <p className="text-xs text-blue-200">
                      Cuenta bancaria de 20 dígitos para transferencias tradicionales directas e interbancarias.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePaymentGateway('bankTransfer')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    config.gateways.bankTransfer ?? true
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{config.gateways.bankTransfer ?? true ? 'Método ACTIVO' : 'Método INACTIVO'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Banco Selector */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Banco Receptor:
                  </label>
                  <select
                    value={btBank}
                    onChange={(e) => {
                      setBtBank(e.target.value);
                      setBtCode(e.target.value.slice(0, 4));
                    }}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    {VENEZUELAN_BANKS.map((b) => (
                      <option key={b.code} value={b.name}>
                        🏛️ {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Número de Cuenta 20 Dígitos */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Número de Cuenta Bancaria (20 Dígitos):
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="01020182740001892044"
                    value={btAccount}
                    onChange={(e) => setBtAccount(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-purple-500 tracking-wider"
                    required
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Debe coincidir con los 4 dígitos iniciales del banco ({btCode})</span>
                    <span className={btAccount.length === 20 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {btAccount.length} / 20 dígitos
                    </span>
                  </div>
                </div>

                {/* Tipo de Cuenta */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Tipo de Cuenta:
                  </label>
                  <select
                    value={btType}
                    onChange={(e) => setBtType(e.target.value as 'corriente' | 'ahorro')}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="corriente">Cuenta Corriente</option>
                    <option value="ahorro">Cuenta de Ahorros</option>
                  </select>
                </div>

                {/* Cédula o RIF */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    RIF o Cédula del Titular:
                  </label>
                  <input
                    type="text"
                    placeholder="J-501239874"
                    value={btCif}
                    onChange={(e) => setBtCif(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Titular */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Titular / Razón Social:
                  </label>
                  <input
                    type="text"
                    placeholder="Vixy Servicios C.A."
                    value={btHolder}
                    onChange={(e) => setBtHolder(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Instrucciones */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Instrucciones de Transferencia:
                  </label>
                  <textarea
                    rows={2}
                    value={btInstructions}
                    onChange={(e) => setBtInstructions(e.target.value)}
                    placeholder="Ej. Transferencias interbancarias se acreditan tras confirmación efectiva..."
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Transferencia Bancaria
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: EFECTIVO */}
          {activeTab === 'cashPayment' && (
            <form onSubmit={handleSaveCash} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-900/80 text-emerald-300 rounded-xl">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Configuración de Pagos en Efectivo / Divisas
                    </h4>
                    <p className="text-xs text-emerald-200">
                      Reglas para el cobro manual en mano por parte del conductor al finalizar la carrera.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePaymentGateway('efectivo')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    config.gateways.efectivo
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{config.gateways.efectivo ? 'Método ACTIVO' : 'Método INACTIVO'}</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Monedas Aceptadas */}
                <div className="space-y-2">
                  <label className="font-bold text-zinc-300 block">
                    Monedas Permitidas en Efectivo:
                  </label>
                  <div className="flex items-center gap-3">
                    {['USD', 'VES', 'EUR'].map((curr) => {
                      const isSelected = cashCurrencies.includes(curr);
                      return (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => handleToggleCurrency(curr)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          <span>{curr === 'USD' ? '💵 Dólares (USD)' : curr === 'VES' ? '🇻🇪 Bolívares (VES)' : '💶 Euros (EUR)'}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Políticas de Denominación */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Denominaciones Máximas y Políticas de Vuelto:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Billetes de $50 y $100 requieren aviso previo al conductor"
                    value={cashMaxDenomination}
                    onChange={(e) => setCashMaxDenomination(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Instrucciones */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Instrucciones para Pasajeros y Conductores:
                  </label>
                  <textarea
                    rows={3}
                    value={cashInstructions}
                    onChange={(e) => setCashInstructions(e.target.value)}
                    placeholder="Ej. Entregar el monto exacto o acordar el cambio antes de abordar..."
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Configuración de Efectivo
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: TARJETA / POS */}
          {activeTab === 'cardPos' && (
            <form onSubmit={handleSavePos} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-cyan-950/30 border border-cyan-800/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-900/80 text-cyan-300 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Configuración de Tarjeta y Puntos de Venta (POS)
                    </h4>
                    <p className="text-xs text-cyan-200">
                      Terminales de cobro y pasarelas con tarjeta de débito/crédito.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePaymentGateway('tarjeta')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    config.gateways.tarjeta
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{config.gateways.tarjeta ? 'Método ACTIVO' : 'Método INACTIVO'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Nombre del Procesador */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Nombre del Procesador / Pasarela POS:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. MegaSoft POS / Credicard"
                    value={posProcessor}
                    onChange={(e) => setPosProcessor(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* ID de Terminal */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    ID o Código de Terminal:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. POS-VIXY-8842"
                    value={posTerminalId}
                    onChange={(e) => setPosTerminalId(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Recargo Bancario */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-300 block">
                    Recargo por Procesamiento Bancario (%):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={posSurcharge}
                    onChange={(e) => setPosSurcharge(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Instrucciones */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-zinc-300 block">
                    Instrucciones de Cobro con Tarjeta:
                  </label>
                  <textarea
                    rows={2}
                    value={posInstructions}
                    onChange={(e) => setPosInstructions(e.target.value)}
                    placeholder="Ej. Presentar cédula de identidad física al momento de pasar la tarjeta..."
                    className="w-full p-3 bg-zinc-900 border border-purple-900/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Datos de Tarjeta / POS
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: CUSTOM PAYMENT METHODS */}
          {activeTab === 'custom' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl">
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-400" />
                    Métodos de Pago Personalizados y Cuentas Adicionales
                  </h4>
                  <p className="text-xs text-purple-200">
                    Añada billeteras como Zinli, Wally Tech, Pipol Pay, PayPal o cuentas en divisas adicionales.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCustom}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Nuevo Método</span>
                </button>
              </div>

              {/* LIST OF CUSTOM METHODS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(config.customPaymentMethods || []).length === 0 ? (
                  <div className="md:col-span-2 p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <Wallet className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400">
                      No hay métodos de pago personalizados registrados. Haga clic en "Añadir Nuevo Método" para configurar una cuenta secundaria.
                    </p>
                  </div>
                ) : (
                  (config.customPaymentMethods || []).map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-2xl border transition space-y-3 ${
                        method.enabled
                          ? 'bg-zinc-900 border-purple-900/60 shadow-xs'
                          : 'bg-zinc-950/60 border-zinc-800 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-black text-sm text-white">{method.name}</h5>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-900/80 text-purple-200 border border-purple-700">
                              {method.currency}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {method.details || 'Sin descripción adicional'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCustom(method)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition"
                            title="Editar Método"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar el método "${method.name}"?`)) {
                                deleteCustomPaymentMethod(method.id);
                              }
                            }}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg text-xs transition"
                            title="Eliminar Método"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-black/60 rounded-xl border border-zinc-800 text-xs space-y-1 font-mono">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Identificador / Cuenta:</span>
                          <span className="text-emerald-400 font-bold">{method.identifier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Titular:</span>
                          <span className="text-zinc-200">{method.holderName}</span>
                        </div>
                        {method.instructions && (
                          <div className="pt-1 text-[11px] text-zinc-400 border-t border-zinc-800/80">
                            <strong>Instrucciones:</strong> {method.instructions}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-[11px] font-bold ${method.enabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {method.enabled ? '● Activo en la App' : '○ Inactivo en la App'}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCustomPaymentMethod(method.id, { enabled: !method.enabled })}
                          className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline"
                        >
                          {method.enabled ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* MODAL / FORM TO ADD / EDIT CUSTOM PAYMENT METHOD */}
              {isAddingCustom && (
                <div className="p-5 bg-zinc-900 border border-purple-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                    <h5 className="font-extrabold text-sm text-white">
                      {editingCustomId ? 'Editar Método de Pago' : 'Añadir Nuevo Método de Pago Personalizado'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(false)}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <form onSubmit={handleSaveCustomMethod} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-300 block">Nombre del Método (ej. Zinli USD):</label>
                        <input
                          type="text"
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Ej. Zinli Billetera USD"
                          className="w-full p-2.5 bg-black border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-300 block">Moneda de Pago:</label>
                        <select
                          value={customCurrency}
                          onChange={(e) => setCustomCurrency(e.target.value as any)}
                          className="w-full p-2.5 bg-black border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="VES">VES (Bs.)</option>
                          <option value="USDT">USDT (Cripto)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="OTRA">Otra Moneda</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-300 block">Identificador / Correo / Cuenta:</label>
                        <input
                          type="text"
                          required
                          value={customIdentifier}
                          onChange={(e) => setCustomIdentifier(e.target.value)}
                          placeholder="Ej. zinli@vhixy.site o +58 412..."
                          className="w-full p-2.5 bg-black border border-purple-900/60 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-300 block">Nombre del Titular:</label>
                        <input
                          type="text"
                          required
                          value={customHolder}
                          onChange={(e) => setCustomHolder(e.target.value)}
                          placeholder="Ej. Vixy Services Inc"
                          className="w-full p-2.5 bg-black border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="font-bold text-zinc-300 block">Descripción Corta / Detalles:</label>
                        <input
                          type="text"
                          value={customDetails}
                          onChange={(e) => setCustomDetails(e.target.value)}
                          placeholder="Ej. Envío directo sin comisiones por red interna"
                          className="w-full p-2.5 bg-black border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="font-bold text-zinc-300 block">Instrucciones de Reporte de Pago:</label>
                        <textarea
                          rows={2}
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          placeholder="Ej. Adjuntar el número de transacción o comprobante en PDF..."
                          className="w-full p-2.5 bg-black border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customEnabled}
                          onChange={(e) => setCustomEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-purple-600 bg-black border-zinc-700"
                        />
                        <span className="font-bold text-zinc-300">Activar este método en la aplicación</span>
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingCustom(false)}
                          className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {editingCustomId ? 'Actualizar Método' : 'Guardar Nuevo Método'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 border-t border-purple-900/40 bg-zinc-950 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Info className="w-4 h-4 text-purple-400" />
            <span>Todos los cambios guardados se sincronizan automáticamente con las aplicaciones de Pasajero y Conductor.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
