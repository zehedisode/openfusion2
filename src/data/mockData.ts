/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProviderModel, PanelConfig, RequestMetric, SystemLog } from '../types';

export const DEFAULT_PROVIDERS = [
  { name: 'OpenAI gpt-4o', provider: 'openai', inputCostPerM: 2.50, outputCostPerM: 10.00, avgLatencyMs: 950 },
  { name: 'OpenAI o3-mini', provider: 'openai', inputCostPerM: 1.10, outputCostPerM: 4.40, avgLatencyMs: 1400 },
  { name: 'Anthropic claude-3.5-sonnet', provider: 'anthropic', inputCostPerM: 3.00, outputCostPerM: 15.00, avgLatencyMs: 1210 },
  { name: 'Anthropic claude-3-haiku', provider: 'anthropic', inputCostPerM: 0.25, outputCostPerM: 1.25, avgLatencyMs: 520 },
  { name: 'Google gemini-2.5-pro', provider: 'google', inputCostPerM: 1.25, outputCostPerM: 5.00, avgLatencyMs: 1100 },
  { name: 'Google gemini-2.5-flash', provider: 'google', inputCostPerM: 0.075, outputCostPerM: 0.30, avgLatencyMs: 410 },
  { name: 'DeepSeek deepseek-v3', provider: 'deepseek', inputCostPerM: 0.14, outputCostPerM: 0.28, avgLatencyMs: 850 },
  { name: 'DeepSeek deepseek-r1', provider: 'deepseek', inputCostPerM: 0.55, outputCostPerM: 2.19, avgLatencyMs: 2400 },
  { name: 'Ollama llama-3.1-70b', provider: 'ollama', inputCostPerM: 0.00, outputCostPerM: 0.00, avgLatencyMs: 450 },
];

export const DEFAULT_PANELS: PanelConfig[] = [
  {
    id: '1',
    name: 'coding-elite',
    strategy: 'debate',
    models: [
      { provider: 'anthropic', model: 'claude-3.5-sonnet', weight: 1.0 },
      { provider: 'openai', model: 'gpt-4o', weight: 0.8 },
      { provider: 'deepseek', model: 'deepseek-v3', weight: 0.9 }
    ],
    judge: 'claude-3.5-sonnet',
    costProfile: 'premium',
    rounds: 3,
    tools: ['code_executor'],
    isBuiltIn: true
  },
  {
    id: '2',
    name: 'budget-coding',
    strategy: 'fallback',
    models: [
      { provider: 'deepseek', model: 'deepseek-v3', weight: 1.0 },
      { provider: 'ollama', model: 'llama-3.1-70b', weight: 0.7 }
    ],
    judge: 'auto',
    costProfile: 'budget',
    isBuiltIn: true
  },
  {
    id: '3',
    name: 'research-deep',
    strategy: 'debate',
    models: [
      { provider: 'google', model: 'gemini-2.5-pro', weight: 1.0 },
      { provider: 'openai', model: 'gpt-4o', weight: 0.8 }
    ],
    judge: 'gemini-2.5-pro',
    costProfile: 'premium',
    rounds: 5,
    tools: ['web_search', 'browser'],
    isBuiltIn: true
  },
  {
    id: '4',
    name: 'latency-first',
    strategy: 'parallel',
    models: [
      { provider: 'google', model: 'gemini-2.5-flash', weight: 1.0 },
      { provider: 'anthropic', model: 'claude-3-haiku', weight: 0.9 }
    ],
    judge: 'auto',
    costProfile: 'budget',
    isBuiltIn: false
  }
];

