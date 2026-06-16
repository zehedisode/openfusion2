/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Terminal, ShieldCheck, Key, Lock, Play, Copy, Check, Info,
  AlertTriangle, RefreshCw, Layers, ShieldAlert, Cpu, ArrowRight
} from 'lucide-react';
import { DEFAULT_PANELS } from '../data/mockData';

export default function CliPlayground() {
  const [typedCommand, setTypedCommand] = useState<string>('openfusion panel list');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['OpenFusion CLI v0.1 ready.', 'Type "help" to see list of valid administrative commands.']);
  const [tokenCounter, setTokenCounter] = useState<number>(0);
  const [rateLimitLogs, setRateLimitLogs] = useState<{ id: string; time: string; status: 'ok' | 'blocked' }[]>([]);
  const [createdApiKey, setCreatedApiKey] = useState<string>('');
  const [createdKeyHash, setCreatedKeyHash] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Curl template output helper
  const curlTemplate = `curl -X POST "${window.location.origin}/v1/chat/completions" \\
  -H "Authorization: Bearer ${createdApiKey || 'fus_live_8a7fe31b2c4d90e011bf'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openfusion/coding-elite",
    "messages": [
      {"role": "user", "content": "Thread safe Rust sort..."}
    ],
    "fusion": {
      "strategy": "debate",
      "rounds": 3,
      "cost_optimize": true
    }
  }'`;

  // CLI Command Execution Simulation
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;

    const cmd = typedCommand.toLowerCase().trim();
    let res: string[] = [`$ ${typedCommand}`];

    if (cmd === 'help') {
      res.push(
        'Available commands:',
        '  openfusion serve               - Boot default gateway on port 3000',
        '  openfusion panel list          - List all system-registered panels',
        '  openfusion api-key create      - Generate secure hashed API key & secret',
        '  openfusion audit-logs          - View current security and audit trails',
        '  clear                          - Clear terminal display logs'
      );
    } else if (cmd === 'clear') {
      setTerminalOutput([]);
      setTypedCommand('');
      return;
    } else if (cmd === 'openfusion serve') {
      res.push(
        '🚀 Booting OpenFusion Universal AI Orchestrator...',
        '⚙️  Loading configurations from `/config/default.yaml`...',
        '🔑 Initializing JWT & Bcrypt Auth Services...',
        '💾 Connected to PostgreSQL + pgvector (localhost:5432)',
        '🍿 Connected to Redis Cache (localhost:6379)',
        '🔌 Model Context Protocol server: ACTIVE on port 8000 (FastMCP)',
        '⭐ Gateway active on address: http://0.0.0.0:3000 (OpenAI Compatible)'
      );
    } else if (cmd === 'openfusion panel list') {
      res.push('ID             NAME           STRATEGY   MODELS COGNITIVE_ROUTE');
      DEFAULT_PANELS.forEach(p => {
        res.push(`${p.id.padEnd(14)} ${p.name.padEnd(14)} ${p.strategy.padEnd(10)} [${p.models.length} models: ${p.models.map(m => m.provider).join(',')}]`);
      });
    } else if (cmd === 'openfusion api-key create') {
      const randomKey = 'fus_live_' + [...Array(24)].map(() => (~~(Math.random()*36)).toString(36)).join('');
      const hashed = 'bcrypt_sha256$' + [...Array(32)].map(() => (~~(Math.random()*16)).toString(16)).join('');
      res.push(
        '🗝️  OpenFusion Hashed Key Engine Activated.',
        `🔑 GENERATED API KEY: ${randomKey}`,
        `🔒 CRYPTO HASH SHA-256: ${hashed}`,
        '⚠️  SECURITY NOTICE: Store your API key safely. The system only stores SHA-256 hashes.'
      );
      setCreatedApiKey(randomKey);
      setCreatedKeyHash(hashed);
    } else if (cmd === 'openfusion audit-logs') {
      res.push(
        '[09:02:14] AUTH_OK  - api_key validated for usr_901',
        '[09:03:01] ROUTE_OK - routed query to panel research-deep',
        '[09:03:55] CACHE_OK - Redis hit for "quicksort algorithm"',
        '[09:05:00] WARN     - Provider "anthropic" rate limited, failover to "google" in 110ms'
      );
    } else {
      res.push(`command not found: "${typedCommand}". Type "help" to view listing.`);
    }

    setTerminalOutput(prev => [...prev, ...res]);
    setTypedCommand('');
  };

  // Sliding Window Rate Limiting Simulation Clicker
  const triggerRateLimit = () => {
    const timestamp = new Date().toLocaleTimeString();
    // Simulate current state inside a 10s sliding window
    const nowMs = Date.now();
    const tenSecsAgo = nowMs - 10000;
    
    // Add new log
    const updatedLogs = [...rateLimitLogs, { id: Math.random().toString(), time: timestamp, status: 'ok' as const }];
    
    // Check counts within 10s window to set status
    // If we click too fast (> 4 clicks in 10s) -> Block
    const activeInWindow = rateLimitLogs.filter(l => true); // just use simple index or count for simulation
    const clicksInLastTenSec = rateLimitLogs.length > 0 ? rateLimitLogs.filter(l => true).length : 0;
    
    if (clicksInLastTenSec >= 4) {
      setRateLimitLogs(prev => [...prev, { id: Math.random().toString(), time: timestamp, status: 'blocked' }]);
    } else {
      setRateLimitLogs(prev => [...prev, { id: Math.random().toString(), time: timestamp, status: 'ok' }]);
    }
  };

  const clearRateLogs = () => {
    setRateLimitLogs([]);
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(curlTemplate);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div id="cli-and-security-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT TERMINAL AREA (7 cols) */}
      <div id="cli-terminal-block" className="lg:col-span-7 flex flex-col gap-5">
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col">
          {/* Windows title bar */}
          <div className="bg-[#121421] px-4 py-2.5 flex items-center justify-between border-b border-[#1c1e2f]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-mono font-bold text-slate-300">openfusion@linux-amd64:~ - (CLI Dashboard Tools)</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
          </div>

          {/* Terminal Console log streams */}
          <div className="p-4 bg-[#06070b] font-mono text-xs text-slate-300 flex-1 min-h-80 max-h-96 overflow-y-auto escroll flex flex-col gap-1.5 text-[11px]">
            {terminalOutput.map((out, oidx) => (
              <div key={oidx} className="whitespace-pre-wrap select-text leading-relaxed">
                {out.startsWith('$') ? (
                  <span className="text-emerald-400 font-bold">{out}</span>
                ) : out.startsWith('command not') ? (
                  <span className="text-red-400">{out}</span>
                ) : out.startsWith('🔑 GENERATED') || out.startsWith('🗝️') ? (
                  <span className="text-amber-300">{out}</span>
                ) : (
                  <span>{out}</span>
                )}
              </div>
            ))}
          </div>

          {/* Input form shell */}
          <form onSubmit={handleCliSubmit} className="bg-[#0d0e16] border-t border-[#1e2230] p-3 flex items-center gap-2">
            <span className="text-emerald-400 font-mono font-bold text-sm">openfusion$</span>
            <input
              type="text"
              value={typedCommand}
              onChange={(e) => setTypedCommand(e.target.value)}
              placeholder="e.g. help, openfusion serve, openfusion panel list"
              className="flex-1 bg-transparent border-none text-slate-100 font-mono text-xs focus:outline-none placeholder-slate-600 focus:ring-0"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded text-[10px] font-mono font-semibold text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              RUN
            </button>
          </form>
        </div>

        {/* SECURITY INFO SECTION */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Entegre Şifreleme ve Veri Koruma (DLP)
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            OpenFusion, veri iletişiminde tam güvenliği esas alır. Kritik sağlayıcı API anahtarları diskte <strong>Fernet (AES-128 tabanlı) şifreleme</strong> ile kilitli tutulurken, API üzerinden iletilen tüm PII (Personal Identifiable Information) ve kredi kartı verileri DLP (Data Leakage Prevention) filtrelerinden geçirilerek otomatik maskelenir.
          </p>
        </div>
      </div>

      {/* RIGHT RATE LIMITING SIMULATOR (5 cols) */}
      <div id="rate-limiting-block" className="lg:col-span-5 flex flex-col gap-5">
        
        {/* INTERACTIVE COMPATIBILITY TESTER */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#202434] pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">OpenAI SDK Uyumluluk Katmanı</span>
            </div>
            <button
              onClick={copyCurl}
              className="p-1 px-2 rounded bg-slate-950 text-slate-400 border border-slate-800 hover:text-white transition-all text-[10px] cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copiedText ? 'Kopyalandı' : 'cURL Kopyala'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            OpenFusion, mevcut kodlarınızı bozmadan OpenAI SDK API formatını destekler. Sadece <code className="text-slate-200 font-mono">base_url</code> değiştirerek tüm orkestrasyona geçebilirsiniz.
          </p>
          <div className="p-3 bg-slate-950 rounded border border-[#191a27] font-mono text-[10px] text-emerald-500 overflow-x-auto select-all max-h-52 escroll">
            <pre className="whitespace-pre">{curlTemplate}</pre>
          </div>
        </div>

        {/* SLIDING WINDOW RATE LIMITING SIMULATOR */}
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-display font-semibold text-slate-200 text-sm">Redis Sliding Window Simulator</h4>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-normal">
            Sürgülü rate limiter tespiti: 10 saniye içerisinde en fazla 3 isteğe izin verilir. Ardışık tıklayarak Redis sliding-window engelini canlandırın!
          </p>

          <div className="flex gap-2.5 mb-4">
            <button
              onClick={triggerRateLimit}
              className="px-5 py-2.5 bg-indigo-950/40 hover:bg-indigo-900 border border-indigo-700 hover:border-indigo-500 text-slate-200 text-xs font-bold rounded-lg cursor-pointer flex-1 flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              Endpoint İsteği Gönder (GET/POST)
            </button>
            <button
              onClick={clearRateLogs}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-500 hover:text-slate-200 text-xs transition-all cursor-pointer"
              title="Sıfırla"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* SIMULATOR WINDOW FEEDBACK PROGRESS */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-52 escroll">
            {rateLimitLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1f2231] rounded-lg p-6 text-center text-slate-500">
                <Info className="w-5 h-5 mb-1.5" />
                <span className="text-[11px] font-sans">Simülatör logu boş. Tetikleyici butona basabilirsiniz.</span>
              </div>
            ) : (
              [...rateLimitLogs].reverse().map((log, lidx) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                    log.status === 'blocked'
                      ? 'bg-red-950/15 border-red-500/30 text-red-400'
                      : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {log.status === 'blocked' ? (
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    )}
                    <span>
                      {log.status === 'blocked' ? 'HTTP 429 BLOCKED' : 'HTTP 200 OK'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
//
