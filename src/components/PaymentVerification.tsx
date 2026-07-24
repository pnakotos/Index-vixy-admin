import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Car,
  Users,
  DollarSign,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { PaymentRecord, PaymentType, PaymentStatus } from '../types';

export const PaymentVerification: React.FC = () => {
  const { payments, verifyPayment, rejectPayment, config } = useAdmin();

  const [paymentTypeTab, setPaymentTypeTab] = useState<PaymentType>('driver_commission');
  const [statusFilter, setStatusFilter] = useState<'todos' | PaymentStatus>('pendiente');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected receipt lightbox modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredPayments = payments.filter((p) => {
    // Type tab
    if (p.type !== paymentTypeTab) return false;

    // Status filter
    if (statusFilter !== 'todos' && p.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.entityName.toLowerCase().includes(q);
      const matchRef = p.referenceNumber.toLowerCase().includes(q);
      const matchPhone = p.entityPhone.includes(q);
      if (!matchName && !matchRef && !matchPhone) return false;
    }

    return true;
  });

  const handleOpenReceipt = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  const handleOpenRejectModal = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedPayment && rejectionReason.trim()) {
      rejectPayment(selectedPayment.id, rejectionReason.trim());
      setIsRejectModalOpen(false);
      setIsReceiptModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Módulo de Verificación de Pagos
          </h2>
          <p className="text-xs text-slate-500">
            Validación de Pago Móvil y transferencias recibidas de conductores y clientes
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por referencia o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Main Dual Category Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => setPaymentTypeTab('driver_commission')}
          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
            paymentTypeTab === 'driver_commission'
              ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <Car className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900">
                Recargas de Comisión (Conductores)
              </h3>
              <p className="text-xs text-slate-500">
                Pagos recibidos de Taxis, Moto Taxis y Delivery
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500 text-white font-mono">
            {payments.filter((p) => p.type === 'driver_commission' && p.status === 'pendiente').length} Pend.
          </span>
        </button>

        <button
          onClick={() => setPaymentTypeTab('client_payment')}
          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
            paymentTypeTab === 'client_payment'
              ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900">
                Abonos Billetera (Clientes / Pasajeros)
              </h3>
              <p className="text-xs text-slate-500">
                Recargas de saldo de clientes para viajes
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white font-mono">
            {payments.filter((p) => p.type === 'client_payment' && p.status === 'pendiente').length} Pend.
          </span>
        </button>
      </div>

      {/* Secondary Status Filters */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 font-bold">Filtrar Estado:</span>
        <button
          onClick={() => setStatusFilter('todos')}
          className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
            statusFilter === 'todos'
              ? 'bg-slate-800 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setStatusFilter('pendiente')}
          className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
            statusFilter === 'pendiente'
              ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Pendientes por Verificar
        </button>
        <button
          onClick={() => setStatusFilter('verificado')}
          className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
            statusFilter === 'verificado'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Aprobados / Verificados
        </button>
        <button
          onClick={() => setStatusFilter('rechazado')}
          className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
            statusFilter === 'rechazado'
              ? 'bg-red-50 border-red-300 text-red-800 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Rechazados
        </button>
      </div>

      {/* Payment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
            <CreditCard className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              No hay pagos en esta sección con los filtros actuales.
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const statusBadges = {
              pendiente: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
              verificado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              rechazado: 'bg-red-50 text-red-700 border-red-200',
            };

            return (
              <div
                key={payment.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-4 transition-all shadow-xs"
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 font-mono flex items-center gap-1">
                    Ref: #{payment.referenceNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border uppercase ${
                      statusBadges[payment.status]
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>

                {/* Entity Info */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {payment.entityName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{payment.entityPhone}</p>
                </div>

                {/* Amount details */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-sans">Monto Recibido:</span>
                    <strong className="text-emerald-600 text-sm">
                      {payment.amountVES.toFixed(2)} VES
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-sans">Abono Equivalente:</span>
                    <strong className="text-slate-900 text-xs">
                      ${payment.amountUSD.toFixed(2)} USD
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Método: {payment.paymentMethod}</span>
                    <span>Tasa: {payment.bcvRateUsed.toFixed(2)} Bs/$</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    {payment.createdAt}
                  </span>
                  {payment.verifiedBy && (
                    <span className="text-emerald-600 font-bold">
                      Por: {payment.verifiedBy}
                    </span>
                  )}
                </div>

                {payment.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    {payment.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReceipt(payment)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Comprobante
                  </button>

                  {payment.status === 'pendiente' && (
                    <>
                      <button
                        onClick={() => verifyPayment(payment.id)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        title="Aprobar y abonar dinero a la cuenta"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verificar
                      </button>

                      <button
                        onClick={() => handleOpenRejectModal(payment)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition"
                        title="Rechazar comprobante"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RECEIPT LIGHTBOX MODAL */}
      {isReceiptModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  Comprobante de Pago Móvil / Transferencia
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Ref: #{selectedPayment.referenceNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 bg-slate-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Receipt Preview */}
            <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative group flex items-center justify-center">
              <img
                src={selectedPayment.receiptImageUrl}
                alt="Comprobante"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <p className="text-slate-600">
                Depositante: <strong className="text-slate-900">{selectedPayment.entityName}</strong>
              </p>
              <p className="text-slate-600">
                Monto en Bs: <strong className="text-emerald-600">{selectedPayment.amountVES.toFixed(2)} VES</strong>
              </p>
              <p className="text-slate-600">
                Abono USD: <strong className="text-slate-900">${selectedPayment.amountUSD.toFixed(2)} USD</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {selectedPayment.status === 'pendiente' && (
                <>
                  <button
                    onClick={() => handleOpenRejectModal(selectedPayment)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => {
                      verifyPayment(selectedPayment.id);
                      setIsReceiptModalOpen(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Aprobar y Abonar
                  </button>
                </>
              )}
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT MODAL */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-slate-800">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Rechazar Comprobante Ref: #{selectedPayment.referenceNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Indique la razón por la cual no se procesará este comprobante de pago.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej. El número de referencia no coincide con el estado de cuenta bancario o el monto reportado es incorrecto."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
