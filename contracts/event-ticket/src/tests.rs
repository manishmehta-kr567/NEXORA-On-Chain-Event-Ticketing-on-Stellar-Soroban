#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    Address, Env, String, IntoVal, Symbol,
};

fn setup() -> (Env, EventTicketContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, EventTicketContract);
    let client = EventTicketContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, client)
}

// ─── Test 1: Create event ─────────────────────────────────────────────────────
#[test]
fn test_create_event_returns_id() {
    let (env, client) = setup();
    let creator = Address::generate(&env);
    let id = client.create_event(
        &creator,
        &100_0000000i128, // 100 XLM in stroops
        &500u64,
        &500u64, // 5% royalty
        &String::from_str(&env, "ipfs://test-event"),
    );
    assert_eq!(id, 1, "first event should have id=1");
}

// ─── Test 2: Event data stored correctly ─────────────────────────────────────
#[test]
fn test_event_data_stored() {
    let (env, client) = setup();
    let creator = Address::generate(&env);
    client.create_event(
        &creator,
        &50_0000000i128,
        &200u64,
        &1000u64, // 10% royalty
        &String::from_str(&env, "ipfs://music-fest"),
    );
    let evt = client.get_event(&1u64);
    assert_eq!(evt.capacity, 200);
    assert_eq!(evt.sold, 0);
    assert_eq!(evt.royalty_bps, 1000);
    assert!(evt.is_active);
}

// ─── Test 3: Duplicate event IDs increment ────────────────────────────────────
#[test]
fn test_event_id_increments() {
    let (env, client) = setup();
    let creator = Address::generate(&env);
    let id1 = client.create_event(&creator, &0i128, &100u64, &0u64, &String::from_str(&env, "a"));
    let id2 = client.create_event(&creator, &0i128, &100u64, &0u64, &String::from_str(&env, "b"));
    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(client.get_event_count(), 2);
}

// ─── Test 4: Royalty bps cap enforced ────────────────────────────────────────
#[test]
#[should_panic(expected = "royalty must be ≤ 25%")]
fn test_royalty_cap() {
    let (env, client) = setup();
    let creator = Address::generate(&env);
    client.create_event(&creator, &100i128, &100u64, &3000u64, &String::from_str(&env, "x"));
}

// ─── Test 5: Capacity validation ─────────────────────────────────────────────
#[test]
#[should_panic(expected = "capacity must be > 0")]
fn test_zero_capacity_rejected() {
    let (env, client) = setup();
    let creator = Address::generate(&env);
    client.create_event(&creator, &0i128, &0u64, &0u64, &String::from_str(&env, "y"));
}

// ─── Test 6: Ticket count starts at zero ─────────────────────────────────────
#[test]
fn test_initial_ticket_count_zero() {
    let (_, client) = setup();
    assert_eq!(client.get_ticket_count(), 0);
}
