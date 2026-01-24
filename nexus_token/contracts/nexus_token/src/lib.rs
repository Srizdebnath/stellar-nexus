#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};
use soroban_token_sdk::metadata::TokenMetadata;

#[contract]
pub struct NexusToken;

#[contractimpl]
impl NexusToken {
    /// Initializes the token contract.
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String) {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            panic!("already initialized");
        }
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "admin"), &admin);

        let metadata = TokenMetadata {
            name,
            symbol,
            decimal: 7,
        };
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "metadata"), &metadata);
    }

    /// Mints new tokens.
    pub fn mint(env: Env, to: Address, amount: i128) {
        // Authenticate the admin
        let admin: Address = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "admin"))
            .unwrap();
        admin.require_auth();

        // Update balance manually
        let mut balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&to, &balance);
    }

    /// Helper to read balance
    pub fn balance(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&user).unwrap_or(0)
    }
}
