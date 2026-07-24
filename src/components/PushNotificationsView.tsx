import React, { useState } from 'react';
import { Send, Users, Bell, CheckCircle2, History } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const PushNotificationsView: React.FC = () => {
  const { sendPushNotification, pushNotifications, drivers, clients } = useAdmin();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetGroup, setTargetGroup] = useState<
    'todos' | 'conductores' | 'taxis' | 'mototaxis' | 'delivery' | 'clientes' | 'individual'
  >('conductores');
  const [recipientId, setRecipientId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    let recipientName = undefined;
    if (targetGroup === 'individual' && recipientId) {
      const drv = drivers.find((d) => d.id === recipientId);
      if (drv) recipientName = drv.name;
    }

    sendPushNotification({
      title: title.trim(),
      body: body.trim(),
      targetGroup,
      recipientId: recipientId || undefined,
      recipientName,
    });

    setTitle('');
    setBody('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
          <Send className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">
            Centro de Emisión de Notificaciones Push
          </h2>
          <p className="text-xs text-slate-500">
            Envío masivo o individual de mensajes push para la app de conductores y clientes
          </p>
        </div>
      </div>

      {/* Composer Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          Redactar Nueva Notificación
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Audiencia de Destino:
            </label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value as any)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="conductores">Todos los Conductores (Taxis, Moto Taxis y Delivery)</option>
              <option value="taxis">Solo Conductores de Taxi 🚖</option>
              <option value="mototaxis">Solo Conductores de Moto Taxi 🏍️</option>
              <option value="delivery">Solo Repartidores de Delivery 📦</option>
              <option value="clientes">Todos los Clientes / Pasajeros 👥</option>
              <option value="todos">Toda la Plataforma (Conductores + Clientes)</option>
              <option value="individual">Conductor Específico 👤</option>
            </select>
          </div>

          {targetGroup === 'individual' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Seleccionar Conductor:
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                required
              >
                <option value="">-- Seleccionar de la lista --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.category.toUpperCase()}) - Placa: {d.documents.plateNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Título de la Notificación Push:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. ⚠️ Recordatorio de Pago de Comisión Vixy"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Mensaje / Cuerpo de la Notificación:
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escriba aquí el contenido detallado de la notificación..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Send className="w-4 h-4" />
            Distribuir Notificación Push
          </button>
        </div>
      </form>

      {/* History Log */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-slate-400" />
          Historial de Notificaciones Emitidas
        </h3>

        {pushNotifications.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            Aún no se han enviado notificaciones push desde esta sesión.
          </p>
        ) : (
          <div className="space-y-3">
            {pushNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900">{notif.title}</h4>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono text-[10px] rounded uppercase border border-blue-200 font-bold">
                    Target: {notif.targetGroup}
                  </span>
                </div>
                <p className="text-slate-600">{notif.body}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  <span>Enviado por: {notif.sentBy}</span>
                  <span>{notif.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
