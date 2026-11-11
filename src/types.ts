export type Site = {
  id: string;
  name: string;
  location: string;
  client: string;
  estimate: number;
  deadline: string;
  color: string;
};

export type RecordType = 'expense' | 'income' | 'client_payment';
export type RecordStatus = 'paid' | 'due';

export type LedgerRecord = {
  id: string;
  siteId: string;
  type: RecordType;
  category: string;
  description: string;
  party: string;
  amount: number;
  date: string;
  dueDate: string;
  status: RecordStatus;
};

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

export type WorkspaceSettings = {
  currency: CurrencyCode;
  userName: string;
};

export type WorkspaceData = {
  sites: Site[];
  records: LedgerRecord[];
  settings: WorkspaceSettings;
};
 