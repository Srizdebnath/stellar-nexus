#![no_std]
use soroban_sdk::xdr::ToXdr;
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, vec, Address, BytesN, Env, IntoVal,
    String, Val, Vec,
};

#[contract]
pub struct NexusContract;

// --- STORAGE KEYS ---
#[contracttype]
pub enum DataKey {
    Listing(u64), // Map Listing ID -> Listing
    NextId,       // Counter for IDs
}

// --- DATA TYPES ---
#[contracttype]
#[derive(Clone)]
pub struct AppletListing {
    pub id: u64,
    pub owner: Address,
    pub name: String,
    pub price: i128,      // Price in XLM (stroops)
    pub code_uri: String, // IPFS hash or code snippet
}

#[contractimpl]
impl NexusContract {
    // ============================================================
    // 🛍️ MARKETPLACE LOGIC
    // ============================================================

    /// List a new applet for sale
    pub fn list_applet(env: Env, owner: Address, name: String, price: i128, code: String) -> u64 {
        owner.require_auth();

        // 1. Get ID
        let id = Self::get_next_id(&env);

        // 2. Create Listing
        let listing = AppletListing {
            id,
            owner: owner.clone(),
            name,
            price,
            code_uri: code,
        };

        // 3. Save to Storage
        env.storage()
            .persistent()
            .set(&DataKey::Listing(id), &listing);
        env.storage().persistent().set(&DataKey::NextId, &(id + 1));

        id
    }

    /// Buy an applet (Transfers XLM from buyer to seller)
    /// Note: buyer must have approved this contract to spend 'amount' tokens if using a custom token,
    /// but for Native XLM transfer via invoke, we usually move funds differently.
    /// For this demo, we simulate the logic: "If I pay, I get rights".
    pub fn buy_applet(env: Env, buyer: Address, listing_id: u64, token_address: Address) -> bool {
        buyer.require_auth();

        // 1. Fetch Listing
        let listing: AppletListing = env
            .storage()
            .persistent()
            .get(&DataKey::Listing(listing_id))
            .unwrap();

        // 2. Prevent Self-Buying
        if buyer == listing.owner {
            panic!("Nexus: Owner cannot buy their own applet");
        }

        // 3. Execute Transfer
        // client.transfer(&buyer, &listing.owner, &listing.price);
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&buyer, &listing.owner, &listing.price);

        true
    }

    /// Helper: Get Next ID
    fn get_next_id(env: &Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::NextId)
            .unwrap_or(1)
    }

    /// Helper: Get Listing Details
    pub fn get_listing(env: Env, listing_id: u64) -> AppletListing {
        env.storage()
            .persistent()
            .get(&DataKey::Listing(listing_id))
            .unwrap()
    }

    /// Helper: Get Total Listing Count
    pub fn get_listing_count(env: Env) -> u64 {
        Self::get_next_id(&env) - 1
    }

    // ============================================================
    // ⚡ PREVIOUS DEMO LOGIC (Text, Hash, Art)
    // ============================================================

    // --- APPLET 1: Text Processor ---
    pub fn get_stats(env: Env, text: String) -> u32 {
        text.len()
    }

    pub fn execute(env: Env, text: String) -> Vec<String> {
        let mut result_vec = vec![&env];
        result_vec.push_back(text.clone());
        let status_msg = String::from_str(&env, "Verified on Stellar Nexus");
        result_vec.push_back(status_msg);
        result_vec
    }

    // --- APPLET 2: Hash Generator (REAL CRYPTO) ---
    pub fn generate_hash(env: Env, text: String) -> BytesN<32> {
        let data_bytes = text.to_xdr(&env);
        env.crypto().sha256(&data_bytes).into()
    }

    // --- APPLET 3: ASCII Art Generator ---
    pub fn generate_art(env: Env, text: String) -> Vec<String> {
        let mut art = vec![&env];
        let top_border = String::from_str(&env, "+----------------------+");
        let spacer = String::from_str(&env, "|                      |");

        art.push_back(top_border.clone());
        art.push_back(spacer.clone());
        art.push_back(text);
        art.push_back(spacer);
        art.push_back(top_border);
        art
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, String};

    #[test]
    fn test_get_stats() {
        let env = Env::default();
        let text = String::from_str(&env, "hello");
        assert_eq!(NexusContract::get_stats(env, text), 5);
    }

    #[test]
    fn test_execute() {
        let env = Env::default();
        let text = String::from_str(&env, "run");
        let res = NexusContract::execute(env, text);
        assert_eq!(res.len(), 2);
    }

    #[test]
    fn test_generate_art() {
        let env = Env::default();
        let text = String::from_str(&env, "art");
        let res = NexusContract::generate_art(env, text);
        assert_eq!(res.len(), 5);
    }
}
