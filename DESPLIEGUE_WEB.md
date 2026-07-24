# Manual de Implementación Web y Despliegue - Vixy Administrativo

Este documento contiene las instrucciones paso a paso para compilar y desplegar la aplicación web **Vixy Administrativo** en cualquier servidor web o servicio de hosting (cPanel, Hostinger, Nginx, Vercel, Netlify, Apache, Firebase Hosting, etc.).

---

## 🔐 1. Credenciales de Acceso Súperusuario Root

El sistema cuenta con un usuario genérico **Root** de máximo nivel administrativo:

- **Usuario / Correo**: `root` o `root@vixytaxi.com`
- **Contraseña Inicial de Fábrica**: `123456`
- **Obligatoriedad de Cambio de Clave**: Al iniciar sesión por primera vez con la clave `123456`, la plataforma bloqueará el acceso al panel hasta que el usuario ingrese y confirme su propia contraseña nueva y personalizada.

---

## 🚀 2. Pasos para Compilar la Aplicación Web

### Requisitos Previos
- Node.js versión 18 o superior.
- Gestor de paquetes `npm`.

### Comando de Compilación:
```bash
npm run build
```

Al finalizar, se creará una carpeta llamada `dist/` en la raíz del proyecto. Esta carpeta contiene el bundle compilado de la aplicación Single Page Application (SPA) con todos los archivos HTML, JavaScript, CSS e imágenes necesarios para su ejecución en la web.

---

## 🌐 3. Instrucciones de Carga según el Hosting

### Opción A: Hosting Compartido (cPanel / Hostinger / Apache)
1. Ejecute `npm run build`.
2. Acceda a su panel cPanel o Administrador de Archivos de Hostinger.
3. Copie todos los archivos dentro de la carpeta `dist/` a la carpeta principal `public_html/`.
4. El archivo `.htaccess` ubicado en `public/.htaccess` se habrá copiado automáticamente para asegurar que las rutas internas de la SPA no den error 404 al recargar la página.

### Opción B: Servidor VPS con Nginx (Ubuntu / Debian / CentOS)
1. Suba los archivos de la carpeta `dist/` a `/var/www/vixy-admin/dist/`.
2. En su archivo de configuración de sitio Nginx (`/etc/nginx/sites-available/default`), agregue:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    root /var/www/vixy-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
3. Reinicie Nginx con `sudo systemctl restart nginx`.

### Opción C: Vercel / Netlify / Cloudflare Pages
1. Conecte su repositorio de GitHub o ejecute `vercel` / `netlify deploy`.
2. El proyecto ya incluye `vercel.json` y `_redirects` preconfigurados para SPA.

---

## 🛠️ 4. Tecnologías y Características Integradas
- **Frontend Framework**: React 18 + Vite + TypeScript.
- **Estilos & UI**: Tailwind CSS + Lucide React Icons.
- **Persistencia**: Almacenamiento local persistente (`localStorage`) para datos de conductores, clientes, pagos, logs, usuarios y tasa BCV.
- **Módulos**: Gestión de Taxis, Moto Taxis, Delivery, Desactivación automática por saldo negativo (&le; -$0.50 USD), Simulación de App del Conductor, Notificaciones Push, Tasa BCV y Alertas SOS en tiempo real.
