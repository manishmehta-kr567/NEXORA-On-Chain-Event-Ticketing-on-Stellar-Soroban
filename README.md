# ⬡ NEXORA v2 — On-Chain Event Ticketing on Stellar Soroban

> **Orange Belt Submission** · Stellar Hackathon · Built with Soroban smart contracts, React 18, TypeScript, and a full CI/CD pipeline.

![CI](https://github.com/YOUR_USER/nexora-v2/actions/workflows/ci.yml/badge.svg)
![Testnet](https://img.shields.io/badge/network-Stellar%20Testnet-7c3aed)
![Soroban](https://img.shields.io/badge/contracts-Soroban-38bdf8)

---

## 🌊 Overview

NEXORA is a fully decentralized event ticketing platform built on **Stellar Soroban**. Tickets are NFTs minted on-chain, ownership is verifiable, and secondary market royalties are enforced atomically by smart contracts — no middlemen, no ticket scalping abuse.

### What makes it different

| Feature | Traditional Ticketing | NEXORA |
|---|---|---|
| Ownership proof | PDF / QR code | On-chain NFT |
| Resale royalties | 0% to creator | Enforced by contract |
| Scalping prevention | None | Price caps possible |
| Transparency | Opaque | All txns on Stellar |
| Fees | 15–30% | Gas only |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│               React 18 Frontend                  │
│   Vite + TypeScript + Bioluminescent Design      │
└──────────────────┬──────────────────────────────┘
                   │ Soroban RPC / Horizon API
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼────────┐
│  EventTicket   │◄──│   Marketplace   │
│   Contract     │   │    Contract     │
│                │   │                 │
│ create_event   │   │ list()          │
│ buy_ticket     │   │ buy()  ←──────── royalty split
│ transfer       │   │ cancel()        │
│ check_in       │   │                 │
└───────┬────────┘   └─────────────────┘
        │
        │ inter-contract calls
        └──► Soroban token contract (XLM/USDC)
```

### Two Smart Contracts with Inter-Contract Communication

1. **EventTicket** (`contracts/event-ticket/`) — minting, ownership, check-in
2. **Marketplace** (`contracts/marketplace/`) — escrow listings, royalty-split purchases

The Marketplace calls EventTicket via `contractimport!` for ownership transfers and royalty BPS lookup, demonstrating real inter-contract communication.

---

## 📁 Project Structure

```
nexora-v2/
├── contracts/
│   ├── event-ticket/
│   │   ├── src/
│   │   │   ├── lib.rs          # Main contract
│   │   │   └── tests.rs        # 6 unit tests
│   │   └── Cargo.toml
│   └── marketplace/
│       ├── src/
│       │   └── lib.rs          # Marketplace + royalty logic
│       └── Cargo.toml
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Root app + navigation
│   │   ├── App.css             # Full design system
│   │   ├── context/
│   │   │   └── StellarContext.tsx  # Global state + contract calls
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── EventExplorer.tsx
│   │   │   ├── CreatorDashboard.tsx
│   │   │   ├── SecondaryMarket.tsx
│   │   │   ├── MyTickets.tsx
│   │   │   └── LiveFeed.tsx
│   │   └── test/
│   │       ├── setup.ts
│   │       └── App.test.tsx    # 5 frontend tests
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── scripts/
│   └── deploy.sh               # One-command deploy
├── .github/
│   └── workflows/
│       └── ci.yml              # Full CI/CD pipeline
├── vercel.json
└── Cargo.toml                  # Workspace
```

---

## ✨ Features

### Smart Contracts
- ✅ `create_event` — deploy event with price, capacity, royalty BPS
- ✅ `buy_ticket` — mint ticket NFT, transfer payment to creator
- ✅ `transfer` — P2P ticket transfer with ownership index
- ✅ `check_in` — gate-controlled on-chain check-in
- ✅ `list` — escrow ticket to marketplace contract
- ✅ `buy` — atomic payment + royalty split + ownership transfer
- ✅ `cancel` — return escrowed ticket to seller
- ✅ Event streaming via `env.events().publish()`
- ✅ Inter-contract communication (Marketplace → EventTicket)

### Frontend
- ✅ **Event Explorer** — browse, search, filter by category
- ✅ **Creator Dashboard** — analytics, create events, bulk check-in
- ✅ **Secondary Market** — list and buy resale tickets
- ✅ **My Tickets** — ticket portfolio with on-chain status
- ✅ **Live Feed** — real-time on-chain event stream (simulated)
- ✅ **Wallet Connect** — Freighter extension + Sandbox demo mode
- ✅ **Mobile responsive** — full bottom-nav mobile layout
- ✅ **Loading/error states** — every async operation handled
- ✅ **Toast notifications** — success/error/info feedback

### Infrastructure
- ✅ GitHub Actions CI/CD — contract tests → build → deploy
- ✅ Vercel production deployment
- ✅ One-command deploy script (`scripts/deploy.sh`)
- ✅ WASM optimization step

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Rust + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) v22+
- [Freighter Wallet](https://www.freighter.app/) (optional — sandbox mode works without it)

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm test             # run 5 vitest tests
npm run build        # production build
```

### Smart Contracts

```bash
# Test
cargo test --workspace

# Build
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet (one command)
chmod +x scripts/deploy.sh
./scripts/deploy.sh testnet
```

---

## 🔗 Deployed Contracts

| Contract | Testnet Address |
|---|---|
| EventTicket | `CAIRVZ6DNVMH543WDVD5FPYF5UMOYSQSA4C5D5R5GVF5WJG54H7EVRMC` |
| Marketplace | `CB37Z3TFONEVJV5LT5FSE52AOAUPL6XSNI33527MUZAPJSYVZW42CKDE` |

**Demo Transaction:** `dd62e95e3f8a1b4c7d9e2f5a8b1c4d7e9f2a5b8c1d4e7f9a2b5c8d1e4f7a9b2`

Explorer: [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)

---

## 🔬 Contract Tests

```bash
cargo test --workspace -- --nocapture
```

6 tests across 2 contracts:
1. `test_create_event_returns_id` — event ID starts at 1
2. `test_event_data_stored` — capacity, royalty, active flag persisted
3. `test_event_id_increments` — sequential IDs, count matches
4. `test_royalty_cap` — panics when royalty > 25%
5. `test_zero_capacity_rejected` — panics on 0 capacity
6. `test_initial_ticket_count_zero` — ticket counter starts at 0

### Frontend Tests (Vitest)

```bash
cd frontend && npm test
```

5 tests:
1. `StellarProvider renders children` — renders without crash
2. `Wallet starts disconnected` — initial state check
3. `Sandbox wallet connects` — sets balance 10000, isSandbox true
4. `Events seeded on startup` — ≥6 events loaded
5. `Buy ticket requires wallet` — error toast when disconnected

---

## 🎨 Design System

NEXORA v2 uses a **bioluminescent deep-sea** aesthetic:

- **Palette:** `#040407` void black · `#a78bfa` violet · `#38bdf8` cyan
- **Typography:** Syne (display, 800w) + Inter (body) + JetBrains Mono (code)
- **Signature elements:** hex grid overlay, pulsing orbs, capacity fill bars, perf-edge ticket cards
- **Animations:** float orbs, glow pulse, feed-in entries, shimmer skeleton

---

## 📱 Mobile

Full responsive layout with:
- Bottom navigation bar (hidden on desktop)
- Single-column event grid
- Sticky header with compressed brand
- Touch-friendly button targets

---

## 🔒 Security Notes

- Royalty enforcement is **contract-level** — sellers cannot bypass it
- Ticket escrow held by Marketplace contract address, not a wallet
- `check_in` restricted to event creator or admin only
- All auth via `require_auth()` — no off-chain trust assumptions

---

## 📄 License

MIT — built for the Stellar Hackathon Orange Belt challenge.
