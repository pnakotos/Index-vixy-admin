import React from 'react';
import {
  AlertTriangle,
  Siren,
  Phone,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Car,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { EmergencyStatus } from '../types';

export const EmergencyAlertsView: React.FC = () => {
  const {
    emergencies,
    updateEmergencyStatus,
    triggerSimulatedEmergency,
    soundEnabled,
    setSoundEnabled,
    setActiveTab,
  } = useAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-600 to-rose-700 p-5 rounded-2xl border border-red-500 shadow-xs text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 text-white rounded-xl backdrop-blur-xs animate-pulse">
            <Siren className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              Centro de Alertas de Emergencia y Robo
            </h2>
            <p className="text-xs text-red-100">
              Notificaciones de pánico en tiempo real enviadas por conductores y usuarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition backdrop-blur-xs"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>Sirena Activada</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-red-200" />
                <span>Sirena Silenciada</span>
              </>
            )}
          </button>

          {/* Test Emergency Button */}
          <button
            onClick={() => triggerSimulatedEmergency('robo')}
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-xl transition shadow-xs"
          >
            🚨 Simular Alerta de Robo
          </button>
        </div>
      </div>

      {/* Emergency Alert List */}
      <div className="space-y-4">
        {emergencies.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">
              No hay alertas de emergencia activas en este momento.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Todas las unidades se encuentran navegando de manera segura.
            </p>
          </div>
        ) : (
          emergencies.map((emg, idx) => {
            const statusBadges = {
              pendiente: 'bg-red-600 text-white animate-pulse border-red-500 font-bold',
              en_proceso: 'bg-amber-500 text-white border-amber-400 font-bold',
              resuelto: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
              falsa_alarma: 'bg-slate-100 text-slate-500 border-slate-200',
            };

            const typeIcons = {
              robo: '🚨 ALERTA DE ROBO / ASALTO',
              accidente: '💥 ACCIDENTE VIAL',
              sos: '🆘 SOS BOTÓN DE PÁNICO',
              mecanico: '🔧 FALLA MECÁNICA EN VÍA',
            };

            return (
              <div
                key={`${emg.id}-${idx}`}
                className={`p-5 rounded-2xl border transition-all space-y-4 shadow-xs ${
                  emg.status === 'pendiente'
                    ? 'bg-red-50/40 border-red-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Siren className="w-4 h-4 text-red-600" />
                    {typeIcons[emg.type]}
                  </span>

                  <span
                    className={`px-3 py-1 text-[10px] font-extrabold rounded-full border uppercase ${
                      statusBadges[emg.status]
                    }`}
                  >
                    Estado: {emg.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase">
                      Reportado Por:
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">{emg.reporterName}</p>
                    <p className="text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {emg.reporterPhone}
                    </p>
                    <p className="text-slate-500 mt-1 capitalize">
                      Tipo: {emg.reporterType} ({emg.category || 'N/A'})
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase">
                      Ubicación de la Incidencia:
                    </p>
                    <p className="font-bold text-slate-800 flex items-start gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      {emg.locationName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      GPS: {(emg.lat ?? 0).toFixed(5)}, {(emg.lng ?? 0).toFixed(5)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase">
                      Datos del Vehículo & Hora:
                    </p>
                    <p className="font-bold text-slate-900 flex items-center gap-1 mt-1">
                      <Car className="w-3.5 h-3.5 text-amber-600" />
                      {emg.vehicleInfo || 'No especificado'}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {emg.timestamp}
                    </p>
                  </div>
                </div>

                {emg.notes && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 font-medium">
                    <strong>Detalles del reporte:</strong> {emg.notes}
                  </div>
                )}

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Ubicar en Mapa en Vivo
                  </button>

                  <div className="flex items-center gap-2">
                    {emg.status !== 'en_proceso' && emg.status !== 'resuelto' && (
                      <button
                        onClick={() => updateEmergencyStatus(emg.id, 'en_proceso')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-xs"
                      >
                        Marcar En Atención
                      </button>
                    )}

                    {emg.status !== 'resuelto' && (
                      <button
                        onClick={() => updateEmergencyStatus(emg.id, 'resuelto')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                      >
                        Marcar Resuelto
                      </button>
                    )}

                    {emg.status !== 'falsa_alarma' && (
                      <button
                        onClick={() => updateEmergencyStatus(emg.id, 'falsa_alarma')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-xl transition border border-slate-200"
                      >
                        Falsa Alarma
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
