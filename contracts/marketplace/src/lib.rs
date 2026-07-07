#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contractclient, token, symbol_short,
    Address, Env, Symbol, String,
    vec, Vec,
};

// ─── Inter-contract client for EventTicket ────────────────────────────────────
mod event_ticket {
    use soroban_sdk::{contractimport, Env};
    contractimport!(file = "../../event-ticket/target/wasm32-unknown-unknown/release/event_ticket.wasm");
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const ADMIN_KEY: Symbol        = symbol_short!("ADMIN");
const EVT_CONTRACT: Symbol     = symbol_short!("EVT_CTR");
const LISTING_CNT: Symbol      = symbol_short!("LST_CNT");

fn listing_key(ticket_id: u64) -> (Symbol, u64) { (symbol_short!("LISTING"), ticket_id) }

// ─── Types ────────────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug)]
pub struct Listing {
    pub ticket_id:   u64,
    pub event_id:    u64,
    pub seller:      Address,
    pub price:       i128,
    pub listed_at:   u64,
    pub is_active:   bool,
}

// ─── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceContract {

    pub fn initialize(env: Env, admin: Address, event_contract: Address) {
        admin.require_auth();
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&EVT_CONTRACT, &event_contract);
        env.storage().instance().set(&LISTING_CNT, &0u64);
    }

    // ── List ────────────────────────────────────────────────────────────────

    /// Seller calls list — ticket is transferred to this contract as escrow
    pub fn list(
        env:           Env,
        seller:        Address,
        ticket_id:     u64,
        price:         i128,
        payment_token: Address,
    ) {
        seller.require_auth();
        assert!(price > 0, "price must be > 0");

        // Inter-contract call: transfer ticket ownership to this marketplace (escrow)
        let evt_contract: Address = env.storage().instance().get(&EVT_CONTRACT).expect("not init");
        let evt_client = event_ticket::Client::new(&env, &evt_contract);
        evt_client.transfer(&seller, &env.current_contract_address(), &ticket_id);

        // Fetch event_id for royalty lookup later
        let ticket = evt_client.get_ticket(&ticket_id);

        let listing = Listing {
            ticket_id,
            event_id: ticket.event_id,
            seller: seller.clone(),
            price,
            listed_at: env.ledger().timestamp(),
            is_active: true,
        };
        env.storage().persistent().set(&listing_key(ticket_id), &listing);

        let cnt: u64 = env.storage().instance().get(&LISTING_CNT).unwrap_or(0) + 1;
        env.storage().instance().set(&LISTING_CNT, &cnt);

        env.events().publish(
            (symbol_short!("listed"), seller),
            (ticket_id, price),
        );
    }

    // ── Buy ─────────────────────────────────────────────────────────────────

    /// Buyer pays → royalty split → ticket released to buyer
    pub fn buy(
        env:           Env,
        buyer:         Address,
        ticket_id:     u64,
        payment_token: Address,
    ) {
        buyer.require_auth();

        let mut listing: Listing = env.storage().persistent()
            .get(&listing_key(ticket_id)).expect("listing not found");
        assert!(listing.is_active, "listing is no longer active");

        // ── Inter-contract call: fetch event for royalty ──────────────────
        let evt_contract: Address = env.storage().instance().get(&EVT_CONTRACT).expect("not init");
        let evt_client = event_ticket::Client::new(&env, &evt_contract);
        let event = evt_client.get_event(&listing.event_id);

        // ── Royalty split ─────────────────────────────────────────────────
        let royalty_amount = (listing.price * event.royalty_bps as i128) / 10000;
        let seller_amount  = listing.price - royalty_amount;

        let token_client = token::Client::new(&env, &payment_token);

        // Pay seller
        token_client.transfer(&buyer, &listing.seller, &seller_amount);
        // Pay creator royalty (inter-contract enforced, not trust-based)
        if royalty_amount > 0 {
            token_client.transfer(&buyer, &event.creator, &royalty_amount);
        }

        // ── Release ticket to buyer ───────────────────────────────────────
        evt_client.transfer(&env.current_contract_address(), &buyer, &ticket_id);

        listing.is_active = false;
        env.storage().persistent().set(&listing_key(ticket_id), &listing);

        env.events().publish(
            (symbol_short!("sold"), buyer.clone()),
            (ticket_id, listing.price, royalty_amount),
        );
    }

    // ── Cancel ──────────────────────────────────────────────────────────────

    pub fn cancel(env: Env, seller: Address, ticket_id: u64) {
        seller.require_auth();

        let mut listing: Listing = env.storage().persistent()
            .get(&listing_key(ticket_id)).expect("listing not found");
        assert!(&listing.seller == &seller, "not the seller");
        assert!(listing.is_active, "already inactive");

        // Return ticket from escrow
        let evt_contract: Address = env.storage().instance().get(&EVT_CONTRACT).expect("not init");
        let evt_client = event_ticket::Client::new(&env, &evt_contract);
        evt_client.transfer(&env.current_contract_address(), &seller, &ticket_id);

        listing.is_active = false;
        env.storage().persistent().set(&listing_key(ticket_id), &listing);

        env.events().publish(
            (symbol_short!("cancelled"), seller),
            ticket_id,
        );
    }

    // ── Queries ─────────────────────────────────────────────────────────────

    pub fn get_listing(env: Env, ticket_id: u64) -> Listing {
        env.storage().persistent()
            .get(&listing_key(ticket_id)).expect("not found")
    }

    pub fn get_listing_count(env: Env) -> u64 {
        env.storage().instance().get(&LISTING_CNT).unwrap_or(0)
    }
}
