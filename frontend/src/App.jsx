import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminDeposits from './pages/admin/AdminDeposits';
import Expenses from './pages/admin/Expenses';
import AdminReports from './pages/admin/AdminReports';
import Settings from './pages/admin/Settings';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberDeposits from './pages/member/MemberDeposits';
import MemberReport from './pages/member/MemberReport';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'member' ? '/member/dashboard' : '/admin/dashboard'} replace />;
}

function AdminLayout({ children }) {
  return (
    <ProtectedRoute roles={['admin', 'account']}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function MemberLayout({ children }) {
  return (
    <ProtectedRoute roles={['member', 'admin', 'account']}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
          <Route path="/admin/deposits" element={<AdminLayout><AdminDeposits /></AdminLayout>} />
          <Route path="/admin/expenses" element={<AdminLayout><Expenses /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
          <Route path="/member/dashboard" element={<MemberLayout><MemberDashboard /></MemberLayout>} />
          <Route path="/member/deposits" element={<MemberLayout><MemberDeposits /></MemberLayout>} />
          <Route path="/member/report" element={<MemberLayout><MemberReport /></MemberLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
