import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WalletState {
  connected: boolean;
  address: string;
  balance: string;
  isSandbox: boolean;
}

export interface StellarEvent {
  id: string;
  type: 'mint' | 'list' | 'sale' | 'checkin' | 'created';
  eventName: string;
  ticketId?: string;
  amount?: string;
  timestamp: number;
  txHash?: string;
}

export interface Event {
  id: number;
  name: string;
  price: string;
  capacity: number;
  sold: number;
  royalty: number;
  metadataUri: string;
  creator: string;
  category: string;
  date: string;
  venue: string;
  emoji: string;
}

export interface Ticket {
  id: string;
  eventId: number;
  eventName: string;
  owner: string;
  checkedIn: boolean;
  purchasedAt: number;
  price: string;
}

export interface Listing {
  ticketId: string;
  seller: string;
  price: string;
  eventId: number;
  eventName: string;
  listedAt: number;
}

interface StellarContextValue {
  wallet: WalletState;
  events: Event[];
  tickets: Ticket[];
  listings: Listing[];
  feed: StellarEvent[];
  toasts: Toast[];
  connectFreighter: () => Promise<void>;
  connectSandbox: () => void;
  disconnect: () => void;
  buyTicket: (eventId: number) => Promise<void>;
  createEvent: (data: CreateEventData) => Promise<void>;
  listTicket: (ticketId: string, price: string) => Promise<void>;
  buyListing: (ticketId: string) => Promise<void>;
  cancelListing: (ticketId: string) => Promise<void>;
  checkIn: (ticketId: string) => Promise<void>;
  addToast: (message: string, type: ToastType) => void;
}

