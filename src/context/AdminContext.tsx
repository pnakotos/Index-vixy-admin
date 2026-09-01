import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Driver,
  Client,
  PaymentRecord,
  EmergencyAlert,
  PushNotification,
  Review,
  AuditLogEntry,
  BackendUser,
  SystemConfig,
  EmergencyStatus,
  EmergencyType,
  BackendUserPermissions,
  AdminRole,
  CompletedService,
  BrandingMedia,
  ApiInterconnectionConfig,
  CustomPaymentMethod,
  StateRatesMap,
  StateServiceFares,
  StateUniversityRatesMap,
  ServiceType,
} from '../types';
import {
  INITIAL_SYSTEM_CONFIG,
  INITIAL_BACKEND_USERS,
  INITIAL_BRANDING_MEDIA,
  INITIAL_API_CONFIG,
  INITIAL_STATE_RATES,
  INITIAL_UNIVERSITY_STATE_RATES,
  INITIAL_CONTACT_SOCIAL,
} from '../data/mockData';
import {
  INITIAL_DRIVERS as PRODUCTION_DRIVERS,
  INITIAL_CLIENTS as PRODUCTION_CLIENTS,
  INITIAL_PAYMENTS as PRODUCTION_PAYMENTS,
  INITIAL_EMERGENCIES as PRODUCTION_EMERGENCIES,
  INITIAL_COMPLETED_SERVICES as PRODUCTION_COMPLETED_SERVICES,
} from '../data/productionDefaults';
import {
  adjustAdminWallet,
  changePasswordAdmin,
  createAdminResource,
  createBackendUserApi,
  deleteAdminResource,
  deleteBackendUserApi,
  fetchAdminRealtime,
  fetchAdminResourceList,
  fetchApiInterconnectionConfig,
  fetchBackendUsers,
  fetchBrandingMediaApi,
  fetchConductorRealtime,
  fetchContactSocialConfig,
  fetchStateRates,
  fetchSystemConfig,
  fetchUniversityRates,
  loginAdmin,
  logoutAdmin,
  updateAdminResource,
  updateApiInterconnectionConfig,
  updateBackendUserApi,
  updateBrandingMediaApi,
  updateContactSocialConfig,
  updateStateRates,
  updateSystemConfig,
  updateUniversityRates,
  verifyAdminPayment,
} from '../utils/adminApi';
import { ApiRequestError } from '../utils/apiClient';

interface AdminContextType {
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  updatePaymentGatewayConfig: (
    gatewayKey: 'pagoMovil' | 'zelle' | 'binancePay' | 'bankTransfer' | 'cashPayment' | 'cardPos',
    data: any,
    enabled?: boolean
  ) => void;
  togglePaymentGateway: (gatewayKey: keyof SystemConfig['gateways']) => void;
  addCustomPaymentMethod: (method: Omit<CustomPaymentMethod, 'id'>) => void;
  updateCustomPaymentMethod: (id: string, methodPartial: Partial<CustomPaymentMethod>) => void;
  deleteCustomPaymentMethod: (id: string) => void;
  
  drivers: Driver[];
  approveDriver: (driverId: string) => void;
  rejectDriver: (driverId: string, reason: string) => void;
  toggleBlockDriver: (driverId: string, reason?: string) => void;
  deleteDriver: (driverId: string) => void;
  updateDriverBalance: (driverId: string, amountUSD: number) => void;
  notifyNegativeBalance: (driverId: string) => void;
  
  clients: Client[];
  toggleBlockClient: (clientId: string, reason?: string) => void;
  deleteClient: (clientId: string) => void;
  updateClientBalance: (clientId: string, amountUSD: number) => void;
  
  payments: PaymentRecord[];
  verifyPayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string, reason: string) => void;
  
  emergencies: EmergencyAlert[];
  updateEmergencyStatus: (emergencyId: string, status: EmergencyStatus, notes?: string) => void;
  
  pushNotifications: PushNotification[];
  sendPushNotification: (notif: Omit<PushNotification, 'id' | 'sentAt' | 'sentBy'>) => void;
  
  reviews: Review[];
  toggleFlagReview: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, module: string, details: string) => void;

  completedServices: CompletedService[];
  
  backendUsers: BackendUser[];
  addBackendUser: (user: Omit<BackendUser, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateBackendUserPermissions: (userId: string, permissions: BackendUserPermissions, role: AdminRole) => void;
  toggleBackendUserActive: (userId: string) => void;
  deleteBackendUser: (userId: string) => void;
  updateBackendUserPassword: (userId: string, newPass: string, expirationDays?: 30 | 90) => void;
  
  currentBackendUser: BackendUser;
  setCurrentBackendUser: (user: BackendUser) => void;
  
  brandingMedia: BrandingMedia;
  updateBrandingMedia: (media: Partial<BrandingMedia>) => void;
  
  apiConfig: ApiInterconnectionConfig;
  updateApiConfig: (configPartial: Partial<ApiInterconnectionConfig>) => void;
  
  // Auth & Root Password Management
  isAuthenticated: boolean;
  rootPassword: string;
  mustChangePassword: boolean;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  isWebGuideModalOpen: boolean;
  setIsWebGuideModalOpen: (open: boolean) => void;
  login: (usernameOrEmail: string, passInput: string) => Promise<{ success: boolean; mustChangePass?: boolean; message?: string }>;
  logout: () => void;
  changeRootPassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;

  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  
  activeTab: string;
  setActiveTab: (tab: string) => void;

  unreadEmergenciesCount: number;
  pendingPaymentsCount: number;
  pendingDriversCount: number;
  negativeBalanceDriversCount: number;
  
  // Notification Toast state
  toastMessage: { text: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

function mapDriver(row: Record<string, unknown>): Driver {
  const category = row.category === 'mototaxi' || row.category === 'delivery' ? row.category : 'taxi';

  return {
    id: String(row.id || ''), name: String(row.name || ''), email: String(row.email || ''),
    phone: String(row.phone || ''), category,
    status: row.status as Driver['status'], balanceUSD: Number(row.balance_usd || 0),
    rating: Number(row.rating || 0), completedTrips: Number(row.completed_trips || 0),
    lat: Number(row.lat || 0), lng: Number(row.lng || 0), locationName: String(row.location_name || ''),
    registeredAt: String(row.registered_at || ''), lastActive: String(row.last_active || ''),
    isOnline: Boolean(Number(row.is_online || 0)), rejectionReason: row.rejection_reason as string | undefined,
    blockReason: row.block_reason as string | undefined,
    documents: {
      cedulaUrl: String(row.doc_cedula_url || ''), cedulaNumber: String(row.doc_cedula_number || ''),
      licenciaUrl: String(row.doc_licencia_url || ''), licenciaNumber: String(row.doc_licencia_number || ''),
      certificadoMedicoUrl: String(row.doc_certificado_medico_url || ''), rcvUrl: String(row.doc_rcv_url || ''),
      fotoVehiculoUrl: String(row.doc_foto_vehiculo_url || ''), plateNumber: String(row.doc_plate_number || ''),
      vehicleModel: String(row.doc_vehicle_model || ''), vehicleYear: String(row.doc_vehicle_year || ''),
      vehicleColor: String(row.doc_vehicle_color || ''),
    },
  };
}

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: String(row.id || ''), name: String(row.name || ''), email: String(row.email || ''),
    phone: String(row.phone || ''), balanceUSD: Number(row.balance_usd || 0),
    totalTrips: Number(row.total_trips || 0), rating: Number(row.rating || 0),
    isBlocked: Boolean(Number(row.is_blocked || 0)), blockReason: row.block_reason as string | undefined,
    registeredAt: String(row.registered_at || ''), avatarUrl: row.avatar_url as string | undefined,
  };
}

function mapPayment(row: Record<string, unknown>): PaymentRecord {
  return {
    id: String(row.id || ''), type: row.type as PaymentRecord['type'], entityId: String(row.entity_id || ''),
    entityName: String(row.entity_name || ''), entityPhone: String(row.entity_phone || ''),
    category: row.category as PaymentRecord['category'], referenceNumber: String(row.reference_number || ''),
    paymentMethod: String(row.payment_method || ''), bankOrigin: row.bank_origin as string | undefined,
    amountVES: Number(row.amount_ves || 0), amountUSD: Number(row.amount_usd || 0),
    bcvRateUsed: Number(row.bcv_rate_used || 0), receiptImageUrl: String(row.receipt_image_url || ''),
    createdAt: String(row.created_at || ''), status: row.status as PaymentRecord['status'],
    verifiedBy: row.verified_by as string | undefined, verifiedAt: row.verified_at as string | undefined,
    notes: row.notes as string | undefined,
  };
}

function mapEmergency(row: Record<string, unknown>): EmergencyAlert {
  return {
    id: String(row.id || ''), type: row.type as EmergencyType, reporterType: row.reporter_type as EmergencyAlert['reporterType'],
    reporterId: String(row.reporter_id || ''), reporterName: String(row.reporter_name || ''),
    reporterPhone: String(row.reporter_phone || ''), category: row.category as EmergencyAlert['category'],
    vehicleInfo: row.vehicle_info as string | undefined, plateNumber: row.plate_number as string | undefined,
    locationName: String(row.location_name || ''), lat: Number(row.lat || 0), lng: Number(row.lng || 0),
    timestamp: String(row.timestamp || ''), status: row.status as EmergencyStatus,
    notes: row.notes as string | undefined, resolvedBy: row.resolved_by as string | undefined,
  };
}

