# Third-party notices

OpenJudge includes third-party code and dependencies. The root MIT license applies to OpenJudge contributions; it does not replace upstream licenses.

## Vendored code

- `scripts/vite/sites-vite-plugin.ts`: adapted from `@openai/sites-vite-plugin` 0.2.0, copyright 2026 OpenAI, MIT. The original license is preserved in `scripts/vite/sites-vite-plugin.LICENSE`.
- `vendor/shadcn-tailwind-4.13.0.css`: shadcn styles, copyright 2023 shadcn, MIT. The original license is preserved in `vendor/shadcn-tailwind-4.13.0.LICENSE.md`.
- `components/ui/`: shadcn-style UI components built on the dependencies declared in `package.json`; upstream copyright and license terms continue to apply.

## Installed dependencies

Direct and transitive dependencies are recorded in `package-lock.json`. After `npm ci`, see each package's `LICENSE`, `NOTICE` and `package.json` files in `node_modules` for its applicable terms. Retain upstream notices when redistributing dependencies or bundled code.

Project and platform names remain the property of their respective owners. This project does not imply endorsement by any platform or dependency author.
