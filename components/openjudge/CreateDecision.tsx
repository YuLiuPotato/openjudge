'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import type { Decision, DecisionInput } from '../../lib/decisions.mjs';
import { api } from './shared';
import { TopicSelect } from './TopicSelect';
import { Dialog } from './Dialog';

const key = 'openjudge.draft.v1';
const emptyDraft: Omit<DecisionInput, 'privacyConfirmed'> = { title: '', context: '', optionA: '', optionB: '', optionADescription: '', optionBDescription: '', category: '其他', goal: '', risk: '' };
type Draft = typeof emptyDraft;
export function CreateDecision({ signedIn, onClose, onCreated }: { signedIn: boolean; onClose: () => void; onCreated: (decision: Decision) => void }) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { try { const saved = localStorage.getItem(key); if (saved) { const restored = { ...emptyDraft, ...JSON.parse(saved) }; setDraft(restored); setExtrasOpen(Boolean(restored.goal || restored.risk || restored.category !== '其他')); } } catch { /* A malformed draft should not prevent publishing. */ } setReady(true); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(key, JSON.stringify(draft)); } catch { /* Browser storage may be disabled. */ } } }, [draft, ready]);
  const update = (field: keyof Draft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const looksSensitive = /[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?86[- ]?)?1[3-9]\d{9}/i.test(Object.values(draft).join(' '));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await api<{ decision: Decision }>('/api/decisions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...draft, privacyConfirmed: confirmed }) });
      try { localStorage.removeItem(key); } catch { /* No local storage available. */ }
      onCreated(result.decision);
    } catch (cause) { setError(cause instanceof Error ? cause.message : '发布失败，请稍后再试。'); }
    finally { setBusy(false); }
  }
  return <Dialog title="发起决策" onClose={onClose} wide><div className="dialog-heading"><h2>发起一个决策</h2></div>
    {!signedIn ? <div className="signin-prompt"><LockKeyhole size={22} /><h3>登录后发起决策</h3><p>你的账号用于管理内容和防止重复投票，广场上仅显示匿名称呼。</p><a className="button button-primary" href="/signin-with-chatgpt?return_to=%2F">登录后继续 <ArrowRight size={16} /></a></div> :
    <form onSubmit={submit} className="decision-form"><div className="publish-columns"><div className="publish-context">
      <label><span>你正在纠结什么？ <i>*</i></span><input autoFocus required minLength={5} maxLength={100} value={draft.title} onChange={e => update('title', e.target.value)} placeholder="例如：我们应该先做小众场景，还是通用产品？" /></label>
      <label><span>说说背景 <i>*</i></span><textarea required minLength={10} maxLength={1200} rows={4} value={draft.context} onChange={e => update('context', e.target.value)} placeholder="目前的情况是什么？你为什么会在这件事上犹豫？" /></label>
      <details className="optional-fields" open={extrasOpen} onToggle={event => setExtrasOpen(event.currentTarget.open)}><summary>补充信息 <span>选填</span></summary><div className="optional-fields-body"><div className="form-two"><label><span>你希望达成什么？</span><input maxLength={300} value={draft.goal} onChange={e => update('goal', e.target.value)} placeholder="你期待的结果" /></label><label><span>最担心什么？</span><input maxLength={300} value={draft.risk} onChange={e => update('risk', e.target.value)} placeholder="可能的风险" /></label></div><div className="topic-field"><label htmlFor="decision-topic">话题</label><TopicSelect id="decision-topic" label="话题" variant="form" value={draft.category} onChange={value => update('category', value)} /></div></div></details>
</div><div className="publish-options"><h3>备选方案</h3><section className="publish-option"><span className="choice-mark">A</span><div><label><span>选项 A</span><input required minLength={2} maxLength={100} value={draft.optionA} onChange={e => update('optionA', e.target.value)} placeholder="用一句话描述选择" /></label><label><span>选项 A 介绍 <small>选填</small></span><textarea rows={3} maxLength={500} value={draft.optionADescription} onChange={e => update('optionADescription', e.target.value)} placeholder="说明这个方案包含什么" /></label></div></section><section className="publish-option"><span className="choice-mark">B</span><div><label><span>选项 B</span><input required minLength={2} maxLength={100} value={draft.optionB} onChange={e => update('optionB', e.target.value)} placeholder="用一句话描述选择" /></label><label><span>选项 B 介绍 <small>选填</small></span><textarea rows={3} maxLength={500} value={draft.optionBDescription} onChange={e => update('optionBDescription', e.target.value)} placeholder="说明这个方案包含什么" /></label></div></section></div></div>      <div className="privacy-box">{looksSensitive && <p className="sensitive-warning">检测到疑似邮箱或手机号，请检查并删除。自动检查不能识别所有敏感信息。</p>}<label className="checkbox-line"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} required /><span>我已移除敏感信息，了解发布内容对站点访问者可见。</span></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-footer"><button className="button button-primary" disabled={busy}>{busy ? '正在发布…' : '发布到广场'} <ArrowRight size={16} /></button></div>
    </form>}
  </Dialog>;
}
