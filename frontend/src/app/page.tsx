"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess, signTransaction } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Networks } from '@stellar/stellar-sdk';
import { X, Lock, Download, Rocket, CheckCircle } from 'lucide-react';

// ✅ IMPORT YOUR V3 CONTRACT BINDINGS
import { Client } from "../contracts/nexus_v3/src";

// 🛑 CONFIGURATION
const CONTRACT_ID = "CDHQIJJJIP2QRH7EGLEJFPGJ7JD3XAWUN43Y3CXVCZX2JYDPG6C5YQ2J"; // Your V3 ID

// 💰 PASTE YOUR SECOND WALLET ADDRESS HERE (The one receiving the money)
const CREATOR_WALLET = "GBKPWDVU4MJQ4JPMMYWOFTKAGQCSGOWC4MRHMS4VXUJSJJ6HYZBG2OPH";

// --- DATA: MARKETPLACE LISTING ---
const APPLETS = [
  {
    id: 1,
    name: "Text Processor",
    contractId: CONTRACT_ID,
    owner: CREATOR_WALLET,
    description: "[Functions: get_stats, execute] Process and analyze text data on-chain. Returns verified stats.",
    price: "10", // Cost in XLM
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
    contractId: CONTRACT_ID,
    owner: CREATOR_WALLET,
    description: "[Functions: generate_hash] Cryptographic SHA-256 hash generation for any input data.",
    price: "25", // Cost in XLM
    inputSchema: "String",
    outputSchema: "BytesN<32> (Hex)",
    totalExecutions: 89,
    trustScore: "98%",
    status: "Active",
    color: "purple"
  },
  // ... other applets ...
];

