/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity, Sliders, Play, Terminal, Database, Key, Shield, Info,
  Layers, Check, Copy, TrendingUp, Cpu, Clock, AlertTriangle, Users,
  Heart, Github, RefreshCw, BookOpen, AlertCircle, ChevronRight, CornerDownRight, Wifi
} from 'lucide-react';
import { DEFAULT_PANELS, MOCK_REQUESTS, MOCK_SYSTEM_LOGS } from './data/mockData';
import { PanelConfig, RequestMetric, SystemLog } from './types';

// Importing custom sub-components
import OrchestrationSimulator from './components/OrchestrationSimulator';
import PanelArchitect from './components/PanelArchitect';
import DatabaseExplorer from './components/DatabaseExplorer';
import CliPlayground from './components/CliPlayground';
import RoadmapView from './components/RoadmapView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'observability' | 'sandbox' | 'architect' | 'database' | 'cli' | 'roadmap'>('observability');
  
  // High fidelity persistence state
  const [panels, setPanels] = useState<PanelConfig[]>(DEFAULT_PANELS);
  const [requests, setRequests] = useState<RequestMetric[]>(MOCK_REQUESTS);
  const [logs, setLogs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  
  // Real-time metrics
  const [throughput, setThroughput] = useState<number>(4.8);
  const [avgLatency, setAvgLatency] = useState<number>(1140);
  const [selectedLogsDetail, setSelectedLogDetail] = useState<RequestMetric | null>(null);

  const refreshData = async () => {
    try {
      const [panelsRes, requestsRes, logsRes, envRes] = await Promise.all([
        fetch("/api/panels"),
        fetch("/api/requests"),
        fetch("/api/logs"),
        fetch("/api/env-check")
      ]);

      if (panelsRes.ok) setPanels(await panelsRes.json());
      if (requestsRes.ok) setRequests(await requestsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (envRes.ok) {
        const envData = await envRes.json();
        setHasGeminiKey(envData.hasGeminiKey);
      }
    } catch (err) {
      console.error("Express API synchronization error:", err);
    }
  };

  useEffect(() => {
    refreshData();
    // Poll updates every 6 seconds to show dynamic trace metrics
    const pollInterval = setInterval(refreshData, 6000);
    return () => clearInterval(pollInterval);
  }, []);

  // Simulate real-time metric fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.max(3.1, Math.min(6.5, prev + delta)).toFixed(1));
      });
      setAvgLatency(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 80);
        return Math.max(900, Math.min(1450, prev + delta));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAddPanel = async (newPanel: PanelConfig) => {
    try {
      await fetch("/api/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPanel)
      });
      refreshData();
    } catch (err) {
      console.error("Panel addition error:", err);
    }
  };

  const handleDeletePanel = async (id: string) => {
    try {
      await fetch(`/api/panels/${id}`, {
        method: "DELETE"
      });
      refreshData();
    } catch (err) {
      console.error("Panel deletion error:", err);
    }
  };

  const handleAddRequestFromSim = (newReq: RequestMetric) => {
    refreshData();
  };

  const totalCostUSD = requests.reduce((acc, curr) => acc + curr.totalCostUsd, 0);

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'coding': return 'bg-sky-400 text-sky-950 border-sky-300';
      case 'reasoning': return 'bg-purple-400 text-purple-950 border-purple-300';
      case 'research': return 'bg-emerald-400 text-emerald-950 border-emerald-300';
      case 'creative': return 'bg-amber-400 text-amber-950 border-amber-300';
      default: return 'bg-slate-400 text-slate-950 border-slate-300';
    }
  };

  const getLogBadgeTheme = (level: string) => {
    switch (level) {
      case 'success': return 'bg-emerald-950/40 text-emerald-400 border border-emerald-900';
      case 'warn': return 'bg-amber-950/40 text-amber-400 border border-amber-900';
      case 'error': return 'bg-red-950/40 text-red-400 border border-red-900';
      default: return 'bg-slate-950/40 text-slate-400 border border-slate-800';
    }
  };

  return (
    <div id="openfusion-root" className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* GLOBAL NAVBAR HEADER */}
      <nav className="border-b border-[#141829] bg-[#090b14]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Brand intersect */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/5">
              <div className="w-full h-full bg-[#090b14] rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15l3 3m12-6l-3 3" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#07080d] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-base font-bold tracking-tight text-white">OpenFusion</h1>
                <span className="text-[9px] font-mono font-bold bg-[#171c35] border border-emerald-500/20 text-emerald-400 py-0.5 px-1.5 rounded-md">
                  v0.1 MVP
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">Universal Open-Source Multi-Model Intelligence Platform</p>
            </div>
          </div>

          {/* Real Credential configuration status */}
          <div className="flex items-center gap-2 text-xs bg-[#0c0e18] border border-[#1b2034] py-1.5 px-3 rounded-lg">
            <span className="text-slate-400 text-[10px] font-mono tracking-wider">GEMINI_API_KEY:</span>
            {hasGeminiKey ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                BAĞLI
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-500 font-semibold font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                EKSİK (DEMO MODU)
              </span>
            )}
          </div>

        </div>
      </nav>

      {/* TABS CONTROLLER BAR */}
      <div className="bg-[#0b0c14] border-b border-[#141829] py-1 px-4">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto pr-1 escroll">
          <button
            onClick={() => setActiveTab('observability')}
            className={`px-4 py-3 text-xs font-semibold font-sans tracking-tight transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'observability'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121524]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Dashboard & Analitik
          </button>
          
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-3 text-xs font-semibold font-sans tracking-tight transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sandbox'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121524]'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            Consensus Engine (Orkestrasyon Masası)
          </button>
          
          <button
            onClick={() => setActiveTab('architect')}
            className={`px-4 py-3 text-xs font-semibold font-sans tracking-tight transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'architect'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121524]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Panel Architect (Konfigürasyon)
          </button>
          
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-3 text-xs font-semibold font-sans tracking-tight transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121524]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            PostgreSQL & pgvector Explorer
          </button>
          
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-4 py-3 text-xs font-semibold font-sans tracking-tight transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cli'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121524]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            CLI Terminal & Gateway Proxy
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-3 text-xs font-semibold font-sans tracking-tight transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121524]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Yol Haritası & Kıyaslama
          </button>
        </div>
      </div>

      {/* CORE CONTENT LAYOUT STAGE */}
      <main id="app-main-view" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {/* TABS ENVELOPE */}

        {/* TAB 1: OBSERVABILITY & DASHBOARD ANALYTICS */}
        {activeTab === 'observability' && (
          <div id="observability-dashboard" className="flex flex-col gap-6">
            
            {/* 4 CORE COUNTERS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#0f111a] border border-[#1e2230] p-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Gateway Trafiği</span>
                  <span className="text-2xl font-mono font-bold text-slate-100">{throughput} req/s</span>
                  <span className="text-[9px] text-[#52a65a] font-semibold flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" /> Real-time active polling
                  </span>
                </div>
                <div className="p-3 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              <div className="bg-[#0f111a] border border-[#1e2230] p-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Ortalama Gecikme</span>
                  <span className="text-2xl font-mono font-bold text-slate-100">{avgLatency} ms</span>
                  <span className="text-[9px] text-[#52a65a] font-semibold">⚡ Optimum routing engine</span>
                </div>
                <div className="p-3 bg-sky-500/5 text-sky-400 border border-sky-500/10 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0f111a] border border-[#1e2230] p-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Toplam Harcanan Bütçe</span>
                  <span className="text-2xl font-mono font-bold text-emerald-400">${totalCostUSD.toFixed(4)}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">%72 ortalama maliyet tasarrufu</span>
                </div>
                <div className="p-3 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0f111a] border border-[#1e2230] p-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Bütçe Tüketimi (Aylık)</span>
                  <span className="text-2xl font-mono font-bold text-slate-100">0.03%</span>
                  <span className="Limit text-[9px] text-slate-500">Kalan limit: $500.00 / $500.00</span>
                </div>
                <div className="p-3 bg-amber-500/5 text-amber-400 border border-amber-500/10 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* CHARTS CONTAINER (Custom Bezier Waves) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Svg area chart */}
              <div className="lg:col-span-8 bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2334] mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">Gateway Saniye Başı İstek Akışı (Son 1 Saat)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live Telemetry (Calculated rolling points)</span>
                </div>

                <div className="h-48 w-full mt-2 relative flex items-end">
                  <svg className="w-full h-full text-emerald-500/10" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,80 Q 50,45 100,60 T 200,40 T 300,75 T 400,25 T 500,45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 0,80 Q 50,45 100,60 T 200,40 T 300,75 T 400,25 T 500,45 L 500,100 L 0,100 Z"
                      fill="url(#chartGradient)"
                    />
                    {/* Secondary reference lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#1c213d" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#1c213d" strokeWidth="0.5" strokeDasharray="3 3" />
                  </svg>
                  
                  {/* Axis indicators */}
                  <div className="absolute left-0 bottom-1.5 text-[9px] font-mono text-slate-600">30 DK Önce</div>
                  <div className="absolute right-0 bottom-1.5 text-[9px] font-mono text-slate-600">CANLI</div>
                </div>
              </div>

              {/* COGNITIVE PANEL DISTRIBUTION SUMMARY */}
              <div className="lg:col-span-4 bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900 mb-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">Panel Rotalama Sıklığı (%)</span>
                </div>
                
                <div className="flex flex-col gap-4 mt-2 justify-center flex-1">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">coding-elite</span>
                      <span className="text-slate-200 font-bold">42%</span>
                    </div>
                    <div className="h-2 bg-[#171c30] rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '42%' }} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">research-deep</span>
                      <span className="text-slate-200 font-bold">31%</span>
                    </div>
                    <div className="h-2 bg-[#171c30] rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400" style={{ width: '31%' }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">budget-coding</span>
                      <span className="text-slate-200 font-bold">18%</span>
                    </div>
                    <div className="h-2 bg-[#171c30] rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400" style={{ width: '18%' }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">latency-first</span>
                      <span className="text-slate-200 font-bold">9%</span>
                    </div>
                    <div className="h-2 bg-[#171c30] rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: '9%' }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* AUDIT LOG TABLE & DETAILED VIEW (8 cols & 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* AUDIT TIMELINE TABLE */}
              <div className="lg:col-span-8 bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-900">
                  <Database className="w-5 h-5 text-slate-400" />
                  <h4 className="font-display font-semibold text-slate-200 text-sm">Orkestrasyon Denetim Logları (Audit requests table)</h4>
                </div>
                <p className="text-xs text-slate-500 mb-3.5">
                  Her istek bağımsız denetlenebilir durumdadır. İlgili satıra tıklayarak model konsensüs çıktılarını ve hata loglarını gözlemleyin.
                </p>

                <div className="overflow-x-auto border border-[#1d2235] rounded-xl">
                  <table className="w-full text-left text-xs bg-slate-950/40">
                    <thead className="bg-[#131523] border-b border-[#21263c] text-slate-400 font-semibold font-mono text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">ISTEK ID</th>
                        <th className="px-4 py-3">ZAMAN</th>
                        <th className="px-4 py-3">KATEGORI</th>
                        <th className="px-4 py-3">KULLANILAN PANEL</th>
                        <th className="px-4 py-3 text-right">GECIKME</th>
                        <th className="px-4 py-3 text-right">MALIYET (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2336] text-slate-300 font-sans text-[11px]">
                      {requests.map((req) => (
                        <tr
                          key={req.id}
                          onClick={() => setSelectedLogDetail(req)}
                          className={`hover:bg-[#141727] transition-colors cursor-pointer ${
                            selectedLogsDetail?.id === req.id ? 'bg-[#151930]/60' : ''
                          }`}
                        >
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-350">{req.id}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{req.timestamp}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getCategoryTheme(req.category)}`}>
                              {req.category.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono font-medium text-slate-300">{req.panelUsed}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-400">{req.latencyMs}ms</td>
                          <td className="px-4 py-2.5 text-right font-mono text-emerald-400 font-bold">${req.totalCostUsd.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUDIT LOG EXPANDED DETAIL VIEW (4 cols) */}
              <div className="lg:col-span-4 bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <span className="text-xs font-semibold text-slate-200">Denetim Detay Panel Görünümü</span>
                  <span className="text-[10px] font-mono text-slate-500">REQUESTS RELATION</span>
                </div>

                {selectedLogsDetail ? (
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1 inline-block">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Giriş İstemi (Matched Prompt):</span>
                      <div className="bg-[#121422] p-2.5 rounded border border-[#191d33] font-mono text-[11.5px] italic text-slate-300">
                        "{selectedLogsDetail.prompt}"
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                        <span className="block text-[10px] text-slate-500 mb-0.5 uppercase font-mono">Güven Derecesi</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">%{selectedLogsDetail.confidenceScore}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                        <span className="block text-[10px] text-slate-500 mb-0.5 uppercase font-mono font-sans text-[9px]">Mutabakat Skoru</span>
                        <span className="text-xs font-mono font-bold text-sky-400">%{selectedLogsDetail.agreementScore}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Konsensüse Katılan Modeller:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLogsDetail.modelsUsed.map((m, idx) => (
                          <span key={idx} className="bg-[#121421] border border-[#202436] px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedLogsDetail.response && (
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase font-mono">Cevap (Sentezlenmiş Çıktı):</span>
                        <div className="bg-[#111119] p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 max-h-44 overflow-y-auto escroll select-text">
                          <pre className="whitespace-pre-wrap">{selectedLogsDetail.response}</pre>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-900 flex justify-between text-[11px]">
                      <span className="text-slate-500">İşlem Hacmi (Token):</span>
                      <span className="text-slate-400 font-mono">
                        {selectedLogsDetail.tokensIn} In / {selectedLogsDetail.tokensOut} Out
                      </span>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#1f2231] rounded-lg text-slate-500">
                    <Info className="w-5 h-5 mb-2 text-slate-600" />
                    <p className="text-xs">Sol taraftaki denetim loglarından bir istek seçerek ilişkisel veritabanı yansımasını inceleyin.</p>
                  </div>
                )}
              </div>

            </div>

            {/* EVENT SYSTEMS LOGS PANEL (BOTTOM ROW) */}
            <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl mb-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#202434] mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#bf9fff]" />
                  <span className="text-sm font-sans font-semibold text-slate-200">OpenTelemetry Trace Events (Platform Canlı Olay Akışı)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#52a65a] font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  STREAMING METRICS
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto flex flex-col gap-2 font-mono text-xs text-slate-305 escroll pr-1.5 selection:bg-indigo-950/20">
                {logs.map((val) => (
                  <div
                    key={val.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2.5 rounded hover:bg-[#121422] border border-[#141525] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-600 text-[10px]">{val.timestamp}</span>
                      <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 uppercase tracking-wider ${getLogBadgeTheme(val.level)}`}>
                        {val.level}
                      </span>
                      <span className="text-indigo-400 font-semibold bg-[#111322] px-2 py-0.5 border border-[#1b1c2e] rounded-md text-[10px] tracking-wide">
                        {val.module.toUpperCase()}
                      </span>
                      <span className="text-slate-350 antialiased font-medium text-[11.5px] leading-relaxed">
                        {val.message}
                      </span>
                    </div>
                    {val.latency && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-900 italic">
                        {val.latency} ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SIMULATOR ORCHESTRATION */}
        {activeTab === 'sandbox' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
              <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2.5">
                <Play className="w-5 h-5 text-emerald-400 fill-current" />
                OpenFusion Canlı Consensus & Orkestrasyon Paneli
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Yapay zeka modellerinin birbirleriyle asenkron olarak tartıştığı Canlı Konsensüs ağını yönetin. Karar meclisi (Ensemble Judge), hata tolere etme ve failover mekanizmalarını kullanarak nihai optimize çıktıyı derler.
              </p>
            </div>
            <OrchestrationSimulator onAddRequest={handleAddRequestFromSim} />
          </div>
        )}

        {/* TAB 3: CONFIG PANEL ARCHITECT */}
        {activeTab === 'architect' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
              <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-emerald-400" />
                Panel Architect (Router Yapılandırma Masası)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                OpenFusion rotalaması tamamen bildirimseldir (declarative). Burada oluşturacağınız özel paneller anında sisteme kaydedilecek ve orkestrasyon ekranındaki model havuzunda aktif hale geçecektir. Hazırlanan YAML çıktılarını uygulamanıza entegre edebilirsiniz.
              </p>
            </div>
            
            <PanelArchitect
              panels={panels}
              onAddPanel={handleAddPanel}
              onDeletePanel={handleDeletePanel}
            />
          </div>
        )}

        {/* TAB 4: DATABASE SCHEMA & PGVECTOR */}
        {activeTab === 'database' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
              <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-400" />
                PostgreSQL + pgvector Migrations Explorer
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                OpenFusion veri ve bellek şemalarını inceleyin. pgvector destekli uzun vadeli bellek tablolarını (memories) sorgulayın ve yerleşik konsolda canlı okuma (SELECT) operasyonları gerçekleştirin.
              </p>
            </div>
            <DatabaseExplorer />
          </div>
        )}

        {/* TAB 5: CLI PLAYGROUND TERMINAL */}
        {activeTab === 'cli' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
              <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-emerald-400" />
                OpenFusion CLI & API Gateway Proxy
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                CLI yönetim komutlarını deneyimleyin ve Redis rate-limiter katmanını doğrudan test edin. OpenAI SDK-uyumlu proxy bağlantı şablonlarını inceleyin.
              </p>
            </div>
            <CliPlayground />
          </div>
        )}

        {/* TAB 6: ROADMAP & BENCHMARKS */}
        {activeTab === 'roadmap' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
              <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Geliştirme Yol Haritası ve Sektör Kıyas Matrisleri
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Açık kaynak OpenFusion platformunun aktif sürüm planlarını (v0.1 - v1.0) ve ticari model orkestratörleri ile olan yetenek karşılaştırmalarını takip edin.
              </p>
            </div>
            <RoadmapView />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#141829] bg-[#090b14] py-6 px-4 mt-auto text-xs text-slate-500 font-mono text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-center gap-1.5">
            <span>OpenFusion Project</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400 hover:text-white cursor-help">
              <Heart className="w-3 h-3 text-red-500 fill-current" /> Released under MIT license
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-slate-600">zehedisode@gmail.com</span>
            <span>•</span>
            <span className="text-slate-450 font-bold uppercase">Open-Source Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
