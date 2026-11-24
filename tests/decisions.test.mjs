import test from 'node:test';
import assert from 'node:assert/strict';
import { makeDb } from './db.mjs';
import { createDecision, listDecisions, getDecision, submitReview, deleteDecision } from '../lib/decisions.mjs';

const draft = {
  title: '我们应该先服务大客户还是独立开发者？',
  context: '两个方向都有用户需求，但团队目前只能专注一个方向。',
  optionA: '先服务大客户', optionB: '先服务独立开发者', category: '产品方向',
  goal: '找到可重复增长的需求', risk: '过早消耗团队资源', privacyConfirmed: true,
};

test('retired contact preferences cannot be enabled by an old client', async () => {
  const db = makeDb();
  const decision = await createDecision(db, 'founder', draft);
  const result = await submitReview(db, decision.id, 'reviewer', {
    choice: 'a', angle: '执行', reason: '先验证真实客户的需求，再决定下一步。', allowContact: true,
  });
  assert.equal((await db.prepare('SELECT allow_contact FROM reviews WHERE decision_id = ?').bind(decision.id).first()).allow_contact, 0);
  assert.equal(Object.hasOwn(result.reviews[0], 'allowContact'), false);
});

test('publishing requires meaningful choices and an explicit privacy confirmation', async () => {
  const db = makeDb();
  await assert.rejects(() => createDecision(db, 'founder', { ...draft, privacyConfirmed: false }), /公开/);
  await assert.rejects(() => createDecision(db, 'founder', { ...draft, optionB: draft.optionA }), /不同/);
  const decision = await createDecision(db, 'founder', draft);
  assert.equal(decision.title, draft.title);
  assert.equal((await listDecisions(db, 'founder')).length, 1);
});

test('reviews remain hidden until the visitor votes, while the author can read them', async () => {
  const db = makeDb();
  const decision = await createDecision(db, 'founder', draft);
  await submitReview(db, decision.id, 'reviewer-1', { choice: 'a', angle: '执行', reason: '可以先访谈几个客户，再做小范围试点。' });
  const blind = await getDecision(db, decision.id, 'reviewer-2');
  assert.equal(blind.canSeeResults, false);
  assert.equal(blind.reviews, undefined);
  assert.equal(blind.counts, undefined);
  const afterVoting = await submitReview(db, decision.id, 'reviewer-2', { choice: 'unsure', angle: '风险', reason: '还需要明确目标市场的预算和决策周期。' });
  assert.equal(afterVoting.canSeeResults, true);
  assert.deepEqual(afterVoting.counts, { a: 1, b: 0, unsure: 1 });
  assert.equal((await getDecision(db, decision.id, 'founder')).reviews.length, 2);
});

test('authors cannot vote on their own decision and each reviewer can vote only once', async () => {
  const db = makeDb();
  const decision = await createDecision(db, 'founder', draft);
  const review = { choice: 'b', angle: '机会', reason: '这个方向更容易验证用户是否愿意付费。' };
  await assert.rejects(() => submitReview(db, decision.id, 'founder', review), /自己/);
  await submitReview(db, decision.id, 'reviewer', review);
  await assert.rejects(() => submitReview(db, decision.id, 'reviewer', review), /已经/);
  await assert.rejects(() => submitReview(db, decision.id, 'another', { ...review, reason: '好' }), /理由/);
});

test('only the author can delete a decision and its reviews disappear with it', async () => {
  const db = makeDb();
  const decision = await createDecision(db, 'founder', draft);
  await submitReview(db, decision.id, 'reviewer', { choice: 'a', angle: '风险', reason: '需要考虑交付周期和团队当前的能力。' });
  await assert.rejects(() => deleteDecision(db, decision.id, 'reviewer'), /删除/);
  assert.equal(await deleteDecision(db, decision.id, 'founder'), true);
  assert.equal(await getDecision(db, decision.id, 'founder'), null);
  assert.equal((await listDecisions(db, 'founder')).length, 0);
});

test('reviews require only a choice and reason, with no perspective', async () => {
  const db = makeDb();
  const decision = await createDecision(db, 'founder', draft);
  const result = await submitReview(db, decision.id, 'reviewer', { choice: 'b', reason: '先验证付费意愿，再决定投入多少资源。' });
  assert.equal(result.reviews[0].choice, 'b');
  assert.equal(Object.hasOwn(result.reviews[0], 'angle'), false);
});

test('option descriptions persist and older decisions can omit them', async () => {
  const db = makeDb();
  const decision = await createDecision(db, 'founder', { ...draft, optionADescription: '围绕几个客户提供深度服务。', optionBDescription: '用标准产品服务更多独立开发者。' });
  assert.equal((await getDecision(db, decision.id, 'founder')).optionADescription, '围绕几个客户提供深度服务。');
  assert.equal((await listDecisions(db, 'founder'))[0].optionBDescription, '用标准产品服务更多独立开发者。');
  assert.equal((await createDecision(db, 'another', draft)).optionADescription, '');
  await assert.rejects(() => createDecision(db, 'founder', { ...draft, optionADescription: '长'.repeat(501) }), /介绍/);
});
