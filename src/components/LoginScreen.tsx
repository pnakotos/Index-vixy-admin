import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Lock,
  Sparkles,
  Server,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const LoginScreen: React.FC = () => {
  const { login, brandingMedia } = useAdmin();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Por favor ingrese usuario y contraseña.');
      return;
    }

    const res = login(usernameInput, passwordInput);
    if (!res.success) {
      setErrorMessage(res.message || 'Error al iniciar sesión.');
    }
  };

  const bgImage =
    brandingMedia?.backgroundImageUrl ||
    brandingMedia?.imageUrl ||
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Full Background Custom Image configured by Admin */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 filter blur-[1px] scale-105 pointer-events-none transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}

      {/* Dark overlay & radial gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black/95 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-purple-900/40 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-600/40">
            V
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              VIXY{' '}
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-950 border border-purple-700 text-purple-300 font-mono">
                WEB PRODUCCIÓN
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">Plataforma de Control Administrativo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-800">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Sistema Web Seguro SSL</span>
          </span>
        </div>
      </header>

      {/* Center Layout */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Informational Showcase Banner */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Plataforma Oficial Vixy Venezuela</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md">
              Control Total e Infraestructura de Movilidad
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed drop-shadow-sm">
              Inicia sesión con tu cuenta administrativa asignada para gestionar tarifas, comisiones, monitorear carreras en vivo y verificar pagos.
            </p>
          </div>

          {/* Image Presentation Banner */}
          <div className="bg-zinc-950/90 border border-purple-900/60 rounded-3xl p-4 shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Presentación Corporativa</span>
              </span>
              <span className="text-[10px] text-purple-400 font-mono">vhixy.site</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-purple-900/40 bg-black aspect-video flex items-center justify-center">
              <img
                src={
                  brandingMedia?.imageUrl ||
                  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'
                }
                alt="Presentación Vixy"
                className="w-full h-full object-cover brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                <p className="text-xs font-bold text-white leading-tight">
                  {brandingMedia?.videoTitle || 'Plataforma Administrativa Vixy Venezuela'}
                </p>
                <p className="text-[10px] text-zinc-300">
                  Infraestructura centralizada de transporte y pagos en tiempo real.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" /> Servidor Web Listo
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Acceso Restringido
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" /> Interconexiones Activas
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-6 bg-zinc-950/90 border border-purple-900/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/50 space-y-6 relative backdrop-blur-xl">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Iniciar Sesión
            </h3>
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
              <span>Ingresar al Panel Administrativo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
            * El acceso requiere un usuario previamente registrado en el módulo de gestión de usuarios con contraseña asignada.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-4 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 relative z-10">
        <p>© 2026 Vixy Servicios C.A. - Todos los derechos reservados.</p>
        <p className="font-mono text-[11px] text-purple-400">
          Plataforma Web de Gestión Administrativa
        </p>
      </footer>
    </div>
  );
};
