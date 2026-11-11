import { ArrowDownLeft, ArrowUpRight, Pencil, Share2, Trash2 } from 'lucide-react';
import { formatDate, formatMoney, isOverdue } from '../lib/format';
import type { CurrencyCode, LedgerRecord } from '../types';

export default function RecordTable({ records, currency, onEdit, onDelete }: {
  records: LedgerRecord[];
  currency: CurrencyCode;
  onEdit: (record: LedgerRecord) => void;
  onDelete: (record: LedgerRecord) => void;
}) {
  const share = async (record: LedgerRecord) => {
    const text = `${record.description}\n${record.category} / ${record.party}\n${formatMoney(record.amount, currency)}\n${record.status === 'due' ? `Due ${formatDate(record.dueDate)}` : 'Paid / received'}`;
    try {
      if (navigator.share) await navigator.share({ title: record.description, text });
      else {
        await navigator.clipboard.writeText(text);
        window.alert('Record details copied. Paste them into a message.');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') window.alert('Could not share this record.');
    }
  };

  if (records.length === 0) return <div className="empty-inline"><strong>No records in this view</strong><span>New records will be linked to this site.</span></div>;

  return <div className="record-list">{records.map((record, index) => {
    const overdue = isOverdue(record);
    const expense = record.type === 'expense';
    return <article className="record-row enter-item" key={record.id} style={{ animationDelay: `${index * 35}ms` }}>
      <span className={`record-kind ${expense ? 'kind-cost' : 'kind-income'}`}>{expense ? <ArrowUpRight size={17} /> : <ArrowDownLeft size={17} />}</span>
      <div className="record-primary"><strong>{record.description}</strong><span>{record.category} <i>/</i> {record.party}</span><span className="record-date">{formatDate(record.date)}{record.dueDate ? ` · Due ${formatDate(record.dueDate)}` : ''}</span></div>
      <div className="record-status-wrap"><span className={`status-pill ${overdue ? 'status-overdue' : record.status === 'due' ? 'status-due' : 'status-paid'}`}>{overdue ? 'Overdue' : record.status === 'due' ? 'Outstanding' : expense ? 'Paid' : 'Received'}</span></div>
      <strong className={`record-amount ${expense ? 'amount-out' : 'amount-in'}`}>{expense ? '-' : '+'}{formatMoney(record.amount, currency)}</strong>
      <div className="record-actions"><button aria-label={`Share ${record.description}`} className="icon-button" onClick={() => share(record)} title="Share details"><Share2 size={15} /></button><button aria-label={`Edit ${record.description}`} className="icon-button" onClick={() => onEdit(record)} title="Edit record"><Pencil size={15} /></button><button aria-label={`Delete ${record.description}`} className="icon-button icon-danger" onClick={() => onDelete(record)} title="Delete record"><Trash2 size={15} /></button></div>
    </article>;
  })}</div>;
}