// --- HELPER: CONVERT BYTES TO HEX ---
const toHex = (buffer: Uint8Array | number[]) => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// --- COMPONENT: APPLET DETAILS MODAL ---
function AppletModal({ applet, onClose, walletAddress }: { applet: any, onClose: () => void, walletAddress: string | null }) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [buying, setBuying] = useState(false);

  // --- 1. DOWNLOAD LOGIC ---
  const handleDownload = () => {
    // This triggers a browser download from the /public folder
    const link = document.createElement('a');
    link.href = '/stellar_nexus.wasm'; // The file we moved to public
    link.download = `${applet.name.replace(/\s+/g, '_').toLowerCase()}.wasm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

// --- 2. REAL PAYMENT LOGIC (DEBUGGED) ---
  const handleBuyCode = async () => {
    if (!walletAddress) {
      alert("Please connect wallet first");
      return;
    }
    setBuying(true);

    try {
      const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
      const source = await server.getAccount(walletAddress);

      console.log(`Processing payment of ${applet.price} XLM to ${CREATOR_WALLET}...`);

      // Build the Real Payment Transaction
      const transaction = new StellarSdk.TransactionBuilder(source, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: CREATOR_WALLET,
          asset: StellarSdk.Asset.native(),
          amount: applet.price,
        }))
        .setTimeout(30)
        .build();

      // Sign with Freighter
      const signResult = await signTransaction(transaction.toXDR(), {
        networkPassphrase: StellarSdk.Networks.TESTNET
      });

      if (signResult.error) {
        console.error("Sign Transaction Error:", signResult.error);
        alert("User cancelled signature.");
        setBuying(false);
        return;
      }

      // Submit to Network
      const tx = StellarSdk.TransactionBuilder.fromXDR(signResult.signedTxXdr, StellarSdk.Networks.TESTNET);
      
      try {
          const result = await server.sendTransaction(tx);
          console.log("Payment Confirmed:", result);
          
          // SUCCESS PATH
          setIsPurchased(true);
          setTimeout(() => {
            handleDownload();
            alert(`Payment Received! Downloading ${applet.name}...`);
          }, 1000);

      } catch (submitError: any) {
          // --- DETAILED ERROR LOGGING ---
          console.error("Submission Failed:", submitError);
          if (submitError.response?.data?.extras?.result_codes) {
              const codes = submitError.response.data.extras.result_codes;
              console.error("Stellar Error Codes:", codes);
              
              if (codes.operations && codes.operations.includes("op_no_destination")) {
                  alert("Error: The Creator Wallet (GBKP...) does not exist on Testnet yet. Go to Stellar Laboratory and fund it with Friendbot.");
              } else if (codes.operations && codes.operations.includes("op_underfunded")) {
                   alert("Error: You do not have enough XLM.");
              } else {
                  alert(`Transaction Failed: ${codes.transaction}`);
              }
          } else {
              alert("Transaction failed on the network. Check console for details.");
          }
      }

    } catch (e) {
      console.error("Payment Error:", e);
      alert("Transaction failed or cancelled.");
    }
    setBuying(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-50 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{applet.name}</h2>
              <span className={`px-2 py-0.5 text-xs rounded border border-${applet.color}-500/30 bg-${applet.color}-500/10 text-${applet.color}-400`}>
                {applet.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-mono">ID: #{applet.id} • Owner: {applet.owner.slice(0, 6)}...</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X className="w-6 h-6" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6 bg-[#0F0F11]">
          <div className="bg-[#151518] p-4 rounded-xl border border-white/5">
            <p className="text-xs text-blue-400 font-bold mb-1 uppercase">Execution Trust</p>
            <div className="text-3xl font-bold text-white">{applet.trustScore}</div>
          </div>
          <div className="bg-[#151518] p-4 rounded-xl border border-white/5">
            <p className="text-xs text-purple-400 font-bold mb-1 uppercase">Total Executions</p>
            <div className="text-3xl font-bold text-white">{applet.totalExecutions}</div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-4">
          <p className="text-gray-400 text-sm mb-6 p-4 bg-gray-900 rounded border border-white/5">{applet.description}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Source Code Price</p>
              <p className="text-2xl font-bold text-white">{applet.price} XLM</p>
            </div>
            <div className="flex gap-3">
              {!isPurchased ? (
                <button onClick={handleBuyCode} disabled={buying} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition">
                  {buying ? "Processing..." : <><Lock className="w-4 h-4" /> Buy Source Code</>}
                </button>
              ) : (
                <div className="flex gap-2 animate-in fade-in">
                  <button onClick={handleDownload} className="px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download .wasm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedApplet, setSelectedApplet] = useState<any>(null); // For Modal

  // Applet 1 State (Text Processor)
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Applet 2 State (Hash Generator)
  const [hashInput, setHashInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [hashLoading, setHashLoading] = useState(false);

  // 1. Connect Wallet
  const connectWallet = async () => {
    const allowed = await isAllowed();
    if (!allowed) await setAllowed();
    const access = await requestAccess();
    if (access?.address) setWalletAddress(access.address);
  };

  // 2. Run Text Processor
  const runStatsApplet = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: CONTRACT_ID,
        rpcUrl: "https://soroban-testnet.stellar.org",
        allowHttp: true,
        publicKey: walletAddress || undefined,
      });
      const tx = await client.execute({ text: inputText }, { fee: "10000", timeoutInSeconds: 30 });
      console.log("Stats Result:", tx);
      setResult(`Success! Verified on Stellar.`);
    } catch (e) {
      console.error("Error:", e);
      alert("Execution failed.");
    }
    setLoading(false);
  };

  // 3. Run Hash Generator
  const runHashApplet = async () => {
    if (!hashInput) { alert("Please enter text"); return; }
    setHashLoading(true);
    try {
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: CONTRACT_ID,
        rpcUrl: "https://soroban-testnet.stellar.org",
        allowHttp: true,
        publicKey: walletAddress || undefined,
      });
      const tx = await client.generate_hash({ text: hashInput }, { fee: "10000", timeoutInSeconds: 30 });
      console.log("Hash Result:", tx);
      if (tx && tx.result) {
        setHashResult("0x" + toHex(tx.result));
      } else {
        setHashResult("Success! (Check Console)");
      }
    } catch (e) {
      console.error("Error:", e);
      alert("Hash generation failed.");
    }
    setHashLoading(false);
  };

  const scrollToDemo = (id: number) => {
    if (id === 1) document.getElementById('demo-text')?.scrollIntoView({ behavior: 'smooth' });
    if (id === 2) document.getElementById('demo-hash')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">S</div>
          <span className="text-xl font-bold tracking-tight">Stellar Nexus</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="text-white font-medium">Marketplace</a>
          <a href="/pipeline" className="hover:text-white transition">Pipeline</a>
          <a href="#" className="hover:text-white transition">History</a>
        </div>
        <button onClick={connectWallet} className="bg-white text-black px-5 py-2 rounded-full font-medium text-sm hover:bg-gray-200 transition">
          {walletAddress ? `Connected: ${walletAddress.slice(0, 4)}...` : "Connect Wallet"}
        </button>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Compute, Decentralized.
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Deploy and execute verifiable logic on the Stellar network. Zero servers, infinite scalability.
        </p>
      </div>

      {/* MARKETPLACE LIST */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
          Applet Marketplace
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {APPLETS.map((applet) => (
            <div key={applet.id} className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">{applet.name}</h3>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <span className={`px-2 py-1 text-xs rounded border border-${applet.color}-500/20 bg-${applet.color}-500/10 text-${applet.color}-400`}>{applet.status}</span>
              </div>

              <p className="text-xs font-mono text-gray-500 mb-2">ID: #{applet.id} • {applet.contractId.slice(0, 8)}...</p>
              <p className="text-gray-400 text-sm mb-6 h-12 overflow-hidden leading-relaxed">{applet.description}</p>

              <div className="flex items-end justify-between border-t border-white/5 pt-4">
                <div>
                  <p className="text-xs text-gray-500">Execution Cost</p>
                  <p className="text-lg font-bold text-white">0.0010 XLM</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => scrollToDemo(applet.id)} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-sm font-medium transition flex items-center gap-2">
                    <Rocket className="w-3 h-3" /> Try Demo
                  </button>
                  <button onClick={() => setSelectedApplet(applet)} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition">
                    Buy Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INTERACTIVE DEMOS */}
        <h3 className="text-xl font-bold mb-6 text-gray-400 border-b border-white/10 pb-4">Live Execution Environment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="demo-text" className="group relative bg-[#0F0F11] border border-white/5 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute top-4 right-4 bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">Connected</div>
            <h3 className="text-xl font-bold mb-2">Text Processor</h3>
            <p className="text-gray-400 text-sm mb-6">Analyzes string length and processes basic transformations on-chain.</p>
            <div className="space-y-4">
              <input type="text" placeholder="Enter text..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500" value={inputText} onChange={(e) => setInputText(e.target.value)} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">ID: {CONTRACT_ID.slice(0, 6)}...</span>
                <span className="text-blue-400 font-bold text-sm">0.01 XLM</span>
              </div>
              <button onClick={runStatsApplet} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition flex justify-center items-center">
                {loading ? "Processing..." : "Execute Applet 🚀"}
              </button>
            </div>
            {result && <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg"><p className="text-xs text-blue-300 uppercase font-bold mb-1">Result</p><p className="text-white font-mono">{result}</p></div>}
          </div>

          <div id="demo-hash" className="group relative bg-[#0F0F11] border border-white/5 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded border border-purple-500/20">Connected</div>
            <h3 className="text-xl font-bold mb-2">Hash Generator</h3>
            <p className="text-gray-400 text-sm mb-6">Generate SHA-256 cryptographic proofs on-chain.</p>
            <div className="space-y-4">
              <input type="text" placeholder="Enter data to hash..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500" value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">ID: {CONTRACT_ID.slice(0, 6)}...</span>
                <span className="text-purple-400 font-bold text-sm">0.02 XLM</span>
              </div>
              <button onClick={runHashApplet} disabled={hashLoading} className="w-full bg-purple-900/50 hover:bg-purple-800 text-purple-100 border border-purple-500/30 py-2.5 rounded-lg font-medium transition flex justify-center items-center">
                {hashLoading ? "Hashing..." : "Generate Hash 🔒"}
              </button>
            </div>
            {hashResult && <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg overflow-hidden"><p className="text-xs text-purple-300 uppercase font-bold mb-1">On-Chain Hash Output</p><p className="text-white font-mono text-xs break-all">{hashResult}</p></div>}
          </div>
        </div>
      </div>

      {selectedApplet && (
        <AppletModal applet={selectedApplet} onClose={() => setSelectedApplet(null)} walletAddress={walletAddress} />
      )}
    </main>
  );
}