export const DATABASE_SCHEMAS = [
  {
    table: 'providers',
    description: 'Entegre edilmis bulut veya lokal LLM saglayicilarinin API baglanti ve anahtar verileri.',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', notes: 'Benzersiz platform kayit ID\'si' },
      { name: 'name', type: 'TEXT UNIQUE', notes: '"openai", "anthropic", "ollama"' },
      { name: 'provider_type', type: 'TEXT', notes: 'cloud | self_hosted' },
      { name: 'api_key_encrypted', type: 'TEXT', notes: 'Fernet ile sifrelenmis API anahtari' },
      { name: 'base_url', type: 'TEXT', notes: 'Uzak servis veya local/Ollama IP baglantisi' },
      { name: 'is_active', type: 'BOOLEAN', notes: 'Sistem aktif aktif-degil flag\'i' },
      { name: 'created_at', type: 'TIMESTAMPTZ', notes: 'Varsayilan now()' }
    ]
  },
  {
    table: 'panels',
    description: 'Modeller, stratejiler, round ve yargic kurallarini tutan JSONB tabanli panel yapilandirmasi.',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', notes: 'Panel ID\'si' },
      { name: 'name', type: 'TEXT UNIQUE', notes: '"coding-elite", "research-deep"' },
      { name: 'config', type: 'JSONB', notes: 'Strateji, agirlik, model listesi ve araclar' },
      { name: 'is_builtin', type: 'BOOLEAN', notes: 'OpenFusion cekirdek paneli mi?' },
      { name: 'owner_id', type: 'UUID REFERENCES users(id)', notes: 'Paneli olusturan yonetici' },
      { name: 'created_at', type: 'TIMESTAMPTZ', notes: 'Varsayilan now()' }
    ]
  },
  {
    table: 'requests',
    description: 'Gelen API talepleri, uretilen maliyetler, tokenler, gecikme ve guven skorlarinin loglandigi denetim tablosu.',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', notes: 'Istek ID\'si, OpenAI /v1 uyumlu' },
      { name: 'user_id', type: 'UUID REFERENCES users(id)', notes: 'Istegi yapan API anahtarinin sahibi' },
      { name: 'panel_id', type: 'UUID REFERENCES panels(id)', notes: 'Kullanilan OpenFusion paneli' },
      { name: 'model_used', type: 'TEXT[]', notes: 'Tartismaya veya surece katilan modeller' },
      { name: 'total_cost_usd', type: 'NUMERIC(10,6)', notes: 'Maddesel para karsiligi (USD)' },
      { name: 'latency_ms', type: 'INTEGER', notes: 'Toplam islem suresi (ms)' },
      { name: 'tokens_in', type: 'INTEGER', notes: 'Girdi token hacmi' },
      { name: 'tokens_out', type: 'INTEGER', notes: 'Cikti token hacmi' },
      { name: 'confidence', type: 'REAL', notes: 'Yargicin kararla belirledigi guven derecesi (%)' },
      { name: 'status', type: 'TEXT', notes: 'completed | failed | processing' },
      { name: 'error', type: 'TEXT', notes: 'Hata olustu ise istisna detayi' },
      { name: 'created_at', type: 'TIMESTAMPTZ', notes: 'Istek zamani' }
    ]
  },
  {
    table: 'users',
    description: 'Platform yonetici ve gelistirici listesi, butce sinirlamalari ve roller (RBAC).',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', notes: 'Sistem kullanici ID\'si' },
      { name: 'email', type: 'TEXT UNIQUE', notes: 'Iletisim adresi' },
      { name: 'role', type: 'TEXT', notes: 'admin (tam yetki) | user (istek) | readonly' },
      { name: 'budget_cents', type: 'NUMERIC(10,2)', notes: 'Aylik limit siniri (Cent cinsinden)' },
      { name: 'is_active', type: 'BOOLEAN', notes: 'Hesap acik/kapali durumu' },
      { name: 'created_at', type: 'TIMESTAMPTZ', notes: 'Uyelik tarihi' }
    ]
  },
  {
    table: 'memories',
    description: 'Ajanlarin pgvector ile saklanan semantik uzun vadeli bellek loglari.',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', notes: 'Bellek kayit ID\'si' },
      { name: 'user_id', type: 'UUID REFERENCES users(id)', notes: 'Bagli olan gelistirici' },
      { name: 'session_id', type: 'TEXT', notes: 'Chat thread oturum havuzu ID\'si' },
      { name: 'embedding', type: 'vector(1536)', notes: 'pgvector embedding verisi (index ivfflat)' },
      { name: 'content', type: 'TEXT', notes: 'Uzun donemli bellek metni' },
      { name: 'metadata', type: 'JSONB', notes: 'Detayli etiketler, oturum analitigi' },
      { name: 'created_at', type: 'TIMESTAMPTZ', notes: 'Kaydedilme tarihi' }
    ]
  }
];

