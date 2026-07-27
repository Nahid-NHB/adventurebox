/**
 * AI service abstraction. The app never depends on a concrete provider; it asks
 * this factory for an AIProvider. Default is the offline stub. OpenRouter is the
 * real implementation, called through a server proxy so the key is never bundled.
 */
import type { ActivityDraft, GenContext } from '@/types/domain';
import type { Result } from '@/lib/result';
import { config } from '../config';
import { StubAIProvider } from './stub';
import { OpenRouterProvider } from './openrouter';

export interface AIProvider {
  generateActivities(ctx: GenContext, count: number): Promise<Result<ActivityDraft[]>>;
}

let instance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!instance) {
    instance = config.useRealAI ? new OpenRouterProvider() : new StubAIProvider();
  }
  return instance;
}

export function __setAIProviderForTests(p: AIProvider | null): void {
  instance = p;
}
