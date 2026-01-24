export const APPLETS = [
  {
    id: 1,
    name: "Text Processor",
    contractId: "CBBGXGBFGKRNPETQH6AKBWIHPC7HM5IJFOB7YOIT34QWYBWHVYJUAE5Z", 
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
    contractId: "CDHQIJJJIP2QRH7EGLEJFPGJ7JD3XAWUN43Y3CXVCZX2JYDPG6C5YQ2J", 
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
    name: "ASCII Art Gen",
    contractId: "CC6MG2FDXFJYOAHRNSB6RVSUWDDYS6HV6FCUB4ESNISK575GS4WMBVAJ",
    owner: "GD2M...XFYZ",
    description: "[Functions: generate_art] Generates retro ASCII art frames for your text on-chain.",
    price: "5",
    inputSchema: "String",
    outputSchema: "Vec<String>",
    totalExecutions: 42,
    trustScore: "100%",
    status: "Active",
    color: "green"
  },
];