import { useState, useMemo } from 'react';
import { useStellar, Event } from '../context/StellarContext';

const CATEGORIES = ['All', 'Conference', 'Hackathon', 'Music', 'Finance', 'Gaming', 'Art'];

export default function EventExplorer() {
  const { events, buyTicket, wallet } = useStellar();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [buying, setBuying] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (category !== 'All' && e.category !== category) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.venue.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, category, search]);

  const handleBuy = async (e: Event) => {
    setBuying(e.id);
    await buyTicket(e.id);
    setBuying(null);
    setSelectedEvent(null);
  };

  const availabilityPct = (e: Event) => Math.min((e.sold / e.capacity) * 100, 100);
  const availabilityColor = (pct: number) => pct >= 90 ? 'var(--rose)' : pct >= 70 ? 'var(--amber)' : 'url(#avail-grad)';

  return (
    <div className="fade-up">
      <div className="section-hero">
        <div className="section-label">Discover</div>
        <h1 className="section-hero-title">On-Chain Events</h1>
        <p className="section-hero-desc">Browse and purchase tickets minted directly on Stellar Testnet — ownership is yours, forever.</p>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">⊙</span>
        <input
          placeholder="Search events, venues, dates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(226,228,240,0.4)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>}
      </div>

      {/* Category Pills */}
      <div className="cat-pills">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Live Events</div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-delta up">↑ 2 this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tickets Minted</div>
          <div className="stat-value">{events.reduce((a, e) => a + e.sold, 0).toLocaleString()}</div>
          <div className="stat-delta up">↑ 48 today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Volume</div>
          <div className="stat-value">{Math.floor(events.reduce((a, e) => a + e.sold * parseFloat(e.price), 0) / 1000)}K</div>
          <div className="stat-delta" style={{ color: 'var(--violet)' }}>XLM traded</div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⬡</div>
          <div className="empty-title">No events found</div>
          <div className="empty-desc">Try adjusting your search or category filter</div>
        </div>
      ) : (
        <div className="event-grid">
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="avail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa"/>
                <stop offset="100%" stopColor="#38bdf8"/>
              </linearGradient>
            </defs>
          </svg>
          {filtered.map((evt, i) => {
            const pct = availabilityPct(evt);
            const isSoldOut = pct >= 100;
            return (
              <div
                key={evt.id}
                className={`event-card fade-up stagger-${Math.min(i + 1, 4)}`}
                onClick={() => setSelectedEvent(evt)}
              >
                <div className="event-card-img-placeholder">{evt.emoji}</div>

                <div className="event-card-body">
                  <div className="event-card-category">{evt.category}</div>
                  <div className="event-card-title">{evt.name}</div>
                  <div className="event-card-meta">
                    <span>📅 {evt.date}</span>
                    <span>📍 {evt.venue}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(226,228,240,0.4)' }}>
                      {evt.sold.toLocaleString()} / {evt.capacity.toLocaleString()} sold
                    </span>
                    <span style={{ fontSize: 11, color: pct >= 90 ? 'var(--rose)' : 'rgba(226,228,240,0.4)' }}>
                      {isSoldOut ? '🔴 Sold Out' : pct >= 90 ? '🟡 Almost full' : `${Math.round(100 - pct)}% left`}
                    </span>
                  </div>

                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{ width: `${pct}%`, background: pct >= 90 ? 'var(--rose)' : undefined }} />
                  </div>

                  <div className="event-card-footer">
                    <div className="event-price">
                      <span className="event-price-label">Price</span>
                      <span className="event-price-value">
                        {parseFloat(evt.price) === 0 ? <span style={{ color: 'var(--emerald)' }}>FREE</span> : <>{evt.price}<span className="event-price-unit"> XLM</span></>}
                      </span>
                    </div>
                    <button
                      className={`btn ${isSoldOut ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                      disabled={isSoldOut || buying === evt.id}
                      onClick={e => { e.stopPropagation(); if (!isSoldOut) setSelectedEvent(evt); }}
                    >
                      {buying === evt.id ? <span className="spin">⟳</span> : isSoldOut ? 'Sold Out' : 'Get Ticket →'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedEvent.emoji} {selectedEvent.name}</h3>
                <span className="badge badge-violet" style={{ marginTop: 6, display: 'inline-flex' }}>{selectedEvent.category}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Date', value: selectedEvent.date },
                  { label: 'Venue', value: selectedEvent.venue },
                  { label: 'Capacity', value: `${selectedEvent.capacity.toLocaleString()} seats` },
                  { label: 'Royalty', value: `${selectedEvent.royalty / 100}%` },
                  { label: 'Creator', value: selectedEvent.creator },
                  { label: 'Available', value: (selectedEvent.capacity - selectedEvent.sold).toLocaleString() },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(4,4,7,0.5)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'rgba(226,228,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e4f0' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(167,139,250,0.07)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'rgba(226,228,240,0.6)' }}>Ticket Price</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--violet)' }}>
                    {parseFloat(selectedEvent.price) === 0 ? <span style={{ color: 'var(--emerald)' }}>FREE</span> : <>{selectedEvent.price} <span style={{ fontSize: 14, opacity: 0.6, fontWeight: 400 }}>XLM</span></>}
                  </span>
                </div>
              </div>

              {!wallet.connected && (
                <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.08)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.2)', fontSize: 13, color: 'var(--amber)', marginBottom: 16 }}>
                  ⚡ Connect a wallet to purchase tickets
                </div>
              )}

              <div style={{ fontSize: 12, color: 'rgba(226,228,240,0.4)', lineHeight: 1.5 }}>
                Contract: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>CAIRVZ6D...EVRMC</span> · Stellar Testnet
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedEvent(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!wallet.connected || selectedEvent.sold >= selectedEvent.capacity || buying === selectedEvent.id}
                onClick={() => handleBuy(selectedEvent)}
              >
                {buying === selectedEvent.id ? <><span className="spin">⟳</span> Minting...</> : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
