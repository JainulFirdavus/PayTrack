import type { CurrencyCode, LedgerRecord } from '../types';

export const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

export const dateOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

export const formatMoney = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string) => {
  if (!value) return 'No date';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export const isOverdue = (record: LedgerRecord) =>
  record.type === 'client_payment' && record.status === 'due' && Boolean(record.dueDate) && record.dueDate < today();

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;






import { ArrowRight, Building2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const { updateSettings } = useWorkspace();
  const [name, setName] = useState('Jordan Lee');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  if (user) return <Navigate replace to="/sites" />;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const displayName = name.trim();
    if (!displayName) {
      setError('Enter your name to open the demo workspace.');
      return;
    }
    login(displayName);
    updateSettings({ userName: displayName });
    const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/sites';
    navigate(destination, { replace: true });
  };

  return <main className="login-screen"><div className="login-layout"><section className="login-brand-panel"><div className="brand login-brand"><span className="brand-mark"><Building2 size={17} /></span><span>SITE LEDGER</span></div><div className="login-message"><span className="eyebrow">CONSTRUCTION FINANCE, CLEARLY</span><h1>Every site.<br />One clear picture.</h1><p>Keep estimates, site costs, client claims and due dates together, wherever the work takes you.</p></div><span className="login-footer-label">BUILT FOR THE PEOPLE WHO BUILD THINGS.</span></section><section className="login-form-panel"><div className="login-form-inner"><span className="eyebrow">DEMO WORKSPACE</span><h2>Welcome back</h2><p className="muted-copy">Enter a name to open your local construction dashboard.</p><form className="form-stack" onSubmit={submit}><label>Your name<input autoComplete="name" autoFocus onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="e.g. Jordan Lee" value={name} /></label>{error && <span className="form-error">{error}</span>}<button className="button button-primary login-submit" type="submit">Open workspace <ArrowRight size={16} /></button></form><p className="login-local-note">No password or account service is connected. Demo data remains in this browser.</p></div></section></div></main>;
}
 