export const MOCK_REQUESTS: RequestMetric[] = [
  {
    id: 'req-001',
    timestamp: '09:02:14',
    prompt: 'split_at_mut for concurrent safe Rust code...',
    category: 'coding',
    panelUsed: 'coding-elite',
    modelsUsed: ['claude-3.5-sonnet', 'gpt-4o', 'deepseek-v3'],
    totalCostUsd: 0.012450,
    latencyMs: 1840,
    tokensIn: 850,
    tokensOut: 1200,
    confidenceScore: 96,
    agreementScore: 91,
    roundsUsed: 3,
    status: 'completed',
    response: ''
  },
  {
    id: 'req-002',
    timestamp: '09:03:01',
    prompt: 'subsidy trends for hydrogen 2026 worldwide...',
    category: 'research',
    panelUsed: 'research-deep',
    modelsUsed: ['gemini-2.5-pro', 'gpt-4o'],
    totalCostUsd: 0.003901,
    latencyMs: 2310,
    tokensIn: 1240,
    tokensOut: 650,
    confidenceScore: 89,
    agreementScore: 78,
    roundsUsed: 2,
    status: 'completed',
    response: ''
  },
  {
    id: 'req-003',
    timestamp: '09:03:55',
    prompt: 'optimizing database indices for high read latency...',
    category: 'analysis',
    panelUsed: 'coding-elite',
    modelsUsed: ['claude-3.5-sonnet', 'deepseek-v3'],
    totalCostUsd: 0.005120,
    latencyMs: 1420,
    tokensIn: 680,
    tokensOut: 900,
    confidenceScore: 94,
    agreementScore: 87,
    roundsUsed: 2,
    status: 'completed',
    response: ''
  },
  {
    id: 'req-004',
    timestamp: '09:04:12',
    prompt: 'viral hooks for AI-based agriculture assistant launch...',
    category: 'creative',
    panelUsed: 'latency-first',
    modelsUsed: ['gemini-2.5-flash'],
    totalCostUsd: 0.000150,
    latencyMs: 410,
    tokensIn: 320,
    tokensOut: 450,
    confidenceScore: 82,
    agreementScore: 100,
    roundsUsed: 1,
    status: 'completed',
    response: ''
  },
  {
    id: 'req-005',
    timestamp: '09:05:00',
    prompt: 'recursive deep tree parsing in Golang concurrency...',
    category: 'coding',
    panelUsed: 'budget-coding',
    modelsUsed: ['deepseek-v3', 'llama-3.1-70b'],
    totalCostUsd: 0.000540,
    latencyMs: 1120,
    tokensIn: 1100,
    tokensOut: 850,
    confidenceScore: 88,
    agreementScore: 84,
    roundsUsed: 1,
    status: 'completed',
    response: ''
  },
  {
    id: 'req-006',
    timestamp: '09:05:32',
    prompt: 'predicting financial crash models using deep learning math ...',
    category: 'reasoning',
    panelUsed: 'research-deep',
    modelsUsed: ['gemini-2.5-pro', 'gpt-4o'],
    totalCostUsd: 0.008450,
    latencyMs: 4520,
    tokensIn: 1950,
    tokensOut: 1100,
    confidenceScore: 90,
    agreementScore: 82,
    roundsUsed: 3,
    status: 'completed',
    response: ''
  }
];

export const MOCK_SYSTEM_LOGS: SystemLog[] = [
  { id: 'log-1', timestamp: '09:05:43', level: 'info', module: 'router', message: 'Incoming REST request /v1/chat/completions (User ID: usr_901)', latency: 5 },
  { id: 'log-2', timestamp: '09:05:43', level: 'success', module: 'security', message: 'Authentication OK: API-Key verified (sha256: 8a7f...e31b)', latency: 12 },
  { id: 'log-3', timestamp: '09:05:44', level: 'info', module: 'router', message: 'Routing Engine classified prompt. Category: coding (Complexity: 9/10)', latency: 45 },
  { id: 'log-4', timestamp: '09:05:44', level: 'info', module: 'cache', message: 'Redis cache miss. Routing query to active debate logic', latency: 2 },
  { id: 'log-5', timestamp: '09:05:44', level: 'info', module: 'debate', message: 'Debate Engine launched. Round 1 of 3: Initiated 3 concurrent providers...', latency: 5 },
  { id: 'log-6', timestamp: '09:05:45', level: 'success', module: 'provider', message: 'anthropic/claude-3.5-sonnet responded in 1210ms (Tokens: I:850, O:1200)', latency: 1210 },
  { id: 'log-7', timestamp: '09:05:45', level: 'success', module: 'provider', message: 'openai/gpt-4o responded in 950ms (Tokens: I:850, O:1100)', latency: 950 },
  { id: 'log-8', timestamp: '09:05:45', level: 'success', module: 'provider', message: 'deepseek/deepseek-v3 responded in 850ms (Tokens: I:850, O:1250)', latency: 850 },
  { id: 'log-9', timestamp: '09:05:45', level: 'info', module: 'debate', message: 'Round 1 ended. Broadcating critiques to Redis Streams (Round 2 started)', latency: 8 },
  { id: 'log-10', timestamp: '09:05:46', level: 'info', module: 'debate', message: 'Critiques gathered. Model agreement score is 91%', latency: 120 },
  { id: 'log-11', timestamp: '09:05:46', level: 'success', module: 'database', message: 'Audited log successfully written to requests table. Latency: 1.84s', latency: 14 }
];

