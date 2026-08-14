import React, { useState } from 'react';
import {
  Car,
  Bike,
  Package,
  GraduationCap,
  Download,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  X,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { VixyRiderIllustration } from './VixyRiderIllustration';
import { useAdmin } from '../context/AdminContext';

interface WelcomeScreenProps {
  onOpenAdminLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenAdminLogin }) => {
  const { config, brandingMedia } = useAdmin();

  const [downloadModal, setDownloadModal] = useState<'driver' | 'passenger' | null>(null);
  const [activeTabServices, setActiveTabServices] = useState<'taxi' | 'mototaxi' | 'delivery' | 'university'>('taxi');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const handleSimulateDownload = (appName: string, apkName: string) => {
    setDownloadSuccessToast(`Iniciando descarga de ${apkName}...`);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4000);
  };

  const bgImage =
    brandingMedia?.backgroundImageUrl ||
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
      {/* Background Ambient Layers */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-[2px] scale-105 pointer-events-none"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/95 to-black pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-fuchsia-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-900/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Navigation Bar with Quick Corner Links */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-purple-900/40 px-4 sm:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-fuchsia-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-600/50 border border-purple-400/30">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white italic">
                  VIXY <span className="text-purple-400 font-sans not-italic font-extrabold text-sm">RIDER</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  🇻🇪 Venezuela
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Plataforma Nacional de Transporte y Movilidad</p>
            </div>
          </div>

          {/* Corner Quick Action Links (Requested by User) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* 1. Driver App Download Link */}
            <button
              onClick={() => setDownloadModal('driver')}
              className="px-3 sm:px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:border-purple-400 hover:text-white"
              title="Descargar Aplicación para Conductores y Repartidores"
            >
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">App</span> Conductor
              <Download className="w-3 h-3 text-purple-300 ml-0.5" />
            </button>

            {/* 2. Passenger App Download Link */}
            <button
              onClick={() => setDownloadModal('passenger')}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-purple-900/40 border border-purple-400/30"
              title="Descargar Aplicación para Pasajeros y Clientes"
            >
              <Car className="w-4 h-4 text-purple-200" />
              <span className="hidden md:inline">App</span> Pasajero
              <Download className="w-3 h-3 text-purple-200 ml-0.5" />
            </button>

            {/* 3. Administrative Panel Access Link */}
            <button
              onClick={onOpenAdminLogin}
              className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
              title="Acceder al Panel Administrativo de Control"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Panel Administrativo</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-16 relative z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* National Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/90 border border-purple-700/60 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-inner">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Movilidad Inteligente en los 24 Estados de Venezuela</span>
            </div>

            {/* Main Headline requested by user */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
              Bienvenidos a la{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                nueva era
              </span>{' '}
              en el transporte de Venezuela
            </h1>

            {/* Subtitle & Value Proposition */}
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              La plataforma venezolana de viajes y encomiendas más rápida, segura y económica.
              Pide tu <strong>Taxi</strong>, muévete veloz en <strong>Moto Taxi</strong> o realiza envíos con{' '}
              <strong>Delivery express</strong> pagando a <strong>tasa oficial BCV</strong> con Pago Móvil, Efectivo o Zelle.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-purple-900/50 backdrop-blur-xs text-center lg:text-left">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">💵 Tasa Oficial</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                  {(config?.bcvRate ?? 58.5).toFixed(2)} Bs/USD
                </span>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-purple-900/50 backdrop-blur-xs text-center lg:text-left">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">📍 Cobertura</span>
                <span className="text-sm sm:text-base font-black text-purple-300 font-mono">24 Estados</span>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-purple-900/50 backdrop-blur-xs text-center lg:text-left col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">🛡️ Seguridad</span>
                <span className="text-sm sm:text-base font-black text-amber-300">Monitoreo 24/7</span>
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              <button
                onClick={() => setDownloadModal('passenger')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm transition shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 border border-purple-300/40 group"
              >
                <Smartphone className="w-5 h-5 text-purple-200 group-hover:scale-110 transition-transform" />
                <span>Descargar App Pasajero</span>
                <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setDownloadModal('driver')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-purple-200 hover:text-white font-extrabold text-sm transition border border-purple-700/60 flex items-center justify-center gap-2.5 shadow-lg group"
              >
                <Bike className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Descargar App Conductor</span>
                <Download className="w-4 h-4 text-purple-400" />
              </button>

              <button
                onClick={onOpenAdminLogin}
                className="w-full sm:w-auto px-4 py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-amber-300 font-bold text-xs transition border border-zinc-800 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-zinc-500" />
                <span>Ingreso Administrativo</span>
              </button>
            </div>
          </div>

          {/* Right Hero Visual Showcase: The Vixy Rider Fox Mascot Image */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Glowing Backdrop Base */}
            <div className="relative p-6 sm:p-8 bg-zinc-950/90 border border-purple-800/60 rounded-3xl shadow-2xl backdrop-blur-md w-full max-w-md flex flex-col items-center">
              {/* Mascot Emblem Graphic */}
              <div className="relative transform hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => setDownloadModal('passenger')}>
                <VixyRiderIllustration size="lg" showGlow={true} />
              </div>

              {/* Tagline below image */}
              <div className="text-center mt-2 space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider font-mono">
                    VIXY RIDER EN VIVO
                  </span>
                </div>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Tu viaje seguro al alcance de tu mano. Disponible para Android y descarga directa APK.
                </p>
              </div>

              {/* Fast Direct Action Links inside Card */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-5 pt-4 border-t border-purple-900/50">
                <button
                  onClick={() => setDownloadModal('passenger')}
                  className="p-2.5 bg-purple-900/40 hover:bg-purple-900/80 rounded-xl border border-purple-700/50 text-center transition group"
                >
                  <span className="text-[10px] text-purple-300 font-bold block">Soy Pasajero</span>
                  <span className="text-xs font-black text-white flex items-center justify-center gap-1 mt-0.5">
                    <span>Pedir Viaje</span>
                    <ChevronRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={() => setDownloadModal('driver')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-700 text-center transition group"
                >
                  <span className="text-[10px] text-zinc-400 font-bold block">Soy Conductor</span>
                  <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                    <span>Generar Ingresos</span>
                    <ChevronRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Services & Features Grid */}
        <section className="mt-16 sm:mt-24 pt-10 border-t border-purple-900/40 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
              Modalidades de Servicio
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Todo lo que necesitas para moverte en Venezuela
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Precios calculados con total transparencia según distancia real y regulados por estado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Taxi */}
            <div className="p-5 bg-zinc-950/80 border border-purple-900/50 hover:border-purple-500 rounded-2xl space-y-3 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">🚗 Taxi Vixy</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Vehículos confortables con aire acondicionado para viajes individuales o familiares en tu ciudad o interurbanos.
              </p>
              <div className="pt-2 text-[11px] font-mono text-purple-300 font-bold flex items-center justify-between border-t border-zinc-800">
                <span>Tarifa Mínima:</span>
                <span className="text-white">${(config?.baseFareUSD ?? 2.5).toFixed(2)} USD</span>
              </div>
            </div>

            {/* 2. Moto Taxi */}
            <div className="p-5 bg-zinc-950/80 border border-purple-900/50 hover:border-purple-500 rounded-2xl space-y-3 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">🏍️ Moto Taxi Vixy</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                La opción más veloz para superar el tráfico en horas pico. Pilotos certificados con casco de seguridad para el pasajero.
              </p>
              <div className="pt-2 text-[11px] font-mono text-purple-300 font-bold flex items-center justify-between border-t border-zinc-800">
                <span>Tarifa Mínima:</span>
                <span className="text-white">${((config?.baseFareUSD ?? 2.5) * 0.65).toFixed(2)} USD</span>
              </div>
            </div>

            {/* 3. Delivery */}
            <div className="p-5 bg-zinc-950/80 border border-purple-900/50 hover:border-purple-500 rounded-2xl space-y-3 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">📦 Delivery Express</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Envíos de comida, documentos, medicinas y encomiendas personales con rastreo en vivo y confirmación de entrega.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-300 font-bold flex items-center justify-between border-t border-zinc-800">
                <span>Tarifa Mínima:</span>
                <span className="text-white">${((config?.baseFareUSD ?? 2.5) * 0.75).toFixed(2)} USD</span>
              </div>
            </div>

            {/* 4. Modalidad Tarifa Universitaria */}
            <div className="p-5 bg-gradient-to-b from-purple-950/60 to-zinc-950 border border-purple-500/60 rounded-2xl space-y-3 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold uppercase font-mono">
                Especial
              </div>
              <div className="w-12 h-12 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">🎓 Tarifa Universitaria</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Modalidad con tarifa preferencial independiente para viajes cuyo origen o destino sea una sede o campus universitario.
              </p>
              <div className="pt-2 text-[11px] font-mono text-amber-300 font-bold flex items-center justify-between border-t border-purple-900/50">
                <span>Beneficio:</span>
                <span className="text-emerald-400">Hasta -25% Ahorro</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Vixy Section */}
        <section className="mt-16 sm:mt-20 p-6 sm:p-8 bg-zinc-950/90 border border-purple-900/50 rounded-3xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-white">Pago Móvil y Múltiples Métodos</h4>
                <p className="text-xs text-zinc-400">
                  Paga al instante en Bolívares a la tasa oficial del BCV o en divisas por Zelle, Binance Pay y Efectivo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-white">Conductores 100% Verificados</h4>
                <p className="text-xs text-zinc-400">
                  Revisión exhaustiva de Cédula, Licencia de Conducir, Certificado Médico y RCV antes de aceptar cada conductor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-fuchsia-600/20 text-fuchsia-400 rounded-2xl border border-fuchsia-500/30 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-white">Rastreo Satelital en Vivo</h4>
                <p className="text-xs text-zinc-400">
                  Monitoreo GPS en tiempo real de cada recorrido y botón SOS de pánico con alerta inmediata a la central de despacho.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-zinc-950/90 py-8 px-4 sm:px-8 mt-12 relative z-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm">VIXY VENEZUELA</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} Todos los derechos reservados</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => setDownloadModal('driver')}
              className="text-zinc-400 hover:text-purple-300 transition"
            >
              App Conductor
            </button>
            <button
              onClick={() => setDownloadModal('passenger')}
              className="text-zinc-400 hover:text-purple-300 transition"
            >
              App Pasajero
            </button>
            <button
              onClick={onOpenAdminLogin}
              className="text-amber-400 hover:text-amber-300 transition font-bold"
            >
              Acceso Administrativo
            </button>
          </div>
        </div>
      </footer>

      {/* --- Download Modal for Passenger / Driver App --- */}
      {downloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-purple-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setDownloadModal(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${downloadModal === 'driver' ? 'bg-purple-600 text-white' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'}`}>
                {downloadModal === 'driver' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono block">
                  {downloadModal === 'driver' ? 'Para Conductores y Repartidores' : 'Para Pasajeros y Clientes'}
                </span>
                <h3 className="text-xl font-black text-white">
                  {downloadModal === 'driver' ? 'Descargar Vixy Conductor' : 'Descargar Vixy Pasajero'}
                </h3>
              </div>
            </div>

            {/* QR Code & Direct APK Box */}
            <div className="p-4 bg-black/60 border border-purple-900/60 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              {/* QR Code Visual representation */}
              <div className="p-3 bg-white rounded-2xl shrink-0 flex flex-col items-center justify-center shadow-lg">
                <QrCode className="w-24 h-24 text-black" />
                <span className="text-[9px] font-extrabold text-purple-900 mt-1 font-mono">ESCANEAR CON TU MÓVIL</span>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-xs font-extrabold text-white">
                  Descarga Rápida en tu Celular
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Apunta la cámara de tu teléfono al código QR o presiona el botón para descargar el instalador oficial APK.
                </p>
                <div className="text-[10px] text-purple-300 font-mono">
                  Versión: v2.5.0 • Compatible con Android 8.0+ / iOS
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() =>
                  handleSimulateDownload(
                    downloadModal === 'driver' ? 'Vixy Conductor' : 'Vixy Pasajero',
                    downloadModal === 'driver' ? 'vixy-conductor-v2.5.apk' : 'vixy-pasajero-v2.5.apk'
                  )
                }
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
              >
                <Download className="w-4 h-4" />
                <span>
                  Descargar APK Directo ({downloadModal === 'driver' ? 'Conductor' : 'Pasajero'})
                </span>
              </button>

              <button
                onClick={() =>
                  handleSimulateDownload('Play Store', 'Accediendo a Google Play Store...')
                }
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-zinc-700"
              >
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>Disponible en Google Play Store</span>
              </button>
            </div>

            {/* Requirements or instructions */}
            <div className="text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-3 space-y-1">
              <p className="font-bold text-zinc-300">
                {downloadModal === 'driver' ? 'Requisitos para conducir:' : 'Ventajas para el usuario:'}
              </p>
              {downloadModal === 'driver' ? (
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                  <li>Cédula de Identidad venezolana vigente</li>
                  <li>Licencia de conducir de 3er o 5to grado</li>
                  <li>Certificado médico y RCV vigente</li>
                  <li>Vehículo propio (Carro o Moto) en buen estado</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                  <li>Solicitud de viajes en segundos con GPS satelital</li>
                  <li>Tarifas justas oficiales a tasa BCV en tiempo real</li>
                  <li>Pagos directos por Pago Móvil, Efectivo y Zelle</li>
                  <li>Botón SOS de asistencia inmediata 24/7</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-purple-900 text-white rounded-2xl border border-purple-400 shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{downloadSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
