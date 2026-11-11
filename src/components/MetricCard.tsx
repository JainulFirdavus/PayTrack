

import type { ReactNode } from 'react';

export default function MetricCard({ label, value, detail, icon, tone = 'default' }: {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: 'default' | 'warning' | 'positive';
}) {
  return <article className={`metric-card metric-${tone}`}><div className="metric-card-top"><span className="metric-label">{label}</span>{icon && <span className="metric-icon">{icon}</span>}</div><strong className="metric-value">{value}</strong>{detail && <span className="metric-detail">{detail}</span>}</article>;
}
 
 