export const COMPETITORS = [
  { name: 'Açık Kaynak', openRouter: 'Hayır (Proprietary)', openFusion: 'Evet (MIT Lisanslı)' },
  { name: 'Çoklu Sağlayıcı Altyapısı', openRouter: 'Sadece Kendi Bulut Sunucuları', openFusion: 'Hem Bulut hem de Local Modeller (Ollama)' },
  { name: 'Debate Engine (Tartışma)', openRouter: 'Yok', openFusion: 'Mevcut (Multi-round model konsensüsü)' },
  { name: 'Judge Katmanı (Değerlendirme)', openRouter: 'Yok', openFusion: 'Mevcut (LLM Judge & Ensemble oylama)' },
  { name: 'Performans Optimizasyonu', openRouter: 'Yok', openFusion: 'Mevcut (RL-tabanlı fiyat/kalite optimizasyonu)' },
  { name: 'MCP (Model Context Protocol)', openRouter: 'Yok', openFusion: 'Mevcut (FastMCP Yerleşik Server)' },
  { name: 'Yerel Kurulum / Güvenlik', openRouter: 'Hayır (SaaS sadece)', openFusion: 'Evet (Docker Compose & K8s ile yerel)' },
  { name: 'Bellek & RAG Altyapısı', openRouter: 'Yok', openFusion: 'Evet (Redis short-term, pgvector long-term)', status: 'v0.3' },
  { name: 'Hassas Veri Maskeleme (DLP)', openRouter: 'Yok', openFusion: 'Evet (Regex + PII karartma)', status: 'v0.4' },
];

export interface ScenarioStep {
  id: string;
  type: 'classification' | 'round1' | 'round2' | 'round3' | 'fallback' | 'web' | 'compilation' | 'final';
  title: string;
  duration: number;
  data: any;
}

