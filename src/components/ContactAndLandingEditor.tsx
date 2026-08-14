import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Send,
  MessageSquare,
  Share2,
  Globe,
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Headphones,
  Users,
  Building,
  Clock,
  Sparkles,
  MapPin,
  Flame,
  Radio,
  Copy,
  Check,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ContactAndSocialConfig } from '../types';
import { INITIAL_CONTACT_SOCIAL } from '../data/mockData';

export const ContactAndLandingEditor: React.FC = () => {
  const { config, updateConfig, addAuditLog, showToast } = useAdmin();

  const currentContact: ContactAndSocialConfig = {
    ...INITIAL_CONTACT_SOCIAL,
    ...(config.contactSocial || {}),
  };

  const [formData, setFormData] = useState<ContactAndSocialConfig>(currentContact);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleChange = (field: keyof ContactAndSocialConfig, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateConfig({
      contactSocial: formData,
    });

    addAuditLog(
      'Configuración de Contacto y Redes',
      'Configuración & Web',
      `Se actualizaron los canales de contacto (WhatsApp: ${formData.whatsappNumber}, Telegram: ${formData.telegramUserOrLink}, Redes y Números de Página Principal)`
    );

    showToast('Canales de contacto, redes sociales y números actualizados con éxito', 'success');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-2xl border border-indigo-500/40 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-extrabold uppercase tracking-wider border border-blue-400/30">
                Página Principal & Soporte
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-300 font-mono">Sincronización en Vivo</span>
            </div>
            <h3 className="text-base font-black tracking-tight">
              Canales de Contacto, Redes Sociales y Números de la Página Principal
            </h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed max-w-3xl">
              Configura los números de atención telefónica, enlace directo de WhatsApp con mensaje personalizado,
              usuarios de Telegram, correos y enlaces a TikTok, Instagram y Facebook que se muestran a los usuarios en la pantalla de bienvenida y en el modal de contacto.
            </p>
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Todos los Cambios</span>
          </button>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: MENSAJERÍA DIRECTA (WHATSAPP & TELEGRAM) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Mensajería Directa & Chats Oficiales</h4>
              <p className="text-[11px] text-slate-500">WhatsApp Oficial y Comunidad / Soporte en Telegram</p>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div className="space-y-3 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <span className="text-base">📱</span> WhatsApp de Atención & Soporte:
              </span>
              <a
                href={getWhatsAppLink(formData.whatsappNumber, formData.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 transition"
                title="Probar enlace de WhatsApp"
              >
                <span>Probar Enlace</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Número Telefónico de WhatsApp (con código de país ej. +58):
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="+58 412 555-0199"
                className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Mensaje Predeterminado al Iniciar Chat (Texto automático de bienvenida):
              </label>
              <textarea
                rows={2}
                value={formData.whatsappMessage || ''}
                onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                placeholder="¡Hola Vixy Venezuela! Deseo solicitar información sobre la aplicación y atención al cliente."
                className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs resize-none"
              />
            </div>
          </div>

          {/* Telegram Settings */}
          <div className="space-y-3 p-3.5 bg-sky-50/50 rounded-xl border border-sky-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-sky-600" /> Telegram Oficial:
              </span>
              <a
                href={getTelegramLink(formData.telegramUserOrLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-sky-700 hover:text-sky-900 bg-white px-2 py-0.5 rounded border border-sky-200 flex items-center gap-1 transition"
                title="Probar enlace de Telegram"
              >
                <span>Probar Telegram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Usuario o Enlace de Soporte en Telegram (@usuario o https://t.me/...):
              </label>
              <input
                type="text"
                value={formData.telegramUserOrLink}
                onChange={(e) => handleChange('telegramUserOrLink', e.target.value)}
                placeholder="@VixyVenezuela o https://t.me/VixyVenezuela"
                className="w-full p-2.5 bg-white border border-sky-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Canal Oficial de Telegram / Grupo de Conductores (Opcional):
              </label>
              <input
                type="text"
                value={formData.telegramChannelOrGroup || ''}
                onChange={(e) => handleChange('telegramChannelOrGroup', e.target.value)}
                placeholder="https://t.me/VixyConductoresOficial"
                className="w-full p-2.5 bg-white border border-sky-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500 shadow-xs"
              />
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-purple-600" /> Correos Electrónicos Oficiales:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Correo de Soporte y Reclamos:
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  placeholder="soporte@vhixy.site"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Correo Corporativo / Alianzas:
                </label>
                <input
                  type="email"
                  value={formData.corporateEmail || ''}
                  onChange={(e) => handleChange('corporateEmail', e.target.value)}
                  placeholder="contacto@vhixy.site"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: REDES SOCIALES OFICIALES */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Redes Sociales Oficiales</h4>
              <p className="text-[11px] text-slate-500">TikTok, Instagram, Facebook, YouTube y X (Twitter)</p>
            </div>
          </div>

          {/* TikTok */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-black">
                  TT
                </span>
                TikTok (@usuario o enlace):
              </label>
              {formData.tiktokUrlOrUser && (
                <a
                  href={getTikTokLink(formData.tiktokUrlOrUser)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-purple-600 hover:text-purple-800 flex items-center gap-0.5 font-bold"
                >
                  <span>Ver Perfil</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={formData.tiktokUrlOrUser}
              onChange={(e) => handleChange('tiktokUrlOrUser', e.target.value)}
              placeholder="@vixy_venezuela o https://tiktok.com/@vixy_venezuela"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
              required
            />
          </div>

          {/* Instagram */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black">
                  IG
                </span>
                Instagram (@usuario o enlace):
              </label>
              {formData.instagramUrlOrUser && (
                <a
                  href={getInstagramLink(formData.instagramUrlOrUser)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-pink-600 hover:text-pink-800 flex items-center gap-0.5 font-bold"
                >
                  <span>Ver Perfil</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={formData.instagramUrlOrUser}
              onChange={(e) => handleChange('instagramUrlOrUser', e.target.value)}
              placeholder="@vixy_venezuela o https://instagram.com/vixy_venezuela"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
              required
            />
          </div>

          {/* Facebook */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                  FB
                </span>
                Facebook (Enlace de Página Oficial):
              </label>
              {formData.facebookUrlOrPage && (
                <a
                  href={
                    formData.facebookUrlOrPage.startsWith('http')
                      ? formData.facebookUrlOrPage
                      : `https://facebook.com/${formData.facebookUrlOrPage}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-bold"
                >
                  <span>Ver Página</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={formData.facebookUrlOrPage}
              onChange={(e) => handleChange('facebookUrlOrPage', e.target.value)}
              placeholder="https://facebook.com/vixyvenezuela"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
              required
            />
          </div>

          {/* YouTube */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-black">
                YT
              </span>
              Canal de YouTube (Tutoriales y Guías):
            </label>
            <input
              type="text"
              value={formData.youtubeUrl || ''}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/@vixyvenezuela"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>

          {/* X / Twitter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black">
                X
              </span>
              X / Twitter (@usuario o enlace):
            </label>
            <input
              type="text"
              value={formData.xTwitterUrl || ''}
              onChange={(e) => handleChange('xTwitterUrl', e.target.value)}
              placeholder="@vixy_vzla o https://x.com/vixy_vzla"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>
        </div>

        {/* SECTION 3: NÚMEROS TELEFÓNICOS DE LA PÁGINA PRINCIPAL */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                Números Telefónicos de la Página Principal & Central de Despacho
              </h4>
              <p className="text-[11px] text-slate-500">
                Líneas telefónicas de atención directa, botón SOS 24/7 y soporte al conductor para llamadas de voz.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Central de Despacho */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-blue-600" />
                Central de Despacho y Pedidos:
              </label>
              <input
                type="text"
                value={formData.dispatchPhone}
                onChange={(e) => handleChange('dispatchPhone', e.target.value)}
                placeholder="0800-VIXY-00 (0800-8499-00)"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                required
              />
              <p className="text-[10px] text-slate-500">Visible en el encabezado y pie de página</p>
            </div>

            {/* 2. Línea de Emergencia SOS */}
            <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
              <label className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Línea de Emergencia SOS 24/7:
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                placeholder="0800-VIXY-SOS / (0212) 999-9000"
                className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs font-mono font-bold text-rose-900 focus:outline-none focus:border-rose-500 shadow-xs"
                required
              />
              <p className="text-[10px] text-rose-700/80">Línea de guardia permanente ante incidentes</p>
            </div>

            {/* 3. Atención al Conductor */}
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
              <label className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                Atención al Conductor y Registro:
              </label>
              <input
                type="text"
                value={formData.driverSupportPhone}
                onChange={(e) => handleChange('driverSupportPhone', e.target.value)}
                placeholder="+58 424-5551234"
                className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-500 shadow-xs"
                required
              />
              <p className="text-[10px] text-purple-700/80">Soporte exclusivo para flota y verificaciones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Dirección de Oficina */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-600" />
                Dirección Física / Sede Principal en Venezuela:
              </label>
              <input
                type="text"
                value={formData.officeAddress || ''}
                onChange={(e) => handleChange('officeAddress', e.target.value)}
                placeholder="Av. Francisco de Miranda, Centro Empresarial Chacao, Torre Vixy, Caracas - Venezuela"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Horario de Atención */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                Horario de Atención y Despacho:
              </label>
              <input
                type="text"
                value={formData.supportHours || ''}
                onChange={(e) => handleChange('supportHours', e.target.value)}
                placeholder="Atención 24 Horas / 7 Días a la semana (365 días)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Estadísticas de la Página Principal */}
          <div className="pt-3 border-t border-slate-100">
            <h5 className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Métricas y Contadores Mostrados en la Página Principal:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Texto de Cobertura Nacional:
                </label>
                <input
                  type="text"
                  value={formData.coverageText || ''}
                  onChange={(e) => handleChange('coverageText', e.target.value)}
                  placeholder="24 Estados de Venezuela"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Conductores Activos Estimados:
                </label>
                <input
                  type="text"
                  value={formData.activeDriversCount || ''}
                  onChange={(e) => handleChange('activeDriversCount', e.target.value)}
                  placeholder="+15,000 Conductores"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Viajes Satisfechos Realizados:
                </label>
                <input
                  type="text"
                  value={formData.satisfiedTripsCount || ''}
                  onChange={(e) => handleChange('satisfiedTripsCount', e.target.value)}
                  placeholder="+250,000 Viajes"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Configuración de Contacto, Redes y Página Principal</span>
        </button>
      </div>
    </form>
  );
};
