/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Cpu, Layers, Search, Code, Coins, Clock, AlertCircle,
  Copy, Check, ChevronRight, TrendingUp, Compass, BookOpen,
  Users, CheckCircle2, Zap, ArrowRight, Share2, HelpCircle, RefreshCw
} from 'lucide-react';
import { SIMULATION_SCENARIOS, DEFAULT_PANELS } from '../data/mockData';

export default function OrchestrationSimulator({ onAddRequest }: { onAddRequest: (req: any) => void }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sc-1');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [copied, setCopied] = useState<boolean>(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Custom scenario generation state
  const [activeScenario, setActiveScenario] = useState<any>(SIMULATION_SCENARIOS[0]);

  useEffect(() => {
    const scen = SIMULATION_SCENARIOS.find(s => s.id === selectedScenarioId);
    if (scen) {
      setActiveScenario(scen);
      setIsPlaying(false);
      setCurrentStepIndex(-1);
      setRunLogs([]);
    }
  }, [selectedScenarioId]);

  // Handle custom prompt execution
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setRunLogs([`[${new Date().toLocaleTimeString()}] OpenFusion -> Arka uç AI orkestrasyon motoru çağrılıyor...`]);

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customPrompt,
          panelId: "coding-elite"
        })
      });

      if (!res.ok) {
        throw new Error("Sunucu veya ağ hatası: " + res.status);
      }

      const data = await res.json();
      
      const generatedScenario = {
        id: 'sc-custom',
        name: `Özel İstemi Orkestre Et (Canlı)`,
        prompt: customPrompt,
        panel: 'coding-elite',
        category: 'coding',
        strategy: 'debate',
        complexity: 8,
        steps: data.steps
      };

      setActiveScenario(generatedScenario);
      setSelectedScenarioId('custom');
      setRunLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] OpenFusion -> Gerçek zamanlı model mutabakatı alındı! Sonuç görselleştiriliyor...`]);
      setIsPlaying(true);
      setCustomPrompt('');
    } catch (err: any) {
      setRunLogs(prev => [...prev, `[HATA] Yapay zeka motoru çağrılamadı: ${err.message}. Lütfen Gemini API anahtarınızı veya internet bağlantınızı kontrol edin.`]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run simulation effect
  useEffect(() => {
    let timer: any;
    if (isPlaying && currentStepIndex < activeScenario.steps.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const step = activeScenario.steps[nextStepIndex];
      
      timer = setTimeout(() => {
        setCurrentStepIndex(nextStepIndex);
        
        // Log generation
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = `[${timestamp}] OpenFusion -> `;
        if (step.type === 'classification') {
          logMsg += `Prompt Algılandı: Sektör '${step.data.category}' | Panel: '${step.data.bestPanel}' (${step.data.complexity}/10 karmaşıklık)`;
        } else if (step.type === 'round1') {
          logMsg += `Round 1 tetiklendi: Eşzamanlı modellerden ilk taslaklar toplandı. (${activeScenario.strategy} stratejisi)`;
        } else if (step.type === 'round2') {
          logMsg += `Round 2: Modeller arası çapraz akran eleştirisi (Cross-Critique) yapılıyor.`;
        } else if (step.type === 'fallback') {
          logMsg += `UYARI: Birincil sağlayıcı hatası! Failover tetiklendi. ${step.data.action}`;
        } else if (step.type === 'web') {
          logMsg += `Arac kütüphanesi aktif: Google Google-Search üzerinden "${step.data.query}" sorgusu güncel veriye bağlandı (grounding).`;
        } else if (step.type === 'compilation') {
          logMsg += `Karar Meclisi (Ensemble Judge) devrede. Güven Skoru: %${step.data.confidenceScore}, Mutabakat: %${step.data.agreementScore}`;
        } else if (step.type === 'final') {
          logMsg += `İşlem tamamlandı. Toplam süre: ${step.data.rawMetrics.latency}. Maliyet: ${step.data.rawMetrics.cost}. Rapor yazdırılıyor.`;

          // Trigger callback to add metric to parent state
          const newRequestMetric = {
            id: `req-${Math.floor(100 + Math.random() * 900)}`,
            timestamp: new Date().toLocaleTimeString(),
            prompt: activeScenario.prompt.substring(0, 45) + '...',
            category: activeScenario.category,
            panelUsed: activeScenario.panel,
            modelsUsed: activeScenario.steps.find((s: any) => s.type === 'round1')?.data.responses?.map((r: any) => r.model) || 
                       activeScenario.steps.find((s: any) => s.type === 'web') ? ['gemini-2.5-pro'] : ['gemini-2.5-flash'],
            totalCostUsd: parseFloat(step.data.rawMetrics.cost.replace('$', '')),
            latencyMs: parseFloat(step.data.rawMetrics.latency) * 1000 || 500,
            tokensIn: step.data.rawMetrics.tokensIn || 450,
            tokensOut: step.data.rawMetrics.tokensOut || 550,
            confidenceScore: 92,
            agreementScore: 85,
            roundsUsed: activeScenario.strategy === 'debate' ? 3 : 1,
            status: 'completed',
            response: step.data.code
          };
          onAddRequest(newRequestMetric);
        }
        
        setRunLogs(prev => [...prev, logMsg]);
      }, currentStepIndex === -1 ? 100 : step.duration);
    } else if (currentStepIndex === activeScenario.steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, activeScenario]);

  const handleStartSimulation = async () => {
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setRunLogs([`[${new Date().toLocaleTimeString()}] OpenFusion -> Arka uç AI orkestrasyon motoru çağrılıyor...`]);

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activeScenario.prompt,
          panelId: activeScenario.id === "sc-custom" || activeScenario.id === "custom" ? undefined : activeScenario.name
        })
      });

      if (!res.ok) {
        throw new Error("Ağ hatası: " + res.status);
      }

      const data = await res.json();
      
      const syncedScenario = {
        ...activeScenario,
        steps: data.steps
      };

      setActiveScenario(syncedScenario);
      setRunLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] OpenFusion -> Gerçek zamanlı model mutabakatı alındı! Sonuç görselleştiriliyor...`]);
      setIsPlaying(true);
    } catch (err: any) {
      setRunLogs(prev => [...prev, `[HATA] Yapay zeka motoru çağrılamadı: ${err.message}. Lütfen Gemini API anahtarınızı veya internet bağlantınızı kontrol edin.`]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'coding': return 'text-sky-400 bg-sky-950/40 border-sky-900';
      case 'reasoning': return 'text-purple-400 bg-purple-950/40 border-purple-900';
      case 'research': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900';
      case 'creative': return 'text-amber-400 bg-amber-950/40 border-amber-900';
      default: return 'text-slate-400 bg-slate-950/40 border-slate-900';
    }
  };

  return (
    <div id="sim-main-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Controls & Presets (4 cols) */}
      <div id="sim-controls" className="lg:col-span-4 flex flex-col gap-5">
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-semibold text-lg text-slate-100">Orkestrasyon Senaryoları</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            OpenFusion'ın benzersiz çoklu model tartışma ve hata tolere etme (failover) yeteneklerini görmek için bir senaryo seçin.
          </p>
          
          <div className="flex flex-col gap-2">
            {SIMULATION_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioId(scen.id);
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col gap-1.5 ${
                  selectedScenarioId === scen.id
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-inner'
                    : 'bg-[#151824] border-[#1e2230] hover:bg-[#1a1d2b]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium py-0.5 px-2 rounded-full border bg-slate-900 text-slate-300">
                    {scen.strategy.toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getCategoryColor(scen.category)}`}>
                    Zorluk: {scen.complexity}/10
                  </span>
                </div>
                <h4 className="text-xs font-medium font-sans text-slate-200 mt-1 line-clamp-1">
                  {scen.name}
                </h4>
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOM PROMPT SIMULATOR */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="font-display font-semibold text-slate-200">Özel Prompt Test Et</h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Kendi promptunuzu yazarak OpenFusion sınıflandırma ve routing motorunun bunu nasıl yönlendireceğini simüle edin.
          </p>
          
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Örn: Python ile asenkron Redis Streams kuyruğu oluşturan kod bloğu hazırla..."
              rows={3}
              className="w-full text-xs bg-[#151824] border border-[#22273a] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 resize-none font-sans placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isPlaying || !customPrompt.trim()}
              className="w-full bg-[#1b2034] hover:bg-emerald-600/90 hover:text-white text-slate-300 py-2 rounded-lg text-xs font-semibold font-sans transition-all border border-emerald-500/10 hover:border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              Motora Gönder ve Simüle Et
            </button>
          </form>
        </div>

        {/* ACTIVE SCENARIO METADATA */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-4 shadow-xl">
          <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Sistem Hedef Özellikleri
          </h4>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between py-1.5 border-b border-[#1c1e2b] text-xs">
              <span className="text-slate-400">Klasör / Panel</span>
              <span className="text-slate-200 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {activeScenario.panel}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#1c1e2b] text-xs">
              <span className="text-slate-400">Rotalama Stratejisi</span>
              <span className="text-emerald-400 font-semibold font-mono text-[11px]">
                {activeScenario.strategy.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-slate-400 mb-1">Giriş Promptu:</span>
              <div className="bg-[#151824] p-2.5 rounded border border-[#202436] font-mono text-[11px] text-slate-300 italic line-clamp-3">
                "{activeScenario.prompt}"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Execution Progress & Code Output (8 cols) */}
      <div id="sim-progress-column" className="lg:col-span-8 flex flex-col gap-5">
        
        {/* ACTION HEADER / TERMINAL LAUNCHER */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <h4 className="text-sm font-semibold font-sans text-slate-100">
              {activeScenario.name}
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              Durum: {currentStepIndex === -1 ? 'Hazır' : isPlaying ? 'İşleniyor...' : 'Tamamlandı'}
            </span>
          </div>

          <button
            onClick={handleStartSimulation}
            disabled={isPlaying || isLoading}
            className="px-5 py-2.5 bg-emerald-500/90 hover:bg-emerald-500 text-[#090a0f] text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {isLoading ? 'Orkestrasyon Yapılıyor...' : currentStepIndex === -1 ? 'Orkestrasyonu Başlat' : 'Yeniden Çalıştır'}
          </button>
        </div>

        {/* LOG FEED / REAL-TIME PROCESS */}
        <AnimatePresence>
          {runLogs.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#0b0c13] border border-[#1c1e2d] rounded-xl p-4 overflow-hidden font-mono text-xs text-[#52a65a] shadow-inner"
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-900">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                  OpenFusion Canlı Denetim Akışı (Telemetry Traces)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="max-h-28 overflow-y-auto flex flex-col gap-1 escroll text-[11px]">
                {runLogs.map((log, lidx) => (
                  <div key={lidx} className="flex gap-2">
                    <span className="text-slate-600 font-normal">❯</span>
                    <span className={log.includes('Hata') || log.includes('UYARI') ? 'text-amber-400' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP-BY-STEP FLOW VISUALIZER */}
        <div className="flex flex-col gap-4">
          {activeScenario.steps.map((step: any, idx: number) => {
            const isVisible = idx <= currentStepIndex;
            if (!isVisible) return null;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0f111a] border border-[#1e2230] rounded-xl overflow-hidden shadow-xl"
              >
                {/* STEP TITLE BAR */}
                <div className="bg-[#141724] border-b border-[#1c2032] py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono text-emerald-400">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {step.duration}ms
                  </span>
                </div>

                {/* STEP VISUALIZATION CARD BODIES */}
                <div className="p-4 bg-[#0d0e16]/60">
                  
                  {/* CLASSIFICATION BODY */}
                  {step.type === 'classification' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#121422] border border-[#1e223b] rounded-lg p-3.5 flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-500">
                          Seçilen Stratejik Atama
                        </span>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getCategoryColor(step.data.category)}`}>
                            Kategori: {step.data.category.toUpperCase()}
                          </span>
                          <span className="text-xs bg-[#19192b] border border-sky-950/40 text-sky-400 font-bold px-2.5 py-0.5 rounded">
                            Panel: {step.data.bestPanel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">
                          "{step.data.explanation}"
                        </p>
                      </div>

                      <div className="bg-[#121422] border border-[#1e223b] rounded-lg p-3.5 flex flex-col gap-2.5">
                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-500">
                          Prompt Parametre Metrikleri
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-slate-900/60 p-2 rounded text-center border border-[#1c1e2d]">
                            <span className="block text-[10px] text-slate-500 mb-0.5">Karmaşıklık</span>
                            <span className="text-xs font-mono font-bold text-amber-400">{step.data.complexity}/10</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded text-center border border-[#1c1e2d]">
                            <span className="block text-[10px] text-slate-500 mb-0.5">Harici Araç</span>
                            <span className="text-xs font-mono font-bold text-slate-300">
                              {step.data.requiresTools ? 'Evet' : 'Hayır'}
                            </span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded text-center border border-[#1c1e2d]">
                            <span className="block text-[10px] text-slate-500 mb-0.5">Web Search</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {step.data.requiresWeb ? 'EVET' : 'HAYIR'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ROUND 1 COMBAT / ANSWERS */}
                  {step.type === 'round1' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {step.data.responses?.map((res: any, idx: number) => (
                        <div key={idx} className="bg-[#121421] border border-[#1f233a] rounded-lg p-3 flex flex-col gap-2 shadow-inner">
                          <div className="flex items-center justify-between border-b border-[#21253c] pb-2">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <Cpu className="w-3 h-3 text-emerald-400" />
                              {res.model}
                            </span>
                            <span className="text-[9px] font-mono py-0.5 px-1.5 rounded bg-slate-950 text-slate-400">
                              {res.provider}
                            </span>
                          </div>
                          <div className="h-28 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-900 font-mono text-[9px] text-slate-300">
                            <pre className="whitespace-pre-wrap">{res.code}</pre>
                          </div>
                          <span className="text-[10px] text-slate-400 italic">
                            💡 {res.notes}
                          </span>
                        </div>
                      ))}
                      {step.data.models?.map((res: any, idx: number) => (
                        <div key={idx} className="bg-[#121421] border border-[#1f233a] rounded-lg p-3.5 flex items-center justify-between shadow-inner col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-xs font-bold text-slate-200">{res.name}</span>
                          </div>
                          <span className="text-xs text-sky-400 font-mono italic">{res.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ROUND 2 CRITIQUE */}
                  {step.type === 'round2' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {step.data.critiques?.map((crit: any, idx: number) => (
                        <div key={idx} className="bg-[#131120] border border-[#2c2242] rounded-lg p-3 flex flex-col gap-2 relative">
                          <div className="flex items-center justify-between border-b border-[#2f2549] pb-2 text-[10px]">
                            <span className="font-bold text-[#b59fee]">
                              ✍️ {crit.author}
                            </span>
                            <span className="text-slate-500 font-bold uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded">
                              Hedef: {crit.target}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-5">
                            "{crit.feedback}"
                          </p>
                          <div className="mt-auto pt-2 border-t border-[#231b38] flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Akran Skoru:</span>
                            <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded">
                              {crit.rating} / 10
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FALLBACK INFO */}
                  {step.type === 'fallback' && (
                    <div className="bg-[#24171a] border border-[#501f23] rounded-lg p-4 flex gap-3.5 items-start">
                      <div className="p-2 bg-[#ff465c]/10 text-[#ff465c] rounded">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                          Sağlayıcı Kesintisi Başa Çıkma Zinciri (Automatic Fallback Engine)
                        </span>
                        <div className="text-xs text-slate-300 leading-relaxed">
                          Asıl model olan <strong className="text-slate-100">{step.data.primaryModel}</strong>'da hata oluştu: 
                          <span className="text-red-400 font-mono ml-1">{step.data.error}</span>
                        </div>
                        <p className="text-xs text-emerald-400 font-semibold leading-relaxed mt-1">
                          🛡️ {step.data.action}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* WEB SEARCH RES */}
                  {step.type === 'web' && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-[#11191f] border border-[#162a35] rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-semibold text-sky-300">Google Search Yerleşik Arama Motoru Entegrasyonu</span>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-400">
                          Sorgu: <code className="text-slate-200 bg-slate-950 px-2 py-0.5 rounded">"{step.data.query}"</code>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.data.results?.map((res: any, idx: number) => (
                          <div key={idx} className="bg-[#121620] border border-[#1e263a] rounded-lg p-3 flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-200 leading-snug line-clamp-1">
                              🔗 {res.title}
                            </span>
                            <p className="text-[11px] text-slate-400 leading-normal line-clamp-3 italic">
                              "{res.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMPILATION / JUDGE SCREEN */}
                  {step.type === 'compilation' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left consensus parameters */}
                      <div className="md:col-span-8 bg-[#121422] border border-[#20243d] rounded-lg p-3.5 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                          <Users className="w-4 h-4 text-[#bf9fff]" />
                          Yargıç Değerlendirme Özeti ({step.data.judge})
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed italic">
                          "{step.data.summary}"
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-1.5 pt-2 border-t border-[#1a1c2e]">
                          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-900 text-center">
                            <span className="block text-[10px] text-slate-500 mb-0.5">Güven Skoru (Confidence)</span>
                            <span className="text-sm font-mono font-bold text-emerald-400">%{step.data.confidenceScore}</span>
                          </div>
                          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-900 text-center">
                            <span className="block text-[10px] text-slate-500 mb-0.5">Mutabakat (Agreement)</span>
                            <span className="text-sm font-mono font-bold text-sky-400">%{step.data.agreementScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right cost optimization statistics */}
                      <div className="md:col-span-4 bg-[#121422] border border-[#20243d] rounded-lg p-3.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                          <TrendingUp className="w-4 h-4" />
                          Cost Optimizer Opt.
                        </div>
                        <div className="flex flex-col gap-1.5 my-3">
                          <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold tracking-wider">
                            Kazandırılan Finansal Tasarruf
                          </span>
                          <span className="text-2xl font-mono font-bold text-emerald-400">
                            🚀 {step.data.costSavedUsd ? `$${step.data.costSavedUsd.toFixed(4)}` : '$0.0031'}
                          </span>
                          <span className="text-[9px] text-[#52a65a] italic leading-normal">
                            Tek tek sıralı modelleri çağırmaya göre %34 maliyet tasarrufu sağlandı.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FINAL RESULTS DISPLAY */}
                  {step.type === 'final' && (
                    <div className="flex flex-col gap-3.5">
                      
                      {/* Code file display with action buttons */}
                      <div className="bg-[#111119] border border-[#20243d] rounded-lg overflow-hidden shadow-inner flex flex-col">
                        <div className="bg-[#161624] px-4 py-2 flex items-center justify-between border-b border-[#232742]">
                          <span className="text-xs font-sans font-medium text-slate-200">
                            {activeScenario.category === 'coding' ? 'quicksort.rs (Compiled Out)' : 'sector_report_2026.md'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(step.data.code)}
                              className="p-1 px-2.5 rounded bg-slate-950 text-slate-400 hover:text-white transition-all border border-[#262b46] hover:bg-slate-900 cursor-pointer text-[10px] flex items-center gap-1.5"
                            >
                              {copied ? <Check className="w-3   h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copied ? 'Kopyalandı' : 'Kodu Kopyala'}
                            </button>
                          </div>
                        </div>

                        {/* FINAL OUTPUT TEXTAREA / DISPLAY */}
                        <div className="p-4 bg-[#0a0a0f] max-h-96 overflow-y-auto text-xs font-mono text-slate-300 leading-relaxed escroll font-normal">
                          <pre className="whitespace-pre-wrap">{step.data.code}</pre>
                        </div>
                      </div>

                      {/* RAW STATISTICS PANEL */}
                      <div className="bg-[#121422] border border-[#20243d] p-3.5 rounded-lg flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-semibold text-slate-200">Tüm orkestrasyon zinciri güvenle tamamlandı!</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-mono">LATENCY</span>
                            <span className="text-xs font-mono font-bold text-slate-200">{step.data.rawMetrics.latency}</span>
                          </div>
                          <div className="flex flex-col text-right border-l border-slate-800 pl-4">
                            <span className="text-[10px] text-slate-500 uppercase font-mono">COST</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">{step.data.rawMetrics.cost}</span>
                          </div>
                          <div className="flex flex-col text-right border-l border-slate-800 pl-4">
                            <span className="text-[10px] text-slate-500 uppercase font-mono">TOKENS</span>
                            <span className="text-xs font-mono font-semibold text-slate-300">
                              {step.data.rawMetrics.tokensIn} / {step.data.rawMetrics.tokensOut}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
