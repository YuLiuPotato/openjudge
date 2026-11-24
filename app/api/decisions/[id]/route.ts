import { deleteDecision, getDecision } from '../../../../lib/decisions.mjs';
import { context, errorResponse, requireSameOrigin } from '../../helpers';

type RouteContext = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, route: RouteContext) {
  try {
    const { db, userId } = await context();
    const decision = await getDecision(db, (await route.params).id, userId);
    return decision ? Response.json({ decision }, { headers: { 'Cache-Control': 'no-store' } }) : Response.json({ error: '这条决策不存在或已删除' }, { status: 404 });
  } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request, route: RouteContext) {
  try {
    requireSameOrigin(request);
    const { db, userId } = await context();
    await deleteDecision(db, (await route.params).id, userId);
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
