import {
  ApiInterconnectionConfig,
  BackendUser,
  BrandingMedia,
  SystemConfig,
} from '../types';

export const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  bcvRate: 0,
  commissionPercent: 0,
  negativeBalanceThreshold: -0.5,
  adminEmail: '',
  baseFareUSD: 0,
  baseDistanceKm: 0,
  additionalKmRateUSD: 0,
  pagoMovil: {
    bankName: '',
    bankCode: '',
    cif: '',
    phone: '',
    holderName: '',
  },
  gateways: {
    pagoMovil: false,
    zelle: false,
    binancePay: false,
    efectivo: false,
    tarjeta: false,
  },
};

export const INITIAL_BRANDING_MEDIA: BrandingMedia = {
  imageUrl: '',
  backgroundImageUrl: '',
  videoUrl: '',
  videoTitle: '',
};

export const INITIAL_API_CONFIG: ApiInterconnectionConfig = {
  backendApiUrl: import.meta.env.VITE_ADMIN_BASE_URL || window.location.origin,
  prodApiKey: import.meta.env.VITE_INTERCONNECTION_KEY || '',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  paymentWebhookSecret: import.meta.env.VITE_PAYMENT_WEBHOOK_SECRET || '',
  driverAppSyncEndpoint: import.meta.env.VITE_DRIVER_APP_SYNC_ENDPOINT || '',
  passengerAppSyncEndpoint: import.meta.env.VITE_PASSENGER_APP_SYNC_ENDPOINT || '',
  fcmServerKey: import.meta.env.VITE_PUSH_NOTIFICATIONS_SERVER_KEY || '',
  productionMode: true,
};

export const EMPTY_BACKEND_USER: BackendUser = {
  id: '',
  name: '',
  username: '',
  email: '',
  role: 'Super Admin',
  avatarUrl: '',
  isActive: false,
  createdAt: '',
  lastLogin: '',
  mustChangePassword: true,
  passwordExpirationDays: 90,
  passwordCreatedAt: '',
  permissions: {
    dashboard: false,
    drivers: false,
    clients: false,
    payments: false,
    map: false,
    emergencies: false,
    financesConfig: false,
    earningsAudit: false,
    notifications: false,
    reviews: false,
    userManagement: false,
    auditLogs: false,
  },
};

export const INITIAL_DRIVERS = [];
export const INITIAL_CLIENTS = [];
export const INITIAL_PAYMENTS = [];
export const INITIAL_EMERGENCIES = [];
export const INITIAL_REVIEWS = [];
export const INITIAL_AUDIT_LOGS = [];
export const INITIAL_COMPLETED_SERVICES = [];
export const INITIAL_BACKEND_USERS: BackendUser[] = [];
