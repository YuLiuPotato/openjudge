import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../chatgpt-auth';
import { DecisionError } from '../../lib/decisions.mjs';

export async function context() {
  if (!env.DB) throw new Error('Database binding is unavailable');
  const user = await getChatGPTUser();
  return { db: env.DB, userId: user?.userId ?? null };
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new DecisionError('请求来源不被允许', 403);
}

export async function body(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new DecisionError('请求格式不正确', 400);
  try { return await request.json(); } catch { throw new DecisionError('请求格式不正确', 400); }
}

export function errorResponse(error: unknown) {
  if (error instanceof DecisionError) return Response.json({ error: error.message }, { status: error.status });
  console.error('OpenJudge API error:', error);
  return Response.json({ error: '暂时无法处理请求，请稍后再试。' }, { status: 500 });
}
