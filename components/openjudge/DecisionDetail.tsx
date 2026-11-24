'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Check, ChevronDown, Link2, LockKeyhole, Trash2 } from 'lucide-react';
import { api, isExample, timeAgo, type Choice, type Decision } from './shared';
import { Dialog } from './Dialog';

type Props = { initial: Decision; signedIn: boolean; onClose: () => void; onUpdated: (decision: Decision) => void; onDeleted: (id: string) => void; onPracticeComplete: (id: string) => void };
type Practice = { choice: Choice; reason: string };
const practiceKey = 'openjudge.practice.v1';
function readPractice(): Record<string, Practice> {
  try { const value = JSON.parse(localStorage.getItem(practiceKey) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; }
}
export function DecisionDetail({ initial, signedIn, onClose, onUpdated, onDeleted, onPracticeComplete }: Props) {
  const example = isExample(initial.id);
  const [decision, setDecision] = useState(initial);
  const [loading, setLoading] = useState(!example);
  const [practice, setPractice] = useState<Practice | null>(() => example ? readPractice()[initial.id] ?? null : null);
  const [choice, setChoice] = useState<Choice | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (example) return;
    let active = true;
    api<{ decision: Decision }>(`/api/decisions/${encodeURIComponent(initial.id)}`).then(result => { if (active) setDecision(result.decision); }).catch(cause => { if (active) setError(cause.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [initial.id, example]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!choice) { setError('请选择一个方案。'); return; }
    setError(''); setBusy(true);
    try {
      if (example) {
        const next = { choice, reason: reason.trim() }; const all = readPractice(); all[decision.id] = next;
        localStorage.setItem(practiceKey, JSON.stringify(all)); setPractice(next); onPracticeComplete(decision.id);
      } else {
        const result = await api<{ decision: Decision }>(`/api/decisions/${encodeURIComponent(decision.id)}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ choice, reason }) });
        setDecision(result.decision); onUpdated(result.decision);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : '提交失败，请稍后重试。'); }
    finally { setBusy(false); }
  }
  async function copyLink() {
    try { const url = new URL('/', window.location.origin); url.searchParams.set('decision', decision.id); await navigator.clipboard.writeText(url.toString()); setCopyNotice('链接已复制'); }
    catch { setCopyNotice('请从浏览器地址栏复制链接。'); }
  }
  async function remove() {
    if (!window.confirm('删除这条决策及其审批？已有的历史对话也会一并删除。')) return;
    setBusy(true); setError('');
    try { await api(`/api/decisions/${encodeURIComponent(decision.id)}`, { method: 'DELETE' }); onDeleted(decision.id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '删除失败，请稍后重试。'); setBusy(false); }
  }
  const options = [{ value: 'a' as const, mark: 'A', title: decision.optionA, description: decision.optionADescription }, { value: 'b' as const, mark: 'B', title: decision.optionB, description: decision.optionBDescription }];
  const labelFor = (value: Choice) => value === 'a' ? decision.optionA : value === 'b' ? decision.optionB : '暂不判断';
  return <Dialog title="决策审批" onClose={onClose} wide>
    <div className="decision-workspace">
      <aside className="decision-brief">
        <div className="detail-meta"><span>{decision.category}</span><span>{example ? '示例' : `${timeAgo(decision.createdAt)}发布`}</span></div>
        <h2>{decision.title}</h2>
        <details className="brief-disclosure"><summary><span>项目介绍</span><ChevronDown size={18} /><span className="brief-preview">{decision.context}</span></summary><div className="brief-body"><p>{decision.context}</p>{decision.goal && <div><h3>目标</h3><p>{decision.goal}</p></div>}{decision.risk && <div><h3>顾虑</h3><p>{decision.risk}</p></div>}</div></details>
        {!example && <button className="quiet-action" onClick={copyLink}><Link2 size={16} />复制链接</button>}{copyNotice && <p className="copy-notice" role="status">{copyNotice}</p>}
        {!example && decision.isOwner && !loading && <button className="quiet-action delete-action" onClick={remove} disabled={busy}><Trash2 size={16} />删除决策</button>}
      </aside>
      <section className="decision-response" aria-label="选择与理由">
        {loading ? <p role="status">正在加载…</p> : example && practice ? <div className="submitted-review"><span className="submitted-state"><Check size={18} />已提交</span><h3>{labelFor(practice.choice)}</h3><p>{practice.reason}</p><button className="button button-outline" onClick={() => { setChoice(practice.choice); setReason(practice.reason); setPractice(null); }}>修改选择</button></div> : decision.canSeeResults && !example ? <>
          <div className="section-heading"><h3>审批结果</h3><span>{decision.reviewCount} 人参与</span></div>
          <div className="results-grid">{[...options, { value: 'unsure' as const, mark: '—', title: '暂不判断' }].map(item => <div className="result-item" key={item.value}><span>{item.mark}</span><strong>{decision.counts?.[item.value] ?? 0}<small>票</small></strong><p>{item.title}</p></div>)}</div>
          <div className="review-list">{decision.reviews?.length ? decision.reviews.map(review => <article className="review" key={review.id}><div className="review-meta"><b>{review.isMine ? '你的选择' : '匿名评审者'}</b><time>{timeAgo(review.createdAt)}</time></div><h4>{labelFor(review.choice)}</h4><p>{review.reason}</p></article>) : <p className="no-reviews">等待第一条审批。</p>}</div>
        </> : !example && !signedIn ? <div className="signin-prompt"><LockKeyhole size={24} /><h3>登录后参与审批</h3><a className="button button-primary" href={`/signin-with-chatgpt?return_to=${encodeURIComponent(`/?decision=${decision.id}`)}`}>登录 <ArrowRight size={16} /></a></div> : <form onSubmit={submit}>
          <fieldset className="choice-fieldset"><legend>选择方案</legend><div className="review-choices">{options.map(option => <label key={option.value} className={`review-choice ${choice === option.value ? 'chosen' : ''}`}><input type="radio" name="choice" value={option.value} checked={choice === option.value} onChange={() => setChoice(option.value)} required /><span className="choice-mark">{option.mark}</span><span className="choice-content"><strong>{option.title}</strong>{option.description && <span>{option.description}</span>}</span><span className="choice-indicator" aria-hidden="true">{choice === option.value && <Check size={14} />}</span></label>)}</div><label className={`unsure-choice ${choice === 'unsure' ? 'chosen' : ''}`}><input type="radio" name="choice" value="unsure" checked={choice === 'unsure'} onChange={() => setChoice('unsure')} />信息不足，暂不判断</label></fieldset>
          <label className="reason-label"><span>选择原因</span><textarea value={reason} onChange={event => setReason(event.target.value)} required minLength={8} maxLength={500} rows={4} placeholder={choice === 'unsure' ? '还需要哪些信息才能作出判断？' : '哪些事实或经验支持你的选择？'} /></label>
          <div className="review-submit"><span className="input-counter">{reason.length} / 500</span><button className="button button-primary" disabled={busy || !choice || reason.trim().length < 8}>{busy ? '正在提交…' : '提交审批'}<ArrowRight size={16} /></button></div>
        </form>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </div>
  </Dialog>;
}
