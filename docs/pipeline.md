# Pipeline Builder Documentation

## Overview
The **Pipeline Builder** enables the chaining of discrete Soroban Applets into complex, automated workflows. This allows developers to build decentralized applications (dApps) by composing existing verified logic blocks.

## 🔗 Architecture
A pipeline is essentially a Directed Acyclic Graph (DAG) where:
*   **Nodes**: Applet instances (smart contracts).
*   **Edges**: Data passed between applets.

### Atomic Execution
Pipelines in Nexus are **atomic per step** but **stateful across the flow**.
*   **Step 1** executes and persists its result on-chain (or returns it to the client).
*   **Step 2** reads the signed output of Step 1 as its input.
*   This ensures that Step 2 cannot be executed with spoofed data; it *must* come from a verified Step 1 execution.

## 🛠 Pipeline Specification (JSON)

Pipelines are defined using a JSON schema:

```json
{
  "pipeline_id": "pip_12345",
  "name": "Data Verification Flow",
  "stages": [
    {
      "id": 1,
      "type": "execution",
      "contract_id": "CC7T...",
      "function": "execute",
      "inputs": ["${USER_INPUT}"]
    },
    {
      "id": 2,
      "type": "processing",
      "contract_id": "CC7T...",
      "function": "generate_hash",
      "inputs": ["${STAGE_1_OUTPUT}"]
    }
  ]
}
```

## 🚦 Execution Stages

### 1. Initialization
The client parses the JSON spec and validates that all referenced contracts exist and the user has sufficient XLM balance.

### 2. Sequential Processing
The frontend execution engine (client-side orchestrator) iterates through the stages:
1.  **Prepare**: Formats arguments for the Soroban invoke.
2.  **Sign**: Prompts user (via Freighter) to sign the invocation.
3.  **Submit**: Broadcasts to Stellar network.
4.  **Wait**: Polls for transaction confirmation.
5.  **Extract**: Decodes the XDR return value for the next step.

### 3. Error Handling
*   **Contract Panic**: If a contract panics (e.g., input validation fails), the pipeline halts.
*   **Network Error**: The orchestrator retries using exponential backoff.
*   **State Recovery**: Since each step is a blockchain transaction, a halted pipeline can be "resumed" from the last successful step.

## 🧠 Hybrid Compute (AI Integration)
Nexus pipelines can include **Off-Chain Steps**.
*   Instead of calling a contract, the orchestrator calls a signed API endpoint (e.g., an LLM inference server).
*   The result is signed by the Oracle key and passed back to the next On-Chain step.
*   This enables "Oracle-less" AI integration where the user acts as the bridge.
