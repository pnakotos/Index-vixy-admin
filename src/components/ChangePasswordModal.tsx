import React, { useState } from 'react';
import { KeyRound, Lock, AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const ChangePasswordModal: React.FC = () => {
  const {
    changeRootPassword,
    currentBackendUser,
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
  } = useAdmin();

  const isMandatory = Boolean(currentBackendUser?.mustChangePassword);

  const [isDismissed, setIsDismissed] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCloseModal = () => {
    setIsDismissed(true);
    setIsChangePasswordModalOpen(false);
    setErrorMsg('');
  };

  const shouldShow = (isChangePasswordModalOpen || isMandatory) && (!isDismissed || isChangePasswordModalOpen);
  if (!shouldShow) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!oldPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMsg('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    if (newPasswordInput === '123456') {
      setErrorMsg('La nueva contraseña no puede ser la clave de fábrica (123456). Elija una nueva clave.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const result = await changeRootPassword(oldPasswordInput, newPasswordInput);
    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setErrorMsg('');
      setIsDismissed(true);
      setIsChangePasswordModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-2 border-purple-600 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl shadow-purple-950/80 text-white relative">
        {/* Close button always accessible */}
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/40 transition cursor-pointer"
          title="Cerrar ventana"
          aria-label="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/40 ring-4 ring-purple-900/50">
            <KeyRound className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black text-white">
            {isMandatory
              ? '🔒 Cambio Inicial de Contraseña'
              : '🔑 Cambiar Contraseña de Cuenta'}
          </h3>

          <p className="text-xs text-purple-300">
            {isMandatory
              ? 'Por políticas de seguridad, se sugiere actualizar la clave inicial. Puedes cambiarla ahora o cerrar esta ventana para continuar.'
              : `Actualiza la contraseña para la cuenta ${currentBackendUser?.name || 'Root'}.`}
          </p>
        </div>

        {/* Warning Badge */}
        {isMandatory && (
          <div className="p-3 bg-purple-950/90 border border-purple-500 rounded-2xl flex items-start gap-2.5 text-xs text-purple-200">
            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold mb-0.5">Clave de Fábrica Activa</strong>
              Recomendamos reemplazar tu clave por una clave personalizada de al menos 6 caracteres.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-950 border border-red-500 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Contraseña Actual / Inicial
            </label>
            <input
              type="password"
              value={oldPasswordInput}
              onChange={(e) => setOldPasswordInput(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-2.5 bg-black border border-purple-900/60 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Nueva Contraseña Deseada
            </label>
            <input
              type="password"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="Mínimo 6 caracteres (ej. VixyAdmin2026!)"
              className="w-full px-4 py-2.5 bg-black border border-purple-900/60 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
              placeholder="Repita la nueva contraseña"
              className="w-full px-4 py-2.5 bg-black border border-purple-900/60 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="order-2 sm:order-1 flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-zinc-800 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isMandatory ? 'Cerrar / Omitir' : 'Cancelar'}</span>
            </button>

            <button
              type="submit"
              className="order-1 sm:order-2 flex-2 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Guardar Contraseña</span>
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-zinc-400 italic">
          La nueva clave se guardará de forma segura en el almacenamiento de la aplicación web.
        </p>
      </div>
    </div>
  );
};
