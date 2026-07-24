import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Car,
  Filter,
  Phone,
  ShieldAlert,
  Search,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { DriverCategory } from '../types';

export const MapView: React.FC = () => {
  const { drivers, emergencies, config, setActiveTab } = useAdmin();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<'todos' | DriverCategory>('todos');
  const [showEmergenciesOnly, setShowEmergenciesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Caracas Center Coordinates [10.48801, -66.87919]
      const map = L.map(mapContainerRef.current, {
        center: [10.48801, -66.87919],
        zoom: 13,
        zoomControl: true,
      });

      // Dark Mode Map Tiles from OpenStreetMap / CartoDB Dark Matter
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // ResizeObserver for clean map rendering inside tabs
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update Markers when drivers/emergencies/filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // 1. Render Active Emergencies if any
    const activeEmergencies = emergencies.filter((e) => e.status !== 'resuelto');
    activeEmergencies.forEach((emg) => {
      const emergencyIcon = L.divIcon({
        className: 'custom-emergency-icon',
        html: `
          <div class="relative flex items-center justify-center w-9 h-9 bg-rose-600 text-white rounded-full font-black border-2 border-white shadow-xl animate-bounce">
            🚨
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping"></span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const emgMarker = L.marker([emg.lat, emg.lng], { icon: emergencyIcon });
      emgMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
          <div style="background-color: #be123c; color: white; padding: 4px 8px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 6px;">
            🚨 EMERGENCIA: ${emg.type.toUpperCase()}
          </div>
          <strong>Reportante:</strong> ${emg.reporterName}<br/>
          <strong>Teléfono:</strong> ${emg.reporterPhone}<br/>
          <strong>Ubicación:</strong> ${emg.locationName}<br/>
          <strong>Vehículo:</strong> ${emg.vehicleInfo || 'N/A'}
        </div>
      `);
      markersGroupRef.current?.addLayer(emgMarker);
    });

    if (showEmergenciesOnly) return;

    // 2. Render Driver Markers
    const activeDrivers = drivers.filter((d) => d.status === 'activo');
    activeDrivers.forEach((driver) => {
      // Category filter check
      if (categoryFilter !== 'todos' && driver.category !== categoryFilter) return;

      // Search filter check
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        if (
          !driver.name.toLowerCase().includes(q) &&
          !driver.documents.plateNumber.toLowerCase().includes(q) &&
          !driver.documents.vehicleModel.toLowerCase().includes(q)
        ) {
          return;
        }
      }

      const isNegative = driver.balanceUSD <= config.negativeBalanceThreshold;

      const colors = {
        taxi: { bg: 'bg-amber-500', text: '🚖' },
        mototaxi: { bg: 'bg-cyan-500', text: '🏍️' },
        delivery: { bg: 'bg-emerald-500', text: '📦' },
      };

      const iconHtml = `
        <div class="relative flex items-center justify-center w-8 h-8 ${
          isNegative ? 'bg-rose-600 border-rose-300' : colors[driver.category].bg + ' border-slate-900'
        } text-slate-950 rounded-full font-bold border-2 shadow-lg transition-transform hover:scale-125">
          <span class="text-xs">${colors[driver.category].text}</span>
          ${isNegative ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full border border-white"></span>' : ''}
        </div>
      `;

      const driverIcon = L.divIcon({
        className: 'custom-driver-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([driver.lat, driver.lng], { icon: driverIcon });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; pb: 4px; margin-bottom: 4px;">
            ${driver.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
            <strong>Categoría:</strong> ${driver.category.toUpperCase()}<br/>
            <strong>Vehículo:</strong> ${driver.documents.vehicleModel}<br/>
            <strong>Placa:</strong> ${driver.documents.plateNumber}<br/>
            <strong>Teléfono:</strong> ${driver.phone}<br/>
            <strong>Saldo:</strong> <span style="color: ${driver.balanceUSD < 0 ? '#e11d48' : '#059669'}; font-weight: bold;">$${driver.balanceUSD.toFixed(2)} USD</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersGroupRef.current?.addLayer(marker);
    });
  }, [drivers, emergencies, categoryFilter, showEmergenciesOnly, searchQuery, config]);

  return (
    <div className="space-y-4">
      {/* Top Map Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-extrabold text-slate-900">
            Monitoreo e Inspección de Flota en Vivo
          </h2>
        </div>

        {/* Filter Category buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => {
              setShowEmergenciesOnly(false);
              setCategoryFilter('todos');
            }}
            className={`px-3 py-1.5 rounded-xl border font-bold transition ${
              !showEmergenciesOnly && categoryFilter === 'todos'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({drivers.filter((d) => d.status === 'activo').length})
          </button>

          <button
            onClick={() => {
              setShowEmergenciesOnly(false);
              setCategoryFilter('taxi');
            }}
            className={`px-3 py-1.5 rounded-xl border font-bold transition ${
              !showEmergenciesOnly && categoryFilter === 'taxi'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            🚖 Taxis
          </button>

          <button
            onClick={() => {
              setShowEmergenciesOnly(false);
              setCategoryFilter('mototaxi');
            }}
            className={`px-3 py-1.5 rounded-xl border font-bold transition ${
              !showEmergenciesOnly && categoryFilter === 'mototaxi'
                ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            🏍️ Moto Taxis
          </button>

          <button
            onClick={() => {
              setShowEmergenciesOnly(false);
              setCategoryFilter('delivery');
            }}
            className={`px-3 py-1.5 rounded-xl border font-bold transition ${
              !showEmergenciesOnly && categoryFilter === 'delivery'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            📦 Delivery
          </button>

          <button
            onClick={() => setShowEmergenciesOnly(!showEmergenciesOnly)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1 ${
              showEmergenciesOnly
                ? 'bg-red-600 text-white border-red-600 animate-pulse'
                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
            }`}
          >
            🚨 Emergencias ({emergencies.filter((e) => e.status !== 'resuelto').length})
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[600px] rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Box Overlay */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700 shadow-lg">
          <p className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider mb-1">
            Leyenda de Conductores
          </p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>Conductor Taxi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
            <span>Conductor Moto Taxi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Repartidor Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block border border-white"></span>
            <span className="text-red-700 font-bold">Saldo Negativo / SOS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