export const SIMULATION_SCENARIOS = [
  {
    id: 'sc-1',
    name: 'Thread-Safe Rust Quicksort Optimizer (Debate 3 Rounds)',
    prompt: 'Değerine göre elemanları sıralayan thread-safe, bellek optimizasyonlu bir Rust Quicksort fonksiyonu yaz ve benchmark yap.',
    panel: 'coding-elite',
    category: 'coding',
    strategy: 'debate',
    complexity: 9,
    steps: [
      {
        id: 'st-1-1',
        type: 'classification',
        title: 'Prompt Sınıflandırılıyor',
        duration: 800,
        data: {
          category: 'coding',
          complexity: 9,
          requiresTools: true,
          bestPanel: 'coding-elite',
          explanation: 'Gelişmiş eşzamanlı sistem programlama sorusu tespit edildi. Eşzamanlılık doğrulaması ve Rayon desteği için "coding-elite" paneli, "debate" (tartışma) stratejisiyle tetikleniyor.'
        }
      },
      {
        id: 'st-1-2',
        type: 'round1',
        title: 'Round 1: Eşzamanlı Modellerin Taslak Cevapları',
        duration: 1500,
        data: {
          round: 1,
          responses: [
            {
              model: 'Claude 3.5 Sonnet',
              provider: 'anthropic',
              code: `// Claude 3.5 Sonnet: Guarded with Mutex
pub fn quicksort_concurrent<T: Ord + Send + Sync + 'static>(arr: &mut [T]) {
    let len = arr.len();
    if len <= 1 { return; }
    // standard pivot Mutex control
    let pivot_idx = partition(arr);
    // Thread pool parallel recursion
    let (left, right) = arr.split_at_mut(pivot_idx);
    rayon::join(
        || quicksort_concurrent(left),
        || quicksort_concurrent(&mut right[1..])
    );
}`,
              notes: 'Excellent layout. Mutex reference used, but partition is local.'
            },
            {
              model: 'GPT-4o',
              provider: 'openai',
              code: `// GPT-4o: Thread-pool local quicksort
pub fn rayon_quicksort<T: Send + Ord>(slice: &mut [T]) {
    if slice.len() <= 1 { return; }
    let pivot = partition(slice);
    let (left, right) = slice.split_at_mut(pivot);
    rayon::join(
        || rayon_quicksort(left),
        || rayon_quicksort(&mut right[1..])
    );
}`,
              notes: 'Clean Rayon join recursion. Minimal overhead.'
            },
            {
              model: 'DeepSeek V3',
              provider: 'deepseek',
              code: `// DeepSeek V3: Pure Parallel with split_at_mut & pivot choice
pub fn parallel_quicksort<T: Send + Ord>(v: &mut [T]) {
    if v.len() < 512 { // Sequential fallback threshold
        v.sort();
        return;
    }
    let pivot_idx = median_of_three_pivot(v);
    let mid = partition(v, pivot_idx);
    let (left, right) = v.split_at_mut(mid);
    rayon::join(
        || parallel_quicksort(left),
        || parallel_quicksort(right)
    );
}`,
              notes: 'Median of three pivot reduces worst-case recursive stack depth. Threshold fallback is high performance.'
            }
          ]
        }
      },
      {
        id: 'st-1-3',
        type: 'round2',
        title: 'Round 2: Çapraz Eleştiriler (Cross Critique)',
        duration: 1200,
        data: {
          round: 2,
          critiques: [
            {
              author: 'Claude 3.5 Sonnet',
              target: 'GPT-4o',
              feedback: 'GPT nin rayon split_at_mut uygulaması oldukça temiz ancak veri boyutu çok küçük olduğunda dahi her adımda yeni thread görevi oluşturuyor. Bu durum küçük dizilerde thread oluşturma maliyetini aşacaktır. DeepSeek in yaptığı gibi 512 elemanlık eşik sıralı sıralama (sequential fallback) koymak hayati önemdedir.',
              rating: 7
            },
            {
              author: 'DeepSeek V3',
              target: 'Claude 3.5 Sonnet',
              feedback: 'Claude un thread güvenliği sağlamak için Mutex kullanma fikri diziler üzerinde gereksiz kilit çekişmesine (lock contention) neden olur. split_at_mut zaten mut referansları derleme zamanında ayırır, Rust un mülkiyet (ownership) kuralları ek kilit gerektirmeden parallel erişimi %100 güvenli kılar. Mutex i kaldırmalıyız.',
              rating: 5
            },
            {
              author: 'GPT-4o',
              target: 'DeepSeek V3',
              feedback: 'DeepSeek in median_of_three pivots seçimi ve 512 eşik değeri mükemmel bir optimizasyon. Ancak split_at_mut sonrasında sag tarapta pivot elemanını atlamayı unutmuş, bu durum sonsuz döngü riski (infinite recursion) oluşturabilir. let (left, right) = v.split_at_mut(mid); yerine pivotu hariç tutacak şekilde dilimlemeliyiz.',
              rating: 8
            }
          ]
        }
      },
      {
        id: 'st-1-4',
        type: 'compilation',
        title: 'Konsensüs Birleştirme & Yargıç Denetimi',
        duration: 1000,
        data: {
          judge: 'claude-3.5-sonnet',
          summary: 'Modeller çok verimli geribildirimler sağladı. Yargıç (Claude), DeepSeek in performans odaklı Rayon median-of-three ve fallback threshold yapısını aldı, GPT-4o nun belirttiği pivot atlama bugını düzeltti ve Claude un thread-safety açıklamalarını ekleyerek nihai kodu derledi.',
          confidenceScore: 96,
          agreementScore: 91,
          latencyMs: 1840,
          costSavedUsd: 0.0042 // saved vs calling individual models sequentially
        }
      },
      {
        id: 'st-1-5',
        type: 'final',
        title: 'Nihai Sonuç Üretildi',
        duration: 500,
        data: {
          code: `// ==========================================
// OPENFUSION GENERATED & AUDITED RUST CODE
// Panel: coding-elite | Consensus Confidence: 96%
// ==========================================

/// Thread-safe, parallel quicksort implementation with median-of-three pivot selection
/// and optimized sequential threshold fallback of 512 elements.
pub fn quicksort_parallel<T: Send + Ord>(v: &mut [T]) {
    // 1. Sequential fallback threshold to avoid rayon task scheduling overhead
    if v.len() < 512 {
        v.sort(); 
        return;
    }

    // 2. Pivot Selection (Median of Three prevents O(N^2) on sorted data)
    let pivot_idx = select_median_pivot(v);
    
    // 3. Partitioning
    let mid = partition(v, pivot_idx);
    
    // 4. Concurrency via safe mutable slice splitting
    // Rust borrow checker guarantees zero-conflict memory safety at compile time.
    let (left, right) = v.split_at_mut(mid);
    
    // Joint execution (Rayon thread pool steals tasks on demand)
    rayon::join(
        || quicksort_parallel(left),
        || quicksort_parallel(&mut right[1..]), // Pivot at mid is skipped
    );
}

fn select_median_pivot<T: Ord>(v: &[T]) -> usize {
    let low = 0;
    let mid = v.len() / 2;
    let high = v.len() - 1;
    // median calculation logic...
    mid
}

fn partition<T: Ord>(v: &mut [T], pivot_idx: usize) -> usize {
    v.swap(pivot_idx, v.len() - 1);
    let mut i = 0;
    for j in 0..v.len() - 1 {
        if v[j] <= v[v.len() - 1] {
            v.swap(i, j);
            i += 1;
        }
    }
    v.swap(i, v.len() - 1);
    i
}`,
          rawMetrics: {
            latency: '1.84 s',
            cost: '$0.0124',
            tokensIn: 850,
            tokensOut: 1200
          }
        }
      }
    ]
  },
  {
    id: 'sc-2',
    name: 'Hydrogen subsidies 2026 (Fallback & Web Search Recovery)',
    prompt: '2026 yılı için yeşil hidrojen üretim maliyetleri ve küresel teşvikler hakkında güncel bir sektör analizi yap.',
    panel: 'research-deep',
    category: 'research',
    strategy: 'fallback',
    complexity: 7,
    steps: [
      {
        id: 'st-2-1',
        type: 'classification',
        title: 'Ön Sınıflandırma',
        duration: 500,
        data: {
          category: 'research',
          complexity: 7,
          requiresTools: true,
          bestPanel: 'research-deep',
          explanation: 'Prompt güncel (2026 verisi) finansal ve endüstriyel veri içeriyor. Web search aracı ve güncel bilgi kurtarma modu etkinleştirildi.'
        }
      },
      {
        id: 'st-2-2',
        type: 'fallback',
        title: 'X Sağlayıcı Hatası ve Otomatik Fallback',
        duration: 1100,
        data: {
          attempt: 1,
          primaryModel: 'claude-3.5-sonnet',
          error: 'HTTP 503 Service Unavailable / Rate Limit Exceeded',
          action: 'OpenFusion failover katmanı 150ms de devreye girdi. Otomatik geri çekilme (fallback) zincirindeki bir sonraki model "google/gemini-2.5-pro" modeline aktarıldı!'
        }
      },
      {
        id: 'st-2-3',
        type: 'web',
        title: 'Google Gemini-2.5-Pro: Web Araması Gerçekleştiriyor',
        duration: 1600,
        data: {
          tool: 'web_search',
          query: 'green hydrogen production cost subsidies 2026',
          results: [
            { title: 'Hydrogen Council Subsidies Tracker 2026', snippet: 'US IRA IRA 45V clean energy production credit offers up to $3/kg for green hydrogen satisfying strict 3-tier hourly matching matching requirements starting 2026.' },
            { title: 'EU Hydrogen Bank Auction Report 2026', snippet: 'The European Hydrogen Bank completed its 2026 auction awarding maximum premium subsidy of €4.5/kg. Projected levelized cost falls to €5.2/kg in southern solar zones.' }
          ]
        }
      },
      {
        id: 'st-2-4',
        type: 'final',
        title: 'Nihai Analiz Çıktısı',
        duration: 600,
        data: {
          code: `# Global Yeşil Hidrojen Sektör Analitik Raporu (2026)
*OpenFusion Otomatik Fallback Zinciri ve Google Gemini Web Grounding Entegrasyonu ile üretilmiştir.*

### 1. Bölgesel Üretim Maliyetleri (Levelized Cost of Hydrogen - LCOH)
2026 yılı itibariyle, yeşil hidrojen üretim maliyeti temiz enerjinin (güneş ve rüzgâr) yaygınlığına göre büyük farklılıklar göstermektedir:
- **AB Güney Kuşağı (Güneş Enerjisi Odaklı):** €4.80 - €5.50 / kg
- **Amerika Birleşik Devletleri (Ortabatı Rüzgârı):** $3.20 - $4.10 / kg (Teşvikler öncesi)
- **Kuzey Afrika ve Orta Doğu (İhracat Devleri):** $2.10 - $2.80 / kg

### 2. Küresel Finansal Teşvikler ve Sübvansiyonlar (2026 Güncellemesi)
- **ABD Enflasyonu Düşürme Yasası (IRA Section 45V Tiering):** Karbon salınım katsayısına göre kg başına **$3.00** a kadar net vergi indirimi. Ancak 2026 dan itibaren geçerli olan saatlik elektrik eşleme (hourly matching) kuralları elektrolizör çalışma verimliliğini kısıtlamaktadır.
- **Avrupa Hidrojen Bankası (EHB v2.0):** Sabit prim desteği olarak kilo başına **€4.50** a kadar ek nakit desteği sunulmaktadır.`,
          rawMetrics: {
            latency: '2.31 s',
            cost: '$0.0039',
            tokensIn: 1240,
            tokensOut: 650
          }
        }
      }
    ]
  },
  {
    id: 'sc-3',
    name: 'Creative Launch Campaign (Parallel Streaming Output)',
    prompt: 'AI tabanlı tarım asistanı ürünümüz için viral kanca (hook) fikirleri ve 3 aşamalı sosyal medya lansman planı hazırla.',
    panel: 'latency-first',
    category: 'creative',
    strategy: 'parallel',
    complexity: 5,
    steps: [
      {
        id: 'st-3-1',
        type: 'classification',
        title: 'Ön Sınıflandırma',
        duration: 400,
        data: {
          category: 'creative',
          complexity: 5,
          requiresTools: false,
          bestPanel: 'latency-first',
          explanation: 'Düşük karmaşıklıkta yaratıcı yazım sorusu tespit edildi. "latency-first" paneli ve parallel stratejisi seçildi.'
        }
      },
      {
        id: 'st-3-2',
        type: 'round1',
        title: 'Parallel Yarış Başladı',
        duration: 500,
        data: {
          models: [
            { name: 'Gemini-2.5-Flash', status: 'Cevap üretiyor...' },
            { name: 'Claude-3-Haiku', status: 'Cevap üretiyor...' }
          ],
          explanation: 'Tüm modeller eşzamanlı olarak tetiklendi. OpenFusion, ilk biten modelin cevabını akış şeklinde yayınlayacak (First-Past-Post).'
        }
      },
      {
        id: 'st-3-3',
        type: 'final',
        title: 'Kazan Model: Gemini-2.5-Flash (410ms!)',
        duration: 300,
        data: {
          code: `## 🌱 AI Sun-Grow Tarım Asistanı Viral Kancaları:
1. *"Toprağınız sizinle konuşsa ilk ne söylerdi? Sun-Grow test eden çiftçilerimiz cevabı aldı ve gübre maliyetlerini %40 düşürdü!"*
2. *"Dedelerimiz gökyüzüne bakıp hava tahmini yapardı. Biz yapay zekaya sorduk, tek bir gecede tüm don zararından kurtulduk."*

## 🚀 3 Aşamalı Lansman Planı:
- **Aşama 1 (Teaser):** Gerçek çiftçilerin "Bu toprak bir şey anlatmaya çalışıyor" isimli kısa, merak uyandırıcı videolarının Tiktok/Instagram Reels üzerinde paylaşılması.
- **Aşama 2 (Launch):** Ücretsiz toprak analiz modülü sunarak viral katılım sağlanması.
- **Aşama 3 (Entegrasyon):** Başarı hikayelerini ve maliyet tasarrufu grafiklerini (Dashboard) paylaşarak referans programının duyurulması.`,
          rawMetrics: {
            latency: '410 ms',
            cost: '$0.00015',
            tokensIn: 320,
            tokensOut: 450
          }
        }
      }
    ]
  }
];
