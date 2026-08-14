import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Send,
  MessageSquare,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Building,
  Clock,
  ShieldAlert,
  Users,
  Headphones,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { INITIAL_CONTACT_SOCIAL } from '../data/mockData';
import { ContactAndSocialConfig } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { config } = useAdmin();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const contact: ContactAndSocialConfig = {
    ...INITIAL_CONTACT_SOCIAL,
    ...(config.contactSocial || {}),
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanWhatsAppNumber = (num: string) => {
    return num.replace(/[^0-9]/g, '');
  };

  const getWhatsAppLink = (num: string, message?: string) => {
    const clean = cleanWhatsAppNumber(num);
    const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${clean}${textParam}`;
  };

  const getTelegramLink = (userOrLink: string) => {
    if (userOrLink.startsWith('http://') || userOrLink.startsWith('https://')) {
      return userOrLink;
    }
    const clean = userOrLink.replace(/^@/, '');
    return `https://t.me/${clean}`;
  };

  const getTikTokLink = (userOrLink: string) => {
    if (userOrLink.startsWith('http://') || userOrLink.startsWith('https://')) {
      return userOrLink;
    }
    const clean = userOrLink.startsWith('@') ? userOrLink : `@${userOrLink}`;
    return `https://tiktok.com/${clean}`;
  };

  const getInstagramLink = (userOrLink: string) => {
    if (userOrLink.startsWith('http://') || userOrLink.startsWith('https://')) {
      return userOrLink;
    }
    const clean = userOrLink.replace(/^@/, '');
    return `https://instagram.com/${clean}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-purple-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/40 border border-purple-400/30 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
                Atención al Cliente & Contacto Oficial
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Canales de Contacto Vixy</h3>
          </div>
        </div>

        {/* Quick Highlights / Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-zinc-900/90 rounded-2xl border border-purple-900/50 flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block">Horario de Guardia</span>
              <span className="text-zinc-200 font-semibold">{contact.supportHours || 'Atención 24 Horas / 7 Días'}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-900/90 rounded-2xl border border-purple-900/50 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block">Cobertura</span>
              <span className="text-zinc-200 font-semibold">{contact.coverageText || '24 Estados de Venezuela'}</span>
            </div>
          </div>
        </div>

        {/* 1. Direct Messaging Channels (WhatsApp & Telegram) */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Mensajería Instantánea & Chats Oficiales</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Card */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/30">
                    💬
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">WhatsApp Oficial</h5>
                    <p className="text-[11px] text-emerald-300 font-mono">{contact.whatsappNumber}</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Chatea con nuestro equipo de atención y soporte para consultas inmediatas sobre viajes y recargas.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={getWhatsAppLink(contact.whatsappNumber, contact.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40"
                >
                  <span>Abrir WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleCopy(contact.whatsappNumber, 'wa')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-emerald-500/30 transition"
                  title="Copiar Número de WhatsApp"
                >
                  {copiedKey === 'wa' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Telegram Card */}
            <div className="p-4 bg-sky-950/40 border border-sky-500/40 rounded-2xl space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black border border-sky-500/30">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">Telegram Oficial</h5>
                    <p className="text-[11px] text-sky-300 font-mono">{contact.telegramUserOrLink}</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Canal de anuncios, soporte oficial y comunidad de conductores activos en Venezuela.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={getTelegramLink(contact.telegramUserOrLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-900/40"
                >
                  <span>Abrir Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleCopy(contact.telegramUserOrLink, 'tg')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-sky-500/30 transition"
                  title="Copiar Usuario de Telegram"
                >
                  {copiedKey === 'tg' ? <Check className="w-4 h-4 text-sky-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Redes Sociales Oficiales */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-purple-400" />
            <span>Redes Sociales Oficiales</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* TikTok */}
            <a
              href={getTikTokLink(contact.tiktokUrlOrUser)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-purple-500 rounded-2xl flex items-center gap-3 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs border border-zinc-700 group-hover:scale-105 transition-transform">
                TT
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">TikTok</span>
                <span className="text-xs font-extrabold text-white truncate block group-hover:text-purple-300">
                  {contact.tiktokUrlOrUser}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400" />
            </a>

            {/* Instagram */}
            <a
              href={getInstagramLink(contact.instagramUrlOrUser)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-pink-500 rounded-2xl flex items-center gap-3 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black text-xs border border-pink-500/30 group-hover:scale-105 transition-transform">
                IG
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Instagram</span>
                <span className="text-xs font-extrabold text-white truncate block group-hover:text-pink-300">
                  {contact.instagramUrlOrUser}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-400" />
            </a>

            {/* Facebook */}
            <a
              href={
                contact.facebookUrlOrPage.startsWith('http')
                  ? contact.facebookUrlOrPage
                  : `https://facebook.com/${contact.facebookUrlOrPage}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-blue-500 rounded-2xl flex items-center gap-3 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs border border-blue-500/30 group-hover:scale-105 transition-transform">
                FB
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Facebook</span>
                <span className="text-xs font-extrabold text-white truncate block group-hover:text-blue-300">
                  Vixy Venezuela
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400" />
            </a>
          </div>
        </div>

        {/* 3. Central Telefónica y Soporte por Voz */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-purple-400" />
            <span>Líneas Telefónicas de Atención Directa</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Central */}
            <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-blue-400" /> Despacho Central:
                </span>
                <button
                  onClick={() => handleCopy(contact.dispatchPhone, 'dispatch')}
                  className="text-[10px] text-zinc-400 hover:text-white"
                  title="Copiar"
                >
                  {copiedKey === 'dispatch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="font-mono font-bold text-white text-xs">{contact.dispatchPhone}</p>
            </div>

            {/* SOS 24/7 */}
            <div className="p-3 bg-rose-950/30 rounded-2xl border border-rose-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-300 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Línea SOS 24/7:
                </span>
                <button
                  onClick={() => handleCopy(contact.emergencyPhone, 'sos')}
                  className="text-[10px] text-rose-300 hover:text-white"
                  title="Copiar"
                >
                  {copiedKey === 'sos' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="font-mono font-bold text-rose-200 text-xs">{contact.emergencyPhone}</p>
            </div>

            {/* Conductor */}
            <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Flota & Conductores:
                </span>
                <button
                  onClick={() => handleCopy(contact.driverSupportPhone, 'driver')}
                  className="text-[10px] text-zinc-400 hover:text-white"
                  title="Copiar"
                >
                  {copiedKey === 'driver' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="font-mono font-bold text-white text-xs">{contact.driverSupportPhone}</p>
            </div>
          </div>
        </div>

        {/* 4. Correos Oficiales y Dirección */}
        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
            <span className="text-zinc-400 flex items-center gap-1.5 font-bold">
              <Mail className="w-4 h-4 text-purple-400" /> Correo de Soporte:
            </span>
            <div className="flex items-center gap-2">
              <a href={`mailto:${contact.supportEmail}`} className="font-mono text-purple-300 hover:underline">
                {contact.supportEmail}
              </a>
              <button
                onClick={() => handleCopy(contact.supportEmail, 'email')}
                className="text-zinc-400 hover:text-white p-1"
                title="Copiar correo"
              >
                {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {contact.officeAddress && (
            <div className="flex items-start gap-2 pt-1 text-[11px] text-zinc-400">
              <Building className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <span>{contact.officeAddress}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
