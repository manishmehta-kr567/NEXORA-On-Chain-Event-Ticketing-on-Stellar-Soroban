import { useStellar } from '../context/StellarContext';

export default function MyTickets() {
  const { wallet, tickets, events } = useStellar();
  const myTickets = tickets.filter(t => t.owner === wallet.address);

  const getEvent = (eventId: number) => events.find(e => e.id === eventId);

  if (!wallet.connected) {
    return (
      <div className="fade-up">
        <div className="section-hero">
          <div className="section-label">Portfolio</div>
          <h1 className="section-hero-title">My Tickets</h1>
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>◆</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'rgba(226,228,240,0.6)', marginBottom: 10 }}>Connect your wallet</div>
          <div style={{ fontSize: 14, color: 'rgba(226,228,240,0.4)' }}>Your on-chain ticket portfolio will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="section-hero">
        <div className="section-label">Portfolio</div>
        <h1 className="section-hero-title">My Tickets</h1>
        <p className="section-hero-desc">Your on-chain ticket NFTs stored in the Stellar smart contract.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value">{myTickets.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Checked In</div>
          <div className="stat-value">{myTickets.filter(t => t.checkedIn).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">{myTickets.reduce((a, t) => a + parseFloat(t.price || '0'), 0).toLocaleString()}</div>
          <div className="stat-delta" style={{ color: 'var(--violet)' }}>XLM</div>
        </div>
      </div>

      {myTickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◆</div>
          <div className="empty-title">No tickets yet</div>
          <div className="empty-desc">Browse the Event Explorer and purchase your first on-chain ticket</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myTickets.map(t => {
            const evt = getEvent(t.eventId);
            return (
              <div key={t.id} className="hex-bg" style={{
                background: 'rgba(13,14,26,0.8)',
                border: `1px solid ${t.checkedIn ? 'rgba(52,211,153,0.25)' : 'var(--border)'}`,
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                transition: 'all 0.2s',
              }}>
                {/* Color stub */}
                <div style={{ width: 6, background: t.checkedIn ? 'var(--emerald)' : 'linear-gradient(180deg, var(--violet), var(--cyan))', flexShrink: 0 }} />

                {/* Content */}
                <div style={{ flex: 1, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{evt?.emoji || '🎫'}</div>

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#f0f1ff', marginBottom: 4 }}>{t.eventName}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(226,228,240,0.4)', flexWrap: 'wrap' }}>
                      <span>📅 {evt?.date || 'TBA'}</span>
                      <span>📍 {evt?.venue || 'TBA'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <span className={`badge ${t.checkedIn ? 'badge-emerald' : 'badge-violet'}`}>
                      {t.checkedIn ? '✓ Checked In' : 'Active'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--violet)', opacity: 0.7 }}>{t.id}</span>
                    <span style={{ fontSize: 11, color: 'rgba(226,228,240,0.3)' }}>
                      {parseFloat(t.price) === 0 ? 'Free' : `${t.price} XLM`} · {new Date(t.purchasedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Perforation dots */}
                <div style={{ width: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', borderLeft: '1px dashed var(--border)' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(167,139,250,0.2)' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract info */}
      {myTickets.length > 0 && (
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(4,4,7,0.5)', borderRadius: 12, border: '1px solid var(--border)', fontSize: 12, color: 'rgba(226,228,240,0.4)', lineHeight: 1.6 }}>
          <strong style={{ color: 'rgba(226,228,240,0.7)' }}>On-chain storage:</strong> Ticket ownership is recorded in the Event Ticket contract at{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>CAIRVZ6D...EVRMC</span> on Stellar Testnet.
          All ticket IDs are verifiable on{' '}
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--violet)', textDecoration: 'none' }}>
            Stellar Expert ↗
          </a>
        </div>
      )}
    </div>
  );
}
