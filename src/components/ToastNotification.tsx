import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const ToastNotification: React.FC = () => {
  const { toastMessage } = useAdmin();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-up shadow-2xl">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg ${
          borderColors[toastMessage.type]
        }`}
      >
        {icons[toastMessage.type]}
        <p className="text-sm font-medium pr-2">{toastMessage.text}</p>
      </div>
    </div>
  );
};