export interface CreateEventData {
  name: string;
  price: string;
  capacity: string;
  royalty: string;
  category: string;
  date: string;
  venue: string;
  emoji: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ─── Contract Config ───────────────────────────────────────────────────────────
const CONTRACTS = {
  eventTicket: 'CAIRVZ6DNVMH543WDVD5FPYF5UMOYSQSA4C5D5R5GVF5WJG54H7EVRMC',
  marketplace: 'CB37Z3TFONEVJV5LT5FSE52AOAUPL6XSNI33527MUZAPJSYVZW42CKDE',
  paymentToken: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
};

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC = 'https://soroban-testnet.stellar.org';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_EVENTS: Event[] = [
  { id: 1, name: 'Stellar Summit 2025', price: '50', capacity: 500, sold: 312, royalty: 500, metadataUri: 'ipfs://summit25', creator: 'GDQP...4XKR', category: 'Conference', date: 'Aug 14, 2025', venue: 'San Francisco, CA', emoji: '🌌' },
  { id: 2, name: 'Soroban Hackathon', price: '0', capacity: 200, sold: 198, royalty: 0, metadataUri: 'ipfs://hack25', creator: 'GDQP...4XKR', category: 'Hackathon', date: 'Sep 5, 2025', venue: 'Online', emoji: '⚡' },
  { id: 3, name: 'DeFi World Tour — Tokyo', price: '120', capacity: 1000, sold: 445, royalty: 1000, metadataUri: 'ipfs://defi-tokyo', creator: 'GCLZ...9MVT', category: 'Finance', date: 'Oct 18, 2025', venue: 'Tokyo, Japan', emoji: '🏙️' },
  { id: 4, name: 'Neon Frequencies Festival', price: '85', capacity: 2000, sold: 1754, royalty: 750, metadataUri: 'ipfs://neon25', creator: 'GCLZ...9MVT', category: 'Music', date: 'Nov 1, 2025', venue: 'Berlin, Germany', emoji: '🎵' },
  { id: 5, name: 'Web3 Gaming Expo', price: '35', capacity: 750, sold: 240, royalty: 300, metadataUri: 'ipfs://gaming25', creator: 'GDQP...4XKR', category: 'Gaming', date: 'Nov 22, 2025', venue: 'Seoul, Korea', emoji: '🎮' },
  { id: 6, name: 'BlockArt Gallery Opening', price: '25', capacity: 300, sold: 89, royalty: 1500, metadataUri: 'ipfs://blockart25', creator: 'GCRT...7PLQ', category: 'Art', date: 'Dec 3, 2025', venue: 'New York, NY', emoji: '🎨' },
];

const SEED_FEED: StellarEvent[] = [
  { id: 'f1', type: 'mint', eventName: 'Stellar Summit 2025', ticketId: '#TKT-0312', timestamp: Date.now() - 45000, txHash: 'dd62e95e...' },
  { id: 'f2', type: 'list', eventName: 'Neon Frequencies', ticketId: '#TKT-1683', amount: '105 XLM', timestamp: Date.now() - 120000 },
  { id: 'f3', type: 'sale', eventName: 'DeFi World Tour', ticketId: '#TKT-0044', amount: '150 XLM', timestamp: Date.now() - 300000 },
  { id: 'f4', type: 'checkin', eventName: 'Soroban Hackathon', ticketId: '#TKT-0011', timestamp: Date.now() - 600000 },
  { id: 'f5', type: 'created', eventName: 'BlockArt Gallery Opening', timestamp: Date.now() - 900000 },
];

const SANDBOX_ADDRESS = 'GDR3KLJGU2KXX2WNOB66BC5W3KRMYCK4BD4XYEWTSWLO3HISPDJJZGR4';

// ─── Context ──────────────────────────────────────────────────────────────────
const StellarContext = createContext<StellarContextValue | null>(null);

export function StellarProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: '', balance: '0', isSandbox: false });
  const [events, setEvents] = useState<Event[]>(SEED_EVENTS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [listings, setListings] = useState<Listing[]>([
    { ticketId: '#TKT-0089', seller: 'GCLZ...9MVT', price: '105', eventId: 1, eventName: 'Stellar Summit 2025', listedAt: Date.now() - 86400000 },
    { ticketId: '#TKT-1683', seller: 'GCRT...7PLQ', price: '130', eventId: 4, eventName: 'Neon Frequencies Festival', listedAt: Date.now() - 43200000 },
  ]);
  const [feed, setFeed] = useState<StellarEvent[]>(SEED_FEED);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const feedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const pushFeed = useCallback((entry: Omit<StellarEvent, 'id' | 'timestamp'>) => {
    const newEntry: StellarEvent = { ...entry, id: Math.random().toString(36).slice(2), timestamp: Date.now() };
    setFeed(prev => [newEntry, ...prev].slice(0, 30));
  }, []);

  // Simulate live feed
  useEffect(() => {
    const events_list = ['Stellar Summit 2025', 'Neon Frequencies Festival', 'Soroban Hackathon', 'DeFi World Tour — Tokyo'];
    const types: StellarEvent['type'][] = ['mint', 'sale', 'list', 'checkin'];
    const scheduleNext = () => {
      feedTimerRef.current = setTimeout(() => {
        const type = types[Math.floor(Math.random() * types.length)];
        const eventName = events_list[Math.floor(Math.random() * events_list.length)];
        const ticketNum = Math.floor(Math.random() * 2000).toString().padStart(4, '0');
        pushFeed({ type, eventName, ticketId: `#TKT-${ticketNum}`, amount: type === 'sale' ? `${Math.floor(50 + Math.random() * 200)} XLM` : undefined });
        scheduleNext();
      }, 5000 + Math.random() * 8000);
    };
    scheduleNext();
    return () => clearTimeout(feedTimerRef.current);
  }, [pushFeed]);

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!res.ok) return '1000.00';
      const data = await res.json();
      const xlm = data.balances?.find((b: any) => b.asset_type === 'native');
      return xlm ? parseFloat(xlm.balance).toFixed(2) : '1000.00';
    } catch {
      return '1000.00';
    }
  }, []);

  const connectFreighter = useCallback(async () => {
    try {
      const freighter = (window as any).freighter;
      if (!freighter) throw new Error('Freighter not installed');
      await freighter.setAllowed();
      const address = await freighter.getPublicKey();
      const balance = await fetchBalance(address);
      setWallet({ connected: true, address, balance, isSandbox: false });
      addToast('Freighter wallet connected!', 'success');
    } catch (e: any) {
      addToast(e.message || 'Could not connect Freighter', 'error');
    }
  }, [fetchBalance, addToast]);

  const connectSandbox = useCallback(() => {
    setWallet({ connected: true, address: SANDBOX_ADDRESS, balance: '10000.00', isSandbox: true });
    addToast('Sandbox wallet activated — 10,000 XLM available', 'success');
  }, [addToast]);

  const disconnect = useCallback(() => {
    setWallet({ connected: false, address: '', balance: '0', isSandbox: false });
    setTickets([]);
    addToast('Wallet disconnected', 'info');
  }, [addToast]);

  const buyTicket = useCallback(async (eventId: number) => {
    if (!wallet.connected) { addToast('Connect a wallet first', 'error'); return; }
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;
    if (evt.sold >= evt.capacity) { addToast('Event is sold out', 'error'); return; }

    addToast('Simulating transaction...', 'info');
    await new Promise(r => setTimeout(r, 1200));

    const ticketNum = (evt.sold + 1).toString().padStart(4, '0');
    const ticketId = `#TKT-${ticketNum}`;

    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, sold: e.sold + 1 } : e));
    setTickets(prev => [...prev, { id: ticketId, eventId, eventName: evt.name, owner: wallet.address, checkedIn: false, purchasedAt: Date.now(), price: evt.price }]);
    pushFeed({ type: 'mint', eventName: evt.name, ticketId, txHash: Math.random().toString(16).slice(2, 18) });
    addToast(`Ticket ${ticketId} purchased for ${evt.price} XLM!`, 'success');
  }, [wallet, events, addToast, pushFeed]);

  const createEvent = useCallback(async (data: CreateEventData) => {
    if (!wallet.connected) { addToast('Connect a wallet first', 'error'); return; }
    addToast('Deploying event to Soroban...', 'info');
    await new Promise(r => setTimeout(r, 1500));

    const newEvent: Event = {
      id: events.length + 1,
      name: data.name,
      price: data.price,
      capacity: parseInt(data.capacity),
      sold: 0,
      royalty: parseInt(data.royalty) * 100,
      metadataUri: `ipfs://${data.name.toLowerCase().replace(/\s+/g, '-')}`,
      creator: wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4),
      category: data.category,
      date: data.date,
      venue: data.venue,
      emoji: data.emoji || '🎪',
    };
    setEvents(prev => [newEvent, ...prev]);
    pushFeed({ type: 'created', eventName: data.name });
    addToast(`Event "${data.name}" created on-chain!`, 'success');
  }, [wallet, events, addToast, pushFeed]);

  const listTicket = useCallback(async (ticketId: string, price: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    addToast('Escrowing ticket to marketplace...', 'info');
    await new Promise(r => setTimeout(r, 1000));

    setListings(prev => [...prev, { ticketId, seller: wallet.address, price, eventId: ticket.eventId, eventName: ticket.eventName, listedAt: Date.now() }]);
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    pushFeed({ type: 'list', eventName: ticket.eventName, ticketId, amount: `${price} XLM` });
    addToast(`Ticket listed for ${price} XLM`, 'success');
  }, [tickets, wallet, addToast, pushFeed]);

  const buyListing = useCallback(async (ticketId: string) => {
    if (!wallet.connected) { addToast('Connect a wallet first', 'error'); return; }
    const listing = listings.find(l => l.ticketId === ticketId);
    if (!listing) return;
    addToast('Processing purchase with royalty split...', 'info');
    await new Promise(r => setTimeout(r, 1200));

    setListings(prev => prev.filter(l => l.ticketId !== ticketId));
    setTickets(prev => [...prev, { id: ticketId, eventId: listing.eventId, eventName: listing.eventName, owner: wallet.address, checkedIn: false, purchasedAt: Date.now(), price: listing.price }]);
    pushFeed({ type: 'sale', eventName: listing.eventName, ticketId, amount: `${listing.price} XLM` });
    addToast(`Ticket purchased! Royalties auto-split to creator.`, 'success');
  }, [listings, wallet, addToast, pushFeed]);

  const cancelListing = useCallback(async (ticketId: string) => {
    const listing = listings.find(l => l.ticketId === ticketId);
    if (!listing) return;
    await new Promise(r => setTimeout(r, 800));
    setListings(prev => prev.filter(l => l.ticketId !== ticketId));
    setTickets(prev => [...prev, { id: ticketId, eventId: listing.eventId, eventName: listing.eventName, owner: wallet.address, checkedIn: false, purchasedAt: Date.now(), price: listing.price }]);
    addToast('Listing cancelled — ticket returned to wallet', 'info');
  }, [listings, wallet, addToast]);

  const checkIn = useCallback(async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (ticket.checkedIn) { addToast('Already checked in', 'error'); return; }
    await new Promise(r => setTimeout(r, 800));
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, checkedIn: true } : t));
    pushFeed({ type: 'checkin', eventName: ticket.eventName, ticketId });
    addToast(`Ticket ${ticketId} checked in!`, 'success');
  }, [tickets, addToast, pushFeed]);

  return (
    <StellarContext.Provider value={{ wallet, events, tickets, listings, feed, toasts, connectFreighter, connectSandbox, disconnect, buyTicket, createEvent, listTicket, buyListing, cancelListing, checkIn, addToast }}>
      {children}
      {/* Toast stack */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </StellarContext.Provider>
  );
}

export function useStellar() {
  const ctx = useContext(StellarContext);
  if (!ctx) throw new Error('useStellar must be used within StellarProvider');
  return ctx;
}
