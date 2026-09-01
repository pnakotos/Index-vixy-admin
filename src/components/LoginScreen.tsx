import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const LoginScreen: React.FC = () => {
  const { login, brandingMedia } = useAdmin();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Por favor ingrese usuario y contraseña.');
      return;
    }

    const res = await login(usernameInput, passwordInput);
    if (!res.success) {
      setErrorMessage(res.message || 'Error al iniciar sesión.');
    }
  };

  const bgImage = brandingMedia?.backgroundImageUrl || brandingMedia?.imageUrl || '';

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Optional Background Image configured by Admin */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-[1px] scale-105 pointer-events-none"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black/95 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 space-y-6">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 flex items-center justify-center font-black text-white text-3xl shadow-lg shadow-purple-600/40">
            V
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">VIXY</h1>
            <p className="text-[11px] text-zinc-400">Panel Administrativo</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-950/90 border border-purple-900/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/50 space-y-6 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Iniciar Sesión
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Ingrese sus credenciales de usuario o correo corporativo.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-purple-950 border border-purple-500 text-purple-200 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Usuario o Correo
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ej. root o admin@vhixy.site"
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-purple-900/60 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-purple-900/60 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <span>Ingresar al Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
            * El acceso requiere un usuario previamente registrado con contraseña asignada.
          </p>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
          <span>© 2026 Vixy Servicios C.A. - Acceso Restringido</span>
        </p>
      </div>
    </div>
  );
};
