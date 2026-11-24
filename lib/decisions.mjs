const categories = new Set(['产品方向', '增长获客', '团队与组织', '融资与资本', '战略与方向', '其他']);
const choices = new Set(['a', 'b', 'unsure']);

export class DecisionError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

function field(value, label, min, max) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < min || text.length > max) throw new DecisionError(`${label}需要 ${min}–${max} 个字`);
  return text;
}

function requireUser(userId) {
  if (!userId) throw new DecisionError('请先登录后再参与', 401);
}

function publicDecision(row) {
  return {
    id: row.id, title: row.title, context: row.context,
    optionA: row.option_a, optionB: row.option_b, optionADescription: row.option_a_description ?? '', optionBDescription: row.option_b_description ?? '', category: row.category,
    goal: row.goal, risk: row.risk, createdAt: row.created_at,
    reviewCount: Number(row.review_count ?? 0),
    isOwner: Boolean(row.is_owner), hasReviewed: Boolean(row.has_reviewed),
  };
}

const selectBase = `SELECT d.*, (SELECT COUNT(*) FROM reviews r WHERE r.decision_id = d.id) AS review_count,
  CASE WHEN d.author_id = ? THEN 1 ELSE 0 END AS is_owner,
  EXISTS(SELECT 1 FROM reviews r WHERE r.decision_id = d.id AND r.author_id = ?) AS has_reviewed
  FROM decisions d`;

export async function createDecision(db, userId, input) {
  requireUser(userId);
  if (!input || input.privacyConfirmed !== true) throw new DecisionError('请确认已了解内容将公开');
  const title = field(input.title, '决策问题', 5, 100);
  const context = field(input.context, '背景', 10, 1200);
  const optionA = field(input.optionA, '选项 A', 2, 100);
  const optionB = field(input.optionB, '选项 B', 2, 100);
  if (optionA.toLocaleLowerCase() === optionB.toLocaleLowerCase()) throw new DecisionError('两个选项需要不同');
  const optionADescription = input.optionADescription == null ? '' : field(input.optionADescription, '选项 A 介绍', 0, 500);
  const optionBDescription = input.optionBDescription == null ? '' : field(input.optionBDescription, '选项 B 介绍', 0, 500);
  const category = categories.has(input.category) ? input.category : '其他';
  const goal = typeof input.goal === 'string' ? input.goal.trim().slice(0, 300) : '';
  const risk = typeof input.risk === 'string' ? input.risk.trim().slice(0, 300) : '';
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO decisions (id, author_id, title, context, option_a, option_b, option_a_description, option_b_description, category, goal, risk, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, userId, title, context, optionA, optionB, optionADescription, optionBDescription, category, goal, risk, Date.now()).run();
  return getDecision(db, id, userId);
}

export async function listDecisions(db, userId) {
  const result = await db.prepare(`${selectBase} ORDER BY d.created_at DESC, d.id DESC LIMIT 100`).bind(userId ?? '', userId ?? '').all();
  return result.results.map(publicDecision);
}

export async function getDecision(db, id, userId) {
  const row = await db.prepare(`${selectBase} WHERE d.id = ?`).bind(userId ?? '', userId ?? '', id).first();
  if (!row) return null;
  const decision = publicDecision(row);
  decision.canSeeResults = decision.isOwner || decision.hasReviewed;
  if (decision.canSeeResults) {
    const result = await db.prepare('SELECT id, author_id, choice, reason, created_at FROM reviews WHERE decision_id = ? ORDER BY created_at DESC').bind(id).all();
    decision.reviews = result.results.map((review) => ({ id: review.id, choice: review.choice, reason: review.reason, createdAt: review.created_at, isMine: review.author_id === userId }));
    decision.counts = { a: 0, b: 0, unsure: 0 };
    for (const review of decision.reviews) if (choices.has(review.choice)) decision.counts[review.choice]++;
    if (decision.hasReviewed) {
      const own = await db.prepare('SELECT choice FROM reviews WHERE decision_id = ? AND author_id = ?').bind(id, userId).first();
      decision.myChoice = own?.choice ?? null;
    }
  }
  return decision;
}

export async function submitReview(db, id, userId, input) {
  requireUser(userId);
  const decision = await getDecision(db, id, userId);
  if (!decision) throw new DecisionError('这条决策不存在或已删除', 404);
  if (decision.isOwner) throw new DecisionError('不能审批自己发布的决策', 403);
  if (decision.hasReviewed) throw new DecisionError('你已经审批过这条决策', 409);
  if (!input || !choices.has(input.choice)) throw new DecisionError('请选择你的判断');
  const reason = field(input.reason, '评审理由', 8, 500);
  try {
    await db.prepare('INSERT INTO reviews (id, decision_id, author_id, choice, angle, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), id, userId, input.choice, '', reason, Date.now()).run();
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed')) throw new DecisionError('你已经审批过这条决策', 409);
    throw error;
  }
  return getDecision(db, id, userId);
}

export async function deleteDecision(db, id, userId) {
  requireUser(userId);
  const result = await db.prepare('DELETE FROM decisions WHERE id = ? AND author_id = ?').bind(id, userId).run();
  if (!result.meta.changes) throw new DecisionError('只能删除自己发布的决策', 403);
  return true;
}
