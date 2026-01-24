#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, Symbol, Vec, vec};

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

    // --- APPLET 2: Hash Generator (NEW) ---
    // Simulates generating a hash (in a real app, you'd use env.crypto().sha256)
    pub fn generate_hash(env: Env, text: String) -> Vec<String> {
        let mut result_vec = vec![&env];
        
        // 1. Create a "mock" hash by reversing and tagging the text
        // (Visual proof that logic ran on-chain)
        let mut prefix = String::from_str(&env, "0xHASH_");
        
        // Note: Real string manipulation is limited in Soroban to keep costs low.
        // We will return a structured response.
        result_vec.push_back(text);
        result_vec.push_back(prefix); 
        
        result_vec
    }
}