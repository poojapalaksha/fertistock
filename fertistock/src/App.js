import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import DashboardPage from './components/DashboardPage';
import InventoryPage from './components/InventoryPage';
import SalesBillingPage from './components/SalesBillingPage';
import StockManagementPage from './components/StockManagementPage';
import { StockEntryPage } from './components/StockEntryPage';
import NotificationsPage from './components/NotificationsPage';
import BackupPage from './components/BackupPage';
import SignInPage from './components/SignInPage';
import Invoice from './components/Invoice';
import Report from './components/Report'; // Import the Report component
import ReportPage from './components/ReportPage';


import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public/Home Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<SignInPage />} />

        {/* Admin and User Dashboards */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Inventory and Stock */}
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/stock" element={<StockManagementPage />} />
        <Route path="/stock/entry" element={<StockEntryPage />} />

        {/* Sales and Invoice */}
        <Route path="/sales" element={<SalesBillingPage />} />
        <Route path="/invoice" element={<Invoice />} />

        {/* Other Pages */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/report" element={<Report />} />
        <Route path="/reportpage" element={<ReportPage />} />
        <Route path="/backup" element={<BackupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
