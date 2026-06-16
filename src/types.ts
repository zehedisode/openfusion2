/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProviderModel {
  name: string;
  provider: string; // "openai" | "anthropic" | "google" | "deepseek" | "ollama"
  inputCostPerM: number; // in USD
  outputCostPerM: number; // in USD
  avgLatencyMs: number;
}

export type RoutingStrategy = 'debate' | 'parallel' | 'fallback' | 'first-past-post';

export interface PanelConfig {
  id: string;
  name: string;
  strategy: RoutingStrategy;
  models: {
    provider: string;
    model: string;
    weight: number;
  }[];
  judge: string; // 'auto' | 'claude-opus-4' | 'gpt-5' | 'deepseek-v3'
  costProfile: 'premium' | 'budget' | 'balanced';
  rounds?: number;
  tools?: string[];
  isBuiltIn: boolean;
}

export interface ClassificationResult {
  category: 'coding' | 'reasoning' | 'research' | 'creative' | 'analysis';
  complexity: number; // 1-10
  requiresTools: boolean;
  requiresWeb: boolean;
}

export interface RequestMetric {
  id: string;
  timestamp: string;
  prompt: string;
  category: string;
  panelUsed: string;
  modelsUsed: string[];
  totalCostUsd: number;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  confidenceScore: number; // 0-100
  agreementScore: number; // 0-100
  roundsUsed: number;
  status: 'completed' | 'failed' | 'processing';
  errorDetail?: string;
  response: string;
}

export interface DebateMessage {
  round: number;
  model: string;
  provider: string;
  role: 'assistant' | 'critic';
  content: string;
  critiqueOf?: string; // which model's output is being critiqued
  ratingOfPrevious?: number; // 1-10 scale rating
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: 'router' | 'debate' | 'cache' | 'security' | 'database' | 'provider';
  message: string;
  latency?: number;
}
