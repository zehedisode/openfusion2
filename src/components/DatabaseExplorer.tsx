/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DATABASE_SCHEMAS, MOCK_REQUESTS } from '../data/mockData';
import {
  Database, RefreshCw, Key, ShieldCheck, Cpu, HardDrive,
  Code, Play, Terminal, DatabaseZap, Table, BookOpen, Layers, GitMerge
} from 'lucide-react';

export default function DatabaseExplorer() {
  const [activeTable, setActiveTable] = useState<string>('requests');
  const [customSQL, setCustomSQL] = useState<string>('SELECT id, user_id, panel_id, total_cost_usd, latency_ms FROM requests ORDER BY latency_ms DESC;');
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const getRelations = (tableName: string) => {
    switch (tableName) {
      case 'requests':
        return [
          { from: 'requests.panel_id', to: 'panels.id', type: '1:N Foreign Key' },
          { from: 'requests.user_id', to: 'users.id', type: '1:N Foreign Key' }
        ];
      case 'panels':
        return [
          { from: 'panels.owner_id', to: 'users.id', type: '1:N Foreign Key' }
        ];
      case 'memories':
        return [
          { from: 'memories.user_id', to: 'users.id', type: '1:N Foreign Key' }
        ];
      default:
        return [];
    }
  };

  const handleRunSQL = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setQueryError(null);
    setSqlResult([]);

    try {
      const res = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: customSQL })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Sorgu hatası (HTTP ${res.status})`);
      }

      const data = await res.json();
      setSqlResult(data.data);
    } catch (err: any) {
      setQueryError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const selectedTableData = DATABASE_SCHEMAS.find(t => t.table === activeTable);

  return (
    <div id="db-explorer-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* SCHEMA SELECTOR & TABLE INFO (8 cols) */}
      <div id="schema-browser" className="lg:col-span-8 flex flex-col gap-5">
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2334]">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-semibold text-base text-slate-100">PostgreSQL Schema & pgvector Görselleştirici</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold bg-[#11131e] border border-slate-900 px-2 py-0.5 rounded">
              v0.1 SCHEMA MIGRATIONS
            </span>
          </div>

          {/* Table Tab Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DATABASE_SCHEMAS.map(val => (
              <button
                key={val.table}
                onClick={() => {
                  setActiveTable(val.table);
                  setQueryError(null);
                  setSqlResult(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTable === val.table
                    ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 font-bold shadow-inner'
                    : 'bg-[#141624] border-[#1e2233] text-slate-400 hover:bg-[#191d2f] hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                {val.table}
              </button>
            ))}
          </div>

          {selectedTableData && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#11131d] border border-[#1c2032] rounded-lg p-3.5">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold tracking-wider">Tablo Açıklaması:</span>
                <p className="text-xs text-slate-350 leading-relaxed mt-1">{selectedTableData.description}</p>
              </div>

              {/* COLUMNS TABLE LIST */}
              <div className="overflow-x-auto border border-[#1d2235] rounded-lg">
                <table className="w-full text-left text-xs bg-slate-950/40">
                  <thead className="bg-[#131523] border-b border-[#21263c] text-slate-400 font-semibold font-mono text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">SÜTUN ADI</th>
                      <th className="px-4 py-3">TİP (DATATYPE)</th>
                      <th className="px-4 py-3">AÇIKLAMA / NOTLAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2336] text-slate-300 font-sans text-[11px]">
                    {selectedTableData.columns.map((col, cidx) => (
                      <tr key={cidx} className="hover:bg-[#141727]/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-200">{col.name}</td>
                        <td className="px-4 py-2.5 font-mono text-emerald-400 font-medium">{col.type}</td>
                        <td className="px-4 py-2.5 text-slate-400">{col.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RELATIONAL TRIGGERS GRAPH */}
              {getRelations(activeTable).length > 0 && (
                <div className="bg-[#101323] border border-[#21264c] p-3 rounded-lg flex flex-col gap-2 shadow-inner mt-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-sky-400 tracking-wider flex items-center gap-1">
                    <GitMerge className="w-3.5 h-3.5" />
                    İlişkisel Veritabanı Haritası (Foreign Key Constraints)
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {getRelations(activeTable).map((rel, rid) => (
                      <div key={rid} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <span className="text-[#a5b4fc] font-bold">{rel.from}</span>
                        <span className="text-slate-600">❯❯❯ references ❯❯❯</span>
                        <span className="text-emerald-400 font-bold">{rel.to}</span>
                        <span className="text-[10px] text-slate-500 italic ml-1">({rel.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SQL PLAYGROUND CONSOLE (4 cols) */}
      <div id="sql-console" className="lg:col-span-4 flex flex-col gap-5">
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-4 flex flex-col h-full shadow-xl">
          <div className="flex items-center justify-between border-b border-[#202434] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Interactive SQL Console</span>
            </div>
            <span className="text-[9px] uppercase font-mono font-semibold bg-red-950/40 text-red-400 border border-red-500/10 px-1.5 py-0.5 rounded">
              READ Only MODE
            </span>
          </div>

          <form onSubmit={handleRunSQL} className="flex flex-col gap-3 flex-1">
            <div className="flex-1">
              <textarea
                value={customSQL}
                onChange={(e) => setCustomSQL(e.target.value)}
                placeholder="SELECT * FROM requests;"
                rows={4}
                className="w-full text-xs bg-[#07080f] border border-[#202439] rounded-lg p-3 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500/50 resize-none h-44"
              />
            </div>
            
            <button
              type="submit"
              disabled={running}
              className="w-full bg-[#1c223c] hover:bg-emerald-600 hover:text-slate-950 transition-all text-slate-300 font-semibold font-sans py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {running ? 'Sorgulanıyor...' : 'SQL Sorgusu Çalıştır'}
            </button>
          </form>

          {/* QUERY ERROR STATUS */}
          {queryError && (
            <div className="mt-3 bg-red-950/20 border border-red-900/50 p-2 rounded text-[11px] text-red-400 font-mono leading-relaxed select-text">
              ⚠️ <strong>Error:</strong> {queryError}
            </div>
          )}

          {/* SQL RESULTS DISPLAY BOX */}
          {sqlResult && !queryError && (
            <div className="mt-4 bg-[#0a0c14] border border-[#1e2237] p-3 rounded-lg overflow-y-auto max-h-56 escroll">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2 text-[9px] uppercase tracking-wider text-slate-500 font-mono font-semibold">
                <span>Dönen Satırlar ({sqlResult.length})</span>
                <span className="text-emerald-500 font-bold">SQL_OK_200</span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {sqlResult.map((row, rIdx) => (
                  <div key={rIdx} className="bg-slate-950/60 p-2 rounded border border-slate-900 font-mono text-[10px] text-slate-300">
                    {Object.entries(row).map(([k, v]) => (
                      <div key={k} className="flex gap-2 justify-between">
                        <span className="text-slate-500 font-semibold">{k}:</span>
                        <span className="text-slate-300 antialiased line-clamp-2 text-right">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-auto pt-3 text-[10px] text-slate-500 leading-normal">
            💡 <strong>İpucu:</strong> Konsolda <code className="text-slate-400">SELECT * FROM users;</code> veya <code className="text-slate-400">SELECT * FROM memories;</code> çalıştırarak semantik pgvector verilerini kontrol edebilirsiniz.
          </div>
        </div>
      </div>

    </div>
  );
}
//
