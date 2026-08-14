import React, { useState } from 'react';
import {
  Car,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileText,
  DollarSign,
  Ban,
  Unlock,
  AlertTriangle,
  Eye,
  Filter,
  Phone,
  Mail,
  UserCheck,
  Smartphone,
  RefreshCw,
  Zap,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Driver, DriverCategory, DriverStatus } from '../types';

interface Props {
  initialFilter?: string;
}

export const DriverManagement: React.FC<Props> = ({ initialFilter }) => {
  const {
    drivers,
    config,
    approveDriver,
    rejectDriver,
    toggleBlockDriver,
    deleteDriver,
    updateDriverBalance,
    notifyNegativeBalance,
  } = useAdmin();

  const [categoryFilter, setCategoryFilter] = useState<'todos' | DriverCategory>('todos');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter === 'drivers_negative' ? 'negativo' : 'todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected driver for document inspector or modals
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Block Modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // Balance Adjust Modal
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState('');

  // Delete Driver Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  // App Simulation Modal
  const [simulatedDriver, setSimulatedDriver] = useState<Driver | null>(null);

  // Filtered drivers
  const filteredDrivers = drivers.filter((d) => {
    // Category match
    if (categoryFilter !== 'todos' && d.category !== categoryFilter) return false;

    // Status match
    if (statusFilter === 'activo' && d.status !== 'activo') return false;
    if (statusFilter === 'pendiente' && d.status !== 'pendiente') return false;
    if (statusFilter === 'bloqueado' && d.status !== 'bloqueado') return false;
    if (statusFilter === 'negativo' && d.balanceUSD <= config.negativeBalanceThreshold) return true;
    if (statusFilter === 'negativo' && d.balanceUSD > config.negativeBalanceThreshold) return false;

    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchPhone = d.phone.includes(q);
      const matchPlate = d.documents.plateNumber.toLowerCase().includes(q);
      const matchCedula = d.documents.cedulaNumber.toLowerCase().includes(q);
      const matchVehicle = d.documents.vehicleModel.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchPlate && !matchCedula && !matchVehicle) {
        return false;
      }
    }

    return true;
  });

  const handleOpenDocModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDocModalOpen(true);
  };

  const handleOpenRejectModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedDriver && rejectionReason.trim()) {
      rejectDriver(selectedDriver.id, rejectionReason.trim());
      setIsRejectModalOpen(false);
      setIsDocModalOpen(false);
    }
  };

  const handleOpenBlockModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setBlockReason(driver.blockReason || '');
    setIsBlockModalOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedDriver) {
      toggleBlockDriver(selectedDriver.id, blockReason.trim());
      setIsBlockModalOpen(false);
      setIsDocModalOpen(false);
    }
  };

  const handleConfirmBalanceAdjust = () => {
    const val = parseFloat(balanceAdjustAmount);
    if (selectedDriver && !isNaN(val)) {
      updateDriverBalance(selectedDriver.id, val);
      setIsBalanceModalOpen(false);
      setBalanceAdjustAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-5 rounded-2xl border border-purple-900/40 shadow-lg shadow-black/50">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-purple-400" />
            Gestión de Conductores (Taxi, Moto Taxi y Delivery)
          </h2>
          <p className="text-xs text-zinc-400">
            Aprobación de expedientes, verificación de documentos, saldos y desactivación automática al llegar a -$0.50 USD
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, placa, cédula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black border border-purple-900/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-purple-900/40">
          <button
            onClick={() => setCategoryFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              categoryFilter === 'todos'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos los Tipos
          </button>
          <button
            onClick={() => setCategoryFilter('taxi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              categoryFilter === 'taxi'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🚖 Taxis
          </button>
          <button
            onClick={() => setCategoryFilter('mototaxi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              categoryFilter === 'mototaxi'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🏍️ Moto Taxis
          </button>
          <button
            onClick={() => setCategoryFilter('delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              categoryFilter === 'delivery'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📦 Delivery
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
              statusFilter === 'todos'
                ? 'bg-purple-600 border-purple-500 text-white font-bold'
                : 'bg-zinc-900 border-purple-900/40 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Todos ({drivers.length})
          </button>
          <button
            onClick={() => setStatusFilter('activo')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
              statusFilter === 'activo'
                ? 'bg-purple-950 border-purple-500 text-white font-bold'
                : 'bg-zinc-900 border-purple-900/40 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setStatusFilter('pendiente')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
              statusFilter === 'pendiente'
                ? 'bg-purple-950 border-purple-500 text-white font-bold'
                : 'bg-zinc-900 border-purple-900/40 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter('negativo')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition flex items-center gap-1 ${
              statusFilter === 'negativo'
                ? 'bg-purple-600 border-purple-400 text-white font-bold'
                : 'bg-zinc-900 border-purple-900/40 text-purple-300 hover:bg-zinc-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-200" />
            Desactivados (&le; -$0.50)
          </button>
          <button
            onClick={() => setStatusFilter('bloqueado')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
              statusFilter === 'bloqueado'
                ? 'bg-purple-950 border-purple-500 text-white'
                : 'bg-zinc-900 border-purple-900/40 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Bloqueados
          </button>
        </div>
      </div>

      {/* Driver Cards Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-zinc-900 border border-purple-900/40 rounded-2xl shadow-lg">
            <Car className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">
              No se encontraron conductores con estos criterios.
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Prueba cambiando la búsqueda o los filtros aplicados.
            </p>
          </div>
        ) : (
          filteredDrivers.map((driver) => {
            const isNegative = driver.balanceUSD <= config.negativeBalanceThreshold;
            const balanceVES = driver.balanceUSD * config.bcvRate;

            const categoryLabels = {
              taxi: { name: 'Taxi', emoji: '🚖', bg: 'bg-purple-950 text-purple-200 border-purple-800' },
              mototaxi: { name: 'Moto Taxi', emoji: '🏍️', bg: 'bg-purple-950 text-purple-200 border-purple-800' },
              delivery: { name: 'Delivery', emoji: '📦', bg: 'bg-purple-950 text-purple-200 border-purple-800' },
            };

            return (
              <div
                key={driver.id}
                className={`p-5 rounded-2xl bg-zinc-900 border transition-all space-y-4 relative shadow-lg ${
                  isNegative
                    ? 'border-purple-600/80 bg-gradient-to-b from-purple-950/40 to-zinc-900 ring-1 ring-purple-600/40'
                    : 'border-purple-900/40 hover:border-purple-600'
                }`}
              >
                {/* Top Badge & Category */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 ${
                      categoryLabels[driver.category].bg
                    }`}
                  >
                    <span>{categoryLabels[driver.category].emoji}</span>
                    <span>{categoryLabels[driver.category].name}</span>
                  </span>

                  {isNegative ? (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg border bg-purple-600 text-white border-purple-400 tracking-wider uppercase flex items-center gap-1 animate-pulse">
                      <ShieldAlert className="w-3 h-3" />
                      DESACTIVADO (-$0.50)
                    </span>
                  ) : (
                    <span
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border uppercase tracking-wider ${
                        driver.status === 'activo'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : driver.status === 'pendiente'
                          ? 'bg-zinc-800 text-purple-300 border-zinc-700'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {driver.status}
                    </span>
                  )}
                </div>

                {/* Driver Info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black border border-purple-900/60 flex items-center justify-center font-black text-purple-400 text-lg overflow-hidden shrink-0">
                    <img
                      src={driver.documents.fotoVehiculoUrl}
                      alt={driver.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-extrabold text-white leading-tight">
                      {driver.name}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-purple-400" />
                      {driver.phone}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Cédula: <strong className="text-white">{driver.documents.cedulaNumber}</strong>
                    </p>
                  </div>
                </div>

                {/* Vehicle & Plate Specs */}
                <div className="p-3 bg-black rounded-xl border border-purple-900/40 text-xs space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Vehículo:</span>
                    <strong className="text-white">{driver.documents.vehicleModel}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Placa / Matrícula:</span>
                    <strong className="text-purple-300 font-mono tracking-wider">
                      {driver.documents.plateNumber}
                    </strong>
                  </div>
                </div>

                {/* Balance & Negative Warning */}
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between font-mono ${
                    isNegative
                      ? 'bg-purple-950/80 border-purple-600 text-white'
                      : 'bg-black border-purple-900/40 text-white'
                  }`}
                >
                  <div>
                    <p className="text-[10px] text-purple-300 uppercase font-bold">
                      Saldo de Comisión:
                    </p>
                    <p
                      className={`text-sm font-black ${
                        isNegative ? 'text-purple-300' : 'text-white'
                      }`}
                    >
                      ${driver.balanceUSD.toFixed(2)} USD
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 font-bold">Eq. BCV:</p>
                    <p className="text-xs font-bold text-zinc-200">
                      {balanceVES.toFixed(2)} VES
                    </p>
                  </div>
                </div>

                {/* Status Notice if Deactivated */}
                {driver.blockReason && (
                  <div className="p-2.5 bg-purple-950/60 border border-purple-800 rounded-xl text-[11px] text-purple-200">
                    <strong>Motivo:</strong> {driver.blockReason}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-purple-900/30 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDocModal(driver)}
                    className="flex-1 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-purple-900/50"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    Expediente
                  </button>

                  <button
                    onClick={() => setSimulatedDriver(driver)}
                    className="py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md shadow-purple-600/30"
                    title="Simular pantalla de la App del Conductor"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Simular App
                  </button>

                  <button
                    onClick={() => handleOpenBlockModal(driver)}
                    className={`p-2 rounded-xl border text-xs font-bold transition ${
                      driver.status === 'bloqueado'
                        ? 'bg-purple-950 border-purple-600 text-purple-300 hover:bg-purple-900'
                        : 'bg-black border-purple-900/50 text-zinc-400 hover:text-white'
                    }`}
                    title={driver.status === 'bloqueado' ? 'Desbloquear conductor' : 'Bloquear conductor'}
                  >
                    {driver.status === 'bloqueado' ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setDriverToDelete(driver);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 text-xs font-bold transition flex items-center justify-center"
                    title="Eliminar conductor permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DRIVER APP SIMULATION MODAL */}
      {simulatedDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-black border-2 border-purple-600 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl text-white relative">
            {/* Phone Top Notch */}
            <div className="w-24 h-4 bg-zinc-900 rounded-b-xl mx-auto -mt-6 mb-2 border-b border-purple-900/50"></div>

            <div className="flex justify-between items-center border-b border-purple-900/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  V
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">VIXY CONDUCTOR</h3>
                  <p className="text-[10px] text-purple-400">{simulatedDriver.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSimulatedDriver(null)}
                className="text-zinc-400 hover:text-white text-xs bg-zinc-900 p-1.5 rounded-lg border border-purple-900/40"
              >
                ✕
              </button>
            </div>

            {/* Simulated Balance Box */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-purple-900/60 text-center space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Saldo de Billetera Vixy
              </p>
              <p
                className={`text-2xl font-black font-mono ${
                  simulatedDriver.balanceUSD <= config.negativeBalanceThreshold
                    ? 'text-purple-400 animate-pulse'
                    : 'text-white'
                }`}
              >
                ${simulatedDriver.balanceUSD.toFixed(2)} USD
              </p>
              <p className="text-xs text-purple-300 font-mono">
                ≈ {(simulatedDriver.balanceUSD * config.bcvRate).toFixed(2)} VES (Tasa BCV)
              </p>
            </div>

            {/* App Status Banner based on -$0.50 threshold */}
            {simulatedDriver.balanceUSD <= config.negativeBalanceThreshold ? (
              <div className="p-4 rounded-2xl bg-purple-950/90 border border-purple-500 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  APLICACIÓN DESACTIVADA
                </h4>
                <p className="text-xs text-purple-200">
                  Tu saldo llegó a <strong>${simulatedDriver.balanceUSD.toFixed(2)} USD</strong> (&le; -$0.50 USD). La aplicación ha sido desactivada automáticamente.
                </p>
                <div className="p-2 bg-black rounded-xl text-[11px] text-zinc-300 font-mono border border-purple-800">
                  ⚠️ No puedes recibir viajes hasta realizar una recarga de saldo.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  APLICACIÓN CONECTADA Y ACTIVA
                </h4>
                <p className="text-xs text-purple-300">
                  Tu cuenta está en regla. Listo para recibir viajes de Taxi, Moto Taxi y Delivery.
                </p>
              </div>
            )}

            {/* Test Recharge & Commission Actions */}
            <div className="space-y-2 pt-2 border-t border-purple-900/50">
              <p className="text-[10px] text-purple-400 font-bold uppercase text-center">
                Acciones de Simulación en Vivo:
              </p>

              {/* Recharge Button (Increases balance above -$0.50) */}
              <button
                onClick={() => {
                  updateDriverBalance(simulatedDriver.id, 5.00);
                  const updated = drivers.find((d) => d.id === simulatedDriver.id);
                  if (updated) setSimulatedDriver({ ...updated, balanceUSD: updated.balanceUSD + 5.00 });
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar +$5.00 USD (Reactivar App)
              </button>

              {/* Deduct Commission (Lowers balance to trigger -$0.50 deactivation) */}
              <button
                onClick={() => {
                  updateDriverBalance(simulatedDriver.id, -0.60);
                  const updated = drivers.find((d) => d.id === simulatedDriver.id);
                  if (updated) setSimulatedDriver({ ...updated, balanceUSD: updated.balanceUSD - 0.60 });
                }}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-purple-300 font-bold border border-purple-900 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <span>📉 Cobrar Comisión Carrera (-$0.60)</span>
              </button>
            </div>

            <button
              onClick={() => setSimulatedDriver(null)}
              className="w-full py-2 bg-black text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-zinc-800"
            >
              Cerrar Vista de Simulación
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL */}
      {isDocModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-purple-900/60 rounded-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-4">
              <div>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                  Expediente Completo del Conductor
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedDriver.name} ({selectedDriver.category.toUpperCase()})
                </h3>
              </div>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-purple-900/40"
              >
                ✕
              </button>
            </div>

            {/* General Driver Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-zinc-900 p-4 rounded-xl border border-purple-900/40">
              <div>
                <p className="text-zinc-400">Teléfono:</p>
                <p className="font-bold text-white">{selectedDriver.phone}</p>
                <p className="text-zinc-400 mt-2">Correo Electrónico:</p>
                <p className="font-bold text-white">{selectedDriver.email}</p>
                <p className="text-zinc-400 mt-2">Fecha de Registro:</p>
                <p className="font-bold text-purple-300">{selectedDriver.registeredAt}</p>
              </div>
              <div>
                <p className="text-zinc-400">Modelo de Vehículo:</p>
                <p className="font-bold text-white">
                  {selectedDriver.documents.vehicleModel} ({selectedDriver.documents.vehicleYear})
                </p>
                <p className="text-zinc-400 mt-2">Placa / Matrícula:</p>
                <p className="font-bold text-purple-300 font-mono">
                  {selectedDriver.documents.plateNumber}
                </p>
                <p className="text-zinc-400 mt-2">Saldo en Cuenta:</p>
                <p
                  className={`font-black font-mono ${
                    selectedDriver.balanceUSD <= -0.50 ? 'text-purple-400' : 'text-white'
                  }`}
                >
                  ${selectedDriver.balanceUSD.toFixed(2)} USD (≈ {(selectedDriver.balanceUSD * config.bcvRate).toFixed(2)} VES)
                </p>
              </div>
            </div>

            {/* Document Cards Gallery */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Documentación y Certificados de Conducción
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Cédula */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-purple-900/40 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Cédula de Identidad</span>
                    <span className="text-[10px] text-purple-300 font-mono">{selectedDriver.documents.cedulaNumber}</span>
                  </div>
                  <div className="h-32 rounded-lg bg-black overflow-hidden border border-purple-900/30">
                    <img
                      src={selectedDriver.documents.cedulaUrl}
                      alt="Cédula"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Licencia */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-purple-900/40 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Licencia de Conducir</span>
                    <span className="text-[10px] text-purple-300 font-mono">{selectedDriver.documents.licenciaNumber}</span>
                  </div>
                  <div className="h-32 rounded-lg bg-black overflow-hidden border border-purple-900/30">
                    <img
                      src={selectedDriver.documents.licenciaUrl}
                      alt="Licencia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Certificado Médico */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-purple-900/40 space-y-2">
                  <span className="text-xs font-bold text-white">Certificado Médico Vial</span>
                  <div className="h-32 rounded-lg bg-black overflow-hidden border border-purple-900/30">
                    <img
                      src={selectedDriver.documents.certificadoMedicoUrl}
                      alt="Certificado Médico"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* RCV */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-purple-900/40 space-y-2">
                  <span className="text-xs font-bold text-white">RCV (Responsabilidad Civil)</span>
                  <div className="h-32 rounded-lg bg-black overflow-hidden border border-purple-900/30">
                    <img
                      src={selectedDriver.documents.rcvUrl}
                      alt="RCV"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Foto Vehículo */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-purple-900/40 space-y-2 sm:col-span-2 lg:col-span-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Fotografía del Vehículo</span>
                    <span className="text-[10px] text-purple-300 font-mono">Placa: {selectedDriver.documents.plateNumber}</span>
                  </div>
                  <div className="h-32 rounded-lg bg-black overflow-hidden border border-purple-900/30">
                    <img
                      src={selectedDriver.documents.fotoVehiculoUrl}
                      alt="Vehículo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-purple-900/40">
              <button
                onClick={() => {
                  setBalanceAdjustAmount('');
                  setIsBalanceModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-purple-600/30"
              >
                <DollarSign className="w-4 h-4" />
                Ajustar Saldo Manual
              </button>

              <div className="flex items-center gap-2">
                {selectedDriver.status === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleOpenRejectModal(selectedDriver)}
                      className="px-4 py-2 bg-black hover:bg-zinc-800 text-red-400 border border-red-900 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar Solicitud
                    </button>
                    <button
                      onClick={() => {
                        approveDriver(selectedDriver.id);
                        setIsDocModalOpen(false);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar Conductor
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-800"
                >
                  Cerrar
                </button>

                <button
                  onClick={() => {
                    setDriverToDelete(selectedDriver);
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-3 py-2 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="Eliminar conductor de la base de datos"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {isRejectModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-purple-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-purple-400" />
              Rechazar Solicitud de {selectedDriver.name}
            </h3>
            <p className="text-xs text-zinc-400">
              Escriba el motivo detallado por el cual se rechaza el registro del conductor. Este mensaje le será notificado.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej. La foto de la licencia no es legible o el RCV se encuentra vencido."
              className="w-full p-3 bg-black border border-purple-900/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-black text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK REASON MODAL */}
      {isBlockModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-purple-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-purple-400" />
              {selectedDriver.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'} Conductor
            </h3>
            {selectedDriver.status !== 'bloqueado' && (
              <>
                <p className="text-xs text-zinc-400">
                  Indique la causa del bloqueo de acceso a la plataforma para {selectedDriver.name}.
                </p>
                <textarea
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ej. Incumplimiento de términos o denuncias de clientes."
                  className="w-full p-3 bg-black border border-purple-900/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="px-4 py-2 bg-black text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBlock}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
              >
                {selectedDriver.status === 'bloqueado' ? 'Desbloquear Acceso' : 'Bloquear Conductor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE ADJUSTMENT MODAL */}
      {isBalanceModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-purple-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              Ajustar Saldo de {selectedDriver.name}
            </h3>
            <p className="text-xs text-zinc-400">
              Saldo Actual: <strong className="text-purple-300">${selectedDriver.balanceUSD.toFixed(2)} USD</strong>.
              Ingrese el monto en USD a abonar (número positivo) o deducir (número negativo). Si el saldo llega a -&le;$0.50 USD, la app se desactivará automáticamente.
            </p>
            <input
              type="number"
              step="0.10"
              placeholder="Ej. 5.00 o -2.50"
              value={balanceAdjustAmount}
              onChange={(e) => setBalanceAdjustAmount(e.target.value)}
              className="w-full p-3 bg-black border border-purple-900/60 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBalanceModalOpen(false)}
                className="px-4 py-2 bg-black text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBalanceAdjust}
                disabled={!balanceAdjustAmount}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
              >
                Aplicar Ajuste de Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DRIVER CONFIRMATION MODAL */}
      {isDeleteModalOpen && driverToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-purple-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 border-b border-purple-900/40 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  Eliminar Conductor
                </h3>
                <p className="text-xs text-zinc-400">
                  ID Conductor: #{driverToDelete.id}
                </p>
              </div>
            </div>

            <div className="p-4 bg-black/70 rounded-xl border border-purple-900/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Nombre Completo:</span>
                <strong className="text-white">{driverToDelete.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Categoría / Vehículo:</span>
                <span className="text-purple-300 font-bold capitalize">{driverToDelete.category} • {driverToDelete.documents.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Placa:</span>
                <span className="font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">{driverToDelete.documents.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Teléfono:</span>
                <span className="font-mono text-zinc-300">{driverToDelete.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Saldo Actual:</span>
                <span className={`font-mono font-bold ${driverToDelete.balanceUSD < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ${driverToDelete.balanceUSD.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-[11px] text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                ¿Confirmas la eliminación permanente del conductor <strong>{driverToDelete.name}</strong>? Esta acción borrará su expediente y cuenta de la plataforma.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDriverToDelete(null);
                }}
                className="px-4 py-2 bg-black text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (driverToDelete) {
                    deleteDriver(driverToDelete.id);
                    setIsDeleteModalOpen(false);
                    if (selectedDriver?.id === driverToDelete.id) {
                      setIsDocModalOpen(false);
                    }
                    setDriverToDelete(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
