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

export interface CompletedService {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  driverId: string;
  driverName: string;
  driverCategory: DriverCategory;
  clientId: string;
  clientName: string;
  clientPhone: string;
  origin: string;
  destination: string;
  fareUSD: number;
  fareVES: number;
  commissionPercent: number;
  commissionUSD: number;
  commissionVES: number;
  driverEarningsUSD: number;
  paymentMethod: 'Efectivo' | 'Pago Móvil' | 'Zelle' | 'Saldo Vixy';
  status: 'completado';
}

export interface BackendUserPermissions {
  dashboard: boolean;
  drivers: boolean;
  clients: boolean;
  payments: boolean;
  map: boolean;
  emergencies: boolean;
  financesConfig: boolean;
  earningsAudit: boolean;
  notifications: boolean;
  reviews: boolean;
  userManagement: boolean;
  auditLogs: boolean;
}

export interface BackendUser {
  id: string;
  name: string;
  username?: string; // Nombre de usuario para inicio de sesión y detalles
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  password?: string;
  mustChangePassword?: boolean;
  passwordExpirationDays?: 30 | 90;
  passwordCreatedAt?: string;
  permissions: BackendUserPermissions;
}

export type ServiceType = 'taxi' | 'mototaxi' | 'delivery';

export interface ServiceFareConfig {
  baseFareUSD: number;       // Tarifa mínima base (USD)
  baseDistanceKm: number;    // Distancia inicial incluida en tarifa mínima (Km)
  additionalKmRateUSD: number; // Costo por Km adicional (USD)
}

export type StateServiceFares = Record<ServiceType, ServiceFareConfig>;

export type StateRatesMap = Record<string, StateServiceFares>;

export interface UniversityFareConfig {
  enabled: boolean;
  notes?: string;
  allowedUniversities: string[];
  requireStudentVerification?: boolean;
  taxi: ServiceFareConfig;
  mototaxi: ServiceFareConfig;
  delivery: ServiceFareConfig;
}

export type StateUniversityRatesMap = Record<string, UniversityFareConfig>;

export interface BrandingMedia {
  imageUrl: string;
  backgroundImageUrl?: string;
  videoUrl: string;
  videoTitle: string;
}

export interface PagoMovilConfig {
  bankName: string;
  bankCode: string;
  cif: string; // RIF o Cédula
  phone: string;
  holderName: string;
  instructions?: string;
}

export interface ZelleConfig {
  email: string;
  holderName: string;
  phone?: string;
  memoRequirement?: string;
  instructions?: string;
}

export interface BinancePayConfig {
  payId: string;
  email?: string;
  nickname?: string;
  supportedNetworks?: string;
  walletAddress?: string;
  qrImageUrl?: string;
  instructions?: string;
}

export interface BankTransferConfig {
  bankName: string;
  bankCode?: string;
  accountNumber: string; // 20 dígitos
  accountType: 'corriente' | 'ahorro';
  cif: string;
  holderName: string;
  instructions?: string;
}

export interface CashPaymentConfig {
  acceptedCurrencies: string[]; // ['USD', 'VES', 'EUR']
  maxBillDenomination?: string;
  instructions?: string;
}

export interface CardPosConfig {
  processorName: string;
  terminalId?: string;
  surchargePercent?: number;
  instructions?: string;
}

export interface CustomPaymentMethod {
  id: string;
  name: string;
  currency: 'VES' | 'USD' | 'EUR' | 'USDT' | 'OTRA';
  identifier: string;
  holderName: string;
  details?: string;
  instructions?: string;
  enabled: boolean;
}

export interface ContactAndSocialConfig {
  // Canales directos
  whatsappNumber: string; // ej. '+58 412 555-0199'
  whatsappMessage?: string; // ej. 'Hola Vixy, deseo información o soporte'
  telegramUserOrLink: string; // ej. '@VixyVenezuela' o 'https://t.me/VixyVenezuela'
  telegramChannelOrGroup?: string; // ej. 'https://t.me/VixyConductores'
  supportEmail: string; // ej. 'soporte@vhixy.site'
  corporateEmail?: string; // ej. 'contacto@vhixy.site'

  // Redes Sociales
  tiktokUrlOrUser: string; // ej. '@vixy_venezuela'
  instagramUrlOrUser: string; // ej. '@vixy_venezuela'
  facebookUrlOrPage: string; // ej. 'https://facebook.com/vixyvenezuela'
  youtubeUrl?: string; // ej. 'https://youtube.com/@vixyvenezuela'
  xTwitterUrl?: string; // ej. '@vixy_vzla'

  // Números y datos para la Página Principal
  dispatchPhone: string; // ej. '0800-VIXY-00 (0800-8499-00)'
  emergencyPhone: string; // ej. '0800-VIXY-SOS / 911'
  driverSupportPhone: string; // ej. '+58 424 555-1234'
  officeAddress?: string; // ej. 'Av. Francisco de Miranda, Torre Vixy, Chacao, Caracas - Venezuela'
  supportHours?: string; // ej. 'Atención 24 Horas / 7 Días a la semana'
  coverageText?: string; // ej. '24 Estados de Venezuela'
  activeDriversCount?: string; // ej. '+15,000'
  satisfiedTripsCount?: string; // ej. '+250,000'
}

export interface ApiInterconnectionConfig {
  backendApiUrl: string;
  prodApiKey: string;
  googleMapsApiKey: string;
  paymentWebhookSecret: string;
  driverAppSyncEndpoint: string;
  passengerAppSyncEndpoint: string;
  fcmServerKey: string;
  productionMode: boolean;
}

export interface SystemConfig {
  bcvRate: number; // Rate in VES per USD
  commissionPercent: number; // e.g., 15 for 15%
  negativeBalanceThreshold: number; // default -0.50 ($)
  adminEmail: string;
  baseFareUSD: number; // Tarifa mínima base (USD) - ej. 2.00$
  baseDistanceKm: number; // Distancia inicial incluida en tarifa mínima (Km) - ej. 3.0 km
  additionalKmRateUSD: number; // Costo por Km adicional (USD) - ej. 0.50$
  stateRates?: StateRatesMap; // Tarifas diferenciadas por Estado de Venezuela y Tipo de Servicio (Taxi, Moto Taxi, Delivery)
  universityStateRates?: StateUniversityRatesMap; // Tarifas Universitarias especiales diferenciadas por Estado de Venezuela
  universityNationalEnabled?: boolean; // Interruptor Master Nacional para la Modalidad Tarifa Universitaria
  contactSocial?: ContactAndSocialConfig; // Configuración de Canales de Contacto, Redes Sociales y Números de Página Principal
  pagoMovil: PagoMovilConfig;
  zelle?: ZelleConfig;
  binancePay?: BinancePayConfig;
  bankTransfer?: BankTransferConfig;
  cashPayment?: CashPaymentConfig;
  cardPos?: CardPosConfig;
  customPaymentMethods?: CustomPaymentMethod[];
  gateways: {
    pagoMovil: boolean;
    zelle: boolean;
    binancePay: boolean;
    bankTransfer?: boolean;
    efectivo: boolean;
    tarjeta: boolean;
  };
}
