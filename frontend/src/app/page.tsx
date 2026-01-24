"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess, signTransaction } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Networks } from '@stellar/stellar-sdk';
import { X, Lock, Download, Rocket, CheckCircle, BrainCircuit } from 'lucide-react';

// ✅ IMPORT YOUR V4 CONTRACT BINDINGS
import { Client } from "../contracts/nexus_v4/src";

// 🛑 CONFIGURATION: PASTE YOUR V4 CONTRACT ID HERE
const CONTRACT_ID = "CC6MG2FDXFJYOAHRNSB6RVSUWDDYS6HV6FCUB4ESNISK575GS4WMBVAJ"; // <--- REPLACE WITH YOUR ACTUAL V4 ID

// 💰 PASTE YOUR CREATOR WALLET HERE
const CREATOR_WALLET = "GBKPWDVU4MJQ4JPMMYWOFTKAGQCSGOWC4MRHMS4VXUJSJJ6HYZBG2OPH";

// --- DATA: MARKETPLACE LISTING ---
const APPLETS = [
  {
    id: 1,
    name: "Text Processor",
    contractId: CONTRACT_ID,
    owner: CREATOR_WALLET,
    description: "[Functions: get_stats, execute] Process and analyze text data on-chain. Returns verified stats.",
    price: "10",
    status: "Active",
    color: "blue"
  },
  {
    id: 2,
    name: "Hash Generator",
    contractId: CONTRACT_ID,
    owner: CREATOR_WALLET,
    description: "[Functions: generate_hash] Cryptographic SHA-256 hash generation for any input data.",
    price: "25",
    status: "Active",
    color: "purple"
  },
  {
    id: 3,
    name: "ASCII Art Gen",
    contractId: CONTRACT_ID,
    owner: CREATOR_WALLET,
    description: "[Functions: generate_art] Generates retro ASCII art frames for your text on-chain.",
    price: "5",
    status: "Active",
    color: "green"
  },
  {
    id: 4,
    name: "AI Code Assistant",
    contractId: "N/A (Off-Chain)",
    owner: CREATOR_WALLET,
    description: "[Model: Llama 3.2] Custom-trained LLM to generate Soroban Rust code snippets.",
    price: "50",
    status: "Experimental",
    color: "yellow"
  }
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
            <div className="flex items-center gap-3 mb-2"><h2 className="text-2xl font-bold text-white">{applet.name}</h2><span className={`px-2 py-0.5 text-xs rounded border border-${applet.color}-500/30 bg-${applet.color}-500/10 text-${applet.color}-400`}>{applet.status}</span></div>
            <p className="text-gray-500 text-sm font-mono">ID: #{applet.id} • Owner: {applet.owner.slice(0, 6)}...</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X className="w-6 h-6" /></button>
        </div>
        <div className="px-6 pb-6 pt-4">
          <p className="text-gray-400 text-sm mb-6 p-4 bg-gray-900 rounded border border-white/5">{applet.description}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div><p className="text-xs text-gray-500 mb-1">Source Code Price</p><p className="text-2xl font-bold text-white">{applet.price} XLM</p></div>
            <div className="flex gap-3">
              {!isPurchased ? (
                <button onClick={handleBuyCode} disabled={buying} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2">
                  {buying ? "Processing..." : <><Lock className="w-4 h-4" /> Buy Source Code</>}
                </button>
              ) : (
                <button onClick={handleDownload} className="px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download .wasm
                </button>
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
  const [selectedApplet, setSelectedApplet] = useState<any>(null);

  // States for each applet
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [hashInput, setHashInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [hashLoading, setHashLoading] = useState(false);

  const [artInput, setArtInput] = useState("");
  const [artResult, setArtResult] = useState<string[]>([]);
  const [artLoading, setArtLoading] = useState(false);

  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const connectWallet = async () => {
    const allowed = await isAllowed();
    if (!allowed) await setAllowed();
    const access = await requestAccess();
    if (access?.address) setWalletAddress(access.address);
  };

  const runStatsApplet = async () => { if (!inputText) return; setLoading(true); try { const client = new Client({ networkPassphrase: Networks.TESTNET, contractId: CONTRACT_ID, rpcUrl: "https://soroban-testnet.stellar.org", allowHttp: true, publicKey: walletAddress || undefined }); await client.execute({ text: inputText }, { fee: "10000" }); setResult(`Success!`); } catch (e) { alert("Execution failed."); } setLoading(false); };
  const runHashApplet = async () => { if (!hashInput) return; setHashLoading(true); try { const client = new Client({ networkPassphrase: Networks.TESTNET, contractId: CONTRACT_ID, rpcUrl: "https://soroban-testnet.stellar.org", allowHttp: true, publicKey: walletAddress || undefined }); const tx = await client.generate_hash({ text: hashInput }, { fee: "10000" }); if (tx && tx.result) { setHashResult("0x" + toHex(tx.result)); } } catch (e) { alert("Hash failed."); } setHashLoading(false); };
  const runArtApplet = async () => {
    if (!artInput) return;
    setArtLoading(true);
    try {
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: CONTRACT_ID,
        rpcUrl: "https://soroban-testnet.stellar.org",
        allowHttp: true,
        publicKey: walletAddress || undefined,
      });

      // Call generate_art
      const tx = await client.generate_art({ text: `|  ${artInput}  |` }, { fee: "10000", timeoutInSeconds: 30 });

      console.log("Art Result:", tx);
      if (tx && tx.result) {
        setArtResult(tx.result); // result is an array of strings
      }
    } catch (e) {
      console.error(e);
      alert("Art generation failed.");
    }
    setArtLoading(false);
  };

  const runAiApplet = async () => {
    if (!aiInput) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const response = await fetch('http://localhost:4000/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiInput }),
      });
      if (!response.ok) throw new Error('AI server response error');
      const data = await response.json();
      setAiResult(data.code);
    } catch (e) {
      console.error(e);
      alert("AI code generation failed. Make sure your local AI server is running.");
    }
    setAiLoading(false);
  };

  const scrollToDemo = (id: number) => {
    document.getElementById(`demo-${id}`)?.scrollIntoView({ behavior: 'smooth' });
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
          An open marketplace for serverless logic, powered by Stellar Soroban and AI.
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
                <div className="flex items-center gap-2"><h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">{applet.name}</h3><CheckCircle className="w-4 h-4 text-green-500" /></div>
                <span className={`px-2 py-1 text-xs rounded border border-${applet.color}-500/20 bg-${applet.color}-500/10 text-${applet.color}-400`}>{applet.status}</span>
              </div>
              <p className="text-xs font-mono text-gray-500 mb-2">ID: #{applet.id} • {applet.contractId.slice(0, 8)}...</p>
              <p className="text-gray-400 text-sm mb-6 h-12 overflow-hidden leading-relaxed">{applet.description}</p>
              <div className="flex items-end justify-between border-t border-white/5 pt-4">
                <div><p className="text-xs text-gray-500">Execution Cost</p><p className="text-lg font-bold text-white">0.001 XLM</p></div>
                <div className="flex gap-3">
                  <button onClick={() => scrollToDemo(applet.id)} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-sm font-medium transition flex items-center gap-2"><Rocket className="w-3 h-3" /> Try Demo</button>
                  <button onClick={() => setSelectedApplet(applet)} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition">Buy Code</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INTERACTIVE DEMOS */}
        <h3 className="text-xl font-bold mb-6 text-gray-400 border-b border-white/10 pb-4">Live Execution Environment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div id="demo-1" className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Text Processor</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Enter text..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm" value={inputText} onChange={(e) => setInputText(e.target.value)} />
              <button onClick={runStatsApplet} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg">{loading ? "Processing..." : "Execute"}</button>
              {result && <div className="mt-2 p-2 bg-blue-900/20 rounded text-center font-mono">{result}</div>}
            </div>
          </div>
          <div id="demo-2" className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Hash Generator</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Enter data..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm" value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
              <button onClick={runHashApplet} disabled={hashLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg">{hashLoading ? "Hashing..." : "Generate"}</button>
              {hashResult && <div className="mt-2 p-2 bg-purple-900/20 rounded text-center font-mono text-xs break-all">{hashResult}</div>}
            </div>
          </div>
          <div id="demo-3" className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">ASCII Art Gen</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Enter text..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm" value={artInput} onChange={(e) => setArtInput(e.target.value)} />
              <button onClick={runArtApplet} disabled={artLoading} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg">{artLoading ? "Generating..." : "Create"}</button>
              {artResult.length > 0 && <div className="mt-2 p-2 bg-green-900/20 rounded font-mono text-xs text-center">{artResult.map((line, i) => <div key={i}>{line}</div>)}</div>}
            </div>
          </div>
        </div>

        <div id="demo-4" className="mt-6 bg-[#0F0F11] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-yellow-400" /> Soroban AI Assistant</h3>
          <div className="space-y-4">
            <input type="text" placeholder="e.g., 'a function that adds two u64 numbers'..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
            <button onClick={runAiApplet} disabled={aiLoading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg">
              {aiLoading ? "Generating..." : "Generate Code"}
            </button>
          </div>
          {aiResult && <div className="mt-4 p-4 bg-black border border-yellow-500/30 rounded-lg"><pre><code className="font-mono text-xs text-yellow-300 whitespace-pre-wrap">{aiResult}</code></pre></div>}
        </div>
      </div>

      {selectedApplet && (
        <AppletModal applet={selectedApplet} onClose={() => setSelectedApplet(null)} walletAddress={walletAddress} />
      )}
    </main>
  );
}