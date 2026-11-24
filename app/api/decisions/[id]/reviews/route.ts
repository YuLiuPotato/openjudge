import { submitReview } from '../../../../../lib/decisions.mjs';
import { body, context, errorResponse, requireSameOrigin } from '../../../helpers';

type RouteContext = { params: Promise<{ id: string }> };
export async function POST(request: Request, route: RouteContext) {
  try {
    requireSameOrigin(request);
    const { db, userId } = await context();
    const decision = await submitReview(db, (await route.params).id, userId, await body(request));
    return Response.json({ decision }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
