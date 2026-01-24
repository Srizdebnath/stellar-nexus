# Stellar Nexus Protocol

**Stellar Nexus** is a decentralized computing marketplace and pipeline orchestrator built on the **Stellar Soroban** network. It enables the seamless exchange, verification, and execution of serverless logic (Applets) in a trustless environment.

## 🏗 System Architecture

The protocol consists of three primary layers:

```mermaid
graph TD
    A[User / Developer] -->|Interacts via| B[Nexus Frontend (Next.js)]
    B -->|Calls| C[Freighter Wallet]
    C -->|Signs Tx| D[Soroban Smart Contracts]
    
    subgraph "On-Chain (Soroban)"
        D -->|Registry| E[Marketplace Contract]
        D -->|Execution| F[Pipeline Orchestrator]
        E -->|Verifies| G[Logic Hash / WASM]
    end
    
    subgraph "Off-Chain / Hybrid"
        B -->|AI Inference| H[Local LLM / API]
        H -->|Proof of Inference| D
    end
```

## 🚀 Core Features

### 1. Logic Marketplace
A decentralized registry where developers can publish verified Soroban contracts.
- **Verification**: Contracts are hashed and verified against their source code.
- **Monetization**: Creators earn XLM every time their logic is purchased or instantiated.
- **Discovery**: Users can filter by functionality (e.g., "Hashing", "Data Processing", "AI").

### 2. Pipeline Orchestrator
A stateful execution engine that chains multiple Applets into a single workflow.
- **Atomic Execution**: If one step fails, the entire pipeline reverts (where applicable).
- **Data Flow**: Output from `Step N` is cryptographically signed and passed as input to `Step N+1`.
- **Hybrid Compute**: Pipelines can mix on-chain deterministic logic with off-chain AI inference.

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind | Server-side rendering, responsive UI. |
| **3D Engine** | React Three Fiber (R3F) | High-fidelity 3D rendering for the Crystal UI. |
| **Blockchain** | Stellar Soroban (Rust) | Smart contract logic and state storage. |
| **Wallet** | Freighter | Key management and transaction signing. |
| **Storage** | IPFS / On-Chain | WASM binaries stored on-chain or linked via IPFS. |

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Rust & Cargo (for contract development)
- Stellar CLI (`soroban-cli`)
- Freighter Wallet Extension

### Quick Start

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/stellar-nexus/protocol.git
    cd protocol
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and submission process.

---

**License**: MIT
**Version**: 0.1.0-beta
