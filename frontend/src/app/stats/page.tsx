"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Activity, 
    BarChart3, 
    ShieldCheck, 
    Cpu, 
    Globe, 
    Zap, 
    CheckCircle2, 
    AlertCircle,
    Server,
    Database,
    Search,
    RefreshCw
} from 'lucide-react';
import MarketplaceScene from '../../components/MarketplaceScene';

// Mock data for metrics
const METRICS_DATA = {
    totalUsers: 142,
    totalApplets: 28,
    totalExecutions: 1542,
    totalVolume: "4,250 XLM",
    networkFees: "1.2 XLM",
    uptime: "99.99%"
};

const SERVICES = [
    { name: "Soroban RPC", status: "Healthy", latency: "42ms" },
    { name: "Stellar Horizon", status: "Healthy", latency: "115ms" },
    { name: "Nexus AI Engine", status: "Healthy", latency: "850ms" },
    { name: "IPFS Gateway", status: "Degraded", latency: "2.4s" },
    { name: "Indexing Service", status: "Healthy", latency: "10ms" },
];

const RECENT_EVENTS = [
    { id: 1, type: "Contract Call", contract: "Text Processor", user: "GA3G...FTIO", time: "2 min ago", status: "Success" },
    { id: 2, type: "New Listing", contract: "Voting Logic", user: "GBTI...GRUO", time: "15 min ago", status: "Success" },
    { id: 3, type: "Payment", contract: "Hash Gen", user: "GD2N...HRPY", time: "1 hour ago", status: "Success" },
    { id: 4, type: "Account Mod", contract: "Nexus Wallet", user: "GCLT...BRUG", time: "3 hours ago", status: "Success" },
];

export default function StatsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    if (!isMounted) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative flex flex-col">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <MarketplaceScene />
            </div>

            {/* Navigation */}
            <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-black/40">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:text-white transition">Stellar Nexus</span>
                    </Link>
                </div>
                <div className="flex gap-6 text-sm text-gray-400">
                    <Link href="/marketplace" className="hover:text-white transition">Marketplace</Link>
                    <Link href="/pipeline" className="hover:text-white transition">Pipeline</Link>
                    <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
                    <Link href="/stats" className="text-cyan-400 font-medium cursor-default">Metrics</Link>
                </div>
                <div className="flex gap-3">
                   <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] text-green-400 font-mono">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        MAINNET READY
                   </span>
                </div>
            </nav>

            <div className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                            <Activity className="text-cyan-400 w-10 h-10" />
                            Nexus Metrics Dashboard
                        </h1>
                        <p className="text-zinc-400 max-w-2xl">
                            Real-time monitoring and analytics for the Stellar Nexus ecosystem. Tracking contract executions, 
                            user activity, and infrastructure health.
                        </p>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition group"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:text-white ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard title="Total Users" value={METRICS_DATA.totalUsers} icon={<Globe className="text-blue-400" />} trend="+12% this week" />
                    <MetricCard title="Active Applets" value={METRICS_DATA.totalApplets} icon={<Cpu className="text-purple-400" />} trend="+2 new" />
                    <MetricCard title="Total Executions" value={METRICS_DATA.totalExecutions} icon={<Zap className="text-yellow-400" />} trend="High Activity" />
                    <MetricCard title="Market Volume" value={METRICS_DATA.totalVolume} icon={<BarChart3 className="text-green-400" />} trend="Live Data" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monitoring Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Server className="w-5 h-5 text-cyan-400" />
                                Infrastructure Health
                            </h2>
                            <div className="space-y-4">
                                {SERVICES.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${s.status === 'Healthy' ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                                                {s.status === 'Healthy' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{s.name}</p>
                                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{s.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-mono text-zinc-400">{s.latency}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transactions / Data Indexer Output */}
                        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Database className="w-5 h-5 text-cyan-400" />
                                    Data Indexer Activity
                                </h2>
                                <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">POLLING: 1s</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-zinc-500 border-b border-white/5">
                                        <tr>
                                            <th className="pb-3 font-medium">Type</th>
                                            <th className="pb-3 font-medium">Contract</th>
                                            <th className="pb-3 font-medium">User Address</th>
                                            <th className="pb-3 font-medium">Time</th>
                                            <th className="pb-3 font-medium text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {RECENT_EVENTS.map((e) => (
                                            <tr key={e.id} className="group transition hover:bg-white/[0.02]">
                                                <td className="py-4 font-mono text-xs">{e.type}</td>
                                                <td className="py-4">{e.contract}</td>
                                                <td className="py-4 font-mono text-xs text-zinc-400">{e.user}</td>
                                                <td className="py-4 text-xs text-zinc-500">{e.time}</td>
                                                <td className="py-4 text-right">
                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded-full border border-green-500/20 font-medium">
                                                        {e.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button className="w-full mt-4 py-3 border border-dashed border-white/10 rounded-2xl text-xs text-zinc-500 hover:text-white transition">
                                View all indexed transactions on Horizon
                            </button>
                        </div>
                    </div>

                    {/* Security & Compliance Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                                Security Status
                            </h2>
                            <div className="space-y-4">
                                <SecurityItem label="WASM Validation" active />
                                <SecurityItem label="Contract Audit" active />
                                <SecurityItem label="XDR Sanity Check" active />
                                <SecurityItem label="Wallet Auth (Freighter)" active />
                                <SecurityItem label="Rate Limiting" active />
                            </div>
                            <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-zinc-400">Security Score</span>
                                    <span className="text-xs font-bold text-cyan-400">98/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[98%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                            <h2 className="text-sm font-bold mb-4 text-zinc-300 uppercase tracking-widest">System Alerts</h2>
                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                                        <span className="text-yellow-500 font-bold">INFO:</span> Testnet reset planned in 48h. Please ensure your persistent data-keys are backed up.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="p-8 border-t border-white/5 text-center text-zinc-600 text-[10px] tracking-widest uppercase">
                &copy; 2026 Stellar Nexus Infrastructure | Monitoring Node ID: NEX-S1-LON
            </footer>
        </main>
    );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition group backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition duration-500">
                    {icon}
                </div>
                <span className="text-[10px] font-medium text-zinc-500 bg-white/5 px-2 py-1 rounded-full uppercase tracking-tighter">
                    {trend}
                </span>
            </div>
            <h3 className="text-zinc-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
    );
}

function SecurityItem({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">{label}</span>
            {active ? (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-cyan-400 font-bold">ACTIVE</span>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(6,182,212,1)]" />
                </div>
            ) : (
                <span className="text-[10px] text-zinc-600 font-bold">INACTIVE</span>
            )}
        </div>
    );
}
