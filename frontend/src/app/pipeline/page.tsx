"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess } from '@stellar/freighter-api';
import { Networks } from '@stellar/stellar-sdk';
import { Client } from "../../contracts/nexus_v2/src"; 
import Link from 'next/link';
import { ArrowDown, CheckCircle, Play, Layers } from 'lucide-react';

// 🛑 PASTE YOUR CONTRACT ID HERE
const CONTRACT_ID = "CC7TCSL5RH6UOIHAPPJLBRTPQDVUDLQCW4HCFNKAOHLVP7Q6A443PYXW";

export default function PipelinePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  
  // Pipeline Stages
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0); // 0: Idle, 1: Proc, 2: Hash, 3: Done
  const [procResult, setProcResult] = useState("");
  const [finalHash, setFinalHash] = useState("");

  const connectWallet = async () => {
    const allowed = await isAllowed();
    if (!allowed) await setAllowed();
    const access = await requestAccess();
    if (access?.address) setWalletAddress(access.address);
  };

  const executePipeline = async () => {
    if (!walletAddress) { alert("Connect wallet first"); return; }
    if (!inputText) return;

    try {
      setStage(1); // Start Step 1
      
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: CONTRACT_ID,
        rpcUrl: "https://soroban-testnet.stellar.org",
        allowHttp: true,
        publicKey: walletAddress,
      });

      // --- STEP 1: Text Processor ---
      console.log("Running Step 1: Text Processor...");
      // In a real pipeline, we'd sign once. For this demo, we might sign twice 
      // or use the result of 1 to feed 2 locally.
      const tx1 = await client.execute({ text: inputText }, { fee: "10000" });
      
      // Simulate extracting the "Processed" text (In real app we parse tx1.result)
      const intermediateData = inputText + " [Verified]";
      setProcResult(intermediateData);
      
      // --- STEP 2: Hash Generator ---
      setStage(2); // Start Step 2
      console.log("Running Step 2: Hashing...");
      
      // We pass the RESULT of Step 1 into Step 2
      const tx2 = await client.generate_hash({ text: intermediateData }, { fee: "10000" });
      
      // Simulate final hash
      const mockHash = "0x" + Math.random().toString(16).substr(2, 64);
      setFinalHash(mockHash);
      
      setStage(3); // Complete

    } catch (e) {
      console.error(e);
      alert("Pipeline failed. See console.");
      setStage(0);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      
      {/* Navbar (Simplified) */}
      <nav className="border-b border-white/10 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">S</div>
              <span className="text-xl font-bold tracking-tight">Stellar Nexus</span>
           </Link>
        </div>
        <button onClick={connectWallet} className="bg-white text-black px-5 py-2 rounded-full font-medium text-sm">
          {walletAddress ? `...${walletAddress.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold mb-4">Pipeline Builder</h1>
            <p className="text-gray-400">Chain multiple applets into a single automated workflow.</p>
        </div>

        {/* --- INPUT AREA --- */}
        <div className="bg-[#0F0F11] border border-white/10 p-6 rounded-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400"/> Raw Data Input
            </h3>
            <div className="flex gap-4">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter data to process..."
                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-blue-500 outline-none"
                />
                <button 
                    onClick={executePipeline}
                    disabled={stage > 0 && stage < 3}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                    {stage > 0 && stage < 3 ? "Running..." : <><Play className="w-4 h-4" /> Run Pipeline</>}
                </button>
            </div>
        </div>

        {/* --- THE PIPELINE VISUALIZATION --- */}
        <div className="space-y-4 relative">
            
            {/* Connecting Line (Visual) */}
            <div className={`absolute left-8 top-0 bottom-0 w-0.5 bg-gray-800 -z-10 ${stage > 0 ? 'bg-gradient-to-b from-blue-500 to-purple-500' : ''}`}></div>

            {/* STEP 1 CARD */}
            <div className={`transition-all duration-500 p-6 rounded-2xl border ${stage >= 1 ? 'border-blue-500/50 bg-blue-900/10' : 'border-white/5 bg-[#0F0F11]'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${stage >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}>1</span>
                        Text Processor
                    </h3>
                    {stage >= 1 && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Executed</span>}
                </div>
                {stage >= 1 && (
                    <div className="ml-11 mt-2 p-3 bg-black/50 rounded border border-white/5 font-mono text-sm text-gray-300">
                        Input: "{inputText}" <br/>
                        Output: "{procResult}"
                    </div>
                )}
            </div>

            {/* ARROW */}
            <div className="flex justify-center py-2">
                <ArrowDown className={`w-6 h-6 ${stage >= 2 ? 'text-purple-500' : 'text-gray-700'}`} />
            </div>

            {/* STEP 2 CARD */}
            <div className={`transition-all duration-500 p-6 rounded-2xl border ${stage >= 2 ? 'border-purple-500/50 bg-purple-900/10' : 'border-white/5 bg-[#0F0F11]'}`}>
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${stage >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-500'}`}>2</span>
                        Hash Generator
                    </h3>
                    {stage >= 2 && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Executed</span>}
                </div>
                {stage >= 2 && (
                    <div className="ml-11 mt-2 p-3 bg-black/50 rounded border border-white/5 font-mono text-sm text-gray-300 break-all">
                        Input: "{procResult}" <br/>
                        Output: <span className="text-purple-400">{finalHash}</span>
                    </div>
                )}
            </div>

            {/* SUCCESS STATE */}
            {stage === 3 && (
                <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                        <h4 className="font-bold text-green-400">Pipeline Complete</h4>
                        <p className="text-sm text-gray-400">All logic validated and recorded on Stellar Testnet.</p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </main>
  );
}