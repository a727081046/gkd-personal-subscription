import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import JSON5 from 'json5';

const root = path.resolve(import.meta.dirname, '..');
const sourceUrl =
  'https://registry.npmmirror.com/gkd-subscription/latest/files';
const sourcePath = path.join(root, 'upstream', 'gkd-subscription.json5');
const temporaryPath = `${sourcePath}.download`;

const response = await fetch(sourceUrl, {
  headers: { 'user-agent': 'gkd-personal-subscription-updater/1.0' },
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) {
  throw new Error(`下载失败: HTTP ${response.status} ${response.statusText}`);
}

const content = await response.text();
const subscription = JSON5.parse(content);
if (
  !Number.isSafeInteger(subscription.version) ||
  !Array.isArray(subscription.apps) ||
  !Array.isArray(subscription.categories)
) {
  throw new Error('下载内容不是有效的 GKD 订阅');
}

fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
fs.writeFileSync(temporaryPath, content);
fs.renameSync(temporaryPath, sourcePath);

const build = spawnSync(
  process.execPath,
  [path.join(root, 'scripts', 'build.mjs'), ...process.argv.slice(2)],
  { cwd: root, stdio: 'inherit' },
);
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const check = spawnSync(
  process.execPath,
  [path.join(root, 'scripts', 'check.mjs')],
  { cwd: root, stdio: 'inherit' },
);
if (check.status !== 0) {
  process.exit(check.status ?? 1);
}

console.log(`已更新至上游订阅 v${subscription.version}`);
