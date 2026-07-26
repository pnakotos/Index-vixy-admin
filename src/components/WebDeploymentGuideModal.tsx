import React, { useState } from 'react';
import {
  Globe,
  Server,
  Terminal,
  FileCode,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Folder,
  Download,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const WebDeploymentGuideModal: React.FC = () => {
  const { isWebGuideModalOpen, setIsWebGuideModalOpen } = useAdmin();
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeHostTab, setActiveHostTab] = useState<'cpanel' | 'nginx' | 'vercel' | 'netlify'>('cpanel');

  if (!isWebGuideModalOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;

  const nginxContent = `server {
    listen 80;
    server_name vhixy.site www.vhixy.site;
    root /var/www/vixy-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}`;

  const vercelContent = `{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const netlifyContent = `/*    /index.html   200`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-600/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Guía de Montaje e Implementación Web (Hosting & Servidor)
              </h3>
              <p className="text-xs text-purple-300">
                Instrucciones para desplegar en CPanel, Hostinger, Nginx, Vercel o Netlify
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWebGuideModalOpen(false)}
            className="text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-purple-900/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Build Step Banner */}
        <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-700/80 space-y-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Terminal className="w-4 h-4 text-purple-400" />
            Paso 1: Generar Archivos Web para Producción
          </div>
          <p className="text-xs text-purple-200">
            Ejecuta el siguiente comando en la terminal de desarrollo para compilar la aplicación React en código HTML, JS y CSS optimizado dentro de la carpeta <code className="bg-black px-1.5 py-0.5 rounded text-purple-300 font-mono">dist/</code>:
          </p>

          <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-purple-900/60 font-mono text-xs text-purple-300">
            <span>npm run build</span>
            <button
              onClick={() => copyToClipboard('npm run build', 'cmd-build')}
              className="text-xs text-purple-400 hover:text-white flex items-center gap-1 font-sans"
            >
              {copiedIndex === 'cmd-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'cmd-build' ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection for Hosting Provider */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-purple-900/40 pb-2">
            <button
              onClick={() => setActiveHostTab('cpanel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeHostTab === 'cpanel'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
              }`}
            >
              🌐 cPanel / Hostinger / Apache (.htaccess)
            </button>
            <button
              onClick={() => setActiveHostTab('nginx')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeHostTab === 'nginx'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
              }`}
            >
              🖥️ Servidor VPS Nginx
            </button>
            <button
              onClick={() => setActiveHostTab('vercel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeHostTab === 'vercel'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
              }`}
            >
              ▲ Vercel Hosting
            </button>
            <button
              onClick={() => setActiveHostTab('netlify')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeHostTab === 'netlify'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/30'
              }`}
            >
              💎 Netlify Hosting
            </button>
          </div>

          {/* cPanel Content */}
          {activeHostTab === 'cpanel' && (
            <div className="space-y-3 bg-zinc-900 p-4 rounded-2xl border border-purple-900/40 text-xs text-zinc-300">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                Despliegue en cPanel / Hostinger (Hosting Compartido)
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                <li>Ejecuta <code className="bg-black px-1.5 py-0.5 rounded text-purple-300 font-mono">npm run build</code> en tu máquina local o repositorio.</li>
                <li>Sube todo el contenido de la carpeta <strong className="text-white">dist/</strong> a la carpeta <strong className="text-white">public_html/</strong> de tu hosting.</li>
                <li>Crea un archivo llamado <strong className="text-purple-300 font-mono">.htaccess</strong> en la misma carpeta raíz con el siguiente contenido para evitar errores de recarga SPA:</li>
              </ol>

              <div className="relative mt-2">
                <pre className="p-3 bg-black rounded-xl border border-purple-900/60 font-mono text-[11px] text-purple-300 overflow-x-auto">
                  {htaccessContent}
                </pre>
                <button
                  onClick={() => copyToClipboard(htaccessContent, 'htaccess')}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] text-white flex items-center gap-1 border border-purple-900/40"
                >
                  {copiedIndex === 'htaccess' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 'htaccess' ? 'Copiado' : 'Copiar .htaccess'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Nginx Content */}
          {activeHostTab === 'nginx' && (
            <div className="space-y-3 bg-zinc-900 p-4 rounded-2xl border border-purple-900/40 text-xs text-zinc-300">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                Despliegue en Servidor Nginx (Ubuntu / Debian VPS)
              </h4>
              <p>Agrega la siguiente directiva en tu archivo de sitio de Nginx (<code className="bg-black px-1 py-0.5 rounded text-purple-300 font-mono">/etc/nginx/sites-available/default</code>):</p>

              <div className="relative mt-2">
                <pre className="p-3 bg-black rounded-xl border border-purple-900/60 font-mono text-[11px] text-purple-300 overflow-x-auto">
                  {nginxContent}
                </pre>
                <button
                  onClick={() => copyToClipboard(nginxContent, 'nginx')}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] text-white flex items-center gap-1 border border-purple-900/40"
                >
                  {copiedIndex === 'nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 'nginx' ? 'Copiado' : 'Copiar Config Nginx'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Vercel Content */}
          {activeHostTab === 'vercel' && (
            <div className="space-y-3 bg-zinc-900 p-4 rounded-2xl border border-purple-900/40 text-xs text-zinc-300">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Despliegue en Vercel
              </h4>
              <p>El proyecto incluye el archivo <code className="bg-black px-1 py-0.5 rounded text-purple-300 font-mono">vercel.json</code> configurado para redirecciones SPA:</p>

              <div className="relative mt-2">
                <pre className="p-3 bg-black rounded-xl border border-purple-900/60 font-mono text-[11px] text-purple-300 overflow-x-auto">
                  {vercelContent}
                </pre>
                <button
                  onClick={() => copyToClipboard(vercelContent, 'vercel')}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] text-white flex items-center gap-1 border border-purple-900/40"
                >
                  {copiedIndex === 'vercel' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 'vercel' ? 'Copiado' : 'Copiar vercel.json'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Netlify Content */}
          {activeHostTab === 'netlify' && (
            <div className="space-y-3 bg-zinc-900 p-4 rounded-2xl border border-purple-900/40 text-xs text-zinc-300">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Despliegue en Netlify
              </h4>
              <p>El proyecto incluye el archivo <code className="bg-black px-1 py-0.5 rounded text-purple-300 font-mono">public/_redirects</code>:</p>

              <div className="relative mt-2">
                <pre className="p-3 bg-black rounded-xl border border-purple-900/60 font-mono text-[11px] text-purple-300 overflow-x-auto">
                  {netlifyContent}
                </pre>
                <button
                  onClick={() => copyToClipboard(netlifyContent, 'netlify')}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] text-white flex items-center gap-1 border border-purple-900/40"
                >
                  {copiedIndex === 'netlify' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 'netlify' ? 'Copiado' : 'Copiar _redirects'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Superuser Root Summary */}
        <div className="p-4 rounded-2xl bg-black border border-purple-900/50 space-y-2 text-xs">
          <p className="font-extrabold text-purple-300 uppercase tracking-wider">
            🔐 Acceso Súperusuario Root Configurado:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 font-mono text-[11px]">
            <div>• Usuario Root: <span className="text-white font-bold">root</span></div>
            <div>• Clave Inicial: <span className="text-purple-300 font-bold">123456</span></div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Al realizar el primer ingreso con esta clave en la web desplegada, la interfaz forzará automáticamente al usuario a establecer una nueva contraseña permanente.
          </p>
        </div>

        <button
          onClick={() => setIsWebGuideModalOpen(false)}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
