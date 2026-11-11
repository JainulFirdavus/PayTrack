import { AlertTriangle, BriefcaseBusiness, CircleDollarSign, Plus, Search, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard';
import SiteCard from '../components/SiteCard';
import SiteDialog from '../components/SiteDialog';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatMoney, isOverdue } from '../lib/format';
import type { Site } from '../types';

export default function SitesPage() {
  const { sites, records, settings, addSite, updateSite, deleteSite } = useWorkspace();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Site | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const expenses = records.filter((record) => record.type === 'expense');
  const overdueRecords = records.filter(isOverdue);
  const received = records.filter((record) => record.type !== 'expense' && record.status === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const paidCosts = expenses.filter((record) => record.status === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const totalEstimate = sites.reduce((sum, site) => sum + site.estimate, 0);
  const totalCosts = expenses.reduce((sum, record) => sum + record.amount, 0);
  const overdueTotal = overdueRecords.reduce((sum, record) => sum + record.amount, 0);
  const visibleSites = useMemo(() => sites.filter((site) => `${site.name} ${site.location} ${site.client}`.toLowerCase().includes(query.toLowerCase())), [query, sites]);

  const saveSite = (values: Omit<Site, 'id' | 'color'>) => {
    if (editing) updateSite(editing.id, values);
    else addSite(values);
    setEditing(undefined);
    setIsDialogOpen(false);
  };

  const removeSite = (site: Site) => {
    if (window.confirm(`Delete ${site.name} and all of its site records? This cannot be undone.`)) deleteSite(site.id);
  };

  return <div className="page-stack">
    <section className="page-intro"><div><span className="eyebrow">YOUR ACTIVE WORK</span><h2>Sites at a glance</h2><p>Financial health across {sites.length} construction {sites.length === 1 ? 'site' : 'sites'}.</p></div><button className="button button-primary" onClick={() => { setEditing(undefined); setIsDialogOpen(true); }}><Plus size={16} /> Add site</button></section>
    <section aria-label="Portfolio totals" className="metric-grid"><MetricCard detail="Across active sites" icon={<BriefcaseBusiness size={16} />} label="PROJECT ESTIMATES" value={formatMoney(totalEstimate, settings.currency)} /><MetricCard detail="Paid and outstanding" icon={<CircleDollarSign size={16} />} label="CURRENT COSTS" value={formatMoney(totalCosts, settings.currency)} /><MetricCard detail={`${overdueRecords.length} overdue ${overdueRecords.length === 1 ? 'claim' : 'claims'}`} icon={<AlertTriangle size={16} />} label="CLIENT OVERDUE" tone={overdueTotal ? 'warning' : 'default'} value={formatMoney(overdueTotal, settings.currency)} /><MetricCard detail="Received less paid costs" icon={<WalletCards size={16} />} label="CASH POSITION" tone="positive" value={formatMoney(received - paidCosts, settings.currency)} /></section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">PROJECT REGISTER</span><h3>Construction sites</h3></div><span className="count-label">{visibleSites.length} OF {sites.length} SITES</span></div><label className="search-field"><Search size={16} /><input aria-label="Search construction sites" onChange={(event) => setQuery(event.target.value)} placeholder="Search site, location or client" value={query} /></label>
      {visibleSites.length ? <div className="site-grid">{visibleSites.map((site, index) => <SiteCard currency={settings.currency} index={index} key={site.id} onDelete={() => removeSite(site)} onEdit={() => { setEditing(site); setIsDialogOpen(true); }} records={records.filter((record) => record.siteId === site.id)} site={site} />)}</div> : <div className="empty-state"><span className="empty-icon"><BriefcaseBusiness size={20} /></span><h3>{sites.length ? 'No matching sites' : 'No sites added yet'}</h3><p>{sites.length ? 'Try another search.' : 'Add a construction site to start tracking its estimate, costs and client claims.'}</p>{!sites.length && <button className="button button-primary" onClick={() => setIsDialogOpen(true)}><Plus size={15} /> Add your first site</button>}</div>}
    </section>
    <p className="data-footnote">Demo figures are examples. Records are saved in this browser only.</p>
    {isDialogOpen && <SiteDialog onClose={() => { setIsDialogOpen(false); setEditing(undefined); }} onSave={saveSite} site={editing} />}
  </div>;
}