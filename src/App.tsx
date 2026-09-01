import React from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { DriverManagement } from './components/DriverManagement';
import { ClientManagement } from './components/ClientManagement';
import { PaymentVerification } from './components/PaymentVerification';
import { MapView } from './components/MapView';
import { EmergencyAlertsView } from './components/EmergencyAlertsView';
import { FinancialSettings } from './components/FinancialSettings';
import { EarningsAuditView } from './components/EarningsAuditView';
import { PushNotificationsView } from './components/PushNotificationsView';
import { ReviewsPanel } from './components/ReviewsPanel';
import { UserPermissionsView } from './components/UserPermissionsView';
import { AuditLogsView } from './components/AuditLogsView';
import { ToastNotification } from './components/ToastNotification';
import { LoginScreen } from './components/LoginScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { WebDeploymentGuideModal } from './components/WebDeploymentGuideModal';

const MainContent: React.FC = () => {
  const { activeTab, currentBackendUser } = useAdmin();
  const p = currentBackendUser?.permissions;

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {activeTab === 'dashboard' && p?.dashboard && <DashboardOverview />}
      {(activeTab === 'drivers' || activeTab === 'drivers_negative') && p?.drivers && (
        <DriverManagement initialFilter={activeTab} />
      )}
      {activeTab === 'clients' && p?.clients && <ClientManagement />}
      {activeTab === 'payments' && p?.payments && <PaymentVerification />}
      {activeTab === 'map' && p?.map && <MapView />}
      {activeTab === 'emergencies' && p?.emergencies && <EmergencyAlertsView />}
      {activeTab === 'financesConfig' && p?.financesConfig && <FinancialSettings />}
      {activeTab === 'earningsAudit' && p?.earningsAudit && <EarningsAuditView />}
      {activeTab === 'notifications' && p?.notifications && <PushNotificationsView />}
      {activeTab === 'reviews' && p?.reviews && <ReviewsPanel />}
      {activeTab === 'userManagement' && p?.userManagement && <UserPermissionsView />}
      {activeTab === 'auditLogs' && p?.auditLogs && <AuditLogsView />}
    </main>
  );
};

const AppContainer: React.FC = () => {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black">
        <Sidebar />
        <MainContent />
      </div>
      <ChangePasswordModal />
      <WebDeploymentGuideModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <AppContainer />
    </AdminProvider>
  );
}
