import { createDecision, listDecisions } from '../../../lib/decisions.mjs';
import { body, context, errorResponse, requireSameOrigin } from '../helpers';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { db, userId } = await context();
    return Response.json({ decisions: await listDecisions(db, userId), signedIn: Boolean(userId) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { db, userId } = await context();
    return Response.json({ decision: await createDecision(db, userId, await body(request)) }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
