import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import ChooseRole from "./pages/ChooseRole";
import LoginCustomer from "./pages/auth/LoginCustomer";
import LoginAdmin from "./pages/auth/LoginAdmin";
import RegisterCustomer from "./pages/auth/RegisterCustomer";
import RegisterAdmin from "./pages/auth/RegisterAdmin";
import ForgotPassword from "./pages/auth/ForgotPassword";

import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerFraudDetector from "./pages/customer/FraudDetector";
import CustomerChatbot from "./pages/customer/Chatbot";
import CustomerHistory from "./pages/customer/History";
import CustomerReports from "./pages/customer/Reports";
import CustomerProfile from "./pages/customer/Profile";
import CustomerSettings from "./pages/customer/Settings";
import CustomerNews from "./pages/customer/CustomerNews";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAlerts from "./pages/admin/Alerts";
import AdminAnalytics from "./pages/admin/Analytics";

import AdminCases from "./pages/admin/Cases";
import AdminReports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";
import AdminSettings from "./pages/admin/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/choose-role" element={<ChooseRole />} />
      <Route path="/login" element={<Navigate to="/choose-role" replace />} />
      <Route path="/register" element={<Navigate to="/choose-role" replace />} />
      <Route path="/login/customer" element={<LoginCustomer />} />
      <Route path="/login/admin" element={<LoginAdmin />} />
      <Route path="/register/customer" element={<RegisterCustomer />} />
      <Route path="/register/admin" element={<RegisterAdmin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/customer"
        element={
          <ProtectedRoute role="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        
        {/* ADDED MISSING FRAUD DETECTOR ROUTE */}
        <Route path="fraud-detector" element={<CustomerFraudDetector />} />
        
        <Route path="chatbot" element={<CustomerChatbot />} />
        <Route path="history" element={<CustomerHistory />} />
        <Route path="reports" element={<CustomerReports />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="settings" element={<CustomerSettings />} />
        <Route path="news" element={<CustomerNews />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        
        <Route path="cases" element={<AdminCases />} />
        
        <Route path="reports" element={<AdminReports />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}