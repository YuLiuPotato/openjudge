import { Binoculars, CheckCheck, LockKeyhole, ShieldCheck } from 'lucide-react';
export function RightRail({ onPrivacy }: { onPrivacy: () => void }) {
  return <aside className="right-rail"><div className="clarity-panel"><h2>一个人纠结，<br />不如一起想清楚<span>.</span></h2><p>创业路上有太多选择。把问题说出来，让不同的经验给你一点新的启发。</p></div>
    <div className="perspective-heading"><span>多一个视角，少一分纠结</span><span>03</span></div>
    <div className="perspective"><span className="perspective-icon green"><Binoculars size={21} /></span><div><h3>看到机会</h3><p>从不同经历中，发现你可能忽略的选择。</p></div></div>
    <div className="perspective"><span className="perspective-icon yellow"><CheckCheck size={21} /></span><div><h3>想清执行</h3><p>回到现实条件，找到可以迈出的下一步。</p></div></div>
    <div className="perspective"><span className="perspective-icon peach"><ShieldCheck size={21} /></span><div><h3>提前避坑</h3><p>听听不同意见，留意不易察觉的风险。</p></div></div>
    <button className="privacy-note" onClick={onPrivacy}><LockKeyhole size={17} /><span><strong>发布前，请先脱敏</strong><small>公开内容可能被他人看到，别写入敏感信息。</small><em>了解隐私边界 →</em></span></button>
    <div className="rail-footer">OPEN MINDS. BETTER QUESTIONS.<br />© OPENJUDGE</div>
  </aside>;
}
