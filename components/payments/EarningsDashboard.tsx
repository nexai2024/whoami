import React, { useEffect, useMemo, useState } from 'react';

type TotalsGroup = {
  currency: string;
  status: string;
  _sum: {
    grossAmount: string | null;
    stripeFees: string | null;
    applicationFees: string | null;
    netAmount: string | null;
  };
};

type Earning = {
  id: string;
  productId?: string | null;
  saleId?: string | null;
  grossAmount: string;
  stripeFees: string;
  applicationFees: string;
  netAmount: string;
  currency: string;
  chargeId?: string | null;
  transferId?: string | null;
  payoutId?: string | null;
  connectedAccountId?: string | null;
  status: string;
  createdAt: string;
};

export default function EarningsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<TotalsGroup[]>([]);
  const [recent, setRecent] = useState<Earning[]>([]);
  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    requirementsDue?: string[];
  } | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [earningsRes, statusRes] = await Promise.all([
          fetch('/api/stripe/earnings', { method: 'GET' }),
          fetch('/api/stripe/connect/status', { method: 'GET' }),
        ]);

        if (!earningsRes.ok) throw new Error('Failed to load earnings');
        if (!statusRes.ok) throw new Error('Failed to load Stripe status');

        const earningsJson = await earningsRes.json();
        const statusJson = await statusRes.json();

        if (!cancelled) {
          setTotals(earningsJson.totals || []);
          setRecent(earningsJson.recent || []);
          setConnectStatus(statusJson);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const byStatus = new Map<string, { gross: number; fees: number; app: number; net: number; currency: string }>();
    for (const g of totals) {
      const gross = Number(g._sum.grossAmount || 0);
      const fees = Number(g._sum.stripeFees || 0);
      const app = Number(g._sum.applicationFees || 0);
      const net = Number(g._sum.netAmount || 0);
      byStatus.set(g.status, { gross, fees, app, net, currency: g.currency });
    }
    return byStatus;
  }, [totals]);

  async function startOnboarding() {
    try {
      setOnboardingLoading(true);
      const res = await fetch('/api/stripe/connect/onboard', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start onboarding');
      const json = await res.json();
      setOnboardingUrl(json.url);
      // Immediately redirect
      if (json.url) window.location.href = json.url;
    } catch (e: any) {
      setError(e.message || 'Failed to start onboarding');
    } finally {
      setOnboardingLoading(false);
    }
  }

  if (loading) return <div>Loading earnings…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  const isConnected = !!connectStatus?.connected;
  const canAcceptPayments = !!connectStatus?.chargesEnabled;
  const canPayout = !!connectStatus?.payoutsEnabled;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <strong>Stripe Connect</strong>{' '}
          <span>
            {isConnected ? 'Connected' : 'Not connected'} • Charges:{' '}
            {canAcceptPayments ? 'Enabled' : 'Disabled'} • Payouts:{' '}
            {canPayout ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {!isConnected || !canAcceptPayments || !canPayout ? (
          <button onClick={startOnboarding} disabled={onboardingLoading} style={{ padding: '8px 12px' }}>
            {onboardingLoading ? 'Opening…' : 'Set up payouts'}
          </button>
        ) : null}
      </section>

      {connectStatus?.requirementsDue && connectStatus.requirementsDue.length > 0 ? (
        <section>
          <div><strong>Action required</strong></div>
          <ul>
            {connectStatus.requirementsDue.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {['available', 'pending', 'paid'].map((key) => {
          const row = summary.get(key);
          return (
            <div key={key} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#666' }}>{key.toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {row ? `${row.currency} ${row.net.toFixed(2)}` : '-'}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                Gross: {row ? row.gross.toFixed(2) : '-'} • Fees: {row ? (row.fees + row.app).toFixed(2) : '-'}
              </div>
            </div>
          );
        })}
      </section>

      <section>
        <div style={{ marginBottom: 8 }}><strong>Recent earnings</strong></div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Gross</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Fees</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Net</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{new Date(e.createdAt).toLocaleString()}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    {e.currency} {Number(e.grossAmount).toFixed(2)}
                  </td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    {e.currency} {(Number(e.stripeFees) + Number(e.applicationFees)).toFixed(2)}
                  </td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    {e.currency} {Number(e.netAmount).toFixed(2)}
                  </td>
                  <td style={{ padding: 8 }}>{e.status}</td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 12, textAlign: 'center', color: '#666' }}>
                    No earnings yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}




