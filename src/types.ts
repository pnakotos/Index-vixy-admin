export type DriverCategory = 'taxi' | 'mototaxi' | 'delivery';

export type DriverStatus = 'activo' | 'bloqueado' | 'pendiente' | 'rechazado';

export interface DriverDocuments {
  cedulaUrl: string;
  cedulaNumber: string;
  licenciaUrl: string;
  licenciaNumber: string;
  certificadoMedicoUrl: string;
  rcvUrl: string; // Responsabilidad civil vehicular
  fotoVehiculoUrl: string;
  plateNumber: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: DriverCategory;
  status: DriverStatus;
  balanceUSD: number; // Balance in USD (can be negative like -2.50$)
  rating: number;
  completedTrips: number;
  documents: DriverDocuments;
  lat: number;
  lng: number;
  locationName: string;
  registeredAt: string;
  lastActive: string;
  isOnline: boolean;
  rejectionReason?: string;
  blockReason?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  balanceUSD: number;
  totalTrips: number;
  rating: number;
  isBlocked: boolean;
  blockReason?: string;
  registeredAt: string;
  avatarUrl?: string;
}

export type PaymentType = 'driver_commission' | 'client_payment';
export type PaymentStatus = 'pendiente' | 'verificado' | 'rechazado';

export interface PaymentRecord {
  id: string;
  type: PaymentType;
  entityId: string; // Driver or Client ID
  entityName: string;
  entityPhone: string;
  category?: DriverCategory | 'cliente';
  referenceNumber: string;
  paymentMethod: string; // 'Pago Móvil', 'Zelle', 'Transferencia', 'Efectivo', etc.
  bankOrigin?: string;
  amountVES: number;
  amountUSD: number;
  bcvRateUsed: number;
  receiptImageUrl: string;
  createdAt: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export type EmergencyType = 'robo' | 'accidente' | 'sos' | 'mecanico';
export type EmergencyStatus = 'pendiente' | 'en_proceso' | 'resuelto' | 'falsa_alarma';

export interface EmergencyAlert {
  id: string;
  type: EmergencyType;
  reporterType: 'conductor' | 'cliente';
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  category?: DriverCategory | 'cliente';
  vehicleInfo?: string;
  plateNumber?: string;
  locationName: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: EmergencyStatus;
  notes?: string;
  resolvedBy?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  targetGroup: 'todos' | 'conductores' | 'taxis' | 'mototaxis' | 'delivery' | 'clientes' | 'individual';
  recipientId?: string;
  recipientName?: string;
  sentAt: string;
  sentBy: string;
}

export interface Review {
  id: string;
  driverId: string;
  driverName: string;
  driverCategory: DriverCategory;
  clientId: string;
  clientName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  isFlagged: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  adminRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export type AdminRole = 'Super Admin' | 'Finanzas' | 'Despacho y Soporte' | 'Verificador';

export interface BackendUserPermissions {
  dashboard: boolean;
  drivers: boolean;
  clients: boolean;
  payments: boolean;
  map: boolean;
  emergencies: boolean;
  financesConfig: boolean;
  notifications: boolean;
  reviews: boolean;
  userManagement: boolean;
  auditLogs: boolean;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  permissions: BackendUserPermissions;
}

export interface PagoMovilConfig {
  bankName: string;
  bankCode: string;
  cif: string; // RIF o Cédula
  phone: string;
  holderName: string;
}

export interface SystemConfig {
  bcvRate: number; // Rate in VES per USD
  commissionPercent: number; // e.g., 15 for 15%
  negativeBalanceThreshold: number; // default -0.50 ($)
  adminEmail: string;
  pagoMovil: PagoMovilConfig;
  gateways: {
    pagoMovil: boolean;
    zelle: boolean;
    binancePay: boolean;
    efectivo: boolean;
    tarjeta: boolean;
  };
}
