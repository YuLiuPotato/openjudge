import { CheckSquare2, Compass, FileText, LockKeyhole, Plus } from 'lucide-react';
import type { View } from './shared';

type Props = { view: View; onNavigate: (view: View) => void; onCreate: () => void; onPrivacy: () => void };
export function Sidebar({ view, onNavigate, onCreate, onPrivacy }: Props) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark"><span /></span><span>openJudge</span><span className="brand-dot">.</span></div>
    <button className="button button-primary create-nav" onClick={onCreate}><Plus size={19} strokeWidth={2.3} />发起决策</button>
    <nav className="nav-links" aria-label="主导航">
      <button className={view === 'feed' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('feed')}><Compass size={19} />决策广场</button>
      <button className={view === 'mine' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('mine')}><FileText size={19} />我的决策</button>
      <button className={view === 'reviews' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('reviews')}><CheckSquare2 size={19} />我的审批</button>
    </nav>
    <div className="sidebar-bottom"><button className="quiet-link" onClick={onPrivacy}><LockKeyhole size={15} /> 隐私说明</button></div>
  </aside>;
}
