#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, Symbol, Vec, vec};

#[contract]
pub struct TextProcessor;

#[contractimpl]
impl TextProcessor {
    // Function 1: Analyze the text (Returns character count)
    pub fn get_stats(_env: Env, text: String) -> u32 {
        text.len()
    }

    // Function 2: Process the text (Simulates the pipeline work)
    pub fn execute(env: Env, text: String) -> Vec<String> {
        let mut result_vec = vec![&env];

        // 1. Add the original text
        result_vec.push_back(text.clone());

        // 2. Add a status message (Simulating a "process")
        let status_msg = String::from_str(&env, "Verified on Stellar Nexus");
        result_vec.push_back(status_msg);

        // 3. Return the list
        result_vec
    }
}