import { ArrowDownLeft, ArrowLeft, ArrowUpRight, BarChart3, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import RecordDialog from '../components/RecordDialog';
import RecordTable from '../components/RecordTable';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatDate, formatMoney, isOverdue } from '../lib/format';
import type { LedgerRecord, RecordType } from '../types';

type Tab = 'overview' | 'costs' | 'income' | 'client_payment';
const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'costs', label: 'Costs' },
  { key: 'income', label: 'Other income' },
  { key: 'client_payment', label: 'Client payments' },
];

export default function SitePage() {
  const { siteId = '' } = useParams();
  const { sites, records, settings, addRecord, updateRecord, deleteRecord } = useWorkspace();
  const site = sites.find((item) => item.id === siteId);
  const [tab, setTab] = useState<Tab>('overview');
  const [query, setQuery] = useState('');
  const [dialogType, setDialogType] = useState<RecordType | null>(null);
  const [editing, setEditing] = useState<LedgerRecord | undefined>();
  if (!site) return <Navigate replace to="/sites" />;

  const siteRecords = records.filter((record) => record.siteId === site.id);
  const costs = siteRecords.filter((record) => record.type === 'expense');
  const income = siteRecords.filter((record) => record.type === 'income');
  const payments = siteRecords.filter((record) => record.type === 'client_payment');
  const totalCosts = costs.reduce((sum, record) => sum + record.amount, 0);
  const received = siteRecords.filter((record) => record.type !== 'expense' && record.status === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const paidCosts = costs.filter((record) => record.status === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const overdueRows = payments.filter(isOverdue);
  const overdue = overdueRows.reduce((sum, record) => sum + record.amount, 0);
  const percentSpent = site.estimate ? Math.min(100, totalCosts / site.estimate * 100) : 0;
  const maxBar = Math.max(totalCosts, received, overdue, 1);
  const tabRecords = useMemo(() => siteRecords.filter((record) => tab === 'costs' ? record.type === 'expense' : tab === 'income' ? record.type === 'income' : tab === 'client_payment' ? record.type === 'client_payment' : true).filter((record) => `${record.description} ${record.party} ${record.category}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date)), [query, siteRecords, tab]);

  const openNew = (type: RecordType) => { setEditing(undefined); setDialogType(type); };
  const saveRecord = (values: Omit<LedgerRecord, 'id'>) => {
    if (editing) updateRecord(editing.id, values);
    else addRecord(values);
    setDialogType(null); setEditing(undefined);
  };
  const removeRecord = (record: LedgerRecord) => {
    if (window.confirm(`Delete "${record.description}"? This cannot be undone.`)) deleteRecord(record.id);
  };

  return <div className="page-stack site-page">
    <Link className="back-link" to="/sites"><ArrowLeft size={15} /> All sites</Link>
    <section className="page-intro site-intro"><div><span className="eyebrow">{site.location.toUpperCase()} <i>/</i> CLIENT: {(site.client || 'NOT SET').toUpperCase()}</span><h2>{site.name}</h2><p>Project deadline {formatDate(site.deadline)}</p></div><button className="button button-primary" onClick={() => openNew('expense')}><Plus size={16} /> Add record</button></section>
    <section className="metric-grid site-metric-grid"><MetricCard detail="Approved project value" label="ESTIMATE" value={formatMoney(site.estimate, settings.currency)} /><MetricCard detail={`${costs.length} cost records`} label="CURRENT COSTS" value={formatMoney(totalCosts, settings.currency)} /><MetricCard detail={`${overdueRows.length} overdue claims`} label="CLIENT OVERDUE" tone={overdue ? 'warning' : 'default'} value={formatMoney(overdue, settings.currency)} /><MetricCard detail="Received less paid costs" label="CASH POSITION" tone={received - paidCosts >= 0 ? 'positive' : 'warning'} value={formatMoney(received - paidCosts, settings.currency)} /></section>
    <nav aria-label="Site ledger sections" className="tabs">{tabs.map((item) => <button aria-current={tab === item.key ? 'page' : undefined} className={tab === item.key ? 'tab-button tab-active' : 'tab-button'} key={item.key} onClick={() => { setTab(item.key); setQuery(''); }}>{item.label}{item.key === 'client_payment' && overdueRows.length > 0 && <span className="tab-count">{overdueRows.length}</span>}</button>)}</nav>
    {tab === 'overview' ? <>
      <section className="chart-panel"><div className="chart-panel-heading"><div><span className="eyebrow">SITE PERFORMANCE</span><h3>Estimate and cash movement</h3></div><span className="chart-usage">{percentSpent.toFixed(0)}% <small>of estimate spent</small></span></div><div className="estimate-progress"><span style={{ width: `${percentSpent}%` }} /></div><div className="estimate-meta"><span>Costs {formatMoney(totalCosts, settings.currency)}</span><span>Estimate {formatMoney(site.estimate, settings.currency)}</span></div><div aria-label="Site cash movement comparison" className="chart-columns" role="img"><div className="chart-column"><strong>{formatMoney(received, settings.currency)}</strong><span className="chart-bar bar-income" style={{ height: `${Math.max(8, received / maxBar * 100)}%` }} /><small>Received</small></div><div className="chart-column"><strong>{formatMoney(totalCosts, settings.currency)}</strong><span className="chart-bar bar-cost" style={{ height: `${Math.max(8, totalCosts / maxBar * 100)}%` }} /><small>Costs</small></div><div className="chart-column"><strong>{formatMoney(overdue, settings.currency)}</strong><span className="chart-bar bar-overdue" style={{ height: `${Math.max(8, overdue / maxBar * 100)}%` }} /><small>Overdue</small></div></div></section>
      <section className="quick-add"><div><span className="eyebrow">RECORD SITE ACTIVITY</span><h3>Quick add</h3></div><div className="quick-add-actions"><button className="button button-quiet" onClick={() => openNew('expense')}><ArrowUpRight size={15} /> Cost</button><button className="button button-quiet" onClick={() => openNew('income')}><ArrowDownLeft size={15} /> Income</button><button className="button button-quiet" onClick={() => openNew('client_payment')}><Plus size={15} /> Client payment</button></div></section>
      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h3>Recent site records</h3></div><button className="text-button" onClick={() => setTab('costs')}>Open ledger <ArrowUpRight size={14} /></button></div><RecordTable currency={settings.currency} onDelete={removeRecord} onEdit={(record) => { setEditing(record); setDialogType(record.type); }} records={siteRecords.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)} /></section>
    </> : <section className="section-block"><div className="section-heading"><div><span className="eyebrow">{tab === 'costs' ? 'LABOR, MATERIALS, EQUIPMENT & MORE' : tab === 'income' ? 'VARIATIONS AND OTHER RECEIPTS' : 'CLAIMS, PAYMENTS AND DUE DATES'}</span><h3>{tabs.find((item) => item.key === tab)?.label}</h3></div><button className="button button-primary" onClick={() => openNew(tab === 'costs' ? 'expense' : tab === 'income' ? 'income' : 'client_payment')}><Plus size={15} /> Add {tab === 'costs' ? 'cost' : tab === 'income' ? 'income' : 'payment'}</button></div><label className="search-field ledger-search"><Search size={16} /><input aria-label="Search site records" onChange={(event) => setQuery(event.target.value)} placeholder="Search description, category or company" value={query} /></label><RecordTable currency={settings.currency} onDelete={removeRecord} onEdit={(record) => { setEditing(record); setDialogType(record.type); }} records={tabRecords} /></section>}
    <p className="data-footnote"><BarChart3 size={13} /> Totals update from this site's records only.</p>
    {dialogType && <RecordDialog currency={settings.currency} initialType={dialogType} onClose={() => { setDialogType(null); setEditing(undefined); }} onSave={saveRecord} record={editing} siteId={site.id} />}
  </div>;
}
