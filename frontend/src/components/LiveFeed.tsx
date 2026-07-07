import { useStellar, StellarEvent } from '../context/StellarContext';

const DOT_CLASS: Record<StellarEvent['type'], string> = {
  mint: 'feed-dot-mint',
  list: 'feed-dot-list',
  sale: 'feed-dot-sale',
  checkin: 'feed-dot-checkin',
  created: 'feed-dot-sale',
};

const TYPE_LABEL: Record<StellarEvent['type'], string> = {
  mint: 'Ticket minted',
  list: 'Listed for sale',
  sale: 'Ticket sold',
  checkin: 'Checked in',
  created: 'Event created',
};

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

export default function LiveFeed() {
  const { feed } = useStellar();

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <div>
          <div className="panel-title">Live Feed</div>
          <div className="panel-subtitle">Real-time on-chain events</div>
        </div>
        <span className="badge badge-emerald badge-dot">Live</span>
      </div>

      <div className="panel-body" style={{ padding: '12px 20px' }}>
        {feed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(226,228,240,0.3)', fontSize: 13 }}>
            Listening for on-chain events...
          </div>
        ) : (
          <div>
            {feed.map(entry => (
              <div key={entry.id} className="feed-entry">
                <div className={`feed-dot ${DOT_CLASS[entry.type]}`} />
                <div>
                  <div className="feed-text">
                    <strong>{TYPE_LABEL[entry.type]}</strong> — {entry.eventName}
                    {entry.ticketId && <span style={{ color: 'var(--violet)', fontSize: 12 }}> {entry.ticketId}</span>}
                    {entry.amount && <span style={{ color: 'var(--cyan)', fontSize: 12 }}> · {entry.amount}</span>}
                  </div>
                  <div className="feed-time">{timeAgo(entry.timestamp)}</div>
                  {entry.txHash && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(226,228,240,0.25)', marginTop: 2 }}>
                      {entry.txHash.slice(0, 16)}...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network info */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)', animation: 'blink 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(226,228,240,0.35)' }}>
          Soroban RPC · Testnet
        </span>
      </div>
    </div>
  );
}
