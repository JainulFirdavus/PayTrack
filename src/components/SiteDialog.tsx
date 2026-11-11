import { useState, type FormEvent } from 'react';
import type { Site } from '../types';

type SiteValues = Omit<Site, 'id' | 'color'>;

export default function SiteDialog({ site, onClose, onSave }: {
  site?: Site;
  onClose: () => void;
  onSave: (values: SiteValues) => void;
}) {
  const [name, setName] = useState(site?.name ?? '');
  const [location, setLocation] = useState(site?.location ?? '');
  const [client, setClient] = useState(site?.client ?? '');
  const [estimate, setEstimate] = useState(site ? String(site.estimate) : '');
  const [deadline, setDeadline] = useState(site?.deadline ?? '');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ name: name.trim(), location: location.trim(), client: client.trim(), estimate: Number(estimate), deadline });
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="site-dialog-title" aria-modal="true" className="dialog-panel" role="dialog">
        <header className="dialog-heading"><div><span className="eyebrow">PROJECT DETAILS</span><h2 id="site-dialog-title">{site ? 'Edit site' : 'Add construction site'}</h2></div><button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button">×</button></header>
        <form className="form-stack" onSubmit={submit}>
          <label>Site / project name<input autoFocus maxLength={70} onChange={(event) => setName(event.target.value)} placeholder="Oak Avenue Apartments" required value={name} /></label>
          <div className="form-grid"><label>Location<input onChange={(event) => setLocation(event.target.value)} placeholder="Town, district or address" required value={location} /></label><label>Client<input onChange={(event) => setClient(event.target.value)} placeholder="Client or company" value={client} /></label></div>
          <div className="form-grid"><label>Project estimate<input min="0.01" onChange={(event) => setEstimate(event.target.value)} placeholder="0.00" required step="0.01" type="number" value={estimate} /></label><label>Project deadline<input onChange={(event) => setDeadline(event.target.value)} required type="date" value={deadline} /></label></div>
          <footer className="dialog-actions"><button className="button button-quiet" onClick={onClose} type="button">Cancel</button><button className="button button-primary" type="submit">{site ? 'Save changes' : 'Create site'}</button></footer>
        </form>
      </section>
    </div>
  );
}
