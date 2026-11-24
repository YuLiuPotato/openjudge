import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'openJudge — 把纠结，交给更多人', description: '创业者的开放决策评审社区。写下你的困惑，听听不同的观点。' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
