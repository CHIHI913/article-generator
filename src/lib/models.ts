import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const models: ModelConfig[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 2048,
    temperature: 0.8,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 2048,
    temperature: 0.8,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    model: 'gemini-1.5-pro-latest',
    maxTokens: 2048,
    temperature: 0.8,
  },
];

export function getModelInstance(config: ModelConfig) {
  switch (config.provider) {
    case 'openai':
      return openai(config.model);
    case 'anthropic':
      return anthropic(config.model);
    case 'google':
      return google(config.model);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}