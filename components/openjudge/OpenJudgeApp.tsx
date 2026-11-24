'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckSquare2, Compass, FileText, Plus, Search, X } from 'lucide-react';
import { api, examples, isExample, type Decision, type View } from './shared';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { CreateDecision } from './CreateDecision';
import { DecisionDetail } from './DecisionDetail';
import { Dialog } from './Dialog';

type Modal = 'create' | 'detail' | 'privacy' | null;
export function OpenJudgeApp() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [practicedIds, setPracticedIds] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('feed');
  const [category, setCategory] = useState('全部');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    try { const result = await api<{ decisions: Decision[]; signedIn: boolean }>('/api/decisions'); setDecisions(result.decisions); setSignedIn(result.signedIn); }
    catch (error) { setNotice(error instanceof Error ? error.message : '加载失败，请刷新重试。'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    try { const saved = JSON.parse(localStorage.getItem('openjudge.practice.v1') || '{}'); if (saved && typeof saved === 'object' && !Array.isArray(saved)) setPracticedIds(Object.keys(saved)); } catch { /* Ignore malformed local practice data. */ }
    const id = new URL(window.location.href).searchParams.get('decision');
    if (id) api<{ decision: Decision }>(`/api/decisions/${encodeURIComponent(id)}`).then(result => { setSelected(result.decision); setModal('detail'); }).catch(error => setNotice(error instanceof Error ? error.message : '决策不存在或已删除。'));
  }, [load]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 4500); return () => window.clearTimeout(timer); }, [notice]);
  const visible = useMemo(() => {
    const source = view === 'feed' ? [...decisions, ...examples] : view === 'mine' ? decisions.filter(item => item.isOwner) : [...decisions.filter(item => item.hasReviewed), ...examples.filter(item => practicedIds.includes(item.id))];
    const term = query.trim().toLowerCase();
    return source.filter(item => (view !== 'feed' || category === '全部' || item.category === category) && (!term || [item.title, item.context, item.category].some(text => text.toLowerCase().includes(term))));
  }, [decisions, view, category, query, practicedIds]);
  function clearDecisionUrl() { const url = new URL(window.location.href); url.searchParams.delete('decision'); window.history.replaceState(null, '', url.toString()); }
  function open(decision: Decision) { setSelected(decision); setModal('detail'); if (!isExample(decision.id)) { const url = new URL(window.location.href); url.searchParams.set('decision', decision.id); window.history.replaceState(null, '', url.toString()); } }
  function closeDetail() { clearDecisionUrl(); setModal(null); }
  function navigate(next: View) { setView(next); setCategory('全部'); setQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function updated(decision: Decision) { setDecisions(current => current.map(item => item.id === decision.id ? decision : item)); }
  return <div className="app-shell">
    <Sidebar view={view} onNavigate={navigate} onCreate={() => setModal('create')} onPrivacy={() => setModal('privacy')} />
    <div className="app-body"><header className="topbar"><div className="mobile-brand"><span className="brand-mark"><span /></span><b>openJudge<span>.</span></b></div><div className="topbar-actions"><div className="search-wrap"><Search size={17} /><input aria-label="搜索决策" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索决策、话题" />{query && <button aria-label="清除搜索" onClick={() => setQuery('')}><X size={14} /></button>}</div>{signedIn ? <a className="account" href="/signout-with-chatgpt?return_to=%2F" title="退出登录"><span>匿</span><span className="account-label">匿名用户</span></a> : <a className="login-link" href="/signin-with-chatgpt?return_to=%2F">登录 <ArrowRight size={15} /></a>}</div></header>
      <main className="content-grid"><Feed practicedIds={practicedIds} view={view} decisions={visible} loading={loading} query={query} category={category} onCategory={setCategory} onOpen={open} onCreate={() => setModal('create')} /></main>
    </div>
    <nav className="mobile-nav" aria-label="移动端导航"><button className={view === 'feed' ? 'active' : ''} onClick={() => navigate('feed')}><Compass size={20} /><span>广场</span></button><button className={view === 'mine' ? 'active' : ''} onClick={() => navigate('mine')}><FileText size={20} /><span>我的决策</span></button><button className="mobile-create" onClick={() => setModal('create')} aria-label="发起决策"><Plus size={23} /></button><button className={view === 'reviews' ? 'active' : ''} onClick={() => navigate('reviews')}><CheckSquare2 size={20} /><span>我的审批</span></button></nav>
    {notice && <div className="toast" role="status">{notice}</div>}
    {modal === 'create' && <CreateDecision signedIn={signedIn} onClose={() => setModal(null)} onCreated={decision => { setDecisions(current => [decision, ...current]); setModal(null); setView('mine'); setQuery(''); setNotice('发布成功，新的视角正在路上。'); }} />}
    {modal === 'detail' && selected && <DecisionDetail initial={selected} signedIn={signedIn} onClose={closeDetail} onUpdated={updated} onDeleted={id => { setDecisions(current => current.filter(item => item.id !== id)); closeDetail(); setNotice('已删除这条决策及其审批、对话。'); }} onPracticeComplete={id => setPracticedIds(current => current.includes(id) ? current : [...current, id])} />}
    {modal === 'privacy' && <Dialog title="隐私与社区说明" onClose={() => setModal(null)}><div className="simple-dialog"><span className="dialog-number">A LITTLE CARE, TOGETHER</span><h2>分享观点，也保护自己<span>.</span></h2><p>公开之前，请确保内容不包含姓名、公司名称、联系方式、合同、源代码和其他敏感信息。任何能够访问本站的人都可能看到、复制或分享你发布的文字。</p><h3>匿名展示，不等于完全匿名</h3><p>其他访问者看到的是匿名称呼。平台仍会使用登录身份管理你的内容、限制重复投票；请不要把这里当作保密空间。</p><h3>删除与撤回</h3><p>删除决策会删除相应审批；若该决策曾有关联的历史对话，也会一并删除。无法撤回他人已经复制的内容。</p><h3>让分歧有帮助</h3><p>请尊重彼此，解释理由；不要发布他人的私人信息。这里的审批只是参考，最终由发起人自己决定。</p><button className="button button-outline" onClick={() => setModal(null)}>我知道了</button></div></Dialog>}
  </div>;
}
