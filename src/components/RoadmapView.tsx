/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { COMPETITORS } from '../data/mockData';
import {
  Compass, ShieldCheck, HelpCircle, CheckCircle, Flame, Sparkles,
  GitPullRequest, ArrowRight, Star, ExternalLink, Award
} from 'lucide-react';

export default function RoadmapView() {
  const [selectedMilestone, setSelectedMilestone] = useState<string>('v0.1');

  const ROADMAP_DATA = [
    {
      version: 'v0.1',
      title: 'MVP - Multi-Provider Altyapı & Rotalama (4-6 hafta)',
      status: 'completed',
      desc: 'Şu an çalışır durumda olan kararlı sürüm. Çekirdek model entegrasyonu, OpenAI uyumlu REST rotalama ve temel yapılandırma katmanlarını içerir.',
      features: [
        { name: 'Çoklu Sağlayıcı Entegrasyonu (OpenAI, Anthropic, Google, DeepSeek, Ollama)', completed: true },
        { name: 'Birleştirilmiş Sağlayıcı Arayüzü (Abstract Provider standardizasyonu)', completed: true },
        { name: 'Yönlendirme Motoru (Basit Prompt kategorilendirme ve karmaşıklık sınıflandırması)', completed: true },
        { name: 'YAML Tabanlı Panel Altyapısı', completed: true },
        { name: 'OpenAI Uyumlu API Çıktı Portu (/v1/chat/completions)', completed: true },
        { name: 'Sunucu Gönderimli Olaylar (SSE) Akışı (SSE Streaming)', completed: true },
        { name: 'JWT & API Key Tabanlı Güvenlik Denetimleri', completed: true },
        { name: 'Redis Kaynaklı Sürgülü Pencere Hız Sınırlayıcı (Sliding Window)', completed: true },
        { name: 'PostgreSQL + pgvector Veritabanı Migrasyon Yapısı', completed: true },
        { name: 'Docker Compose ile Tek Tıkla Kurulum', completed: true },
        { name: 'Gelişmiş CLI Kontrol Altyapısı (Serve, Panel)', completed: true }
      ]
    },
    {
      version: 'v0.2',
      title: 'Intelligence Layer - Tartışma ve Karar Havuzu (4-6 hafta)',
      status: 'active',
      desc: 'Zorlu sorulara yüksek doğruluklu yanıtlar üretebilmek için modelleri tartışma masasında buluşturan ve konsensüs üreten zeka katmanı.',
      features: [
        { name: 'Çoklu Round Tartışma Motoru (Redis Streams üzerinden koordinasyon)', completed: false },
        { name: 'Yargıç Hizmeti (LLM Judge & Ensemble oylama algoritmaları)', completed: false },
        { name: 'Güven-Doğruluk Katsayısı Analizi', completed: false },
        { name: 'Öğrenmeli Fiyat Optimizasyon Modeli (Maliyet kontrol)', completed: false },
        { name: 'MCP (Model Context Protocol) Desteği (FastMCP Yerleşik)', completed: false },
        { name: 'Yerleşik Web Arama ve Tarayıcı Entegrasyon Araçları', completed: false },
        { name: 'Hata Durumunda Otomatik Geri Çekilme Zinciri (Automatic Fallback)', completed: false }
      ]
    },
    {
      version: 'v0.3',
      title: 'Memory & Long-term RAG Engine (4-6 hafta)',
      status: 'scheduled',
      desc: 'Ajanların kalıcı olmasına imkan sağlayan ve belgeleri semantik olarak indeksleyerek akıllıca geri çağıran hafıza katmanı.',
      features: [
        { name: 'Ajan Kurul Şablonu (Soyut Taban Sınıf ve Orkestratör)', completed: false },
        { name: 'Uzun Dönem pgvector Semantik Hafıza Entegrasyonu', completed: false },
        { name: 'Kısa Dönem Redis Önbellek Belleği', completed: false },
        { name: 'Zengin Belge Ayrıştırıcı Modülü (PDF, DOCX, Markdown)', completed: false },
        { name: 'TypeScript & Node.js Edge SDK', completed: false }
      ]
    },
    {
      version: 'v0.4',
      title: 'Enterprise & Security Compliance (4-6 hafta)',
      status: 'scheduled',
      desc: 'Kurumsal düzeyde yetkilendirme, denetim, DLP masking ve eklenti pazar yerini barındıran ölçeklendirme aşaması.',
      features: [
        { name: 'Rol Tabanlı Erişim Kontrolü (RBAC) & Tam Denetim Logları', completed: false },
        { name: 'Kişisel Veri Maskeleme ve DLP Koruma Kalkanı (PII Redaction)', completed: false },
        { name: 'Gelişmiş Yönetici Paneli & Analitik Dashboard Arayüzü', completed: false },
        { name: 'Eklenti Pazar Yeri Altyapısı & SDK', completed: false },
        { name: 'Kubernetes Helm Kurulum Desteği', completed: false }
      ]
    }
  ];

  const activeMilestone = ROADMAP_DATA.find(r => r.version === selectedMilestone) || ROADMAP_DATA[0];

  return (
    <div id="roadmap-and-matrix" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: COMPARISON MATRIX (6 cols) */}
      <div id="comparison-matrix" className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-900">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-semibold text-base text-slate-100">OpenRouter vs OpenFusion Karşılaştırması</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Neden OpenFusion? Açık kaynak (MIT) lisanslı bir orkestrasyon motorunun, ticari proxy sunucularına göre kurumsal avantajları:
          </p>

          <div className="flex flex-col gap-2.5">
            {COMPETITORS.map((comp, idx) => (
              <div
                key={idx}
                className="bg-[#141624]/60 border border-[#1d2134] p-3 rounded-lg flex flex-col gap-1.5 hover:bg-[#181a29]/60 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{comp.name}</span>
                  {comp.status && (
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900">
                      {comp.status}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mt-1 pt-1.5 border-t border-slate-900/40">
                  <div className="flex flex-col">
                    <span className="text-slate-500 font-sans">OpenRouter:</span>
                    <span className="text-red-400 font-bold">{comp.openRouter}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-800/60 pl-2">
                    <span className="text-slate-500 font-sans">OpenFusion:</span>
                    <span className="text-emerald-400 font-bold">{comp.openFusion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ROADMAP TIMELINE & CHEKCLIST (7 cols) */}
      <div id="roadmap-timeline" className="lg:col-span-7 flex flex-col gap-5">
        <div className="bg-[#0f111a] border border-[#1e2230] rounded-xl p-5 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-900">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-semibold text-base text-slate-100 font-sans">OpenFusion Lansman Yol Haritası</h3>
          </div>

          {/* Timeline Tab selector */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {ROADMAP_DATA.map(val => (
              <button
                key={val.version}
                onClick={() => setSelectedMilestone(val.version)}
                className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                  selectedMilestone === val.version
                    ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-inner'
                    : 'bg-[#141624] border-[#1e2233] text-slate-400 hover:bg-[#1a1d2d]'
                }`}
              >
                {val.version}
                <span className={`block text-[8px] font-sans font-medium mt-0.5 uppercase tracking-wider ${
                  val.status === 'completed'
                    ? 'text-emerald-500'
                    : val.status === 'active'
                    ? 'text-amber-400 animate-pulse'
                    : 'text-slate-500'
                }`}>
                  {val.status === 'completed' ? 'TAMAMLANDI' : val.status === 'active' ? 'YAYINDA' : 'Planda'}
                </span>
              </button>
            ))}
          </div>

          {/* Active Milestone Card details */}
          <div className="bg-[#121422] border border-[#1d2138] p-4 rounded-lg flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#21264c] pb-2">
              <span className="text-xs font-bold text-slate-100 leading-snug">
                {activeMilestone.title}
              </span>
            </div>
            
            <p className="text-xs text-slate-450 leading-relaxed italic">
              "{activeMilestone.desc}"
            </p>

            <div className="flex flex-col gap-2.5 mt-2 overflow-y-auto max-h-80 pr-1 escroll flex-1">
              {activeMilestone.features.map((feat, fidx) => (
                <div key={fidx} className="flex gap-3 items-start text-xs text-slate-300">
                  <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    feat.completed
                      ? 'bg-emerald-500 border-emerald-500 text-[#090a0f]'
                      : 'border-slate-700 bg-slate-900 text-transparent'
                  }`}>
                    ✓
                  </div>
                  <span className={feat.completed ? 'text-slate-300' : 'text-slate-500 italic font-sans'}>
                    {feat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
              Sistemi GitHub üzerinden forklayın
            </span>
            <span className="font-mono text-slate-400">MIT LICENSE</span>
          </div>

        </div>
      </div>

    </div>
  );
}
