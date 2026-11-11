import { ArrowUpRight, CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatMoney, isOverdue } from '../lib/format';
import type { LedgerRecord, Site, CurrencyCode } from '../types';

export default function SiteCard({ site, records, currency, index, onEdit, onDelete }: {
  site: Site;
  records: LedgerRecord[];
  currency: CurrencyCode;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const costs = records.filter((record) => record.type === 'expense').reduce((sum, record) => sum + record.amount, 0);
  const overdue = records.filter(isOverdue).reduce((sum, record) => sum + record.amount, 0);
  const progress = site.estimate > 0 ? Math.min(100, costs / site.estimate * 100) : 0;

  return (
    <article className="site-card enter-item" style={{ animationDelay: `${index * 70}ms`, '--site-accent': site.color } as CSSProperties}>
      <header className="site-card-head"><div className="site-name-block"><span className="site-mark" /><div><h2>{site.name}</h2><p className="site-location"><MapPin size={13} aria-hidden="true" />{site.location}</p></div></div><div className="site-actions"><button aria-label={`Edit ${site.name}`} className="icon-button" onClick={onEdit} title="Edit site"><Pencil size={15} /></button><button aria-label={`Delete ${site.name}`} className="icon-button icon-danger" onClick={onDelete} title="Delete site"><Trash2 size={15} /></button></div></header>
      <div className="site-card-info"><span>CLIENT <strong>{site.client || 'Not set'}</strong></span><span><CalendarDays size={13} aria-hidden="true" /> DEADLINE <strong>{formatDate(site.deadline)}</strong></span></div>
      <div className="site-progress-label"><span>Estimate used</span><strong>{progress.toFixed(0)}%</strong></div><div aria-label={`${progress.toFixed(0)} percent of estimate used`} className="progress-track" role="img"><span style={{ width: `${progress}%` }} /></div>
      <div className="site-card-metrics"><div><span>ESTIMATE</span><strong>{formatMoney(site.estimate, currency)}</strong></div><div><span>CURRENT COSTS</span><strong>{formatMoney(costs, currency)}</strong></div><div><span>CLIENT OVERDUE</span><strong className={overdue ? 'warning-text' : ''}>{formatMoney(overdue, currency)}</strong></div></div>
      <Link aria-label={`Open ${site.name}`} className="site-open-link" to={`/sites/${site.id}`}>Open project <ArrowUpRight size={15} /></Link>
    </article>
  );
}


