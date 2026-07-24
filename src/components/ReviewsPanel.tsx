import React from 'react';
import { MessageSquare, Star, Trash2, Flag, Filter, ShieldAlert } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const ReviewsPanel: React.FC = () => {
  const { reviews, toggleFlagReview, deleteReview } = useAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Panel de Comentarios y Reseñas de Usuarios
          </h2>
          <p className="text-xs text-slate-500">
            Opiniones y calificaciones entre pasajeros y conductores de Taxi, Moto Taxi y Delivery
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className={`p-5 rounded-2xl border space-y-3 transition-all ${
              rev.isFlagged
                ? 'bg-red-50 border-red-200 shadow-xs'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-600 uppercase tracking-wider font-mono">
                {rev.driverCategory.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rev.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
              "{rev.comment}"
            </p>

            {/* Participants */}
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>
                Pasajero: <strong className="text-slate-900">{rev.clientName}</strong>
              </span>
              <span>
                Conductor: <strong className="text-blue-600">{rev.driverName}</strong>
              </span>
            </div>

            {/* Moderation Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => toggleFlagReview(rev.id)}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  rev.isFlagged
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={rev.isFlagged ? 'Quitar reporte' : 'Reportar comentario'}
              >
                <Flag className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => deleteReview(rev.id)}
                className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                title="Eliminar reseña"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
