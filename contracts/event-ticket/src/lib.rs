#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, symbol_short,
    Address, Env, String, Symbol,
    map, vec, Map, Vec,
    log,
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const ADMIN_KEY: Symbol        = symbol_short!("ADMIN");
const EVT_CNT_KEY: Symbol      = symbol_short!("EVT_CNT");
const TKT_CNT_KEY: Symbol      = symbol_short!("TKT_CNT");

fn event_key(id: u64) -> (Symbol, u64) { (symbol_short!("EVT"), id) }
fn ticket_key(id: u64) -> (Symbol, u64) { (symbol_short!("TKT"), id) }
fn owner_tickets_key(owner: &Address) -> (Symbol, Address) { (symbol_short!("OWN_TKT"), owner.clone()) }

// ─── Data Types ───────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug)]
pub struct EventData {
    pub id:               u64,
    pub creator:          Address,
    pub price:            i128,
    pub capacity:         u64,
    pub sold:             u64,
    pub royalty_bps:      u64,   // basis points (500 = 5%)
    pub metadata_uri:     String,
    pub is_active:        bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct TicketData {
    pub id:           u64,
    pub event_id:     u64,
    pub owner:        Address,
    pub is_checked_in: bool,
    pub purchased_at:  u64,
}

// ─── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct EventTicketContract;

#[contractimpl]
impl EventTicketContract {