function mapCompletedService(row: Record<string, unknown>): CompletedService {
  return {
    id: String(row.id || ''), date: String(row.service_date || ''), time: String(row.service_time || ''),
    driverId: String(row.driver_id || ''), driverName: String(row.driver_name || ''),
    driverCategory: row.driver_category as CompletedService['driverCategory'], clientId: String(row.client_id || ''),
    clientName: String(row.client_name || ''), clientPhone: String(row.client_phone || ''),
    origin: String(row.origin || ''), destination: String(row.destination || ''), fareUSD: Number(row.fare_usd || 0),
    fareVES: Number(row.fare_ves || 0), commissionPercent: Number(row.commission_percent || 0),
    commissionUSD: Number(row.commission_usd || 0), commissionVES: Number(row.commission_ves || 0),
    driverEarningsUSD: Number(row.driver_earnings_usd || 0), paymentMethod: row.payment_method as CompletedService['paymentMethod'],
    status: 'completado',
  };
}

function mapAdminUser(row: Record<string, unknown>): BackendUser {
  return {
    id: String(row.id || ''), name: String(row.name || ''), username: String(row.username || ''),
    email: String(row.email || ''), role: row.role as AdminRole, avatarUrl: row.avatar_url as string | undefined,
    isActive: Boolean(Number(row.is_active ?? 0)), createdAt: String(row.created_at || ''),
    lastLogin: String(row.last_login || ''), mustChangePassword: Boolean(Number(row.must_change_password ?? 0)),
    passwordExpirationDays: row.password_expiration_days as 30 | 90 | undefined,
    passwordCreatedAt: row.password_created_at as string | undefined,
    permissions: {
      dashboard: Boolean(Number(row.perm_dashboard || 0)), drivers: Boolean(Number(row.perm_drivers || 0)),
      clients: Boolean(Number(row.perm_clients || 0)), payments: Boolean(Number(row.perm_payments || 0)),
      map: Boolean(Number(row.perm_map || 0)), emergencies: Boolean(Number(row.perm_emergencies || 0)),
      financesConfig: Boolean(Number(row.perm_finances_config || 0)), earningsAudit: Boolean(Number(row.perm_earnings_audit || 0)),
      notifications: Boolean(Number(row.perm_notifications || 0)), reviews: Boolean(Number(row.perm_reviews || 0)),
      userManagement: Boolean(Number(row.perm_user_management || 0)), auditLogs: Boolean(Number(row.perm_audit_logs || 0)),
    },
  };
}

// Mapa de pestaña -> permiso requerido, usado para bloquear el acceso sin importar
// desde dónde se intente cambiar de pestaña (Sidebar, Navbar, accesos directos, etc.).
const TAB_PERMISSIONS: Record<string, keyof BackendUserPermissions> = {
  dashboard: 'dashboard',
  drivers: 'drivers',
  drivers_negative: 'drivers',
  clients: 'clients',
  payments: 'payments',
  map: 'map',
  emergencies: 'emergencies',
  financesConfig: 'financesConfig',
  earningsAudit: 'earningsAudit',
  notifications: 'notifications',
  reviews: 'reviews',
  userManagement: 'userManagement',
  auditLogs: 'auditLogs',
};

function permissionsToFields(permissions: BackendUserPermissions): Record<string, number> {
  return {
    perm_dashboard: permissions.dashboard ? 1 : 0,
    perm_drivers: permissions.drivers ? 1 : 0,
    perm_clients: permissions.clients ? 1 : 0,
    perm_payments: permissions.payments ? 1 : 0,
    perm_map: permissions.map ? 1 : 0,
    perm_emergencies: permissions.emergencies ? 1 : 0,
    perm_finances_config: permissions.financesConfig ? 1 : 0,
    perm_earnings_audit: permissions.earningsAudit ? 1 : 0,
    perm_notifications: permissions.notifications ? 1 : 0,
    perm_reviews: permissions.reviews ? 1 : 0,
    perm_user_management: permissions.userManagement ? 1 : 0,
    perm_audit_logs: permissions.auditLogs ? 1 : 0,
  };
}

// Solo estos campos existen en la tabla `system_config`; el resto (tarifas por estado,
// métodos de pago adicionales, contacto/redes) permanece únicamente en el navegador.
function mapSystemConfigFromDb(row: Record<string, unknown>, prev: SystemConfig): SystemConfig {  return {
    ...prev,
    bcvRate: row.bcv_rate != null ? Number(row.bcv_rate) : prev.bcvRate,
    commissionPercent: row.commission_percent != null ? Number(row.commission_percent) : prev.commissionPercent,
    negativeBalanceThreshold: row.negative_balance_threshold != null ? Number(row.negative_balance_threshold) : prev.negativeBalanceThreshold,
    adminEmail: row.admin_email != null ? String(row.admin_email) : prev.adminEmail,
    baseFareUSD: row.base_fare_usd != null ? Number(row.base_fare_usd) : prev.baseFareUSD,
    baseDistanceKm: row.base_distance_km != null ? Number(row.base_distance_km) : prev.baseDistanceKm,
    additionalKmRateUSD: row.additional_km_rate_usd != null ? Number(row.additional_km_rate_usd) : prev.additionalKmRateUSD,
    pagoMovil: {
      ...prev.pagoMovil,
      bankName: dbString(row.pago_movil_bank_name, prev.pagoMovil.bankName),
      bankCode: dbString(row.pago_movil_bank_code, prev.pagoMovil.bankCode),
      cif: dbString(row.pago_movil_cif, prev.pagoMovil.cif),
      phone: dbString(row.pago_movil_phone, prev.pagoMovil.phone),
      holderName: dbString(row.pago_movil_holder_name, prev.pagoMovil.holderName),
    },
    gateways: {
      ...prev.gateways,
      pagoMovil: row.gateway_pago_movil != null ? Boolean(Number(row.gateway_pago_movil)) : prev.gateways.pagoMovil,
      zelle: row.gateway_zelle != null ? Boolean(Number(row.gateway_zelle)) : prev.gateways.zelle,
      binancePay: row.gateway_binance_pay != null ? Boolean(Number(row.gateway_binance_pay)) : prev.gateways.binancePay,
      efectivo: row.gateway_efectivo != null ? Boolean(Number(row.gateway_efectivo)) : prev.gateways.efectivo,
      tarjeta: row.gateway_tarjeta != null ? Boolean(Number(row.gateway_tarjeta)) : prev.gateways.tarjeta,
    },
  };
}

