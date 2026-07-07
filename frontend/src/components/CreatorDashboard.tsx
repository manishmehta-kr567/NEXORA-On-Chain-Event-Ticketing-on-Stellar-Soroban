import { useState } from 'react';
import { useStellar, CreateEventData } from '../context/StellarContext';

const CATEGORIES = ['Conference', 'Hackathon', 'Music', 'Finance', 'Gaming', 'Art', 'Sports', 'Other'];
const EMOJIS = ['🌌', '⚡', '🎵', '🏙️', '🎮', '🎨', '🏆', '🎪', '🌊', '🔥'];

export default function CreatorDashboard() {
  const { wallet, events, tickets, createEvent, checkIn } = useStellar();
  const [tab, setTab] = useState<'analytics' | 'create' | 'checkin'>('analytics');
  const [creating, setCreating] = useState(false);
  const [checkInId, setCheckInId] = useState('');
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState<CreateEventData>({
    name: '', price: '', capacity: '', royalty: '5',
    category: 'Conference', date: '', venue: '', emoji: '🌌',
  });

  const myEvents = events.filter(e => wallet.connected && e.creator.startsWith(wallet.address.slice(0, 6)));
  const myTickets = tickets.filter(t => wallet.connected && t.owner === wallet.address);

  const totalRevenue = myEvents.reduce((a, e) => a + e.sold * parseFloat(e.price), 0);
  const totalSold = myEvents.reduce((a, e) => a + e.sold, 0);

  const handleCreate = async () => {
    if (!form.name || !form.capacity || !form.date || !form.venue) return;
    setCreating(true);
    await createEvent(form);
    setCreating(false);
    setForm({ name: '', price: '', capacity: '', royalty: '5', category: 'Conference', date: '', venue: '', emoji: '🌌' });
    setTab('analytics');
  };

  const handleCheckIn = async () => {
    if (!checkInId.trim()) return;
    setChecking(true);
    await checkIn(checkInId.trim());
    setChecking(false);
    setCheckInId('');
  };

  return (
    <div className="fade-up">
      <div className="section-hero">
        <div className="section-label">Creator Hub</div>
        <h1 className="section-hero-title">Creator Dashboard</h1>
        <p className="section-hero-desc">Deploy events on-chain, track sales, and manage attendee check-ins.</p>
      </div>

      {!wallet.connected && (
        <div style={{ padding: '20px 24px', background: 'rgba(167,139,250,0.07)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 24, textAlign: 'center', color: 'rgba(226,228,240,0.5)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
          Connect a wallet to access the Creator Dashboard
        </div>
      )}

      {/* Tab row */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: 'rgba(4,4,7,0.5)', borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[{ id: 'analytics', label: '◎ Analytics' }, { id: 'create', label: '◈ Create Event' }, { id: 'checkin', label: '✓ Check-In' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: tab === t.id ? 'rgba(167,139,250,0.15)' : 'transparent', color: tab === t.id ? 'var(--violet)' : 'rgba(226,228,240,0.45)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', boxShadow: tab === t.id ? '0 0 12px rgba(167,139,250,0.15)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {tab === 'analytics' && (
        <div>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Events Created</div>
              <div className="stat-value">{myEvents.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Tickets Sold</div>
              <div className="stat-value">{totalSold.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">{totalRevenue.toLocaleString()}</div>
              <div className="stat-delta" style={{ color: 'var(--violet)' }}>XLM</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">My Tickets</div>
              <div className="stat-value">{myTickets.length}</div>
            </div>
          </div>

          {myEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <div className="empty-title">No events yet</div>
              <div className="empty-desc">Create your first on-chain event to start tracking analytics</div>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setTab('create')}>Create First Event</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myEvents.map(evt => {
                const pct = Math.min((evt.sold / evt.capacity) * 100, 100);
                return (
                  <div key={evt.id} className="panel">
                    <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 28, flexShrink: 0 }}>{evt.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#f0f1ff', marginBottom: 6 }}>{evt.name}</div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(226,228,240,0.45)', marginBottom: 10 }}>
                          <span>{evt.date}</span>
                          <span>{evt.venue}</span>
                          <span>{evt.sold} / {evt.capacity} sold</span>
                        </div>
                        <div className="capacity-bar"><div className="capacity-fill" style={{ width: `${pct}%` }} /></div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--violet)' }}>{(evt.sold * parseFloat(evt.price)).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: 'rgba(226,228,240,0.35)' }}>XLM revenue</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Event */}
      {tab === 'create' && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Deploy New Event</div>
              <div className="panel-subtitle">Creates a smart contract entry on Stellar Testnet</div>
            </div>
          </div>
          <div className="panel-body">
            {/* Emoji picker */}
            <div className="field">
              <label className="field-label">Event Icon</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EMOJIS.map(em => (
                  <button key={em} onClick={() => setForm(f => ({ ...f, emoji: em }))}
                    style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.emoji === em ? 'var(--violet)' : 'var(--border)'}`, background: form.emoji === em ? 'rgba(167,139,250,0.15)' : 'rgba(4,4,7,0.5)', fontSize: 20, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Event Name *</label>
                <input className="field-input" placeholder="e.g. Stellar Developer Summit 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Ticket Price (XLM)</label>
                <input className="field-input" type="number" min="0" placeholder="0 = free" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Capacity *</label>
                <input className="field-input" type="number" min="1" placeholder="500" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Royalty %</label>
                <input className="field-input" type="number" min="0" max="25" value={form.royalty} onChange={e => setForm(f => ({ ...f, royalty: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Category</label>
                <select className="field-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Event Date *</label>
                <input className="field-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Venue / Location *</label>
                <input className="field-input" placeholder="San Francisco, CA or Online" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 8, padding: '12px 14px', background: 'rgba(167,139,250,0.07)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'rgba(226,228,240,0.5)' }}>
              Royalty split: <span style={{ color: 'var(--violet)' }}>{form.royalty || 0}%</span> of secondary sales automatically returned to creator via smart contract
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 20 }}
              disabled={!wallet.connected || !form.name || !form.capacity || !form.date || !form.venue || creating}
              onClick={handleCreate}
            >
              {creating ? <><span className="spin">⟳</span> Deploying to Soroban...</> : '◈ Deploy Event Contract'}
            </button>
          </div>
        </div>
      )}

      {/* Check-In Tool */}
      {tab === 'checkin' && (
        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-header">
              <div className="panel-title">QR Check-In</div>
            </div>
            <div className="panel-body">
              <p style={{ fontSize: 14, color: 'rgba(226,228,240,0.5)', marginBottom: 16 }}>Enter a ticket ID to mark it as checked in on-chain. Only event admins can perform this action.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  className="field-input"
                  placeholder="#TKT-0001"
                  value={checkInId}
                  onChange={e => setCheckInId(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleCheckIn}
                  disabled={!checkInId.trim() || checking || !wallet.connected}
                >
                  {checking ? <span className="spin">⟳</span> : '✓ Check In'}
                </button>
              </div>
            </div>
          </div>

          {/* Checked-in tickets */}
          <div className="section-label" style={{ marginBottom: 12 }}>My Tickets</div>
          {myTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">◆</div>
              <div className="empty-title">No tickets in wallet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myTickets.map(t => (
                <div key={t.id} className="ticket-card">
                  <div className="ticket-stub" style={{ background: t.checkedIn ? 'var(--emerald)' : undefined }} />
                  <div className="ticket-body">
                    <div>
                      <div className="ticket-event-name">{t.eventName}</div>
                      <div className="ticket-id">{t.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`badge ${t.checkedIn ? 'badge-emerald' : 'badge-violet'}`}>
                        {t.checkedIn ? '✓ Checked In' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
