export const APPLETS = [
  {
    id: 1,
    name: "Text Processor",
    contractId: "YOUR_TEXT_CONTRACT_ID", // Paste your Text Processor ID
    owner: "GD2M...XFYZ",
    description: "[Functions: get_stats, execute] Process and analyze text data on-chain.",
    price: "10",
    inputSchema: "String",
    outputSchema: "String (Stats)",
    totalExecutions: 142,
    trustScore: "100%",
    status: "Active",
    color: "blue"
  },
  {
    id: 2,
    name: "Hash Generator",
    contractId: "YOUR_HASH_CONTRACT_ID", 
    owner: "GD2M...XFYZ",
    description: "[Functions: generate_hash] Cryptographic hash generation for any input data.",
    price: "25",
    inputSchema: "String",
    outputSchema: "BytesN<32> (Hex)",
    totalExecutions: 89,
    trustScore: "98%",
    status: "Active",
    color: "purple"
  },
  {
    id: 3,
    name: "Data Validator",
    contractId: "Coming Soon",
    owner: "GD2M...XFYZ",
    description: "[Functions: validate] JSON structure validation with field checking.",
    price: "15",
    inputSchema: "JSON",
    outputSchema: "Boolean",
    totalExecutions: 0,
    trustScore: "100%",
    status: "Standard",
    color: "green"
  }
];