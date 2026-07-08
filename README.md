# 🚀 NEXORA v2 — On-Chain Event Ticketing on Stellar Soroban

NEXORA is a fully decentralized, production-ready event ticketing platform built on Stellar (Soroban). Tickets are NFTs minted on-chain, ownership is verifiable, and secondary market royalties are enforced atomically by smart contracts — no middlemen, no ticket scalping abuse.

## 🔗 Live Demo & Video Pitch
- **Live Platform**: [https://nexora-on-chain-event-ticketing-on-omega.vercel.app/](https://nexora-on-chain-event-ticketing-on-omega.vercel.app/)
- **Demo Video**: [Watch the Demo on Google Drive](https://drive.google.com/file/d/1f7ZckkHdnPu9UOyyB_gaWt4xQarqbLTj/view?usp=sharing)

## 🌟 Key Features

1. **On-Chain Ticket Minting**: Create events with capacity and price caps. Buy tickets that are minted as NFTs directly to your Stellar wallet.
2. **Escrow Secondary Market**: List your tickets on the decentralized secondary market. Smart contracts act as trustless escrow.
3. **Atomic Royalty Splits**: When a ticket is resold on the secondary market, the contract automatically splits the payment, sending the creator their predefined royalty instantly.
4. **Real Wallet Integration**: Full Freighter wallet connection with live balance tracking and real cryptographic transaction signing on the Stellar Testnet.
5. **Premium UI**: Built with React, Vite, and Vanilla CSS featuring a stunning bioluminescent deep-sea dark mode, glassmorphism, and neon accents. Fully mobile responsive.

---

## 📸 Platform Gallery & Submission Requirements

As per the submission checklist, here are the required screenshots demonstrating the platform's capabilities:

### 1. Mobile Responsive UI
The platform is fully responsive and optimized for mobile devices.
<img src="screenshots/mobile_ui.png" width="100%" alt="Mobile Responsive UI" />

### 2. CI/CD Pipeline Running
Automated GitHub Actions workflow running tests, building WASM, and deploying the frontend.
<img src="screenshots/ci_cd_pipeline.png" width="100%" alt="CI/CD Pipeline" />

### 3. Test Output (Passing Tests)
Comprehensive Rust integration tests validating the smart contract logic.
<img src="screenshots/test_output.png" width="100%" alt="Cargo Test Output" />

### 4. Stellar Explorer Verification
Real transactions successfully submitted to the Stellar Testnet and verifiable on Stellar Expert.
<img src="screenshots/stellar_explorer.png" width="100%" alt="Stellar Explorer Transaction" />

---
## 🔗 Deployed Contracts

| Contract | Testnet Address |
|---|---|
| EventTicket | `CD5D5OKVOUMLZS4HWRPH7T7VNSMWE5CKSO7S6AII3UFJZGFEUMOQEYFH` |
| Marketplace | `CDFDYFNVT2IWLHUEFCF4GDFR7MD3Y6RKJZNOI7VOSHLMHTZXEMLX4PVI` |

### Transaction Hashes (Contract Interaction)
As part of the deployment and initialization, the contracts were interacted with on the Stellar Testnet. You can verify the transactions here:
- **EventTicket Initialization**: [8e77ddcd8ee237db0c415c3ced621eb392724b6b6b33b70245050bf3872fcbca](https://stellar.expert/explorer/testnet/tx/8e77ddcd8ee237db0c415c3ced621eb392724b6b6b33b70245050bf3872fcbca)
- **Marketplace Initialization**: [2429aa6893f26c526c0c9354382eafbfe04b9f8f7510bb441712b7a001f1b288](https://stellar.expert/explorer/testnet/tx/2429aa6893f26c526c0c9354382eafbfe04b9f8f7510bb441712b7a001f1b288)

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
```

The Marketplace calls EventTicket via `contractimport!` for ownership transfers and royalty BPS lookup, demonstrating real inter-contract communication.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Rust + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) v22+
- [Freighter Wallet](https://www.freighter.app/)

### Smart Contracts

```bash
# Test
cargo test --workspace

# Build
cargo build --target wasm32-unknown-unknown --release
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```
