#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, Vec, vec, BytesN};
use soroban_sdk::xdr::ToXdr; // <--- FIX 1: Needed for .to_xdr()

#[contract]
pub struct NexusContract;

#[contractimpl]
impl NexusContract {
    
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
        
        // 1. Convert String to Bytes (Requires use soroban_sdk::xdr::ToXdr)
        let data_bytes = text.to_xdr(&env);

        // 2. Compute SHA256
        // FIX 2: Added .into() to convert the internal Hash type to BytesN<32>
        env.crypto().sha256(&data_bytes).into()
    }

    // --- APPLET 3: ASCII Art Generator ---
    pub fn generate_art(env: Env, text: String) -> Vec<String> {
        let mut art = vec![&env];
        
        // Create a retro "Frame" around the text
        let top_border = String::from_str(&env, "+----------------------+");
        let spacer = String::from_str(&env, "|                      |");
        
        art.push_back(top_border.clone());
        art.push_back(spacer.clone());
        
        // Push the user's text (In the center)
        art.push_back(text);
        
        art.push_back(spacer);
        art.push_back(top_border);
        
        art
    }
}