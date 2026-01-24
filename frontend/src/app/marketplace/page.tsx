"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess, signTransaction } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Networks } from '@stellar/stellar-sdk';
import { X, Lock, Download, Rocket, CheckCircle, BrainCircuit, Search, Layers } from 'lucide-react';
import MarketplaceScene from '../../components/MarketplaceScene';


import { Client } from "../../contracts/nexus_v4/src";
import Link from 'next/link';


const CONTRACT_ID = "CAAQBQS5XV4KB3TKY4CLLEXGQL2Y43D5HG2JPVKKBQ7CWYK2YXT7M5LE";


const CREATOR_WALLET = "GBKPWDVU4MJQ4JPMMYWOFTKAGQCSGOWC4MRHMS4VXUJSJJ6HYZBG2OPH";


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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
      <div className="bg-[#09090b]/80 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2"><h2 className="text-2xl font-bold text-white">{applet.name}</h2><span className={`px-2 py-0.5 text-xs rounded border border-${applet.color}-500/30 bg-${applet.color}-500/10 text-${applet.color}-400`}>{applet.status}</span></div>
            <p className="text-gray-500 text-sm font-mono">ID: #{applet.id} • Owner: {applet.owner.slice(0, 6)}...</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X className="w-6 h-6" /></button>
        </div>
        <div className="px-6 pb-6 pt-4">
          <p className="text-zinc-300 text-sm mb-6 p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm leading-relaxed">{applet.description}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div><p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Price</p><p className="text-2xl font-bold text-white">{applet.price} XLM</p></div>
            <div className="flex gap-3">
              {!isPurchased ? (
                <button onClick={handleBuyCode} disabled={buying} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
                  {buying ? "Processing..." : <><Lock className="w-4 h-4" /> Buy Source Code</>}
                </button>
              ) : (
                <button onClick={handleDownload} className="px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:scale-105">
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
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/generate-code`, {
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
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">

      {/* 3D Background */}
      <MarketplaceScene />

      {/* Navbar */}
      <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-black/20">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 cursor-pointer hover:opacity-80 transition">Stellar Nexus</span>
          </Link>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-gray-400 font-medium">
          <Link href="/marketplace" className="text-white font-medium">Marketplace</Link>
          <Link href="/pipeline" className="hover:text-white transition hover:scale-105 duration-200">Pipeline</Link>
          <Link href="/dashboard" className="hover:text-white transition hover:scale-105 duration-200">Dashboard</Link>
          <Link href="/docs" className="hover:text-white transition hover:scale-105 duration-200">Docs</Link>
          <Link href="/go-live" className="text-cyan-400 font-medium hover:text-cyan-300 transition hover:scale-105 duration-200">Go Live</Link>
        </div>
        <button onClick={connectWallet} className="bg-white/10 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition backdrop-blur-md">
          {walletAddress ? `Connected: ${walletAddress.slice(0, 4)}...` : "Connect Wallet"}
        </button>
      </nav>

      {/* Hero */}
      <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <h1 className="text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
          Applet Marketplace
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover, buy, and monetize verified serverless logic. Powered by Soroban Smart Contracts.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#09090b]/80 border border-white/10 rounded-full flex items-center p-2 pl-6 backdrop-blur-md">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input type="text" placeholder="Search for applets, AI models, or utilities..." className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500" />
            <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">Search</button>
          </div>
        </div>
      </div>

      {/* MARKETPLACE LIST */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Layers className="w-6 h-6 text-blue-500" />
          Available Applets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {APPLETS.map((applet) => (
            <div key={applet.id} className="group bg-[#09090b]/40 border border-white/5 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-500 hover:bg-[#0c0c0e]/60 backdrop-blur-md overflow-hidden relative shadow-lg shadow-black/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${applet.color}-500/10 border border-${applet.color}-500/20`}>
                    <CheckCircle className={`w-5 h-5 text-${applet.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition">{applet.name}</h3>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border border-${applet.color}-500/20 bg-${applet.color}-500/5 text-${applet.color}-300`}>{applet.status}</span>
              </div>

              <p className="text-xs font-mono text-zinc-500 mb-4 ml-1">ID: #{applet.id} • {applet.contractId === "N/A (Off-Chain)" ? "OFF-CHAIN" : applet.contractId.slice(0, 8) + "..."}</p>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed h-10">{applet.description}</p>

              <div className="flex items-center justify-between border-t border-white/5 pt-6 relative z-10">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">Price</p>
                  <p className="text-xl font-bold text-white tracking-tight">{applet.price} XLM</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => scrollToDemo(applet.id)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition flex items-center gap-2 text-zinc-300">
                    <Rocket className="w-3.5 h-3.5" /> Demo
                  </button>
                  <button onClick={() => setSelectedApplet(applet)} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition hover:scale-105">
                    Buy License
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INTERACTIVE DEMOS */}
        <div className="bg-[#09090b]/60 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3 relative z-10">
            <Rocket className="w-6 h-6 text-purple-500" />
            Live Execution Environment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

            {/* Demo 1 */}
            <div id="demo-1" className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition duration-300">
              <h3 className="text-lg font-bold mb-4 text-zinc-100">Text Processor</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Enter text to analyze..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition" value={inputText} onChange={(e) => setInputText(e.target.value)} />
                <button onClick={runStatsApplet} disabled={loading} className="w-full bg-blue-600/90 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition shadow-lg shadow-blue-900/20">
                  {loading ? "Processing On-Chain..." : "Execute Contract"}
                </button>
                {result && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center font-mono text-sm text-blue-200 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-4 h-4 inline mr-2 text-blue-400" /> {result}
                  </div>
                )}
              </div>
            </div>

            {/* Demo 2 */}
            <div id="demo-2" className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition duration-300">
              <h3 className="text-lg font-bold mb-4 text-zinc-100">Hash Generator</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Enter data to hash..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition" value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
                <button onClick={runHashApplet} disabled={hashLoading} className="w-full bg-purple-600/90 hover:bg-purple-600 text-white py-2.5 rounded-xl font-medium transition shadow-lg shadow-purple-900/20">
                  {hashLoading ? "Computing Hash..." : "Generate SHA-256"}
                </button>
                {hashResult && <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center font-mono text-xs break-all text-purple-200 animate-in fade-in slide-in-from-top-2">{hashResult}</div>}
              </div>
            </div>

            {/* Demo 3 */}
            <div id="demo-3" className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition duration-300">
              <h3 className="text-lg font-bold mb-4 text-zinc-100">ASCII Art Gen</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Enter text..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition" value={artInput} onChange={(e) => setArtInput(e.target.value)} />
                <button onClick={runArtApplet} disabled={artLoading} className="w-full bg-green-600/90 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition shadow-lg shadow-green-900/20">
                  {artLoading ? "Generating Art..." : "Create Artwork"}
                </button>
                {artResult.length > 0 && <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl font-mono text-[10px] leading-tight text-center text-green-300 animate-in fade-in slide-in-from-top-2 overflow-hidden">{artResult.map((line, i) => <div key={i}>{line}</div>)}</div>}
              </div>
            </div>

          </div>

          {/* Demo 4: AI */}
          <div id="demo-4" className="mt-8 bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-yellow-500/20 transition duration-300">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-100"><BrainCircuit className="w-5 h-5 text-yellow-400" /> Soroban AI Assistant</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Describe the smart contract function you need (e.g., 'a function that adds two u64 numbers')..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none transition" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
              <button onClick={runAiApplet} disabled={aiLoading} className="w-full bg-yellow-600/90 hover:bg-yellow-600 text-white py-3 rounded-xl font-medium transition shadow-lg shadow-yellow-900/20">
                {aiLoading ? "Generating Rust Code..." : "Generate Smart Contract Code"}
              </button>
            </div>
            {aiResult && <div className="mt-4 p-5 bg-[#121215] border border-yellow-500/30 rounded-xl animate-in fade-in slide-in-from-top-4"><pre><code className="font-mono text-xs text-yellow-300 whitespace-pre-wrap">{aiResult}</code></pre></div>}
          </div>

        </div>
      </div>

      {selectedApplet && (
        <AppletModal applet={selectedApplet} onClose={() => setSelectedApplet(null)} walletAddress={walletAddress} />
      )}
    </main>
  );
}