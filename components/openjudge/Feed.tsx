import { ArrowRight, Search } from 'lucide-react';
import { isExample, timeAgo, type Decision, type View } from './shared';
import { TopicSelect } from './TopicSelect';

type CardProps = { decision: Decision; onOpen: (decision: Decision) => void; practiced: boolean };
export function DecisionCard({ decision, onOpen, practiced }: CardProps) {
  const example = isExample(decision.id);
  return <article className="decision-card">
    <div className="card-meta"><span className={example ? 'card-origin practice-origin' : 'card-origin'}>{example ? '示例' : `匿名发布 · ${timeAgo(decision.createdAt)}`}</span><span className="category-label">{decision.category}</span></div>
    <button className="card-title" onClick={() => onOpen(decision)}>{decision.title}</button>
    <p className="card-context">{decision.context}</p>
    <div className="card-footer">{!example && <span className="card-count">{decision.reviewCount} 条审批</span>}<button className="button button-small" onClick={() => onOpen(decision)}>{example ? practiced ? '查看审批' : '参与审批' : decision.isOwner || decision.hasReviewed ? '查看结果' : '参与审批'}<ArrowRight size={15} /></button></div>
  </article>;
}

type FeedProps = { practicedIds: string[]; view: View; decisions: Decision[]; loading: boolean; query: string; category: string; onCategory: (value: string) => void; onOpen: (decision: Decision) => void; onCreate: () => void };
export function Feed({ practicedIds, view, decisions, loading, query, category, onCategory, onOpen, onCreate }: FeedProps) {
  const heading = view === 'feed' ? '决策广场' : view === 'mine' ? '我的决策' : '我的审批';
  return <section className="feed" aria-labelledby="feed-heading">
    <div className="page-heading"><h1 id="feed-heading">{heading}<span className="heading-period">.</span></h1>{view === 'feed' && <p>把问题写下来，听听不同的想法。</p>}</div>
    {view === 'feed' && <div className="feed-tools"><div className="category-control"><TopicSelect label="按话题筛选" value={category} onChange={onCategory} includeAll /></div></div>}
    <div className="feed-list">
      {loading ? <div className="empty-state"><div className="loading-dot" />正在加载…</div> : decisions.length ? decisions.map(item => <DecisionCard key={item.id} decision={item} onOpen={onOpen} practiced={practicedIds.includes(item.id)} />) : <div className="empty-state"><span className="empty-icon"><Search size={22} /></span><h3>{query ? '没有找到相关决策' : view === 'mine' ? '还没有发起过决策' : view === 'reviews' ? '还没有审批记录' : '这里还没有决策'}</h3><p>{query ? '试试其他关键词或话题。' : view === 'reviews' ? '去广场看看，分享你的想法。' : '从写下一个问题开始。'}</p>{!query && view !== 'reviews' && <button className="button button-outline" onClick={onCreate}>发起决策 <ArrowRight size={15} /></button>}</div>}
    </div>
  </section>;
}