    // Initialize — set admin, seed counters
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&EVT_CNT_KEY, &0u64);
        env.storage().instance().set(&TKT_CNT_KEY, &0u64);
    }

    // ── Events ──────────────────────────────────────────────────────────────

    pub fn create_event(
        env:          Env,
        creator:      Address,
        price:        i128,
        capacity:     u64,
        royalty_bps:  u64,
        metadata_uri: String,
    ) -> u64 {
        creator.require_auth();
        assert!(capacity > 0,      "capacity must be > 0");
        assert!(royalty_bps <= 2500, "royalty must be ≤ 25%");
        assert!(price >= 0,         "price must be ≥ 0");

        let id: u64 = env.storage().instance().get(&EVT_CNT_KEY).unwrap_or(0) + 1;
        env.storage().instance().set(&EVT_CNT_KEY, &id);

        let evt = EventData {
            id, creator: creator.clone(),
            price, capacity, sold: 0,
            royalty_bps, metadata_uri, is_active: true,
        };
        env.storage().persistent().set(&event_key(id), &evt);

        // Emit event
        env.events().publish(
            (symbol_short!("evt_crtd"), creator),
            (id, price, capacity),
        );
        id
    }

    pub fn deactivate_event(env: Env, admin: Address, event_id: u64) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        let mut evt: EventData = env.storage().persistent()
            .get(&event_key(event_id)).expect("event not found");
        evt.is_active = false;
        env.storage().persistent().set(&event_key(event_id), &evt);
    }

    // ── Tickets ─────────────────────────────────────────────────────────────

    pub fn buy_ticket(
        env:           Env,
        buyer:         Address,
        event_id:      u64,
        payment_token: Address,
    ) -> u64 {
        buyer.require_auth();

        let mut evt: EventData = env.storage().persistent()
            .get(&event_key(event_id)).expect("event not found");
        assert!(evt.is_active,         "event is not active");
        assert!(evt.sold < evt.capacity, "event is sold out");

        // Transfer payment to creator
        if evt.price > 0 {
            let token_client = token::Client::new(&env, &payment_token);
            token_client.transfer(&buyer, &evt.creator, &evt.price);
        }

        // Mint ticket
        evt.sold += 1;
        env.storage().persistent().set(&event_key(event_id), &evt);

        let tkt_id: u64 = env.storage().instance().get(&TKT_CNT_KEY).unwrap_or(0) + 1;
        env.storage().instance().set(&TKT_CNT_KEY, &tkt_id);

        let tkt = TicketData {
            id: tkt_id,
            event_id,
            owner: buyer.clone(),
            is_checked_in: false,
            purchased_at: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&ticket_key(tkt_id), &tkt);

        // Update owner index
        let mut owned: Vec<u64> = env.storage().persistent()
            .get(&owner_tickets_key(&buyer)).unwrap_or(vec![&env]);
        owned.push_back(tkt_id);
        env.storage().persistent().set(&owner_tickets_key(&buyer), &owned);

        env.events().publish(
            (symbol_short!("tkt_mntd"), buyer),
            (tkt_id, event_id),
        );
        tkt_id
    }

    pub fn transfer(env: Env, from: Address, to: Address, ticket_id: u64) {
        from.require_auth();
        let mut tkt: TicketData = env.storage().persistent()
            .get(&ticket_key(ticket_id)).expect("ticket not found");
        assert!(&tkt.owner == &from, "not ticket owner");
        assert!(!tkt.is_checked_in,  "checked-in tickets cannot be transferred");

        let mut from_tickets: Vec<u64> = env.storage().persistent()
            .get(&owner_tickets_key(&from)).unwrap_or(vec![&env]);
        if let Some(idx) = from_tickets.first_index_of(ticket_id) {
            from_tickets.remove(idx);
        }
        env.storage().persistent().set(&owner_tickets_key(&from), &from_tickets);

        let mut to_tickets: Vec<u64> = env.storage().persistent()
            .get(&owner_tickets_key(&to)).unwrap_or(vec![&env]);
        to_tickets.push_back(ticket_id);
        env.storage().persistent().set(&owner_tickets_key(&to), &to_tickets);

        tkt.owner = to.clone();
        env.storage().persistent().set(&ticket_key(ticket_id), &tkt);

        env.events().publish(
            (symbol_short!("tkt_trns"), from),
            (ticket_id, to),
        );
    }

    pub fn check_in(env: Env, caller: Address, ticket_id: u64) {
        caller.require_auth();
        let mut tkt: TicketData = env.storage().persistent()
            .get(&ticket_key(ticket_id)).expect("ticket not found");
        let evt: EventData = env.storage().persistent()
            .get(&event_key(tkt.event_id)).expect("event not found");

        // Only event creator or admin can check in
        assert!(&caller == &evt.creator || Self::is_admin(&env, &caller), "unauthorized");
        assert!(!tkt.is_checked_in, "already checked in");

        tkt.is_checked_in = true;
        env.storage().persistent().set(&ticket_key(ticket_id), &tkt);

        env.events().publish(
            (symbol_short!("tkt_clmd"), caller),
            ticket_id,
        );
    }

    // ── Queries ─────────────────────────────────────────────────────────────

    pub fn get_event(env: Env, event_id: u64) -> EventData {
        env.storage().persistent()
            .get(&event_key(event_id)).expect("event not found")
    }

    pub fn get_ticket(env: Env, ticket_id: u64) -> TicketData {
        env.storage().persistent()
            .get(&ticket_key(ticket_id)).expect("ticket not found")
    }

    pub fn get_tickets_for_owner(env: Env, owner: Address) -> Vec<u64> {
        env.storage().persistent()
            .get(&owner_tickets_key(&owner)).unwrap_or(vec![&env])
    }

    pub fn get_event_count(env: Env) -> u64 {
        env.storage().instance().get(&EVT_CNT_KEY).unwrap_or(0)
    }

    pub fn get_ticket_count(env: Env) -> u64 {
        env.storage().instance().get(&TKT_CNT_KEY).unwrap_or(0)
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    fn require_admin(env: &Env, caller: &Address) {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        assert!(caller == &admin, "admin only");
    }

    fn is_admin(env: &Env, caller: &Address) -> bool {
        env.storage().instance()
            .get::<Symbol, Address>(&ADMIN_KEY)
            .map(|a| &a == caller)
            .unwrap_or(false)
    }
}
