import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../data/mockData';

interface AdminContextType {
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  
  drivers: Driver[];
  approveDriver: (driverId: string) => void;
  rejectDriver: (driverId: string, reason: string) => void;
  toggleBlockDriver: (driverId: string, reason?: string) => void;
  updateDriverBalance: (driverId: string, amountUSD: number) => void;
  notifyNegativeBalance: (driverId: string) => void;
  
  clients: Client[];
  toggleBlockClient: (clientId: string, reason?: string) => void;
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
  
  backendUsers: BackendUser[];
  addBackendUser: (user: Omit<BackendUser, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateBackendUserPermissions: (userId: string, permissions: BackendUserPermissions, role: AdminRole) => void;
  toggleBackendUserActive: (userId: string) => void;
  
  currentBackendUser: BackendUser;
  setCurrentBackendUser: (user: BackendUser) => void;
  
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
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_CONFIG;
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

  const [backendUsers, setBackendUsers] = useState<BackendUser[]>(() => {
    const saved = localStorage.getItem('vixy_backend_users');
    return saved ? JSON.parse(saved) : INITIAL_BACKEND_USERS;
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
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
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

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addAuditLog = (action: string, moduleName: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-VE'),
      adminUser: currentBackendUser.name,
      adminRole: currentBackendUser.role,
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
              verifiedBy: currentBackendUser.name,
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
              verifiedBy: currentBackendUser.name,
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
              resolvedBy: status === 'resuelto' ? currentBackendUser.name : e.resolvedBy,
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
      id: `emg-${Date.now()}`,
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
      id: `notif-${Date.now()}`,
      sentAt: new Date().toLocaleString('es-VE'),
      sentBy: currentBackendUser.name,
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
    const newUser: BackendUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Nunca',
    };
    setBackendUsers((prev) => [...prev, newUser]);
    addAuditLog(
      'Creación de Usuario Administrativo',
      'Niveles de Acceso',
      `Creado nuevo usuario ${newUser.name} (${newUser.email}) con rol [${newUser.role}]`
    );
    showToast(`Usuario ${newUser.name} creado exitosamente`, 'success');
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

  const toggleBackendUserActive = (userId: string) => {
    setBackendUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
    showToast('Estado del usuario del backend modificado', 'info');
  };

  // Auth & Root Password Functions
  const login = (usernameOrEmail: string, passInput: string) => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();

    // Check if root user
    if (cleanUser === 'root' || cleanUser === 'root@vixytaxi.com') {
      if (passInput === rootPassword) {
        const rootUser = backendUsers.find((u) => u.id === 'usr-root') || INITIAL_BACKEND_USERS[0];
        setCurrentBackendUser(rootUser);
        setIsAuthenticated(true);

        if (rootPassword === '123456') {
          setIsChangePasswordModalOpen(true);
          showToast('⚠️ ATENCIÓN: Debes cambiar la clave por primera vez (123456)', 'warning');
          return { success: true, mustChangePass: true, message: 'Ingreso como Root correcto. Debes cambiar la contraseña por primera vez.' };
        }

        showToast('¡Bienvenido Súperusuario Root!', 'success');
        return { success: true, mustChangePass: false };
      } else {
        showToast('Contraseña incorrecta para súperusuario root.', 'error');
        return { success: false, message: 'Contraseña incorrecta para súperusuario root.' };
      }
    }

    // Check other backend users
    const foundUser = backendUsers.find(
      (u) => u.email.toLowerCase() === cleanUser || u.name.toLowerCase().includes(cleanUser)
    );

    if (foundUser) {
      if (!foundUser.isActive) {
        showToast('Este usuario se encuentra inactivo.', 'error');
        return { success: false, message: 'Usuario desactivado por la administración.' };
      }
      setCurrentBackendUser(foundUser);
      setIsAuthenticated(true);
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
    if (oldPass !== rootPassword) {
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

    setRootPassword(newPass);
    setIsChangePasswordModalOpen(false);
    addAuditLog(
      'Cambio de Contraseña Root',
      'Seguridad y Accesos',
      'El súperusuario root ha cambiado su contraseña de inicio de sesión exitosamente.'
    );
    showToast('🔑 ¡Contraseña del Súperusuario Root actualizada exitosamente!', 'success');
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
        drivers,
        approveDriver,
        rejectDriver,
        toggleBlockDriver,
        updateDriverBalance,
        notifyNegativeBalance,
        clients,
        toggleBlockClient,
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
        backendUsers,
        addBackendUser,
        updateBackendUserPermissions,
        toggleBackendUserActive,
        currentBackendUser,
        setCurrentBackendUser,
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
