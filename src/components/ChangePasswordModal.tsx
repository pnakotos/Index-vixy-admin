import React, { useState } from 'react';
import { KeyRound, Lock, AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const ChangePasswordModal: React.FC = () => {
  const {
    changeRootPassword,
    rootPassword,
    mustChangePassword,
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
  } = useAdmin();

  const [oldPasswordInput, setOldPasswordInput] = useState('123456');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isChangePasswordModalOpen && !mustChangePassword) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
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

    const result = changeRootPassword(oldPasswordInput, newPasswordInput);
    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-2 border-purple-600 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl shadow-purple-950/80 text-white relative">
        {/* Close button only if not mandatory change */}
        {!mustChangePassword && (
          <button
            onClick={() => setIsChangePasswordModalOpen(false)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-purple-900/40"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/40 ring-4 ring-purple-900/50">
            <KeyRound className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black text-white">
            {mustChangePassword
              ? '🔒 Cambio Obligatorio de Contraseña (Primer Ingreso)'
              : '🔑 Cambiar Contraseña de Súperusuario Root'}
          </h3>

          <p className="text-xs text-purple-300">
            {mustChangePassword
              ? 'Has ingresado con la contraseña genérica de fábrica (123456). Por seguridad, debes establecer tu propia contraseña antes de continuar.'
              : 'Actualiza la contraseña maestra del súperusuario root.'}
          </p>
        </div>

        {/* Warning Badge */}
        {mustChangePassword && (
          <div className="p-3 bg-purple-950/90 border border-purple-500 rounded-2xl flex items-start gap-2.5 text-xs text-purple-200">
            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold mb-0.5">Acceso Bloqueado Hasta Actualizar</strong>
              Para proteger tu instalación web, debes cambiar la clave inicial <code className="bg-black px-1.5 py-0.5 rounded text-purple-300 font-mono">123456</code> por una personalizada.
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

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition transform active:scale-95 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Guardar Nueva Contraseña y Entrar</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-zinc-400 italic">
          La nueva clave se guardará de forma segura en el almacenamiento de la aplicación web.
        </p>
      </div>
    </div>
  );
};
