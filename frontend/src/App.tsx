import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import HomePage from "./pages/HomePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import CommitteeDashboard from "./pages/committees/CommitteeDashboard";
import NotFoundPage from "./pages/NotFoundPage";

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow"><Outlet /></main>
    <Footer />
  </div>
);

const MustChangePwdGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mustChangePassword, isAuthenticated } = useAuth();
  if (isAuthenticated && mustChangePassword) return <Navigate to="/change-password" replace />;
  return <>{children}</>;
};

const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><MustChangePwdGuard><NotificationsPage /></MustChangePwdGuard></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MustChangePwdGuard><SettingsPage /></MustChangePwdGuard></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><MustChangePwdGuard><UserDashboard /></MustChangePwdGuard></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><MustChangePwdGuard><AdminDashboard /></MustChangePwdGuard></ProtectedRoute>} />
          <Route path="/committee/:committeeId" element={<ProtectedRoute><MustChangePwdGuard><CommitteeDashboard /></MustChangePwdGuard></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </AuthProvider>
);

export default App;

