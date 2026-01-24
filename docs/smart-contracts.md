# Smart Contracts Development Guide

## Overview
Nexus contracts are written in **Rust** and compiled to **WASM** for the **Stellar Soroban** network. This guide covers the standard interfaces required for your contract to be listed on the Marketplace.

## 📦 Standard Interface (Nexus Standard)

To ensure interoperability with the Pipeline Builder, your contract should expose metadata functions compatible with the Nexus Standard.

### 1. `get_metadata`

Returns a map of contract capabilities.

```rust
#[contractimpl]
impl MyContract {
    pub fn get_metadata(env: Env) -> Symbol {
        symbol_short!("NexusV1")
    }
}
```

### 2. `execute` (Recommended)

For general purpose processing contracts, exposing an `execute` function allows generic pipelines to invoke your logic.

```rust
#[contractimpl]
impl MyContract {
    pub fn execute(env: Env, input: String) -> String {
        // Your logic here
        let processed = ...;
        processed
    }
}
```

## 🏗 Development Workflow

### 1. Setup
Initialize a new Soroban project:
```bash
soroban contract init my-applet
cd my-applet
```

### 2. Write Logic
Edit `src/lib.rs`. Ensure you use `#[contract]` and `#[contractimpl]` macros.

### 3. Test
Use the Soroban test framework to verify logic off-chain:
```bash
cargo test
```

### 4. Build
Compile to efficient WASM:
```bash
soroban contract build --release
```
The output file will be at `target/wasm32-unknown-unknown/release/my_applet.wasm`.

### 5. Deploy
Deploy to Testnet:
```bash
soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/my_applet.wasm \
    --source YOUR_SECRET_KEY \
    --network testnet
```
Save the returned **Contract ID** (e.g., `CC7T...`).

## ⚠️ Security Best Practices
1.  **Input Validation**: Always sanitize `String` and `Bytes` inputs.
2.  **Auth**: Use `Address::require_auth()` for privileged functions.
3.  **Storage**: Be mindful of Ledger Entry TTL. Use `env.storage().persistent()` for longterm data.
