import { useState } from 'react';
import { useStellar } from '../context/StellarContext';

export default function WalletConnect() {
  const { wallet, connectFreighter, connectSandbox, disconnect } = useStellar();
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleFreighter = async () => {
    setConnecting(true);
    await connectFreighter();
    setConnecting(false);
    setShowModal(false);
  };

  const handleSandbox = () => {
    connectSandbox();
    setShowModal(false);
  };

  const shortAddr = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4);

  if (wallet.connected) {
    return (
      <div className="wallet-pill" onClick={() => setShowModal(true)} title="Wallet options">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, lineHeight: 1.2 }}>
          <span className="wallet-address">{shortAddr(wallet.address)}</span>
          <span className="wallet-balance">{parseFloat(wallet.balance).toLocaleString()} XLM</span>
        </div>
        {wallet.isSandbox && (
          <span className="sandbox-label">SANDBOX</span>
        )}
        <div className="wallet-avatar">
          {wallet.address.slice(0, 2)}
        </div>

        {showModal && (
          <div className="modal-backdrop" onClick={e => { e.stopPropagation(); setShowModal(false); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Wallet</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(4,4,7,0.6)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(226,228,240,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Address</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e2e4f0', wordBreak: 'break-all' }}>{wallet.address}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(167,139,250,0.07)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: 'rgba(226,228,240,0.6)' }}>Balance</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--violet)' }}>{parseFloat(wallet.balance).toLocaleString()} <span style={{ fontSize: 12, opacity: 0.6 }}>XLM</span></span>
                </div>
                {wallet.isSandbox && (
                  <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.08)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.2)', fontSize: 13, color: 'var(--amber)' }}>
                    ⚠️ Sandbox mode — transactions are simulated, not on-chain
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger btn-sm" onClick={disconnect}>Disconnect</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button className="connect-btn" onClick={() => setShowModal(true)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 8h6M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Connect Wallet
      </button>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Connect Wallet</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 14, color: 'rgba(226,228,240,0.5)', marginBottom: 8 }}>Choose how to connect to NEXORA on Stellar Testnet.</p>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 14, borderRadius: 14 }}
                onClick={handleFreighter}
                disabled={connecting}
              >
                <span style={{ fontSize: 24 }}>🪶</span>
                <div style={{ textAlign: 'left' }}>
                  <div>Freighter Wallet</div>
                  <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>Browser extension — real transactions</div>
                </div>
                {connecting && <span className="spin" style={{ marginLeft: 'auto' }}>⟳</span>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="divider" style={{ flex: 1, margin: 0 }} />
                <span style={{ fontSize: 12, color: 'rgba(226,228,240,0.3)' }}>or</span>
                <div className="divider" style={{ flex: 1, margin: 0 }} />
              </div>

              <button
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 14, borderRadius: 14 }}
                onClick={handleSandbox}
              >
                <span style={{ fontSize: 24 }}>🧪</span>
                <div style={{ textAlign: 'left' }}>
                  <div>Sandbox Wallet</div>
                  <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>Instant access — simulated 10,000 XLM</div>
                </div>
                <span className="sandbox-label" style={{ marginLeft: 'auto' }}>DEMO</span>
              </button>

              <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(56,189,248,0.06)', borderRadius: 10, border: '1px solid rgba(56,189,248,0.15)', fontSize: 12, color: 'rgba(226,228,240,0.5)', lineHeight: 1.5 }}>
                Connected to <strong style={{ color: 'var(--cyan)' }}>Stellar Testnet</strong> — all transactions use test XLM. Get free testnet XLM via <a href="https://friendbot.stellar.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Friendbot ↗</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
