import React, { useState } from 'react';
import {
  Users,
  Search,
  Ban,
  Unlock,
  DollarSign,
  Star,
  Phone,
  Mail,
  UserCheck,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Client } from '../types';

export const ClientManagement: React.FC = () => {
  const { clients, config, toggleBlockClient, updateClientBalance, deleteClient } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');

  // Selected client for modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const handleOpenBlock = (client: Client) => {
    setSelectedClient(client);
    setBlockReason(client.blockReason || '');
    setIsBlockModalOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedClient) {
      toggleBlockClient(selectedClient.id, blockReason.trim());
      setIsBlockModalOpen(false);
    }
  };

  const handleConfirmBalance = () => {
    const val = parseFloat(balanceAmount);
    if (selectedClient && !isNaN(val)) {
      updateClientBalance(selectedClient.id, val);
      setIsBalanceModalOpen(false);
      setBalanceAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestión de Clientes y Pasajeros Vixy
          </h2>
          <p className="text-xs text-slate-500">
            Administración de perfiles, saldos en billetera virtual y restricciones de acceso
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Client List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const balanceVES = client.balanceUSD * config.bcvRate;

          return (
            <div
              key={client.id}
              className={`p-5 rounded-2xl bg-white border space-y-4 transition-all shadow-xs ${
                client.isBlocked
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  ID: #{client.id}
                </span>

                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border uppercase ${
                    client.isBlocked
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {client.isBlocked ? 'Bloqueado' : 'Activo'}
                </span>
              </div>

              {/* Profile Details */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-blue-600">
                  {client.avatarUrl ? (
                    <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    client.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{client.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <Phone className="w-3 h-3 text-blue-600" />
                    {client.phone}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {client.email}
                  </p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-500 text-[10px]">Carreras Realizadas:</p>
                  <p className="font-bold text-slate-900">{client.totalTrips} viajes</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Calificación Pasajero:</p>
                  <p className="font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {client.rating.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Saldo Billetera Vixy:
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    ${client.balanceUSD.toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold block">Equivalente VES:</span>
                  <span className="text-xs font-bold text-slate-700">
                    {balanceVES.toFixed(2)} VES
                  </span>
                </div>
              </div>

              {client.blockReason && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700">
                  <strong>Motivo de Bloqueo:</strong> {client.blockReason}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setBalanceAmount('');
                    setIsBalanceModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Ajustar Saldo
                </button>

                <button
                  onClick={() => handleOpenBlock(client)}
                  className={`p-2 rounded-xl border text-xs font-bold transition ${
                    client.isBlocked
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  }`}
                  title={client.isBlocked ? 'Desbloquear cliente' : 'Bloquear cliente'}
                >
                  {client.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    setClientToDelete(client);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition flex items-center justify-center"
                  title="Eliminar pasajero permanentemente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BLOCK CLIENT MODAL */}
      {isBlockModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-slate-800">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              {selectedClient.isBlocked ? 'Desbloquear' : 'Bloquear'} Cliente {selectedClient.name}
            </h3>
            {!selectedClient.isBlocked && (
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Motivo del bloqueo de la cuenta del cliente..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBlock}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE CLIENT MODAL */}
      {isBalanceModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-slate-800">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Abonar Saldo a {selectedClient.name}
            </h3>
            <p className="text-xs text-slate-500">
              Saldo actual: <strong className="text-blue-600">${selectedClient.balanceUSD.toFixed(2)} USD</strong>.
              Ingrese el monto en USD a acreditar.
            </p>
            <input
              type="number"
              step="0.50"
              placeholder="Ej. 10.00"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBalanceModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBalance}
                disabled={!balanceAmount}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
              >
                Abonar Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CLIENT CONFIRMATION MODAL */}
      {isDeleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Eliminar Pasajero / Cliente
                </h3>
                <p className="text-xs text-slate-500">
                  ID de cuenta: #{clientToDelete.id}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nombre Completo:</span>
                <strong className="text-slate-900">{clientToDelete.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="font-bold text-slate-900 font-mono">{clientToDelete.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Correo:</span>
                <span className="text-slate-700">{clientToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Carreras:</span>
                <span className="font-bold text-slate-900">{clientToDelete.totalTrips} viajes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo en Billetera:</span>
                <span className="font-mono font-bold text-emerald-600">${clientToDelete.balanceUSD.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                ¿Confirmas la eliminación definitiva del cliente <strong>{clientToDelete.name}</strong>? Se borrará su historial de la plataforma.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setClientToDelete(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (clientToDelete) {
                    deleteClient(clientToDelete.id);
                    setIsDeleteModalOpen(false);
                    setClientToDelete(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition"
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
