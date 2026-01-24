"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess } from '@stellar/freighter-api';
import { Contract, Networks } from '@stellar/stellar-sdk';
import { Client } from "../contracts/text_processor/src";

// 🛑 PASTE YOUR CONTRACT ID HERE
const TEXT_PROCESSOR_ID = "CBBGXGBFGKRNPETQH6AKBWIHPC7HM5IJFOB7YOIT34QWYBWHVYJUAE5Z";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 1. Connect Wallet Function
  const connectWallet = async () => {
    const allowed = await isAllowed();
    if (!allowed) await setAllowed();
    const access = await requestAccess();
    if (access?.address) setWalletAddress(access.address);
  };

  // 2. Execute Contract Function
  const runStatsApplet = async () => {
    if (!inputText) return;
    setLoading(true);

    try {
      // 1. Initialize the Contract Client
      // We pass the TEXT_PROCESSOR_ID here because the binding is generic
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: TEXT_PROCESSOR_ID, // <--- CRITICAL: Pass the ID here
        rpcUrl: "https://soroban-testnet.stellar.org",
        allowHttp: true,
        publicKey: walletAddress || undefined,
      });

      // 2. Call the "execute" function
      // Note: We use the 'execute' function we defined in Rust
      const tx = await client.execute({
        text: inputText
      }, {
        fee: "10000",
        timeoutInSeconds: 30
      });

      // 3. Handle Result
      // The result comes back in the transaction simulation/response
      // For this hackathon demo, we can just show success:
      console.log("Transaction Result:", tx);
      setResult("Success! Verified on Stellar.");

    } catch (e) {
      console.error("Error:", e);
      alert("Execution failed. Check console (F12) for details.");
    }
    setLoading(false);
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
          <a href="#" className="hover:text-white transition">Marketplace</a>
          <a href="#" className="hover:text-white transition">Pipeline</a>
          <a href="#" className="hover:text-white transition">History</a>
        </div>
        <button
          onClick={connectWallet}
          className="bg-white text-black px-5 py-2 rounded-full font-medium text-sm hover:bg-gray-200 transition"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 4)}...` : "Connect Wallet"}
        </button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Compute, Decentralized.
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Deploy and execute verifiable logic on the Stellar network.
          Zero servers, infinite scalability.
        </p>
      </div>

      {/* Marketplace Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
          Available Applets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Text Processor (Active) */}
          <div className="group relative bg-[#0F0F11] border border-white/5 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute top-4 right-4 bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">Active</div>
            <h3 className="text-xl font-bold mb-2">Text Processor</h3>
            <p className="text-gray-400 text-sm mb-6 h-12">Analyzes string length and processes basic transformations on-chain.</p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter text to analyze..."
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">ID: {TEXT_PROCESSOR_ID.slice(0, 6)}...</span>
                <span className="text-blue-400 font-bold text-sm">0.01 XLM</span>
              </div>

              <button
                onClick={runStatsApplet}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition flex justify-center items-center"
              >
                {loading ? "Processing..." : "Execute Applet 🚀"}
              </button>
            </div>

            {result && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300 uppercase font-bold mb-1">Result (Stats)</p>
                <p className="text-white font-mono">{result} Characters</p>
              </div>
            )}
          </div>

          {/* Card 2: Placeholder */}
          <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6 opacity-50">
            <h3 className="text-xl font-bold mb-2">Hash Generator</h3>
            <p className="text-gray-400 text-sm mb-6">Coming soon...</p>
            <button disabled className="w-full bg-white/5 text-gray-500 py-2.5 rounded-lg font-medium cursor-not-allowed">
              Deploying...
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}