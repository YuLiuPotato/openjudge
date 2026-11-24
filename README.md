# openJudge

给创业者的决策评审社区。把纠结写成一个问题、两个选项，邀请其他人先独立表态并说明理由，再查看社区观点。最终决定由发起人做出。

An open-source decision review community for founders. Publish a dilemma and two options, collect independent reviews, and compare the reasoning before deciding.

[MIT License](LICENSE) · [贡献指南](CONTRIBUTING.md) · [安全说明](SECURITY.md) · [产品发展记录](docs/product-and-plan.md)

## 现在能做什么

- 发布决策：填写问题、项目背景、两个方案及介绍，可选目标、顾虑和话题。
- 浏览和发现：决策广场、搜索、话题筛选、分享链接和个人记录。
- 独立审批：先选择方案并给出理由，提交后再看社区观点；作者可以查看自己收到的意见。
- 权限与隐私：不能审批自己的问题，每人每条仅能审批一次，作者可以删除自己的决策。
- 本机体验：草稿和清楚标注的示例练习；练习结果仅存当前浏览器。

聊天、会员支付、专家撮合和 landing page 尚未提供。历史聊天相关迁移为数据库兼容而保留，不代表当前仍有聊天功能。

## 技术栈

React 19、TypeScript、Vinext/Vite、Cloudflare Workers、D1（SQLite）和 Drizzle。测试使用 Node.js 内置测试运行器。

## 本地运行

需要 Node.js **22.13 或更新版本**及 npm。安装不需要生产密钥。

```sh
git clone https://github.com/YuLiuPotato/openjudge.git
cd openjudge
npm ci
npm run build
```

首次运行，在新建的本地数据库中按顺序执行全部迁移：

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_fat_nehzno.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_first_raza.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_complex_roxanne_simpson.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_bouncy_mach_iv.sql
npm run dev
```

打开终端显示的本地地址（默认 `http://localhost:5173`）。点击登录即可使用本地模拟身份。以上命令适用于首次初始化；已经应用的迁移不要重复执行。数据库和运行状态位于被 Git 忽略的本地目录中。

检查代码：

```sh
npm test
npm run typecheck
npm run build
```

## 部署与身份认证

这个版本面向 **ChatGPT Sites / Cloudflare Workers** 运行环境；它不是可以直接部署到任意 Node.js 主机的 Next.js 应用。

- `.openai/hosting.json` 仅声明 `DB` 绑定，不包含原站点 ID。部署自己的实例时，配置自己的数据库、Sites 项目标识和运行环境。
- 生产认证由 Sites 入口提供的可信 `oai-authenticated-user-*` 请求头完成。本地模拟登录只在开发服务器使用。
- 若部署到普通 Cloudflare Worker 或其他平台，需要自行实现认证，并在可信入口剥离客户端传入的身份头，再注入经过验证的身份。不要直接信任互联网请求中的这些头。
- 源码公开不会开放原站点或其数据库。本仓库不包含用户决策、审批、聊天记录、密钥或生产数据。

## 隐私边界

发布的内容对能访问实例的人可见；匿名称呼不等于完全匿名。运行平台仍需识别账户，以限制重复审批和提供作者管理权限。发布前请去掉姓名、公司、联系方式、合同、代码和可识别的商业数据。删除无法撤回别人已复制的内容。

审批是参考意见，不是正确性保证，也不替发起人承担决策责任。

## 代码地图

| 路径 | 内容 |
| --- | --- |
| `components/openjudge/` | 广场、发布、审批、共享话题控件 |
| `lib/decisions.mjs` | 验证、权限和独立审批规则 |
| `app/api/` | 决策与审批接口 |
| `app/chatgpt-auth.ts` | 平台身份读取 |
| `db/`、`drizzle/` | 数据结构与迁移 |
| `tests/` | 业务规则、权限及迁移测试 |
| `docs/product-and-plan.md` | 产品判断与发展记录 |
| `AGENTS.md` | UI 一致性规范 |

## 参与和许可

欢迎通过 Issue 反馈具体问题，通过 Pull Request 提交改进。请先阅读[贡献指南](CONTRIBUTING.md)，安全问题请按[安全说明](SECURITY.md)私下报告。

项目代码按 [MIT](LICENSE) 许可发布；第三方代码保留原有许可，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。依赖与上游商标不因本项目的许可而重新授权。
