import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Globe,
  Lock,
  Sparkles,
  Smartphone,
  Server,
  Zap,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const LoginScreen: React.FC = () => {
  const { login, rootPassword, mustChangePassword, setIsWebGuideModalOpen } = useAdmin();

  const [usernameInput, setUsernameInput] = useState('root');
  const [passwordInput, setPasswordInput] = useState('123456');
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

  const handleQuickLogin = (user: string, pass: string) => {
    setUsernameInput(user);
    setPasswordInput(pass);
    const res = login(user, pass);
    if (!res.success) {
      setErrorMessage(res.message || 'Error en inicio de sesión rápido.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-purple-900/40 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-600/40">
            V
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              VIXY <span className="text-xs px-2 py-0.5 rounded-md bg-purple-950 border border-purple-700 text-purple-300 font-mono">BACKEND WEB</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Plataforma de Control Administrativo Root</p>
          </div>
        </div>

        <button
          onClick={() => setIsWebGuideModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/50 text-xs font-bold text-purple-300 hover:text-white flex items-center gap-2 transition"
        >
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Guía de Montaje Web</span>
        </button>
      </header>

      {/* Center Card */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Informational Banner */}
        <div className="md:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Acceso Superusuario Root Generico
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white leading-tight">
              Control Total e Infraestructura Web
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inicia sesión con la cuenta <strong className="text-purple-300">Root</strong> para configurar tarifas, comisiones, monitorear taxis, mototaxis, envíos y gestionar administradores.
            </p>
          </div>

          {/* Key Security Badge Notice */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-900/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Credenciales por Defecto de Fábrica:</span>
            </div>
            <div className="p-3 bg-black rounded-xl border border-purple-900/40 text-xs font-mono space-y-1 text-zinc-300">
              <p>
                👤 Usuario: <strong className="text-white">root</strong>
              </p>
              <p>
                🔑 Clave Inicial: <strong className="text-purple-300 font-bold">123456</strong>
              </p>
            </div>
            <p className="text-[11px] text-zinc-400 italic">
              ⚠️ Al ingresar por primera vez con <strong className="text-purple-300">123456</strong>, el sistema solicitará obligatoriamente cambiar la contraseña.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2">
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" /> Web Ready
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> SPA SPA-Build
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" /> Real-time State
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-7 bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/50 space-y-6 relative">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Iniciar Sesión en Vixy
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Ingrese su nombre de usuario o correo electrónico administrativo.
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
                placeholder="root o root@vixytaxi.com"
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-purple-900/60 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-300">
                  Contraseña
                </label>
                <span className="text-[10px] text-purple-400 font-mono">Clave Inicial: 123456</span>
              </div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-purple-900/60 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition transform active:scale-95"
            >
              <span>Ingresar al Panel Administrativo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Presets for testing */}
          <div className="pt-4 border-t border-purple-900/40 space-y-3">
            <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider text-center">
              ⚡ Ingreso Rápido de Prueba (Un solo Clic)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('root', rootPassword)}
                className="p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-left text-xs transition"
              >
                <div className="font-extrabold text-white flex items-center justify-between">
                  <span>👑 Súper Root</span>
                </div>
                <p className="text-[10px] text-purple-300 font-mono">root / {rootPassword}</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('finanzas@vixytaxi.com', '123456')}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/40 text-left text-xs transition"
              >
                <div className="font-extrabold text-white">💼 Finanzas</div>
                <p className="text-[10px] text-zinc-400 font-mono">finanzas@vixy...</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('despacho@vixytaxi.com', '123456')}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/40 text-left text-xs transition"
              >
                <div className="font-extrabold text-white">🎧 Soporte</div>
                <p className="text-[10px] text-zinc-400 font-mono">despacho@vixy...</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-4 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 relative z-10">
        <p>© 2026 Vixy Servicios C.A. - Todos los derechos reservados.</p>
        <p className="font-mono text-[11px] text-purple-400">
          Compilado para implementación Web (Vite + React SPA)
        </p>
      </footer>
    </div>
  );
};
