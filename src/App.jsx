import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import CustomerProfile from './pages/CustomerProfile';
import FinanceAccounts from './pages/FinanceAccounts';
import CreateFinanceAccount from './pages/CreateFinanceAccount';
import WeeklyCollections from './pages/WeeklyCollections';
import CollectionLedger from './pages/CollectionLedger';
import PaymentHistory from './pages/PaymentHistory';
import Reports from './pages/Reports';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import RouteManagement from './pages/RouteManagement';
import Expenses from './pages/Expenses';
import Investments from './pages/Investments';
import CashFlow from './pages/CashFlow';
import StaffSalary from './pages/StaffSalary';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public login route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated application layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            
            {/* Dedicated Role Dashboard Routes */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="collector/dashboard" element={<CollectorDashboard />} />
            <Route path="auditor/dashboard" element={<AuditorDashboard />} />

            <Route path="customers" element={<Customers />} />
            <Route path="customers/new" element={<AddCustomer />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="accounts" element={<FinanceAccounts />} />
            <Route path="accounts/new" element={<CreateFinanceAccount />} />
            <Route path="collections" element={<WeeklyCollections />} />
            <Route path="ledger" element={<CollectionLedger />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="routes" element={<RouteManagement />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="investments" element={<Investments />} />
            <Route path="cashflow" element={<CashFlow />} />
            <Route path="salary" element={<StaffSalary />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
