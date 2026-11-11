import { Building2, CircleUserRound, LayoutDashboard, LogOut, Settings2 } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

export default function AppShell() {
  const { user, logout } = useAuth();
  const { settings } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const isSite = location.pathname.startsWith('/sites/');

  return <div className="app-shell">
    <aside className="sidebar"><NavLink aria-label="Site Ledger home" className="brand" to="/sites"><span className="brand-mark"><Building2 size={17} /></span><span>SITE LEDGER</span></NavLink><span className="nav-caption">WORKSPACE</span><nav className="primary-nav"><NavLink className={({ isActive }) => `nav-link ${isActive && !isSite ? 'nav-active' : ''}`} end to="/sites"><LayoutDashboard size={17} /><span>Portfolio</span></NavLink><NavLink className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`} to="/settings"><Settings2 size={17} /><span>Settings</span></NavLink></nav><div className="sidebar-account"><span className="account-avatar"><CircleUserRound size={17} /></span><div className="account-user"><strong>{settings.userName || user?.name || 'Site manager'}</strong><span>Site manager</span></div><button aria-label="Sign out" className="icon-button" onClick={() => { logout(); navigate('/login'); }} title="Sign out"><LogOut size={16} /></button></div></aside>
    <div className="main-column"><header className="topbar"><div className="topbar-heading"><span aria-hidden="true" className="mobile-topbar-mark"><Building2 size={17} /></span><div><span className="topbar-label">{isSite ? 'PROJECT WORKSPACE' : 'CONSTRUCTION OPERATIONS'}</span><h1>{isSite ? 'Site ledger' : 'Project portfolio'}</h1></div></div><div className="topbar-user"><span>Good day, {(settings.userName || user?.name || 'Manager').split(' ')[0]}</span><span className="topbar-avatar">{(settings.userName || user?.name || 'M').slice(0, 1).toUpperCase()}</span></div></header><main className="page-content"><div className="route-enter" key={location.pathname}><Outlet /></div></main></div>
    <nav aria-label="Main navigation" className="mobile-nav mobile-nav--03"><NavLink className={({ isActive }) => `mobile-nav-link ${isActive && !isSite ? 'mobile-active' : ''}`} end to="/sites"><LayoutDashboard size={19} /><span>Sites</span></NavLink><NavLink className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-active' : ''}`} to="/settings"><Settings2 size={19} /><span>Settings</span></NavLink><button className="mobile-nav-link" onClick={() => { logout(); navigate('/login'); }}><LogOut size={19} /><span>Sign out</span></button></nav>
  </div>;
}
