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
} from '../types';
import {
  INITIAL_SYSTEM_CONFIG,
  INITIAL_DRIVERS,
  INITIAL_CLIENTS,
  INITIAL_PAYMENTS,
  INITIAL_EMERGENCIES,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BACKEND_USERS,
  INITIAL_COMPLETED_SERVICES,
  INITIAL_BRANDING_MEDIA,
  INITIAL_API_CONFIG,
  INITIAL_STATE_RATES,
  INITIAL_UNIVERSITY_STATE_RATES,
} from '../data/mockData';

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
  triggerSimulatedEmergency: (type?: EmergencyType) => void;
  
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
  login: (usernameOrEmail: string, passInput: string) => { success: boolean; mustChangePass?: boolean; message?: string };
  logout: () => void;
  changeRootPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };

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
          };
        }
      } catch (e) {
        console.warn('Error parsing vixy_config:', e);
      }
    }
    return INITIAL_SYSTEM_CONFIG;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('vixy_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('vixy_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('vixy_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>(() => {
    const saved = localStorage.getItem('vixy_emergencies');
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCIES;
  });

  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('vixy_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('vixy_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('vixy_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [completedServices, setCompletedServices] = useState<CompletedService[]>(() => {
    const saved = localStorage.getItem('vixy_completed_services');
    return saved ? JSON.parse(saved) : INITIAL_COMPLETED_SERVICES;
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
        if (parsed && typeof parsed === 'object') return { ...INITIAL_API_CONFIG, ...parsed };
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

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
  };

  const updateApiConfig = (configPartial: Partial<ApiInterconnectionConfig>) => {
    setApiConfig((prev) => ({ ...prev, ...configPartial }));
    addAuditLog(
      'Actualización Claves API',
      'Configuración & Web',
      'Se han actualizado las claves de interconexión y producción de la plataforma.'
    );
    showToast('🔑 Claves de API e interconexión guardadas correctamente', 'success');
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
  };

  const addCustomPaymentMethod = (method: Omit<CustomPaymentMethod, 'id'>) => {
    const newMethod: CustomPaymentMethod = {
      ...method,
      id: `cpm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setConfig((prev) => {
      const currentList = prev.customPaymentMethods || [];
      return {
        ...prev,
        customPaymentMethods: [...currentList, newMethod],
      };
    });
    addAuditLog(
      'Creación Método de Pago Personalizado',
      'Configuración de Pagos',
      `Añadido nuevo método de pago: "${newMethod.name}" (${newMethod.currency})`
    );
    showToast(`Método de pago personalizado "${newMethod.name}" creado con éxito`, 'success');
  };

  const updateCustomPaymentMethod = (id: string, methodPartial: Partial<CustomPaymentMethod>) => {
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
  };

  const deleteCustomPaymentMethod = (id: string) => {
    const method = config.customPaymentMethods?.find((m) => m.id === id);
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
  };

  // Driver actions
  const approveDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'activo', rejectionReason: undefined } : d))
    );
    const drv = drivers.find((d) => d.id === driverId);
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
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'rechazado', rejectionReason: reason } : d))
    );
    const drv = drivers.find((d) => d.id === driverId);
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
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const isNowBlocked = d.status !== 'bloqueado';
          return {
            ...d,
            status: isNowBlocked ? 'bloqueado' : 'activo',
            blockReason: isNowBlocked ? reason || 'Bloqueado por el administrativo' : undefined,
          };
        }
        return d;
      })
    );
    const drv = drivers.find((d) => d.id === driverId);
    if (drv) {
      const isBlocked = drv.status !== 'bloqueado';
      addAuditLog(
        isBlocked ? 'Bloqueo de Conductor' : 'Desbloqueo de Conductor',
        'Gestión de Conductores',
        `${isBlocked ? 'Bloqueado' : 'Desbloqueado'}: ${drv.name}. ${reason ? 'Motivo: ' + reason : ''}`
      );
    }
    showToast('Estado del conductor actualizado', 'info');
  };

  const deleteDriver = (driverId: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    if (drv) {
      addAuditLog(
        'Eliminación de Conductor',
        'Gestión de Conductores',
        `Conductor ${drv.name} (Cédula: ${drv.documents.cedulaNumber}, Placa: ${drv.documents.plateNumber}, Categoría: ${drv.category}) eliminado del sistema.`
      );
      showToast(`Conductor ${drv.name} eliminado exitosamente`, 'warning');
    }
  };

  const updateDriverBalance = (driverId: string, amountUSD: number) => {
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
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const isNowBlocked = !c.isBlocked;
          return {
            ...c,
            isBlocked: isNowBlocked,
            blockReason: isNowBlocked ? reason || 'Bloqueado por el administrativo' : undefined,
          };
        }
        return c;
      })
    );
    const cli = clients.find((c) => c.id === clientId);
    if (cli) {
      addAuditLog(
        !cli.isBlocked ? 'Bloqueo de Cliente' : 'Desbloqueo de Cliente',
        'Gestión de Clientes',
        `${!cli.isBlocked ? 'Bloqueado' : 'Desbloqueado'}: ${cli.name}`
      );
    }
    showToast('Estado del cliente actualizado', 'info');
  };

  const updateClientBalance = (clientId: string, amountUSD: number) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, balanceUSD: c.balanceUSD + amountUSD } : c))
    );
    showToast(`Saldo del cliente ajustado en $${amountUSD.toFixed(2)}`, 'success');
  };

  const deleteClient = (clientId: string) => {
    const cli = clients.find((c) => c.id === clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    if (cli) {
      addAuditLog(
        'Eliminación de Pasajero',
        'Gestión de Clientes',
        `Cliente/Pasajero ${cli.name} (${cli.phone}, Email: ${cli.email}) eliminado del sistema.`
      );
      showToast(`Pasajero ${cli.name} eliminado exitosamente`, 'warning');
    }
  };

  // Payment actions
  const verifyPayment = (paymentId: string) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'verificado',
              verifiedBy: currentBackendUser?.name || 'Administrador',
              verifiedAt: new Date().toLocaleString('es-VE'),
            }
          : p
      )
    );

    // Automatically increase balance of driver or client
    if (pay.type === 'driver_commission') {
      updateDriverBalance(pay.entityId, pay.amountUSD);
    } else {
      updateClientBalance(pay.entityId, pay.amountUSD);
    }

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

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'rechazado',
              notes: `Rechazado: ${reason}`,
              verifiedBy: currentBackendUser?.name || 'Administrador',
              verifiedAt: new Date().toLocaleString('es-VE'),
            }
          : p
      )
    );

    addAuditLog(
      'Rechazo de Pago',
      'Verificación de Pagos',
      `Pago Ref: ${pay.referenceNumber} rechazado. Motivo: ${reason}`
    );

    showToast('Comprobante de pago rechazado', 'warning');
  };

  // Emergency actions
  const updateEmergencyStatus = (emergencyId: string, status: EmergencyStatus, notes?: string) => {
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

  const triggerSimulatedEmergency = (type: EmergencyType = 'sos') => {
    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    const newEmergency: EmergencyAlert = {
      id: `emg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      reporterType: 'conductor',
      reporterId: randomDriver.id,
      reporterName: randomDriver.name,
      reporterPhone: randomDriver.phone,
      category: randomDriver.category,
      vehicleInfo: `${randomDriver.documents.vehicleModel} - ${randomDriver.documents.plateNumber}`,
      plateNumber: randomDriver.documents.plateNumber,
      locationName: randomDriver.locationName,
      lat: randomDriver.lat + (Math.random() - 0.5) * 0.01,
      lng: randomDriver.lng + (Math.random() - 0.5) * 0.01,
      timestamp: new Date().toLocaleString('es-VE'),
      status: 'pendiente',
      notes: 'ALERTA EN TIEMPO REAL enviada desde la App de Conductor Vixy',
    };

    setEmergencies((prev) => [newEmergency, ...prev]);

    addAuditLog(
      'ALERTA DE EMERGENCIA RECIBIDA',
      'Alertas de Emergencia',
      `🚨 ALERTA DE ${type.toUpperCase()} enviada por conductor ${randomDriver.name} en ${randomDriver.locationName}`
    );

    showToast(`🚨 NOUVA ALERTA DE EMERGENCIA: ${type.toUpperCase()} de ${randomDriver.name}!`, 'error');
  };

  // Push notifications
  const sendPushNotification = (notif: Omit<PushNotification, 'id' | 'sentAt' | 'sentBy'>) => {
    const newNotif: PushNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sentAt: new Date().toLocaleString('es-VE'),
      sentBy: currentBackendUser?.name || 'Administrador',
    };
    setPushNotifications((prev) => [newNotif, ...prev]);
    addAuditLog(
      'Envío de Notificación Push',
      'Notificaciones Push',
      `Notificación enviada a grupo: [${notif.targetGroup.toUpperCase()}]. Título: ${notif.title}`
    );
    showToast('Notificación Push distribuida con éxito', 'success');
  };

  // Reviews
  const toggleFlagReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isFlagged: !r.isFlagged } : r))
    );
    showToast('Reporte de reseña actualizado', 'info');
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    addAuditLog('Eliminación de Reseña', 'Panel de Reseñas', `Eliminada reseña ID #${reviewId}`);
    showToast('Reseña eliminada', 'warning');
  };

  // Backend user management
  const addBackendUser = (userData: Omit<BackendUser, 'id' | 'createdAt' | 'lastLogin'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const usernameClean = userData.username
      ? userData.username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')
      : userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');

    const newUser: BackendUser = {
      ...userData,
      username: usernameClean,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: todayStr,
      lastLogin: 'Nunca',
      password: userData.password || '123456',
      mustChangePassword: userData.mustChangePassword !== undefined ? userData.mustChangePassword : true,
      passwordExpirationDays: userData.passwordExpirationDays || 90,
      passwordCreatedAt: todayStr,
    };
    setBackendUsers((prev) => [...prev, newUser]);
    addAuditLog(
      'Creación de Usuario Administrativo',
      'Niveles de Acceso',
      `Creado usuario @${newUser.username} - ${newUser.name} (${newUser.email}) con rol [${newUser.role}] y expiración de clave a ${newUser.passwordExpirationDays} días`
    );
    showToast(`Usuario @${newUser.username} (${newUser.name}) creado exitosamente`, 'success');
  };

  const updateBackendUserPermissions = (userId: string, permissions: BackendUserPermissions, role: AdminRole) => {
    setBackendUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions, role } : u))
    );
    addAuditLog(
      'Modificación de Permisos',
      'Niveles de Acceso',
      `Permisos modificados para usuario ID #${userId}`
    );
    showToast('Permisos de usuario actualizados', 'success');
  };

  const updateBackendUserPassword = (userId: string, newPass: string, expirationDays?: 30 | 90) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setBackendUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              password: newPass,
              passwordExpirationDays: expirationDays || u.passwordExpirationDays || 90,
              passwordCreatedAt: todayStr,
              mustChangePassword: true,
            }
          : u
      )
    );
    addAuditLog(
      'Actualización de Clave de Usuario',
      'Niveles de Acceso',
      `Nueva clave asignada a usuario ID #${userId}`
    );
    showToast('Clave de usuario actualizada correctamente', 'success');
  };

  const toggleBackendUserActive = (userId: string) => {
    setBackendUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
    showToast('Estado del usuario del backend modificado', 'info');
  };

  const deleteBackendUser = (userId: string) => {
    if (userId === 'usr-root') {
      showToast('El usuario Root principal no puede ser eliminado', 'error');
      return;
    }
    if (currentBackendUser && currentBackendUser.id === userId) {
      showToast('No puedes eliminar la cuenta con la que has iniciado sesión actualmente', 'error');
      return;
    }
    const usr = backendUsers.find((u) => u.id === userId);
    setBackendUsers((prev) => prev.filter((u) => u.id !== userId));
    if (usr) {
      addAuditLog(
        'Eliminación de Usuario Administrativo',
        'Niveles de Acceso',
        `Usuario administrativo ${usr.name} (@${usr.username || 'sin_alias'}, ${usr.email}, Rol: ${usr.role}) eliminado permanentemente.`
      );
      showToast(`Usuario administrativo ${usr.name} eliminado con éxito`, 'warning');
    }
  };

  // Auth & Root Password Functions
  const login = (usernameOrEmail: string, passInput: string) => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();

    // Check if root user
    if (cleanUser === 'root' || cleanUser === 'root@vhixy.site' || cleanUser === 'root@vixytaxi.com') {
      if (passInput === rootPassword) {
        const rootUser = backendUsers.find((u) => u.id === 'usr-root') || INITIAL_BACKEND_USERS[0];
        setCurrentBackendUser(rootUser);
        setIsAuthenticated(true);

        if (rootPassword === '123456') {
          setIsChangePasswordModalOpen(true);
          showToast('⚠️ ATENCIÓN: Debes cambiar la clave por primera vez', 'warning');
          return { success: true, mustChangePass: true, message: 'Ingreso como Root correcto. Debes cambiar la contraseña por primera vez.' };
        }

        showToast('¡Bienvenido Súperusuario Root!', 'success');
        return { success: true, mustChangePass: false };
      } else {
        showToast('Contraseña incorrecta.', 'error');
        return { success: false, message: 'Contraseña incorrecta.' };
      }
    }

    // Check other backend users by username, email, or name
    const foundUser = backendUsers.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanUser) ||
        u.email.toLowerCase() === cleanUser ||
        u.name.toLowerCase().includes(cleanUser)
    );

    if (foundUser) {
      if (!foundUser.isActive) {
        showToast('Este usuario se encuentra inactivo.', 'error');
        return { success: false, message: 'Usuario desactivado por la administración.' };
      }

      const expectedPass = foundUser.password || '123456';
      if (passInput !== expectedPass) {
        showToast('Contraseña incorrecta.', 'error');
        return { success: false, message: 'Contraseña de acceso incorrecta.' };
      }

      // Check password expiration (30 or 90 days)
      let isExpired = false;
      if (foundUser.passwordCreatedAt && foundUser.passwordExpirationDays) {
        const createdMs = new Date(foundUser.passwordCreatedAt).getTime();
        const nowMs = new Date().getTime();
        const diffDays = Math.floor((nowMs - createdMs) / (1000 * 60 * 60 * 24));
        if (diffDays >= foundUser.passwordExpirationDays) {
          isExpired = true;
        }
      }

      setCurrentBackendUser(foundUser);
      setIsAuthenticated(true);

      if (foundUser.mustChangePassword || isExpired) {
        setIsChangePasswordModalOpen(true);
        const alertMsg = isExpired ? 'Tu contraseña ha expirado (límite alcanzado)' : 'Debes cambiar tu contraseña en tu primer inicio de sesión';
        showToast(`⚠️ ${alertMsg}`, 'warning');
        return { success: true, mustChangePass: true, message: alertMsg };
      }

      showToast(`Bienvenido, ${foundUser.name}`, 'success');
      return { success: true };
    }

    showToast('Usuario o correo no encontrado', 'error');
    return { success: false, message: 'Credenciales inválidas.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Sesión cerrada correctamente', 'info');
  };

  const changeRootPassword = (oldPass: string, newPass: string) => {
    const currentPass = currentBackendUser?.id === 'usr-root' ? rootPassword : (currentBackendUser?.password || '123456');

    if (oldPass !== currentPass) {
      showToast('La contraseña actual ingresada es incorrecta', 'error');
      return { success: false, message: 'La contraseña actual no coincide.' };
    }
    if (newPass.trim().length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return { success: false, message: 'Mínimo 6 caracteres requeridos.' };
    }
    if (newPass === '123456') {
      showToast('Por seguridad, la nueva clave debe ser diferente a 123456', 'error');
      return { success: false, message: 'No puedes reutilizar la contraseña por defecto (123456).' };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (currentBackendUser?.id === 'usr-root') {
      setRootPassword(newPass);
    }

    // Also update in backendUsers state
    setBackendUsers((prev) =>
      prev.map((u) =>
        u.id === currentBackendUser?.id
          ? { ...u, password: newPass, mustChangePassword: false, passwordCreatedAt: todayStr }
          : u
      )
    );

    setCurrentBackendUser((prev) => ({
      ...prev,
      password: newPass,
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
        triggerSimulatedEmergency,
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
