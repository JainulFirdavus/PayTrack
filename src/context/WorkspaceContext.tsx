import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoRecords, demoSites } from '../data/demo';
import { createId } from '../lib/format';
import type { CurrencyCode, LedgerRecord, Site, WorkspaceData, WorkspaceSettings } from '../types';

const DATA_KEY = 'site-ledger-workspace-v2';
const siteAccents = ['#d46b36', '#607d8b', '#c39435', '#8e5c4c'];
type NewSite = Omit<Site, 'id' | 'color'>;
type SitePatch = Partial<Omit<Site, 'id'>>;
type NewRecord = Omit<LedgerRecord, 'id'>;
type RecordPatch = Partial<Omit<LedgerRecord, 'id' | 'siteId'>>;
type WorkspaceContextValue = WorkspaceData & {
  addSite: (site: NewSite) => string;
  updateSite: (id: string, patch: SitePatch) => void;
  deleteSite: (id: string) => void;
  addRecord: (record: NewRecord) => void;
  updateRecord: (id: string, patch: RecordPatch) => void;
  deleteRecord: (id: string) => void;
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
};

const initialData = (): WorkspaceData => {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      const workspace = JSON.parse(saved) as WorkspaceData;
      return { ...workspace, sites: workspace.sites.map((site, index) => ({ ...site, color: siteAccents[index % siteAccents.length] })) };
    }
  } catch {
    localStorage.removeItem(DATA_KEY);
  }
  return { sites: demoSites, records: demoRecords, settings: { currency: 'USD', userName: 'Jordan Lee' } };
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WorkspaceData>(initialData);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  const value = useMemo<WorkspaceContextValue>(() => ({
    ...data,
    addSite: (site) => {
      const id = createId();
      setData((current) => ({
        ...current,
        sites: [...current.sites, { ...site, id, color: siteAccents[current.sites.length % siteAccents.length] }],
      }));
      return id;
    },
    updateSite: (id, patch) => setData((current) => ({
      ...current,
      sites: current.sites.map((site) => site.id === id ? { ...site, ...patch } : site),
    })),
    deleteSite: (id) => setData((current) => ({
      ...current,
      sites: current.sites.filter((site) => site.id !== id),
      records: current.records.filter((record) => record.siteId !== id),
    })),
    addRecord: (record) => setData((current) => ({ ...current, records: [{ ...record, id: createId() }, ...current.records] })),
    updateRecord: (id, patch) => setData((current) => ({
      ...current,
      records: current.records.map((record) => record.id === id ? { ...record, ...patch } : record),
    })),
    deleteRecord: (id) => setData((current) => ({ ...current, records: current.records.filter((record) => record.id !== id) })),
    updateSettings: (patch) => setData((current) => ({ ...current, settings: { ...current.settings, ...patch, currency: (patch.currency ?? current.settings.currency) as CurrencyCode } })),
  }), [data]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
}
 