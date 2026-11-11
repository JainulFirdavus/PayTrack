
import { Save, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { CurrencyCode } from '../types';

const currencies: { code: CurrencyCode; name: string }[] = [
  { code: 'USD', name: 'US Dollar' }, { code: 'GBP', name: 'British Pound' }, { code: 'EUR', name: 'Euro' }, { code: 'CAD', name: 'Canadian Dollar' }, { code: 'AUD', name: 'Australian Dollar' },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useWorkspace();
  const [name, setName] = useState(settings.userName);
  const [saved, setSaved] = useState(false);
  useEffect(() => setName(settings.userName), [settings.userName]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings({ userName: name.trim() || 'Site manager' });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return <div className="page-stack settings-page"><section className="page-intro"><div><span className="eyebrow">WORKSPACE PREFERENCES</span><h2>Settings</h2><p>Update how your construction workspace is displayed.</p></div></section>
    <form className="settings-panel" onSubmit={submit}><section className="settings-section"><div className="settings-section-heading"><span className="settings-section-icon"><ShieldCheck size={17} /></span><div><h3>Profile</h3><p>Personal details for this browser workspace.</p></div></div><label className="settings-label">DISPLAY NAME<input autoComplete="name" maxLength={70} onChange={(event) => setName(event.target.value)} value={name} /></label></section>
      <section className="settings-section"><div className="settings-section-heading"><span className="settings-section-icon currency-symbol">$</span><div><h3>Display currency</h3><p>Used for site estimates, costs and income.</p></div></div><label className="settings-label">CURRENCY<select onChange={(event) => updateSettings({ currency: event.target.value as CurrencyCode })} value={settings.currency}>{currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} - {currency.name}</option>)}</select></label></section>
      <section className="settings-section settings-storage"><div><h3>Browser storage</h3><p>Sites and ledger records are stored in this browser. There is no cloud sync or team account in this demo.</p></div><span className="storage-status"><span /> Saved locally</span></section>
      <footer className="settings-footer"><button className="button button-primary" type="submit"><Save size={15} /> {saved ? 'Saved' : 'Save profile'}</button></footer>
    </form>
  </div>;
}
