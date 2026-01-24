"use client";
import React from 'react';
import Link from 'next/link';
import { Book, Layers, ShoppingBag, Code, ArrowRight } from 'lucide-react';
import MarketplaceScene from '../../components/MarketplaceScene'; // Reusing scene for continuity

export default function DocsPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">

            {/* 3D Background - Reused for consistency */}
            <div className="fixed inset-0 -z-10 opacity-30">
                <MarketplaceScene />
            </div>

            {/* Navbar */}
            <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-black/20">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:text-white transition">Stellar Nexus</span>
                    </Link>
                </div>
                <div className="flex gap-6 text-sm text-gray-400">
                    <Link href="/marketplace" className="hover:text-white transition">Marketplace</Link>
                    <Link href="/pipeline" className="hover:text-white transition">Pipeline</Link>
                    <span className="text-white font-medium">Docs</span>
                </div>
                <button className="bg-white/10 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition backdrop-blur-md">
                    Connect Wallet
                </button>
            </nav>

            {/* Header */}
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                    Documentation
                </h1>
                <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Learn how to build, deploy, and monetize logic on the Stellar Nexus protocol.
                </p>
            </div>

            {/* Doc Cards */}
            <div className="max-w-5xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-[#09090b]/60 border border-white/5 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 group backdrop-blur-md cursor-default">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition">
                            <Book className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition">Quick Start</h3>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                            Get up and running with Stellar Nexus. Understand the core concepts of Applets, Pipelines, and Soroban integration.
                        </p>
                        <div className="flex items-center text-blue-400 font-bold text-sm">
                            See <code>docs/README.md</code>
                        </div>
                    </div>

                    <div className="bg-[#09090b]/60 border border-white/5 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 group backdrop-blur-md cursor-default">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition">
                            <ShoppingBag className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition">Marketplace Guide</h3>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                            How to verify, list, and purchase code snippets. Learn about the pricing model and verification process.
                        </p>
                        <div className="flex items-center text-purple-400 font-bold text-sm">
                            See <code>docs/marketplace.md</code>
                        </div>
                    </div>

                    <div className="bg-[#09090b]/60 border border-white/5 rounded-2xl p-8 hover:border-green-500/30 transition-all duration-300 group backdrop-blur-md cursor-default">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 border border-green-500/20 group-hover:scale-110 transition">
                            <Layers className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-200 transition">Pipeline Builder</h3>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                            Chain multiple applets into automated workflows. Documentation on input/output formats and atomic execution.
                        </p>
                        <div className="flex items-center text-green-400 font-bold text-sm">
                            See <code>docs/pipeline.md</code>
                        </div>
                    </div>

                    <div className="bg-[#09090b]/60 border border-white/5 rounded-2xl p-8 hover:border-yellow-500/30 transition-all duration-300 group backdrop-blur-md cursor-default">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 border border-yellow-500/20 group-hover:scale-110 transition">
                            <Code className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-200 transition">Developer API</h3>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                            Technical reference for the Nexus SDK, Contract Interfaces, and AI integration endpoints.
                        </p>
                        <div className="flex items-center text-yellow-400 font-bold text-sm">
                            See <code>docs/smart-contracts.md</code>
                        </div>
                    </div>

                </div>

                <div className="mt-16 p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Open Source</h3>
                    <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
                        All documentation is available directly in the <code className="bg-black/50 px-2 py-1 rounded text-blue-400">docs/</code> folder of our repository.
                    </p>
                    <a href="https://github.com/Srizdebnath/stellar-nexus" target="_blank" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition">
                        <Code className="w-4 h-4" /> View on GitHub
                    </a>
                </div>
            </div>
        </main>
    );
}
