import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import SitePage from './pages/SitePage';
import SitesPage from './pages/SitesPage';
import RequireAuth from './routes/RequireAuth';

export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route element={user ? <Navigate replace to="/sites" /> : <LoginPage />} path="/login" />
    <Route element={<RequireAuth />}>
      <Route element={<AppShell />}>
        <Route element={<Navigate replace to="/sites" />} index />
        <Route element={<SitesPage />} path="/sites" />
        <Route element={<SitePage />} path="/sites/:siteId" />
        <Route element={<SettingsPage />} path="/settings" />
      </Route>
    </Route>
    <Route element={<Navigate replace to={user ? '/sites' : '/login'} />} path="*" />
  </Routes>;
}