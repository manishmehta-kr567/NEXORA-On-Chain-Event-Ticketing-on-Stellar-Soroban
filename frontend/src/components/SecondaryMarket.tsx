import { useState } from 'react';
import { useStellar } from '../context/StellarContext';

export default function SecondaryMarket() {
  const { wallet, listings, tickets, buyListing, cancelListing, listTicket } = useStellar();
  const [buying, setBuying] = useState<string | null>(null);
  const [listingTicketId, setListingTicketId] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [showListModal, setShowListModal] = useState(false);
  const [listing, setListing] = useState(false);

  const myTickets = tickets.filter(t => t.owner === wallet.address);
  const myListings = listings.filter(l => l.seller === wallet.address);

  const handleBuy = async (ticketId: string) => {
    setBuying(ticketId);
    await buyListing(ticketId);
    setBuying(null);
  };

  const handleList = async () => {
    if (!listingTicketId || !listingPrice) return;
    setListing(true);
    await listTicket(listingTicketId, listingPrice);
    setListing(false);
    setShowListModal(false);
    setListingTicketId('');
    setListingPrice('');
  };

  const timeAgo = (ts: number) => {
    const d = Date.now() - ts;
    if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
    if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
    return `${Math.floor(d / 86400000)}d ago`;
  };

  return (
    <div className="fade-up">
      <div className="section-hero">
        <div className="section-label">P2P Trading</div>
        <h1 className="section-hero-title">Secondary Market</h1>
        <p className="section-hero-desc">Escrow-backed ticket resales with automatic royalty splits to original creators.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Active Listings</div>
          <div className="stat-value">{listings.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Floor Price</div>
          <div className="stat-value">{listings.length ? Math.min(...listings.map(l => parseFloat(l.price))) : '—'}</div>
          <div className="stat-delta" style={{ color: 'var(--violet)' }}>{listings.length ? 'XLM' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">My Listings</div>
          <div className="stat-value">{myListings.length}</div>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button
          className="btn btn-primary"
          disabled={!wallet.connected || myTickets.length === 0}
          onClick={() => setShowListModal(true)}
        >
          + List a Ticket
        </button>
        {!wallet.connected && (
          <div style={{ fontSize: 13, color: 'rgba(226,228,240,0.4)', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            Connect wallet to list tickets
          </div>
        )}
      </div>

      {/* All Listings */}
      <div className="section-label" style={{ marginBottom: 14 }}>Available Listings</div>
      {listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <div className="empty-title">No listings yet</div>
          <div className="empty-desc">Be the first to list a ticket on the secondary market</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {listings.map(l => {
            const isOwn = l.seller === wallet.address;
            return (
              <div key={l.ticketId} className="panel">
                <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#f0f1ff' }}>{l.eventName}</span>
                      {isOwn && <span className="badge badge-violet">Your listing</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(226,228,240,0.4)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--violet)' }}>{l.ticketId}</span>
                      <span>Seller: {l.seller}</span>
                      <span>{timeAgo(l.listedAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--violet)' }}>{l.price} <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 400 }}>XLM</span></div>
                    </div>
                    {isOwn ? (
                      <button className="btn btn-danger btn-sm" onClick={() => cancelListing(l.ticketId)}>Cancel</button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={!wallet.connected || buying === l.ticketId}
                        onClick={() => handleBuy(l.ticketId)}
                      >
                        {buying === l.ticketId ? <span className="spin">⟳</span> : 'Buy Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Royalty info */}
      <div style={{ padding: '20px 24px', background: 'rgba(56,189,248,0.05)', borderRadius: 14, border: '1px solid rgba(56,189,248,0.15)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#f0f1ff', marginBottom: 10 }}>⬡ Automatic Royalty Split</div>
        <p style={{ fontSize: 14, color: 'rgba(226,228,240,0.55)', marginBottom: 14, lineHeight: 1.6 }}>
          Every secondary sale triggers an on-chain royalty distribution via inter-contract call. The marketplace contract reads event metadata, calculates the royalty percentage, and splits the payment atomically — no trust required.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: 'rgba(4,4,7,0.5)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(226,228,240,0.4)', marginBottom: 4 }}>Seller receives</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--emerald)', fontSize: 18 }}>Price − Royalty</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(4,4,7,0.5)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(226,228,240,0.4)', marginBottom: 4 }}>Creator receives</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--violet)', fontSize: 18 }}>Royalty %</div>
          </div>
        </div>
      </div>

      {/* List Ticket Modal */}
      {showListModal && (
        <div className="modal-backdrop" onClick={() => setShowListModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">List Ticket for Sale</h3>
              <button className="modal-close" onClick={() => setShowListModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="field-label">Select Ticket</label>
                <select className="field-select" value={listingTicketId} onChange={e => setListingTicketId(e.target.value)}>
                  <option value="">Choose a ticket...</option>
                  {myTickets.map(t => (
                    <option key={t.id} value={t.id}>{t.id} — {t.eventName}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Listing Price (XLM)</label>
                <input className="field-input" type="number" min="1" placeholder="120" value={listingPrice} onChange={e => setListingPrice(e.target.value)} />
              </div>
              {listingTicketId && listingPrice && (
                <div style={{ padding: '12px 14px', background: 'rgba(167,139,250,0.07)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'rgba(226,228,240,0.5)', marginBottom: 8 }}>
                  Ticket will be escrowed in the Marketplace contract until sold or cancelled.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowListModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!listingTicketId || !listingPrice || listing}
                onClick={handleList}
              >
                {listing ? <><span className="spin">⟳</span> Escrowing...</> : 'List Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
