import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import UserProfileEditPage from './pages/UserProfileEditPage';
import RolesPage from './pages/RolesPage';
import RoleDetailPage from './pages/RoleDetailPage';
import AuditLogsPage from './pages/AuditLogsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile/edit" element={<UserProfileEditPage />} />
        <Route path="users">
          <Route index element={<UsersPage />} />
          <Route path=":id" element={<UserDetailPage />} />
        </Route>
        <Route path="roles">
          <Route index element={<RolesPage />} />
          <Route path=":id" element={<RoleDetailPage />} />
        </Route>
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
