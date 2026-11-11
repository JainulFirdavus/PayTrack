import { useState, type FormEvent } from 'react';
import { today } from '../lib/format';
import type { LedgerRecord, RecordType } from '../types';

const expenseCategories = ['Labor', 'Materials', 'Equipment', 'Subcontractor', 'Permits', 'Other'];
const incomeCategories = ['Variation', 'Other income'];
const paymentCategories = ['Progress claim', 'Deposit', 'Stage payment', 'Retention'];
type RecordValues = Omit<LedgerRecord, 'id'>;

export default function RecordDialog({ siteId, record, initialType = 'expense', currency, onClose, onSave }: {
  siteId: string;
  record?: LedgerRecord;
  initialType?: RecordType;
  currency: string;
  onClose: () => void;
  onSave: (values: RecordValues) => void;
}) {
  const [type, setType] = useState<RecordType>(record?.type ?? initialType);
  const [category, setCategory] = useState(record?.category ?? (initialType === 'expense' ? 'Labor' : initialType === 'income' ? 'Variation' : 'Progress claim'));
  const [description, setDescription] = useState(record?.description ?? '');
  const [party, setParty] = useState(record?.party ?? '');
  const [amount, setAmount] = useState(record ? String(record.amount) : '');
  const [date, setDate] = useState(record?.date ?? today());
  const [dueDate, setDueDate] = useState(record?.dueDate ?? '');
  const [status, setStatus] = useState<LedgerRecord['status']>(record?.status ?? (initialType === 'expense' ? 'paid' : 'due'));

  const categories = type === 'expense' ? expenseCategories : type === 'income' ? incomeCategories : paymentCategories;
  const changeType = (next: RecordType) => {
    setType(next);
    setCategory(next === 'expense' ? 'Labor' : next === 'income' ? 'Variation' : 'Progress claim');
    if (next === 'expense' && !record) setStatus('paid');
    if (next !== 'expense' && !record) setStatus('due');
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ siteId, type, category, description: description.trim(), party: party.trim(), amount: Number(amount), date, dueDate: status === 'due' || type === 'client_payment' ? dueDate : '', status });
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="record-dialog-title" aria-modal="true" className="dialog-panel dialog-panel-wide" role="dialog">
        <header className="dialog-heading"><div><span className="eyebrow">{record ? 'UPDATE SITE LEDGER' : 'SITE LEDGER ENTRY'}</span><h2 id="record-dialog-title">{record ? 'Edit record' : 'Add a record'}</h2></div><button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button">×</button></header>
        <form className="form-stack" onSubmit={submit}>
          <fieldset className="segmented-control"><legend>Record type</legend>{([{ key: 'expense', label: 'Cost' }, { key: 'income', label: 'Income' }, { key: 'client_payment', label: 'Client payment' }] as { key: RecordType; label: string }[]).map((item) => <button aria-pressed={type === item.key} className={type === item.key ? 'segment active' : 'segment'} key={item.key} onClick={() => changeType(item.key)} type="button">{item.label}</button>)}</fieldset>
          <div className="form-grid"><label>Category<select onChange={(event) => setCategory(event.target.value)} value={category}>{categories.map((option) => <option key={option}>{option}</option>)}</select></label><label>Amount ({currency})<input min="0.01" onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required step="0.01" type="number" value={amount} /></label></div>
          <label>Description<input autoFocus maxLength={90} onChange={(event) => setDescription(event.target.value)} placeholder={type === 'expense' ? 'e.g. Concrete delivery' : 'e.g. Stage 2 progress claim'} required value={description} /></label>
          <div className="form-grid"><label>{type === 'client_payment' ? 'Client' : type === 'expense' ? 'Supplier / crew' : 'Income source'}<input onChange={(event) => setParty(event.target.value)} placeholder="Person or company" required value={party} /></label><label>Record date<input onChange={(event) => setDate(event.target.value)} required type="date" value={date} /></label></div>
          <div className="form-grid"><label>Status<select onChange={(event) => setStatus(event.target.value as LedgerRecord['status'])} value={status}><option value="paid">{type === 'expense' ? 'Paid' : 'Received'}</option><option value="due">Outstanding</option></select></label>{(status === 'due' || type === 'client_payment') && <label>Due date<input onChange={(event) => setDueDate(event.target.value)} required type="date" value={dueDate} /></label>}</div>
          <p className="form-note">This entry belongs only to the selected construction site.</p>
          <footer className="dialog-actions"><button className="button button-quiet" onClick={onClose} type="button">Cancel</button><button className="button button-primary" type="submit">{record ? 'Save changes' : 'Add record'}</button></footer>
        </form>
      </section>
    </div>
  );
}



