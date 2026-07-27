/**
 * OpenRouter provider (real). Uses the OpenAI-compatible chat completions API.
 *
 * SECURITY: the raw OpenRouter key is NEVER bundled in the app. In production
 * this talks to a thin server proxy (Supabase Edge Function) that injects the
 * key and forwards to https://openrouter.ai/api/v1. Set EXPO_PUBLIC_AI_PROXY_URL
 * to that proxy. If no proxy is configured we fail closed (the curated library
 * already covers the user, so there is no functional gap).
 */
import type { AIProvider } from './index';
import { ActivityDraftSchema, type ActivityDraft, type GenContext } from '@/types/domain';
import { ok, err, type Result } from '@/lib/result';
import { config } from '../config';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompt';

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export class OpenRouterProvider implements AIProvider {
  async generateActivities(
    ctx: GenContext,
    count: number,
  ): Promise<Result<ActivityDraft[]>> {
    if (!config.ai.proxyUrl) {
      return err('unauthorized', 'AI proxy URL is not configured.');
    }

    let res: Response;
    try {
      res = await fetch(config.ai.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.ai.model,
          temperature: 0.6,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(ctx, count) },
          ],
        }),
      });
    } catch (e) {
      return err('network', 'Failed to reach the AI proxy.', e);
    }

    if (!res.ok) {
      if (res.status === 429) return err('rate_limited', 'AI rate limited.');
      return err('network', `AI proxy returned ${res.status}.`);
    }

    let content: string | undefined;
    try {
      const json = (await res.json()) as ChatResponse;
      content = json.choices?.[0]?.message?.content;
    } catch (e) {
      return err('unknown', 'Malformed AI response.', e);
    }
    if (!content) return err('unknown', 'Empty AI response.');

    return parseDrafts(content);
  }
}

/** Parse + validate the model's JSON into safe ActivityDrafts (exported for tests). */
export function parseDrafts(content: string): Result<ActivityDraft[]> {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch (e) {
    return err('validation', 'AI did not return valid JSON.', e);
  }

  // Accept either a bare array or an object wrapping an array.
  const candidates = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { activities?: unknown }).activities)
      ? (raw as { activities: unknown[] }).activities
      : [raw];

  const valid: ActivityDraft[] = [];
  for (const c of candidates) {
    const parsed = ActivityDraftSchema.safeParse(c);
    if (parsed.success) valid.push(parsed.data);
  }
  if (valid.length === 0) return err('validation', 'No valid activities in AI output.');
  return ok(valid);
}