// Convierte un valor de fila de BD a string, tratando null/undefined y los textos
// literales "null"/"undefined" (residuo de un bug anterior) como "sin valor".
function dbString(value: unknown, fallback: string): string {
  if (value == null) return fallback;
  const str = String(value).trim();
  if (str === '' || str === 'null' || str === 'undefined') return fallback;
  return str;
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence via localStorage or default fallback
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('vixy_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_SYSTEM_CONFIG,
            ...parsed,
            bcvRate: typeof parsed.bcvRate === 'number' && !isNaN(parsed.bcvRate) ? parsed.bcvRate : INITIAL_SYSTEM_CONFIG.bcvRate,
            baseFareUSD: typeof parsed.baseFareUSD === 'number' && !isNaN(parsed.baseFareUSD) ? parsed.baseFareUSD : INITIAL_SYSTEM_CONFIG.baseFareUSD,
            baseDistanceKm: typeof parsed.baseDistanceKm === 'number' && !isNaN(parsed.baseDistanceKm) ? parsed.baseDistanceKm : INITIAL_SYSTEM_CONFIG.baseDistanceKm,
            additionalKmRateUSD: typeof parsed.additionalKmRateUSD === 'number' && !isNaN(parsed.additionalKmRateUSD) ? parsed.additionalKmRateUSD : INITIAL_SYSTEM_CONFIG.additionalKmRateUSD,
            commissionPercent: typeof parsed.commissionPercent === 'number' && !isNaN(parsed.commissionPercent) ? parsed.commissionPercent : INITIAL_SYSTEM_CONFIG.commissionPercent,
            negativeBalanceThreshold: typeof parsed.negativeBalanceThreshold === 'number' && !isNaN(parsed.negativeBalanceThreshold) ? parsed.negativeBalanceThreshold : INITIAL_SYSTEM_CONFIG.negativeBalanceThreshold,
            pagoMovil: { ...INITIAL_SYSTEM_CONFIG.pagoMovil, ...(parsed.pagoMovil || {}) },
            zelle: { ...INITIAL_SYSTEM_CONFIG.zelle, ...(parsed.zelle || {}) },
            binancePay: { ...INITIAL_SYSTEM_CONFIG.binancePay, ...(parsed.binancePay || {}) },
            bankTransfer: { ...INITIAL_SYSTEM_CONFIG.bankTransfer, ...(parsed.bankTransfer || {}) },
            cashPayment: { ...INITIAL_SYSTEM_CONFIG.cashPayment, ...(parsed.cashPayment || {}) },
            cardPos: { ...INITIAL_SYSTEM_CONFIG.cardPos, ...(parsed.cardPos || {}) },
            customPaymentMethods: Array.isArray(parsed.customPaymentMethods)
              ? parsed.customPaymentMethods
              : INITIAL_SYSTEM_CONFIG.customPaymentMethods || [],
            gateways: { ...INITIAL_SYSTEM_CONFIG.gateways, ...(parsed.gateways || {}) },
            stateRates: parsed.stateRates || INITIAL_STATE_RATES,
            universityStateRates: parsed.universityStateRates || INITIAL_UNIVERSITY_STATE_RATES,
            universityNationalEnabled: parsed.universityNationalEnabled ?? INITIAL_SYSTEM_CONFIG.universityNationalEnabled,
            contactSocial: { ...INITIAL_CONTACT_SOCIAL, ...(parsed.contactSocial || {}) },
          };
        }
      } catch (e) {
        console.warn('Error parsing vixy_config:', e);
      }
    }
    return INITIAL_SYSTEM_CONFIG;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    return PRODUCTION_DRIVERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    return PRODUCTION_CLIENTS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    return PRODUCTION_PAYMENTS;
  });

  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>(() => {
    return PRODUCTION_EMERGENCIES;
  });

  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('vixy_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('vixy_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('vixy_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedServices, setCompletedServices] = useState<CompletedService[]>(() => {
    return PRODUCTION_COMPLETED_SERVICES;
  });

  const [backendUsers, setBackendUsers] = useState<BackendUser[]>(() => {
    const saved = localStorage.getItem('vixy_backend_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_BACKEND_USERS;
  });

  const [brandingMedia, setBrandingMedia] = useState<BrandingMedia>(() => {
    const saved = localStorage.getItem('vixy_branding_media');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...INITIAL_BRANDING_MEDIA, ...parsed };
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_BRANDING_MEDIA;
  });

  const [apiConfig, setApiConfig] = useState<ApiInterconnectionConfig>(() => {
    const saved = localStorage.getItem('vixy_api_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Sanea residuos corruptos de sesiones anteriores (ej. el texto literal "null").
          const isBad = (v: unknown) => v == null || v === '' || v === 'null' || v === 'undefined';
          return {
            ...INITIAL_API_CONFIG,
            ...parsed,
            backendApiUrl: isBad(parsed.backendApiUrl) ? INITIAL_API_CONFIG.backendApiUrl : parsed.backendApiUrl,
            prodApiKey: isBad(parsed.prodApiKey) ? INITIAL_API_CONFIG.prodApiKey : parsed.prodApiKey,
          };
        }
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_API_CONFIG;
  });

  // Auth & Root Password States
  const [rootPassword, setRootPassword] = useState<string>(() => {
    const saved = localStorage.getItem('vixy_root_pass');
    return saved || '123456';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('vixy_auth');
    return saved === 'true';
  });

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [isWebGuideModalOpen, setIsWebGuideModalOpen] = useState<boolean>(false);

  const mustChangePassword = rootPassword === '123456';

  const [currentBackendUser, setCurrentBackendUser] = useState<BackendUser>(() => {
    const saved = localStorage.getItem('vixy_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name && parsed.permissions) return parsed;
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_BACKEND_USERS[0];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTabRaw] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Bloquea el cambio de pestaña si el usuario actual no tiene el permiso requerido,
  // sin importar desde dónde se intente (Sidebar, Navbar, etc.).
  const setActiveTab = (tab: string) => {
    const requiredPermission = TAB_PERMISSIONS[tab];
    const permissions = currentBackendUser?.permissions;
    if (requiredPermission && permissions && !permissions[requiredPermission]) {
      showToast('No tienes permiso para acceder a esta sección', 'error');
      return;
    }
    setActiveTabRaw(tab);
  };

  // Si el usuario pierde el permiso de la pestaña activa (ej. cambio de rol), regresa al dashboard.
  useEffect(() => {
    const requiredPermission = TAB_PERMISSIONS[activeTab];
    const permissions = currentBackendUser?.permissions;
    if (requiredPermission && permissions && !permissions[requiredPermission]) {
      setActiveTabRaw('dashboard');
    }
  }, [currentBackendUser, activeTab]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const refresh = async () => {
      const [adminResult, conductorResult, usersResult, reviewsResult, notificationsResult] = await Promise.allSettled([
        fetchAdminRealtime(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchConductorRealtime(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchBackendUsers(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchAdminResourceList(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'reviews'),
        fetchAdminResourceList(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'notifications'),
      ]);
      if (cancelled) return;

      // Sesión inválida/expirada de verdad: sí debemos cerrar sesión.
      const isSessionExpired = [adminResult, conductorResult, usersResult].some(
        (result) => result.status === 'rejected' && result.reason instanceof ApiRequestError && result.reason.status === 401
      );
      if (isSessionExpired) {
        setIsAuthenticated(false);
        showToast('Tu sesión ha expirado, inicia sesión nuevamente', 'warning');
        return;
      }

      if (adminResult.status === 'rejected') {
        console.warn('No se pudo actualizar el panel administrativo desde MySQL:', adminResult.reason);
      }
      if (conductorResult.status === 'rejected') {
        console.warn('No se pudo actualizar el estado de conductores desde MySQL:', conductorResult.reason);
      }
      if (usersResult.status === 'rejected') {
        console.warn('No se pudo actualizar la lista de usuarios administrativos desde MySQL:', usersResult.reason);
      } else {
        setBackendUsers(usersResult.value.map(mapAdminUser));
      }

      if (reviewsResult.status === 'rejected') {
        console.warn('No se pudieron cargar las reseñas desde MySQL:', reviewsResult.reason);
      } else {
        setReviews(reviewsResult.value.map((row) => ({
          id: String(row.id || ''),
          driverId: String(row.driver_id || ''),
          driverName: String(row.driver_name || ''),
          driverCategory: row.driver_category as Review['driverCategory'],
          clientId: String(row.client_id || ''),
          clientName: String(row.client_name || ''),
          rating: Number(row.rating || 0),
          comment: String(row.comment || ''),
          isFlagged: Boolean(Number(row.is_flagged || 0)),
          createdAt: String(row.created_at || ''),
        })));
      }

      if (notificationsResult.status === 'rejected') {
        console.warn('No se pudieron cargar las notificaciones desde MySQL:', notificationsResult.reason);
      } else {
        setPushNotifications(notificationsResult.value.map((row) => ({
          id: String(row.id || ''),
          title: String(row.title || ''),
          body: String(row.body || ''),
          targetGroup: row.target_group as PushNotification['targetGroup'],
          recipientId: row.recipient_id as string | undefined,
          recipientName: row.recipient_name as string | undefined,
          sentAt: String(row.sent_at || ''),
          sentBy: String(row.sent_by || ''),
        })));
      }

      const snapshot = adminResult.status === 'fulfilled' ? adminResult.value : null;
      const conductorSnapshot = conductorResult.status === 'fulfilled' ? conductorResult.value : null;
      if (!snapshot) return;

      const conductorAvailable = Boolean(conductorSnapshot?.available);
      setDrivers([...snapshot.drivers, ...(conductorAvailable ? conductorSnapshot!.drivers : [])].map(mapDriver));
      setClients([...snapshot.clients, ...(conductorAvailable ? conductorSnapshot!.clients : [])].map(mapClient));
      setPayments([...snapshot.payments, ...(conductorAvailable ? conductorSnapshot!.payments : [])].map(mapPayment));
      setEmergencies([...snapshot.emergencies, ...(conductorAvailable ? conductorSnapshot!.emergencies : [])].map(mapEmergency));
      setCompletedServices([...snapshot.completedServices, ...(conductorAvailable ? conductorSnapshot!.completedServices : [])].map(mapCompletedService));
      setAuditLogs([...snapshot.activity, ...(conductorAvailable ? conductorSnapshot!.activity : [])].map((row) => ({
        id: String(row.id || ''), timestamp: String(row.created_at || ''),
        adminUser: String(row.driver_name || ''), adminRole: 'Conductor',
        action: String(row.action || ''), module: String(row.module || 'App Conductor'),
        details: String(row.details || ''), ipAddress: String(row.ip_address || ''),
      })));
    };
    refresh();
    const timer = window.setInterval(refresh, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [apiConfig.backendApiUrl, apiConfig.prodApiKey, isAuthenticated]);

  // Configuración financiera, branding e interconexión: se cargan una vez por sesión
  // (cambian con poca frecuencia). Deliberadamente no dependemos de apiConfig aquí para
  // evitar un bucle, ya que este efecto puede actualizar apiConfig.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const [configResult, brandingResult, apiConfigResult, contactResult, stateRatesResult, universityRatesResult, customMethodsResult] = await Promise.allSettled([
        fetchSystemConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchBrandingMediaApi(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchApiInterconnectionConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchContactSocialConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchStateRates(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchUniversityRates(apiConfig.backendApiUrl, apiConfig.prodApiKey),
        fetchAdminResourceList(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'custom_payment_methods'),
      ]);
      if (cancelled) return;

      if (configResult.status === 'fulfilled') {
        const row = configResult.value;
        setConfig((prev) => mapSystemConfigFromDb(row, prev));
      } else {
        console.warn('No se pudo cargar la configuración financiera desde MySQL:', configResult.reason);
      }

      if (brandingResult.status === 'fulfilled') {
        const row = brandingResult.value;
        setBrandingMedia((prev) => ({
          ...prev,
          imageUrl: dbString(row.image_url, prev.imageUrl),
          backgroundImageUrl: dbString(row.background_image_url, prev.backgroundImageUrl || ''),
          videoUrl: dbString(row.video_url, prev.videoUrl),
          videoTitle: dbString(row.video_title, prev.videoTitle),
        }));
      } else {
        console.warn('No se pudo cargar la configuración de marca desde MySQL:', brandingResult.reason);
      }

      if (apiConfigResult.status === 'fulfilled') {
        const row = apiConfigResult.value;
        setApiConfig((prev) => ({
          ...prev,
          backendApiUrl: dbString(row.backend_api_url, prev.backendApiUrl),
          prodApiKey: dbString(row.prod_api_key, prev.prodApiKey),
          googleMapsApiKey: dbString(row.google_maps_api_key, prev.googleMapsApiKey),
          paymentWebhookSecret: dbString(row.payment_webhook_secret, prev.paymentWebhookSecret),
          driverAppSyncEndpoint: dbString(row.driver_app_sync_endpoint, prev.driverAppSyncEndpoint),
          passengerAppSyncEndpoint: dbString(row.passenger_app_sync_endpoint, prev.passengerAppSyncEndpoint),
          fcmServerKey: dbString(row.fcm_server_key, prev.fcmServerKey),
          productionMode: row.production_mode != null ? Boolean(Number(row.production_mode)) : prev.productionMode,
        }));
      } else {
        console.warn('No se pudo cargar la configuración de interconexión desde MySQL:', apiConfigResult.reason);
      }

      if (contactResult.status === 'fulfilled') {
        const row = contactResult.value;
        setConfig((prev) => ({
          ...prev,
          contactSocial: {
            ...(prev.contactSocial || INITIAL_CONTACT_SOCIAL),
            whatsappNumber: row.whatsapp_number != null ? String(row.whatsapp_number) : prev.contactSocial?.whatsappNumber ?? INITIAL_CONTACT_SOCIAL.whatsappNumber,
            whatsappMessage: row.whatsapp_message != null ? String(row.whatsapp_message) : prev.contactSocial?.whatsappMessage,
            telegramUserOrLink: row.telegram_user_or_link != null ? String(row.telegram_user_or_link) : prev.contactSocial?.telegramUserOrLink ?? INITIAL_CONTACT_SOCIAL.telegramUserOrLink,
            telegramChannelOrGroup: row.telegram_channel_or_group != null ? String(row.telegram_channel_or_group) : prev.contactSocial?.telegramChannelOrGroup,
            supportEmail: row.support_email != null ? String(row.support_email) : prev.contactSocial?.supportEmail ?? INITIAL_CONTACT_SOCIAL.supportEmail,
            corporateEmail: row.corporate_email != null ? String(row.corporate_email) : prev.contactSocial?.corporateEmail,
            tiktokUrlOrUser: row.tiktok_url_or_user != null ? String(row.tiktok_url_or_user) : prev.contactSocial?.tiktokUrlOrUser ?? INITIAL_CONTACT_SOCIAL.tiktokUrlOrUser,
            instagramUrlOrUser: row.instagram_url_or_user != null ? String(row.instagram_url_or_user) : prev.contactSocial?.instagramUrlOrUser ?? INITIAL_CONTACT_SOCIAL.instagramUrlOrUser,
            facebookUrlOrPage: row.facebook_url_or_page != null ? String(row.facebook_url_or_page) : prev.contactSocial?.facebookUrlOrPage ?? INITIAL_CONTACT_SOCIAL.facebookUrlOrPage,
            youtubeUrl: row.youtube_url != null ? String(row.youtube_url) : prev.contactSocial?.youtubeUrl,
            xTwitterUrl: row.x_twitter_url != null ? String(row.x_twitter_url) : prev.contactSocial?.xTwitterUrl,
            dispatchPhone: row.dispatch_phone != null ? String(row.dispatch_phone) : prev.contactSocial?.dispatchPhone ?? INITIAL_CONTACT_SOCIAL.dispatchPhone,
            emergencyPhone: row.emergency_phone != null ? String(row.emergency_phone) : prev.contactSocial?.emergencyPhone ?? INITIAL_CONTACT_SOCIAL.emergencyPhone,
            driverSupportPhone: row.driver_support_phone != null ? String(row.driver_support_phone) : prev.contactSocial?.driverSupportPhone ?? INITIAL_CONTACT_SOCIAL.driverSupportPhone,
            officeAddress: row.office_address != null ? String(row.office_address) : prev.contactSocial?.officeAddress,
            supportHours: row.support_hours != null ? String(row.support_hours) : prev.contactSocial?.supportHours,
            coverageText: row.coverage_text != null ? String(row.coverage_text) : prev.contactSocial?.coverageText,
            activeDriversCount: row.active_drivers_count != null ? String(row.active_drivers_count) : prev.contactSocial?.activeDriversCount,
            satisfiedTripsCount: row.satisfied_trips_count != null ? String(row.satisfied_trips_count) : prev.contactSocial?.satisfiedTripsCount,
          },
        }));
      } else {
        console.warn('No se pudo cargar la configuración de contacto/redes desde MySQL:', contactResult.reason);
      }

      if (stateRatesResult.status === 'fulfilled' && stateRatesResult.value.length > 0) {
        const rows = stateRatesResult.value;
        setConfig((prev) => {
          const updatedMap: StateRatesMap = { ...(prev.stateRates || {}) };
          rows.forEach((row) => {
            const state = String(row.state);
            const serviceType = row.service_type as ServiceType;
            const existing = (updatedMap[state] || {}) as StateServiceFares;
            updatedMap[state] = {
              ...existing,
              [serviceType]: {
                baseFareUSD: Number(row.base_fare_usd ?? 0),
                baseDistanceKm: Number(row.base_distance_km ?? 0),
                additionalKmRateUSD: Number(row.additional_km_rate_usd ?? 0),
              },
            };
          });
          return { ...prev, stateRates: updatedMap };
        });
      } else if (stateRatesResult.status === 'rejected') {
        console.warn('No se pudieron cargar las tarifas por estado desde MySQL:', stateRatesResult.reason);
      }

      if (universityRatesResult.status === 'fulfilled' && universityRatesResult.value.length > 0) {
        const rows = universityRatesResult.value;
        setConfig((prev) => {
          const updatedMap: StateUniversityRatesMap = { ...(prev.universityStateRates || {}) };
          rows.forEach((row) => {
            const state = String(row.state);
            let allowedUniversities: string[] = [];
            try {
              const parsed = row.allowed_universities ? JSON.parse(String(row.allowed_universities)) : [];
              if (Array.isArray(parsed)) allowedUniversities = parsed.map(String);
            } catch {
              /* JSON malformado, se ignora */
            }
            updatedMap[state] = {
              enabled: Boolean(Number(row.enabled ?? 0)),
              notes: row.notes != null ? String(row.notes) : undefined,
              allowedUniversities,
              requireStudentVerification: Boolean(Number(row.require_student_verification ?? 0)),
              taxi: {
                baseFareUSD: Number(row.taxi_base_fare_usd ?? 0),
                baseDistanceKm: Number(row.taxi_base_distance_km ?? 0),
                additionalKmRateUSD: Number(row.taxi_additional_km_rate_usd ?? 0),
              },
              mototaxi: {
                baseFareUSD: Number(row.mototaxi_base_fare_usd ?? 0),
                baseDistanceKm: Number(row.mototaxi_base_distance_km ?? 0),
                additionalKmRateUSD: Number(row.mototaxi_additional_km_rate_usd ?? 0),
              },
              delivery: {
                baseFareUSD: Number(row.delivery_base_fare_usd ?? 0),
                baseDistanceKm: Number(row.delivery_base_distance_km ?? 0),
                additionalKmRateUSD: Number(row.delivery_additional_km_rate_usd ?? 0),
              },
            };
          });
          return { ...prev, universityStateRates: updatedMap };
        });
      } else if (universityRatesResult.status === 'rejected') {
        console.warn('No se pudieron cargar las tarifas universitarias desde MySQL:', universityRatesResult.reason);
      }

      if (customMethodsResult.status === 'fulfilled') {
        const methods: CustomPaymentMethod[] = customMethodsResult.value.map((row) => ({
          id: String(row.id || ''),
          name: String(row.name || ''),
          currency: (row.currency as CustomPaymentMethod['currency']) || 'USD',
          identifier: String(row.identifier || ''),
          holderName: String(row.holder_name || ''),
          details: row.details as string | undefined,
          instructions: row.instructions as string | undefined,
          enabled: Boolean(Number(row.enabled ?? 0)),
        }));
        setConfig((prev) => ({ ...prev, customPaymentMethods: methods }));
      } else {
        console.warn('No se pudieron cargar los métodos de pago personalizados desde MySQL:', customMethodsResult.reason);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('vixy_root_pass', rootPassword);
  }, [rootPassword]);

  useEffect(() => {
    localStorage.setItem('vixy_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('vixy_current_user', JSON.stringify(currentBackendUser));
  }, [currentBackendUser]);

  useEffect(() => {
    localStorage.setItem('vixy_config', JSON.stringify(config));
    setDoc(doc(db, 'config', 'system'), config).catch((error) => {
      console.warn('Could not sync config to Firestore:', error);
    });
  }, [config]);

  useEffect(() => {
    localStorage.setItem('vixy_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('vixy_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('vixy_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('vixy_emergencies', JSON.stringify(emergencies));
  }, [emergencies]);

  useEffect(() => {
    localStorage.setItem('vixy_notifications', JSON.stringify(pushNotifications));
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem('vixy_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('vixy_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('vixy_backend_users', JSON.stringify(backendUsers));
  }, [backendUsers]);

  useEffect(() => {
    localStorage.setItem('vixy_branding_media', JSON.stringify(brandingMedia));
  }, [brandingMedia]);

  useEffect(() => {
    localStorage.setItem('vixy_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);

  const updateBrandingMedia = (mediaPartial: Partial<BrandingMedia>) => {
    setBrandingMedia((prev) => ({ ...prev, ...mediaPartial }));
    showToast('Fondo e información de marca actualizados', 'success');

    const dbFields: Record<string, unknown> = {};
    if (mediaPartial.imageUrl !== undefined) dbFields.image_url = mediaPartial.imageUrl;
    if (mediaPartial.backgroundImageUrl !== undefined) dbFields.background_image_url = mediaPartial.backgroundImageUrl;
    if (mediaPartial.videoUrl !== undefined) dbFields.video_url = mediaPartial.videoUrl;
    if (mediaPartial.videoTitle !== undefined) dbFields.video_title = mediaPartial.videoTitle;
    if (Object.keys(dbFields).length > 0) {
      void updateBrandingMediaApi(apiConfig.backendApiUrl, apiConfig.prodApiKey, dbFields).catch(() =>
        showToast('Advertencia: la marca no pudo guardarse en la base de datos central', 'warning')
      );
    }
  };

  const updateApiConfig = (configPartial: Partial<ApiInterconnectionConfig>) => {
    // backendApiUrl y prodApiKey son críticos: si llegan vacíos o corruptos (ej. "null"),
    // se ignoran para no romper todas las peticiones futuras a la API.
    const isValidCritical = (v: unknown) => typeof v === 'string' && v.trim() !== '' && v.trim() !== 'null' && v.trim() !== 'undefined';
    const sanitized: Partial<ApiInterconnectionConfig> = { ...configPartial };
    if (configPartial.backendApiUrl !== undefined && !isValidCritical(configPartial.backendApiUrl)) {
      delete sanitized.backendApiUrl;
    }
    if (configPartial.prodApiKey !== undefined && !isValidCritical(configPartial.prodApiKey)) {
      delete sanitized.prodApiKey;
    }

    setApiConfig((prev) => ({ ...prev, ...sanitized }));
    addAuditLog(
      'Actualización Claves API',
      'Configuración & Web',
      'Se han actualizado las claves de interconexión y producción de la plataforma.'
    );
    showToast('🔑 Claves de API e interconexión guardadas correctamente', 'success');

    const dbFields: Record<string, unknown> = {};
    if (sanitized.backendApiUrl !== undefined) dbFields.backend_api_url = sanitized.backendApiUrl;
    if (sanitized.prodApiKey !== undefined) dbFields.prod_api_key = sanitized.prodApiKey;
    if (configPartial.googleMapsApiKey !== undefined) dbFields.google_maps_api_key = configPartial.googleMapsApiKey;
    if (configPartial.paymentWebhookSecret !== undefined) dbFields.payment_webhook_secret = configPartial.paymentWebhookSecret;
    if (configPartial.driverAppSyncEndpoint !== undefined) dbFields.driver_app_sync_endpoint = configPartial.driverAppSyncEndpoint;
    if (configPartial.passengerAppSyncEndpoint !== undefined) dbFields.passenger_app_sync_endpoint = configPartial.passengerAppSyncEndpoint;
    if (configPartial.fcmServerKey !== undefined) dbFields.fcm_server_key = configPartial.fcmServerKey;
    if (configPartial.productionMode !== undefined) dbFields.production_mode = configPartial.productionMode ? 1 : 0;
    if (Object.keys(dbFields).length > 0) {
      void updateApiInterconnectionConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey, dbFields).catch(() =>
        showToast('Advertencia: la configuración de interconexión no pudo guardarse en la base de datos central', 'warning')
      );
    }
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addAuditLog = (action: string, moduleName: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleString('es-VE'),
      adminUser: currentBackendUser?.name || 'Administrador',
      adminRole: currentBackendUser?.role || 'Super Admin',
      action,
      module: moduleName,
      details,
      ipAddress: '190.202.45.' + Math.floor(Math.random() * 200 + 10),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateConfig = (newConfigPartial: Partial<SystemConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfigPartial };
      if (newConfigPartial.bcvRate !== undefined) {
        addAuditLog(
          'Actualización Tasa BCV',
          'Configuración Financiera',
          `Tasa ajustada a ${newConfigPartial.bcvRate.toFixed(2)} VES/$`
        );
      }
      if (newConfigPartial.commissionPercent !== undefined) {
        addAuditLog(
          'Ajuste % Comisión',
          'Configuración Financiera',
          `Comisión de la empresa ajustada al ${newConfigPartial.commissionPercent}%`
        );
      }
      return updated;
    });
    showToast('Configuración actualizada exitosamente', 'success');

    // Solo estos campos tienen columna en `system_config`; el resto queda solo en el navegador.
    const dbFields: Record<string, unknown> = {};
    if (newConfigPartial.bcvRate !== undefined) dbFields.bcv_rate = newConfigPartial.bcvRate;
    if (newConfigPartial.commissionPercent !== undefined) dbFields.commission_percent = newConfigPartial.commissionPercent;
    if (newConfigPartial.negativeBalanceThreshold !== undefined) dbFields.negative_balance_threshold = newConfigPartial.negativeBalanceThreshold;
    if (newConfigPartial.adminEmail !== undefined) dbFields.admin_email = newConfigPartial.adminEmail;
    if (newConfigPartial.baseFareUSD !== undefined) dbFields.base_fare_usd = newConfigPartial.baseFareUSD;
    if (newConfigPartial.baseDistanceKm !== undefined) dbFields.base_distance_km = newConfigPartial.baseDistanceKm;
    if (newConfigPartial.additionalKmRateUSD !== undefined) dbFields.additional_km_rate_usd = newConfigPartial.additionalKmRateUSD;
    if (newConfigPartial.universityNationalEnabled !== undefined) dbFields.university_national_enabled = newConfigPartial.universityNationalEnabled ? 1 : 0;
    if (Object.keys(dbFields).length > 0) {
      void updateSystemConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey, dbFields).catch(() =>
        showToast('Advertencia: este cambio no pudo guardarse en la base de datos central', 'warning')
      );
    }

    if (newConfigPartial.contactSocial !== undefined) {
      const c = newConfigPartial.contactSocial;
      void updateContactSocialConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey, {
        whatsapp_number: c.whatsappNumber, whatsapp_message: c.whatsappMessage ?? null,
        telegram_user_or_link: c.telegramUserOrLink, telegram_channel_or_group: c.telegramChannelOrGroup ?? null,
        support_email: c.supportEmail, corporate_email: c.corporateEmail ?? null,
        tiktok_url_or_user: c.tiktokUrlOrUser, instagram_url_or_user: c.instagramUrlOrUser,
        facebook_url_or_page: c.facebookUrlOrPage, youtube_url: c.youtubeUrl ?? null,
        x_twitter_url: c.xTwitterUrl ?? null, dispatch_phone: c.dispatchPhone, emergency_phone: c.emergencyPhone,
        driver_support_phone: c.driverSupportPhone, office_address: c.officeAddress ?? null,
        support_hours: c.supportHours ?? null, coverage_text: c.coverageText ?? null,
        active_drivers_count: c.activeDriversCount ?? null, satisfied_trips_count: c.satisfiedTripsCount ?? null,
      }).catch(() => showToast('Advertencia: los datos de contacto no pudieron guardarse en la base de datos central', 'warning'));
    }

    if (newConfigPartial.stateRates !== undefined) {
      const rows = Object.entries(newConfigPartial.stateRates).flatMap(([state, fares]) =>
        (['taxi', 'mototaxi', 'delivery'] as const).map((serviceType) => ({
          state,
          service_type: serviceType,
          base_fare_usd: fares[serviceType].baseFareUSD,
          base_distance_km: fares[serviceType].baseDistanceKm,
          additional_km_rate_usd: fares[serviceType].additionalKmRateUSD,
        }))
      );
      if (rows.length > 0) {
        void updateStateRates(apiConfig.backendApiUrl, apiConfig.prodApiKey, rows).catch(() =>
          showToast('Advertencia: las tarifas por estado no pudieron guardarse en la base de datos central', 'warning')
        );
      }
    }

    if (newConfigPartial.universityStateRates !== undefined) {
      const rows = Object.entries(newConfigPartial.universityStateRates).map(([state, uni]) => ({
        state,
        enabled: uni.enabled ? 1 : 0,
        notes: uni.notes ?? null,
        allowed_universities: uni.allowedUniversities || [],
        require_student_verification: uni.requireStudentVerification ? 1 : 0,
        taxi_base_fare_usd: uni.taxi.baseFareUSD, taxi_base_distance_km: uni.taxi.baseDistanceKm, taxi_additional_km_rate_usd: uni.taxi.additionalKmRateUSD,
        mototaxi_base_fare_usd: uni.mototaxi.baseFareUSD, mototaxi_base_distance_km: uni.mototaxi.baseDistanceKm, mototaxi_additional_km_rate_usd: uni.mototaxi.additionalKmRateUSD,
        delivery_base_fare_usd: uni.delivery.baseFareUSD, delivery_base_distance_km: uni.delivery.baseDistanceKm, delivery_additional_km_rate_usd: uni.delivery.additionalKmRateUSD,
      }));
      if (rows.length > 0) {
        void updateUniversityRates(apiConfig.backendApiUrl, apiConfig.prodApiKey, rows).catch(() =>
          showToast('Advertencia: las tarifas universitarias no pudieron guardarse en la base de datos central', 'warning')
        );
      }
    }
  };

  const updatePaymentGatewayConfig = (
    gatewayKey: 'pagoMovil' | 'zelle' | 'binancePay' | 'bankTransfer' | 'cashPayment' | 'cardPos',
    data: any,
    enabled?: boolean
  ) => {
    setConfig((prev) => {
      const updatedGateways = { ...prev.gateways };
      if (enabled !== undefined) {
        if (gatewayKey === 'bankTransfer') {
          updatedGateways.bankTransfer = enabled;
        } else {
          updatedGateways[gatewayKey] = enabled;
        }
      }
      const updated = {
        ...prev,
        [gatewayKey]: { ...prev[gatewayKey], ...data },
        gateways: updatedGateways,
      };
      return updated;
    });

    const labels: Record<string, string> = {
      pagoMovil: 'Pago Móvil (VES)',
      zelle: 'Zelle (USD)',
      binancePay: 'Binance Pay (USDT)',
      bankTransfer: 'Transferencia Bancaria (VES)',
      cashPayment: 'Efectivo USD/VES',
      cardPos: 'Tarjeta / POS',
    };

    addAuditLog(
      'Edición Método de Pago',
      'Configuración de Pagos',
      `Actualizada la configuración y datos receptores de ${labels[gatewayKey] || gatewayKey}`
    );
    showToast(`Método de pago ${labels[gatewayKey] || gatewayKey} actualizado exitosamente`, 'success');

    // Solo Pago Móvil tiene columnas dedicadas en `system_config`; los demás métodos quedan solo en el navegador.
    const dbFields: Record<string, unknown> = {};
    if (gatewayKey === 'pagoMovil') {
      if (data.bankName !== undefined) dbFields.pago_movil_bank_name = data.bankName;
      if (data.bankCode !== undefined) dbFields.pago_movil_bank_code = data.bankCode;
      if (data.cif !== undefined) dbFields.pago_movil_cif = data.cif;
      if (data.phone !== undefined) dbFields.pago_movil_phone = data.phone;
      if (data.holderName !== undefined) dbFields.pago_movil_holder_name = data.holderName;
    }
    const gatewayColumnMap: Partial<Record<typeof gatewayKey, string>> = {
      pagoMovil: 'gateway_pago_movil',
      zelle: 'gateway_zelle',
      binancePay: 'gateway_binance_pay',
      cashPayment: 'gateway_efectivo',
      cardPos: 'gateway_tarjeta',
    };
    if (enabled !== undefined && gatewayColumnMap[gatewayKey]) {
      dbFields[gatewayColumnMap[gatewayKey] as string] = enabled ? 1 : 0;
    }
    if (Object.keys(dbFields).length > 0) {
      void updateSystemConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey, dbFields).catch(() =>
        showToast('Advertencia: este método de pago no pudo guardarse en la base de datos central', 'warning')
      );
    }
  };

  const togglePaymentGateway = (gatewayKey: keyof SystemConfig['gateways']) => {
    const isCurrentlyActive = config.gateways[gatewayKey];
    setConfig((prev) => {
      const updated = {
        ...prev,
        gateways: {
          ...prev.gateways,
          [gatewayKey]: !prev.gateways[gatewayKey],
        },
      };
      return updated;
    });
    addAuditLog(
      'Cambio Estado Pasarela de Pago',
      'Configuración de Pagos',
      `Pasarela ${gatewayKey} cambiada a ${!isCurrentlyActive ? 'ACTIVA' : 'INACTIVA'}`
    );
    showToast(`Pasarela de pago ${!isCurrentlyActive ? 'activada' : 'desactivada'}`, 'info');

    const gatewayFieldMap: Partial<Record<keyof SystemConfig['gateways'], string>> = {
      pagoMovil: 'gateway_pago_movil',
      zelle: 'gateway_zelle',
      binancePay: 'gateway_binance_pay',
      efectivo: 'gateway_efectivo',
      tarjeta: 'gateway_tarjeta',
    };
    const dbColumn = gatewayFieldMap[gatewayKey];
    if (dbColumn) {
      void updateSystemConfig(apiConfig.backendApiUrl, apiConfig.prodApiKey, { [dbColumn]: !isCurrentlyActive ? 1 : 0 }).catch(() =>
        showToast('Advertencia: este cambio no pudo guardarse en la base de datos central', 'warning')
      );
    }
  };

  const addCustomPaymentMethod = (method: Omit<CustomPaymentMethod, 'id'>) => {
    void createAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'custom_payment_methods', {
      name: method.name,
      currency: method.currency,
      identifier: method.identifier,
      holder_name: method.holderName,
      details: method.details ?? null,
      instructions: method.instructions ?? null,
      enabled: method.enabled ? 1 : 0,
    }).then((row) => {
      const newMethod: CustomPaymentMethod = {
        id: String(row.id || ''),
        name: String(row.name ?? method.name),
        currency: (row.currency as CustomPaymentMethod['currency']) || method.currency,
        identifier: String(row.identifier ?? method.identifier),
        holderName: String(row.holder_name ?? method.holderName),
        details: (row.details as string | undefined) ?? method.details,
        instructions: (row.instructions as string | undefined) ?? method.instructions,
        enabled: Boolean(Number(row.enabled ?? (method.enabled ? 1 : 0))),
      };
      setConfig((prev) => ({ ...prev, customPaymentMethods: [...(prev.customPaymentMethods || []), newMethod] }));
      addAuditLog(
        'Creación Método de Pago Personalizado',
        'Configuración de Pagos',
        `Añadido nuevo método de pago: "${newMethod.name}" (${newMethod.currency})`
      );
      showToast(`Método de pago personalizado "${newMethod.name}" creado con éxito`, 'success');
    }).catch(() => showToast('No se pudo crear el método de pago en la base de datos', 'error'));
  };

  const updateCustomPaymentMethod = (id: string, methodPartial: Partial<CustomPaymentMethod>) => {
    const dbFields: Record<string, unknown> = {};
    if (methodPartial.name !== undefined) dbFields.name = methodPartial.name;
    if (methodPartial.currency !== undefined) dbFields.currency = methodPartial.currency;
    if (methodPartial.identifier !== undefined) dbFields.identifier = methodPartial.identifier;
    if (methodPartial.holderName !== undefined) dbFields.holder_name = methodPartial.holderName;
    if (methodPartial.details !== undefined) dbFields.details = methodPartial.details;
    if (methodPartial.instructions !== undefined) dbFields.instructions = methodPartial.instructions;
    if (methodPartial.enabled !== undefined) dbFields.enabled = methodPartial.enabled ? 1 : 0;

    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'custom_payment_methods', id, dbFields).then(() => {
      setConfig((prev) => {
        const currentList = prev.customPaymentMethods || [];
        return {
          ...prev,
          customPaymentMethods: currentList.map((m) => (m.id === id ? { ...m, ...methodPartial } : m)),
        };
      });
      addAuditLog(
        'Edición Método de Pago Personalizado',
        'Configuración de Pagos',
        `Actualizado método de pago ID: ${id}`
      );
      showToast('Método de pago personalizado actualizado exitosamente', 'success');
    }).catch(() => showToast('No se pudo actualizar el método de pago en la base de datos', 'error'));
  };

  const deleteCustomPaymentMethod = (id: string) => {
    const method = config.customPaymentMethods?.find((m) => m.id === id);
    void deleteAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'custom_payment_methods', id).then(() => {
      setConfig((prev) => {
        const currentList = prev.customPaymentMethods || [];
        return {
          ...prev,
          customPaymentMethods: currentList.filter((m) => m.id !== id),
        };
      });
      addAuditLog(
        'Eliminación Método de Pago Personalizado',
        'Configuración de Pagos',
        `Eliminado método de pago personalizado: ${method?.name || id}`
      );
      showToast(`Método de pago "${method?.name || id}" eliminado`, 'warning');
    }).catch(() => showToast('No se pudo eliminar el método de pago en la base de datos', 'error'));
  };

  // Driver actions
  const approveDriver = (driverId: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'drivers', driverId, {
      status: 'activo', rejection_reason: null,
    }).then(() => {
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, status: 'activo', rejectionReason: undefined } : d)));
    }).catch(() => showToast('No se pudo aprobar el conductor en la base de datos', 'error'));
    if (drv) {
      addAuditLog(
        'Aprobación de Conductor',
        'Gestión de Conductores',
        `Conductor ${drv.name} (${drv.documents.cedulaNumber}) aprobado con éxito.`
      );
    }
    showToast('Conductor aprobado y activado en la plataforma', 'success');
  };

  const rejectDriver = (driverId: string, reason: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'drivers', driverId, {
      status: 'rechazado', rejection_reason: reason,
    }).then(() => {
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, status: 'rechazado', rejectionReason: reason } : d)));
    }).catch(() => showToast('No se pudo rechazar el conductor en la base de datos', 'error'));
    if (drv) {
      addAuditLog(
        'Rechazo de Conductor',
        'Gestión de Conductores',
        `Conductor ${drv.name} rechazado. Motivo: ${reason}`
      );
    }
    showToast('Registro de conductor rechazado', 'warning');
  };

  const toggleBlockDriver = (driverId: string, reason?: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    if (!drv) return;
    const isNowBlocked = drv.status !== 'bloqueado';
    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'drivers', driverId, {
      status: isNowBlocked ? 'bloqueado' : 'activo', block_reason: isNowBlocked ? reason || 'Bloqueado por el administrativo' : null,
    }).then(() => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            status: isNowBlocked ? 'bloqueado' : 'activo',
            blockReason: isNowBlocked ? reason || 'Bloqueado por el administrativo' : undefined,
          };
        }
        return d;
      })
    );
    {
      const isBlocked = isNowBlocked;
      addAuditLog(
        isBlocked ? 'Bloqueo de Conductor' : 'Desbloqueo de Conductor',
        'Gestión de Conductores',
        `${isBlocked ? 'Bloqueado' : 'Desbloqueado'}: ${drv.name}. ${reason ? 'Motivo: ' + reason : ''}`
      );
    }
    showToast('Estado del conductor actualizado', 'info');
    }).catch(() => showToast('No se pudo actualizar el conductor en la base de datos', 'error'));
  };

  const deleteDriver = (driverId: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    void deleteAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'drivers', driverId).then(() => {
      setDrivers((prev) => prev.filter((d) => d.id !== driverId));
      if (drv) {
        addAuditLog(
          'Eliminación de Conductor',
          'Gestión de Conductores',
          `Conductor ${drv.name} (Cédula: ${drv.documents.cedulaNumber}, Placa: ${drv.documents.plateNumber}, Categoría: ${drv.category}) eliminado del sistema.`
        );
        showToast(`Conductor ${drv.name} eliminado exitosamente`, 'warning');
      }
    }).catch(() => showToast('No se pudo eliminar el conductor en la base de datos', 'error'));
  };

  const updateDriverBalance = (driverId: string, amountUSD: number) => {
    void adjustAdminWallet(
      apiConfig.backendApiUrl, apiConfig.prodApiKey, driverId, amountUSD, 'Ajuste iniciado desde el panel administrativo'
    ).then(() => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const newBalance = Number((d.balanceUSD + amountUSD).toFixed(2));
        const threshold = config.negativeBalanceThreshold ?? -0.50; // -$0.50 USD threshold

        // Check if balance drops to or below -$0.50
        if (newBalance <= threshold) {
          const isDeactivated = d.status === 'bloqueado' && d.blockReason?.includes('DESACTIVADO');
          if (!isDeactivated) {
            addAuditLog(
              'DESACTIVACIÓN AUTOMÁTICA DE CONDUCTOR',
              'Gestión de Conductores',
              `Conductor ${d.name} alcanzó saldo de $${newBalance.toFixed(2)} USD (<= -$0.50 USD). La aplicación pasó automáticamente a estado DESACTIVADO.`
            );
          }
          return {
            ...d,
            balanceUSD: newBalance,
            status: 'bloqueado',
            isOnline: false,
            blockReason: `DESACTIVADO AUTOMÁTICAMENTE: Saldo de $${newBalance.toFixed(2)} USD es igual o menor al límite (-$0.50 USD). Debe recargar saldo para reactivar la aplicación.`,
          };
        }

        // Check if driver was deactivated due to negative balance and is now recharged above -$0.50
        if (newBalance > threshold && d.status === 'bloqueado' && d.blockReason?.includes('DESACTIVADO')) {
          addAuditLog(
            'REACTIVACIÓN AUTOMÁTICA DE CONDUCTOR',
            'Gestión de Conductores',
            `Conductor ${d.name} recargó saldo a $${newBalance.toFixed(2)} USD (> -$0.50 USD). La aplicación pasó a estado ACTIVO automáticamente.`
          );
          return {
            ...d,
            balanceUSD: newBalance,
            status: 'activo',
            isOnline: true,
            blockReason: undefined,
          };
        }

        return {
          ...d,
          balanceUSD: newBalance,
        };
      })
    );

    const drv = drivers.find((d) => d.id === driverId);
    if (drv) {
      const calcBalance = Number((drv.balanceUSD + amountUSD).toFixed(2));
      const threshold = config.negativeBalanceThreshold ?? -0.50;
      if (calcBalance <= threshold) {
        showToast(
          `⛔ Conductor ${drv.name} ha sido DESACTIVADO automáticamente (Saldo: $${calcBalance.toFixed(2)})`,
          'error'
        );
      } else if (drv.balanceUSD <= threshold && calcBalance > threshold) {
        showToast(
          `✅ ¡Conductor ${drv.name} REACTIVADO con éxito! Saldo actual: $${calcBalance.toFixed(2)}`,
          'success'
        );
      } else {
        showToast(`Saldo del conductor ajustado en $${amountUSD.toFixed(2)} USD (Actual: $${calcBalance.toFixed(2)})`, 'success');
      }
    }
    }).catch(() => showToast('No se pudo registrar el ajuste de wallet en la base de datos', 'error'));
  };

  const notifyNegativeBalance = (driverId: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    if (drv) {
      sendPushNotification({
        title: '⚠️ ALERTA DE SALDO NEGATIVO DE COMISIÓN',
        body: `Estimado(a) ${drv.name}, su saldo en Vixy se encuentra en ${drv.balanceUSD.toFixed(2)}$. Por favor realice su recarga de comisión para continuar recibiendo carreras.`,
        targetGroup: 'individual',
        recipientId: drv.id,
        recipientName: drv.name,
      });
      addAuditLog(
        'Notificación de Saldo Negativo',
        'Gestión de Conductores',
        `Se envió alerta de saldo negativo a ${drv.name} (Saldo: $${drv.balanceUSD.toFixed(2)})`
      );
      showToast(`Notificación de saldo negativo enviada a ${drv.name}`, 'warning');
    }
  };

  // Client actions
  const toggleBlockClient = (clientId: string, reason?: string) => {
    const cli = clients.find((c) => c.id === clientId);
    if (!cli) return;
    const isNowBlocked = !cli.isBlocked;
    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'clients', clientId, {
      is_blocked: isNowBlocked ? 1 : 0,
      block_reason: isNowBlocked ? (reason || 'Bloqueado por el administrativo') : null,
    }).then(() => {
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, isBlocked: isNowBlocked, blockReason: isNowBlocked ? (reason || 'Bloqueado por el administrativo') : undefined }
            : c
        )
      );
      addAuditLog(
        isNowBlocked ? 'Bloqueo de Cliente' : 'Desbloqueo de Cliente',
        'Gestión de Clientes',
        `${isNowBlocked ? 'Bloqueado' : 'Desbloqueado'}: ${cli.name}`
      );
      showToast('Estado del cliente actualizado', 'info');
    }).catch(() => showToast('No se pudo actualizar el cliente en la base de datos', 'error'));
  };

  const updateClientBalance = (clientId: string, amountUSD: number) => {
    const cli = clients.find((c) => c.id === clientId);
    if (!cli) return;
    const newBalance = Number((cli.balanceUSD + amountUSD).toFixed(2));
    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'clients', clientId, { balance_usd: newBalance })
      .then(() => {
        setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, balanceUSD: newBalance } : c)));
        showToast(`Saldo del cliente ajustado en $${amountUSD.toFixed(2)}`, 'success');
      }).catch(() => showToast('No se pudo actualizar el saldo del cliente en la base de datos', 'error'));
  };

  const deleteClient = (clientId: string) => {
    const cli = clients.find((c) => c.id === clientId);
    void deleteAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'clients', clientId).then(() => {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      if (cli) {
        addAuditLog(
          'Eliminación de Pasajero',
          'Gestión de Clientes',
          `Cliente/Pasajero ${cli.name} (${cli.phone}, Email: ${cli.email}) eliminado del sistema.`
        );
        showToast(`Pasajero ${cli.name} eliminado exitosamente`, 'warning');
      }
    }).catch(() => showToast('No se pudo eliminar el cliente en la base de datos', 'error'));
  };

  // Payment actions
  const verifyPayment = (paymentId: string) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay) return;
    void verifyAdminPayment(apiConfig.backendApiUrl, apiConfig.prodApiKey, paymentId, 'verificado').then(() => {
      setPayments((prev) => prev.map((p) => p.id === paymentId ? {
        ...p, status: 'verificado', verifiedBy: currentBackendUser?.name || 'Administrador',
        verifiedAt: new Date().toLocaleString('es-VE'),
      } : p));
    }).catch(() => showToast('No se pudo verificar el pago en la base de datos', 'error'));

    addAuditLog(
      'Verificación de Pago',
      'Verificación de Pagos',
      `Pago Ref: ${pay.referenceNumber} por $${pay.amountUSD.toFixed(2)} (${pay.amountVES.toFixed(2)} VES) verificado.`
    );

    showToast('Pago verificado y abonado exitosamente a la cuenta', 'success');
  };

  const rejectPayment = (paymentId: string, reason: string) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay) return;
    void verifyAdminPayment(apiConfig.backendApiUrl, apiConfig.prodApiKey, paymentId, 'rechazado', `Rechazado: ${reason}`).then(() => {
      setPayments((prev) => prev.map((p) => p.id === paymentId ? {
        ...p, status: 'rechazado', notes: `Rechazado: ${reason}`,
        verifiedBy: currentBackendUser?.name || 'Administrador', verifiedAt: new Date().toLocaleString('es-VE'),
      } : p));
    }).catch(() => showToast('No se pudo rechazar el pago en la base de datos', 'error'));

    addAuditLog(
      'Rechazo de Pago',
      'Verificación de Pagos',
      `Pago Ref: ${pay.referenceNumber} rechazado. Motivo: ${reason}`
    );

    showToast('Comprobante de pago rechazado', 'warning');
  };

  // Emergency actions
  const updateEmergencyStatus = (emergencyId: string, status: EmergencyStatus, notes?: string) => {
    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'emergencies', emergencyId, {
      status, notes, resolved_by: status === 'resuelto' ? currentBackendUser?.name || 'Administrador' : undefined,
    }).then(() => {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === emergencyId
          ? {
              ...e,
              status,
              notes: notes || e.notes,
              resolvedBy: status === 'resuelto' ? (currentBackendUser?.name || 'Administrador') : e.resolvedBy,
            }
          : e
      )
    );
    }).catch(() => showToast('No se pudo actualizar la emergencia en la base de datos', 'error'));

    const emg = emergencies.find((e) => e.id === emergencyId);
    if (emg) {
      addAuditLog(
        'Actualización Alerta Emergencia',
        'Alertas de Emergencia',
        `Alerta de ${emg.type.toUpperCase()} de ${emg.reporterName} cambiada a estado: ${status}`
      );
    }

    showToast(`Estado de emergencia actualizado a: ${status.replace('_', ' ').toUpperCase()}`, 'info');
  };

  // Push notifications
  const sendPushNotification = (notif: Omit<PushNotification, 'id' | 'sentAt' | 'sentBy'>) => {
    void createAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'notifications', {
      title: notif.title,
      body: notif.body,
      target_group: notif.targetGroup,
      recipient_id: notif.recipientId ?? null,
      recipient_name: notif.recipientName ?? null,
      sent_by: currentBackendUser?.name || 'Administrador',
      sent_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }).then((row) => {
      const newNotif: PushNotification = {
        id: String(row.id || ''),
        title: String(row.title ?? notif.title),
        body: String(row.body ?? notif.body),
        targetGroup: (row.target_group as PushNotification['targetGroup']) || notif.targetGroup,
        recipientId: (row.recipient_id as string | undefined) ?? notif.recipientId,
        recipientName: (row.recipient_name as string | undefined) ?? notif.recipientName,
        sentAt: String(row.sent_at || new Date().toLocaleString('es-VE')),
        sentBy: String(row.sent_by || currentBackendUser?.name || 'Administrador'),
      };
      setPushNotifications((prev) => [newNotif, ...prev]);
      addAuditLog(
        'Envío de Notificación Push',
        'Notificaciones Push',
        `Notificación enviada a grupo: [${notif.targetGroup.toUpperCase()}]. Título: ${notif.title}`
      );
      showToast('Notificación Push distribuida con éxito', 'success');
    }).catch(() => showToast('No se pudo registrar la notificación en la base de datos', 'error'));
  };

  // Reviews
  const toggleFlagReview = (reviewId: string) => {
    const rev = reviews.find((r) => r.id === reviewId);
    if (!rev) return;
    const newFlag = !rev.isFlagged;
    void updateAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'reviews', reviewId, { is_flagged: newFlag ? 1 : 0 })
      .then(() => {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, isFlagged: newFlag } : r)));
        showToast('Reporte de reseña actualizado', 'info');
      }).catch(() => showToast('No se pudo actualizar la reseña en la base de datos', 'error'));
  };

  const deleteReview = (reviewId: string) => {
    void deleteAdminResource(apiConfig.backendApiUrl, apiConfig.prodApiKey, 'reviews', reviewId).then(() => {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      addAuditLog('Eliminación de Reseña', 'Panel de Reseñas', `Eliminada reseña ID #${reviewId}`);
      showToast('Reseña eliminada', 'warning');
    }).catch(() => showToast('No se pudo eliminar la reseña en la base de datos', 'error'));
  };

  // Backend user management
  const addBackendUser = async (userData: Omit<BackendUser, 'id' | 'createdAt' | 'lastLogin'>) => {
    const usernameClean = userData.username
      ? userData.username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')
      : userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');

    try {
      const created = await createBackendUserApi(apiConfig.backendApiUrl, apiConfig.prodApiKey, {
        name: userData.name,
        username: usernameClean,
        email: userData.email,
        password: userData.password || '123456',
        role: userData.role,
        avatarUrl: userData.avatarUrl,
        passwordExpirationDays: userData.passwordExpirationDays || 90,
        ...permissionsToFields(userData.permissions),
      });
      const newUser = mapAdminUser(created);
      setBackendUsers((prev) => [newUser, ...prev]);
      addAuditLog(
        'Creación de Usuario Administrativo',
        'Niveles de Acceso',
        `Creado usuario @${newUser.username} - ${newUser.name} (${newUser.email}) con rol [${newUser.role}] y expiración de clave a ${newUser.passwordExpirationDays} días`
      );
      showToast(`Usuario @${newUser.username} (${newUser.name}) creado exitosamente`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el usuario en la base de datos.';
      showToast(message, 'error');
    }
  };

  const updateBackendUserPermissions = async (userId: string, permissions: BackendUserPermissions, role: AdminRole) => {
    try {
      const updated = await updateBackendUserApi(apiConfig.backendApiUrl, apiConfig.prodApiKey, userId, {
        role,
        ...permissionsToFields(permissions),
      });
      setBackendUsers((prev) => prev.map((u) => (u.id === userId ? mapAdminUser(updated) : u)));
      addAuditLog(
        'Modificación de Permisos',
        'Niveles de Acceso',
        `Permisos modificados para usuario ID #${userId}`
      );
      showToast('Permisos de usuario actualizados', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron actualizar los permisos en la base de datos.';
      showToast(message, 'error');
    }
  };

  const updateBackendUserPassword = async (userId: string, newPass: string, expirationDays?: 30 | 90) => {
    try {
      const updated = await updateBackendUserApi(apiConfig.backendApiUrl, apiConfig.prodApiKey, userId, {
        password: newPass,
        password_expiration_days: expirationDays || 90,
        must_change_password: 1,
      });
      setBackendUsers((prev) => prev.map((u) => (u.id === userId ? mapAdminUser(updated) : u)));
      addAuditLog(
        'Actualización de Clave de Usuario',
        'Niveles de Acceso',
        `Nueva clave asignada a usuario ID #${userId}`
      );
      showToast('Clave de usuario actualizada correctamente', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la clave en la base de datos.';
      showToast(message, 'error');
    }
  };

  const toggleBackendUserActive = async (userId: string) => {
    const target = backendUsers.find((u) => u.id === userId);
    if (!target) return;
    try {
      const updated = await updateBackendUserApi(apiConfig.backendApiUrl, apiConfig.prodApiKey, userId, {
        is_active: target.isActive ? 0 : 1,
      });
      setBackendUsers((prev) => prev.map((u) => (u.id === userId ? mapAdminUser(updated) : u)));
      showToast('Estado del usuario del backend modificado', 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el estado del usuario en la base de datos.';
      showToast(message, 'error');
    }
  };

  const deleteBackendUser = async (userId: string) => {
    if (userId === 'usr-root') {
      showToast('El usuario Root principal no puede ser eliminado', 'error');
      return;
    }
    if (currentBackendUser && currentBackendUser.id === userId) {
      showToast('No puedes eliminar la cuenta con la que has iniciado sesión actualmente', 'error');
      return;
    }
    const usr = backendUsers.find((u) => u.id === userId);
    try {
      await deleteBackendUserApi(apiConfig.backendApiUrl, apiConfig.prodApiKey, userId);
      setBackendUsers((prev) => prev.filter((u) => u.id !== userId));
      if (usr) {
        addAuditLog(
          'Eliminación de Usuario Administrativo',
          'Niveles de Acceso',
          `Usuario administrativo ${usr.name} (@${usr.username || 'sin_alias'}, ${usr.email}, Rol: ${usr.role}) eliminado permanentemente.`
        );
        showToast(`Usuario administrativo ${usr.name} eliminado con éxito`, 'warning');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el usuario en la base de datos.';
      showToast(message, 'error');
    }
  };

  // Auth & Root Password Functions
  const login = async (usernameOrEmail: string, passInput: string) => {
    try {
      const rawUser = await loginAdmin(apiConfig.backendApiUrl, apiConfig.prodApiKey, usernameOrEmail.trim(), passInput);
      const user = mapAdminUser(rawUser);
      setCurrentBackendUser(user);
      setIsAuthenticated(true);
      if (user.mustChangePassword) {
        setIsChangePasswordModalOpen(true);
        showToast('Debes cambiar tu contraseña en el primer inicio de sesión', 'warning');
        return { success: true, mustChangePass: true, message: 'Debes cambiar tu contraseña.' };
      }
      showToast(`Bienvenido, ${user.name}`, 'success');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión en el backend.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const logout = () => {
    void logoutAdmin(apiConfig.backendApiUrl, apiConfig.prodApiKey).catch(() => undefined);
    setIsAuthenticated(false);
    showToast('Sesión cerrada correctamente', 'info');
  };

  const changeRootPassword = async (oldPass: string, newPass: string) => {
    if (newPass.trim().length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return { success: false, message: 'Mínimo 6 caracteres requeridos.' };
    }
    if (newPass === '123456') {
      showToast('Por seguridad, la nueva clave debe ser diferente a 123456', 'error');
      return { success: false, message: 'No puedes reutilizar la contraseña por defecto (123456).' };
    }

    try {
      await changePasswordAdmin(apiConfig.backendApiUrl, apiConfig.prodApiKey, oldPass, newPass);

      const todayStr = new Date().toISOString().split('T')[0];
      setCurrentBackendUser((prev) => ({
        ...prev,
        mustChangePassword: false,
        passwordCreatedAt: todayStr,
      }));

      setIsChangePasswordModalOpen(false);
      addAuditLog(
        'Cambio de Contraseña',
        'Seguridad y Accesos',
        `El usuario ${currentBackendUser?.name || 'Usuario'} ha cambiado su contraseña de inicio de sesión exitosamente.`
      );
      showToast('🔑 ¡Contraseña actualizada exitosamente!', 'success');
      return { success: true, message: 'Contraseña actualizada.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Badge counts
  const unreadEmergenciesCount = emergencies.filter((e) => e.status === 'pendiente').length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'pendiente').length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'pendiente').length;
  const negativeBalanceDriversCount = drivers.filter((d) => d.balanceUSD <= config.negativeBalanceThreshold).length;

  return (
    <AdminContext.Provider
      value={{
        config,
        updateConfig,
        updatePaymentGatewayConfig,
        togglePaymentGateway,
        addCustomPaymentMethod,
        updateCustomPaymentMethod,
        deleteCustomPaymentMethod,
        drivers,
        approveDriver,
        rejectDriver,
        toggleBlockDriver,
        deleteDriver,
        updateDriverBalance,
        notifyNegativeBalance,
        clients,
        toggleBlockClient,
        deleteClient,
        updateClientBalance,
        payments,
        verifyPayment,
        rejectPayment,
        emergencies,
        updateEmergencyStatus,
        pushNotifications,
        sendPushNotification,
        reviews,
        toggleFlagReview,
        deleteReview,
        auditLogs,
        addAuditLog,
        completedServices,
        backendUsers,
        addBackendUser,
        updateBackendUserPermissions,
        toggleBackendUserActive,
        deleteBackendUser,
        updateBackendUserPassword,
        currentBackendUser,
        setCurrentBackendUser,
        brandingMedia,
        updateBrandingMedia,
        apiConfig,
        updateApiConfig,
        isAuthenticated,
        rootPassword,
        mustChangePassword,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        isWebGuideModalOpen,
        setIsWebGuideModalOpen,
        login,
        logout,
        changeRootPassword,
        soundEnabled,
        setSoundEnabled,
        activeTab,
        setActiveTab,
        unreadEmergenciesCount,
        pendingPaymentsCount,
        pendingDriversCount,
        negativeBalanceDriversCount,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
