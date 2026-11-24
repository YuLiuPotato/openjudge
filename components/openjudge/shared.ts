import type { Choice, Decision } from '../../lib/decisions.mjs';
export type { Choice, Decision };
export type View = 'feed' | 'mine' | 'reviews';
export const categories = ['全部', '产品方向', '增长获客', '团队与组织', '融资与资本', '战略与方向', '其他'];
export const examples: Decision[] = [
  { id: 'example-product', title: '该先聚焦一个小众场景，还是做通用的 AI 助手？', context: '我们有一个能解决多种问题的原型，但团队人手有限，正在寻找第一个真正需要它的人群。', optionA: '聚焦一个具体场景', optionB: '继续覆盖更多需求', optionADescription: '围绕一个具体问题打磨体验，先服务一类用户。', optionBDescription: '保留多种能力，继续探索不同人群的使用需求。', category: '产品方向', goal: '找到最愿意持续使用的用户', risk: '过早扩大范围会分散团队精力', createdAt: 0, reviewCount: 0, isOwner: false, hasReviewed: false },
  { id: 'example-team', title: '现在就招一位全职产品负责人，还是创始人先兼任？', context: '产品开始有早期用户，但方向还在探索。全职招聘会加快推进，也会增加团队的固定成本。', optionA: '现在开始招聘', optionB: '创始人先兼任', optionADescription: '让专职负责人协调需求和迭代，团队增加固定投入。', optionBDescription: '由创始人继续负责产品，暂缓增加固定成本。', category: '团队与组织', goal: '让产品迭代保持稳定', risk: '过早固化职责可能降低灵活性', createdAt: 0, reviewCount: 0, isOwner: false, hasReviewed: false },
  { id: 'example-growth', title: '第一个月应该打磨产品，还是先去找更多用户？', context: '一些用户说产品有价值，也提出了不少改进建议。团队在完善体验和主动获客之间犹豫。', optionA: '先解决核心体验', optionB: '先扩大用户访谈', optionADescription: '优先处理已发现的体验问题，再扩大使用范围。', optionBDescription: '先接触更多目标用户，判断哪些问题最值得解决。', category: '增长获客', goal: '确认接下来最值得做的事', risk: '花时间解决了并不重要的问题', createdAt: 0, reviewCount: 0, isOwner: false, hasReviewed: false },
];
export const isExample = (id: string) => id.startsWith('example-');
export function timeAgo(timestamp: number) {
  if (!timestamp) return '示例';
  const mins = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  if (mins < 1440) return `${Math.floor(mins / 60)} 小时前`;
  return `${Math.floor(mins / 1440)} 天前`;
}
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  let data: { error?: string } & T;
  try { data = await response.json(); } catch { throw new Error('暂时无法连接，请稍后重试。'); }
  if (!response.ok) throw new Error(data.error || '暂时无法处理请求，请稍后重试。');
  return data;
}
