/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PanelConfig, ProviderModel } from '../types';
import {
  Settings, Sliders, Play, Trash2, Edit2, Plus, Info, Check, Eye,
  Database, UserCheck, Shield, ChevronDown, CheckCircle, Code2, Sparkles, Terminal
} from 'lucide-react';
import { DEFAULT_PROVIDERS, DEFAULT_PANELS } from '../data/mockData';

export default function PanelArchitect({
  panels,
  onAddPanel,
  onDeletePanel,
}: {
  panels: PanelConfig[];
  onAddPanel: (newPanel: PanelConfig) => void;
  onDeletePanel: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'visual' | 'yaml'>('visual');
  const [panelName, setPanelName] = useState<string>('custom-analytics');
  const [strategy, setStrategy] = useState<any>('debate');
  const [judge, setJudge] = useState<string>('auto');
  const [costProfile, setCostProfile] = useState<any>('balanced');
  const [rounds, setRounds] = useState<number>(3);
  const [selectedModels, setSelectedModels] = useState<string[]>(['google gemini-2.5-pro', 'openai gpt-4o']);
  const [selectedTools, setSelectedTools] = useState<string[]>(['web_search']);
  const [copied, setCopied] = useState<boolean>(false);

  // Available Tools
  const ALL_TOOLS = [
    { key: 'web_search', name: 'Web Search', desc: 'Google ve Bing API yerel arama kütüphanesi' },
    { key: 'code_executor', name: 'Sandbox Code Executor', desc: 'İzole edilmiş Docker Rust/Python yürütücü' },
    { key: 'browser', name: 'Web Scraper', desc: 'Dinamik sayfa kazıyıcı (browser grounding)' },
    { key: 'vector_db', name: 'Semantik Bellek (pgvector)', desc: 'Uzun vadeli vektör hafıza araması' },
  ];

  const handleToggleModel = (modelName: string) => {
    if (selectedModels.includes(modelName)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(m => m !== modelName));
      }
    } else {
      setSelectedModels([...selectedModels, modelName]);
    }
  };

  const handleToggleTool = (toolKey: string) => {
    if (selectedTools.includes(toolKey)) {
      setSelectedTools(selectedTools.filter(t => t !== toolKey));
    } else {
      setSelectedTools([...selectedTools, toolKey]);
    }
  };

  const generateYAML = (name: string, strat: string, mods: string[], jdg: string, costP: string, rnds: number, tls: string[]) => {
    let yaml = `panels:\n  ${name || 'custom-panel'}:\n    models:\n`;
    
    mods.forEach(fullModelName => {
      const match = DEFAULT_PROVIDERS.find(p => p.name.toLowerCase() === fullModelName.toLowerCase());
      if (match) {
        yaml += `      - provider: ${match.provider}\n        model: ${match.name.split(' ')[1]}\n        weight: 1.0\n`;
      }
    });

    yaml += `    strategy: ${strat}\n`;
    if (strat === 'debate') {
      yaml += `    rounds: ${rnds}\n`;
    }
    yaml += `    judge: ${jdg}\n`;
    yaml += `    cost_profile: ${costP}\n`;
    if (tls.length > 0) {
      yaml += `    tools: [${tls.join(', ')}]\n`;
    }
    
    return yaml;
  };

  const currentYaml = generateYAML(panelName, strategy, selectedModels, judge, costProfile, rounds, selectedTools);

  const handleCreatePanel = () => {
    if (!panelName) return;
    
    const configuredModels = selectedModels.map(fullModelName => {
      const match = DEFAULT_PROVIDERS.find(p => p.name.toLowerCase() === fullModelName.toLowerCase());
      return {
        provider: match?.provider || 'openai',
        model: match?.name.split(' ')[1] || 'gpt-4o',
        weight: 1.0
      };
    });

    const newPanel: PanelConfig = {
      id: `custom-${Math.random().toString(36).substr(2, 5)}`,
      name: panelName.toLowerCase().replace(/\s+/g, '-'),
      strategy,
      models: configuredModels,
      judge,
      costProfile,
      rounds: strategy === 'debate' ? rounds : undefined,
      tools: selectedTools,
      isBuiltIn: false
    };

    onAddPanel(newPanel);
    setPanelName('custom-agent');
    setSelectedModels(['google gemini-2.5-flash']);
  };

  const copyYaml = () => {
    navigator.clipboard.writeText(currentYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="panel-editor-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT FORM COLUMN (7 cols) */}
      <div id="panel-architecture-form" className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2336]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-semibold text-base text-slate-100">Panel Yapılandırma Editörü</h3>
            </div>
            <span className="text-[10px] uppercase font-mono bg-[#161a29] px-2.5 py-1 rounded-md border border-emerald-500/20 text-emerald-400 font-bold">
              v0.1 YAML GENERATOR
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Panel Name input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Panel İsmi (ID)</label>
              <input
                type="text"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="Örn: coding-elite-v2"
                className="w-full text-xs bg-[#151824] border border-[#22273a] rounded-lg p-3 text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-[10px] text-slate-500 font-mono">Boşluksuz ve küçük harflerle (örn: budget-reasoning-panel).</span>
            </div>

            {/* Strategy Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Rotalama Stratejisi</label>
                <div className="relative">
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full text-xs bg-[#151824] border border-[#22273a] rounded-lg p-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 appearance-none font-sans"
                  >
                    <option value="debate">Debate (Akıllı Çapraz Tartışma)</option>
                    <option value="parallel">Parallel (Tümünü Çağır, En Hızlı Döneni Seç)</option>
                    <option value="fallback">Fallback (Sıralı Emniyet Zinciri)</option>
                    <option value="first-past-post">First-Past-Post (İlk Bitiren Cevap Verir)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Yargıç Model / Auto Pilot</label>
                <div className="relative">
                  <select
                    value={judge}
                    onChange={(e) => setJudge(e.target.value)}
                    className="w-full text-xs bg-[#151824] border border-[#22273a] rounded-lg p-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 appearance-none font-sans"
                  >
                    <option value="auto">Auto (Otomatik Panel Lideri)</option>
                    <option value="claude-3.5-sonnet">Anthropic Claude-3.5-Sonnet</option>
                    <option value="gpt-4o">OpenAI GPT-4o</option>
                    <option value="gemini-2.5-pro">Google Gemini-2.5-Pro</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Custom Parameters for debate */}
            {strategy === 'debate' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[#121523] border border-[#222744] p-3.5 rounded-lg flex items-center justify-between gap-4"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Debate Akran Tartışma Round Sayısı</span>
                  <p className="text-[10px] text-slate-400">Arka arkaya modellerin birbirini denetleyeceği döngü adımı.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value))}
                    className="w-24 h-1.5 bg-[#1b2035] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="w-8 text-center font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                    {rounds}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Model Multi-Selector */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-semibold text-slate-300">Birleştirilecek LLM Model Havuzu</label>
              <span className="text-[10px] text-slate-500 mb-2">En az 1 veya daha fazla aktif sağlayıcı modeli seçmelisiniz.</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 escroll">
                {DEFAULT_PROVIDERS.map((prov) => {
                  const isChecked = selectedModels.includes(prov.name);
                  return (
                    <button
                      key={prov.name}
                      onClick={() => handleToggleModel(prov.name)}
                      className={`text-left p-2.5 rounded-lg border text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-[#151824] border-[#202436] text-slate-400 hover:border-slate-800 hover:bg-[#1a1d2d]'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[11px] text-slate-200">{prov.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-mono">
                          In: ${prov.inputCostPerM} / Out: ${prov.outputCostPerM} (per M)
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isChecked && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tool Selections wrapper */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-semibold text-slate-300">Orkestrasyona Ekli Araç Kitleri (Tools / Action Grounding)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {ALL_TOOLS.map((tl) => {
                  const isChecked = selectedTools.includes(tl.key);
                  return (
                    <button
                      key={tl.key}
                      onClick={() => handleToggleTool(tl.key)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all flex gap-3 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-[#151824] border-[#202436] text-slate-400 hover:border-slate-800 hover:bg-[#1a1d2d]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center text-[9px] font-bold ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isChecked && '✓'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 text-[11px]">{tl.name}</span>
                        <span className="text-[10px] text-slate-500">{tl.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create action button */}
            <div className="mt-4 pt-3 border-t border-[#1f2336] flex justify-end">
              <button
                onClick={handleCreatePanel}
                disabled={!panelName || selectedModels.length === 0}
                className="px-5 py-2.5 bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Özel Paneli Sisteme Kaydet
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT STACK PANEL (5 cols) YAML & PRESENT PANELS */}
      <div id="panel-architecture-yaml" className="lg:col-span-5 flex flex-col gap-6">
        
        {/* YAML PREVIEW SCREEN */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#202434] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">YAML Manifest Çıktısı</span>
            </div>
            <button
              onClick={copyYaml}
              className="p-1 px-2 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all text-[10px] cursor-pointer flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : 'Kopyala'}
            </button>
          </div>

          <div className="p-3 bg-[#08090f] rounded-lg border border-[#161a28] font-mono text-xs text-emerald-400 overflow-x-auto select-all max-h-64 escroll">
            <pre className="whitespace-pre">{currentYaml}</pre>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            ⚙️ Yukarıdaki YAML yapısı, OpenFusion sunucusuna gönderilmek üzere oluşturulan panel kurallar dizisidir. (dosya konumu: <code className="text-slate-400 font-mono">/config/panels/{panelName || 'id'}.yaml</code>)
          </p>
        </div>

        {/* ACTIVE PANELS DIRECTORY */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-900">
            <Database className="w-4 h-4 text-slate-400" />
            <h4 className="font-display font-semibold text-slate-200 text-sm">Mevcut Aktif Paneller ({panels.length})</h4>
          </div>
          
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1 escroll flex-1">
            {panels.map((pnl) => (
              <div
                key={pnl.id}
                className="bg-[#141724] border border-[#1e2236] p-3 rounded-lg flex items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#bf9fff] font-mono font-bold text-xs">{pnl.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                      pnl.isBuiltIn ? 'bg-indigo-950/40 border-indigo-900 text-indigo-400' : 'bg-amber-950/40 border-amber-900 text-amber-400'
                    }`}>
                      {pnl.isBuiltIn ? 'BILT-IN' : 'USER'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Strateji: <strong className="text-slate-300 capitalize">{pnl.strategy}</strong></span>
                    <span>•</span>
                    <span>Modeller: <strong className="text-slate-300">{pnl.models.length} adet</strong></span>
                  </div>
                </div>

                {!pnl.isBuiltIn && (
                  <button
                    onClick={() => onDeletePanel(pnl.id)}
                    className="p-1.5 rounded hover:bg-red-950/20 text-slate-500 hover:text-red-400 transition-all border border-transparent hover:border-red-900/50 cursor-pointer"
                    title="Paneli Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
