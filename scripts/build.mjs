import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import JSON5 from 'json5';

const root = path.resolve(import.meta.dirname, '..');
const appsPath = process.argv[2] ?? path.join(root, 'apps.txt');
const sourcePath = path.join(root, 'upstream', 'gkd-subscription.json5');
const outputPath = path.join(root, 'dist', 'personal-gkd.json5');
const versionPath = path.join(root, 'dist', 'personal-gkd.version.json5');
const reportPath = path.join(root, 'dist', 'coverage.txt');
const updateUrl =
  'https://raw.githubusercontent.com/a727081046/gkd-personal-subscription/main/dist/personal-gkd.json5';
const checkUpdateUrl =
  'https://raw.githubusercontent.com/a727081046/gkd-personal-subscription/main/dist/personal-gkd.version.json5';

const packageIds = [
  ...new Set(
    fs
      .readFileSync(appsPath, 'utf8')
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('package:'))
      .map((line) => line.slice('package:'.length))
      .filter(Boolean),
  ),
].sort();

const source = JSON5.parse(fs.readFileSync(sourcePath, 'utf8'));
const wanted = new Set(packageIds);
const matchedApps = source.apps.filter((app) => wanted.has(app.id));
const matchedIds = new Set(matchedApps.map((app) => app.id));
const unmatchedIds = packageIds.filter((id) => !matchedIds.has(id));

const subscription = {
  id: 2026062501,
  name: '个人手机 GKD 订阅',
  version: source.version,
  author: `Codex（规则来源：${source.name} v${source.version}）`,
  updateUrl,
  checkUpdateUrl,
  supportUri: source.supportUri,
  categories: source.categories ?? [],
  // 全局规则会作用于未列入 apps 的界面，个人精简版默认不继承，降低误触风险。
  globalGroups: [],
  apps: matchedApps,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON5.stringify(subscription, null, 2) + '\n');
fs.writeFileSync(
  versionPath,
  JSON5.stringify({ version: subscription.version }) + '\n',
);

const groupCount = matchedApps.reduce(
  (total, app) => total + (app.groups?.length ?? 0),
  0,
);
const report = [
  `规则来源: ${source.name}`,
  `来源版本: v${source.version}`,
  `来源地址: https://registry.npmmirror.com/gkd-subscription/latest/files`,
  `清单应用数: ${packageIds.length}`,
  `匹配应用数: ${matchedApps.length}`,
  `应用规则组数: ${groupCount}`,
  `未匹配应用数: ${unmatchedIds.length}`,
  '',
  '未匹配包名:',
  ...unmatchedIds,
  '',
].join('\n');
fs.writeFileSync(reportPath, report);

console.log(
  JSON.stringify(
    {
      packageCount: packageIds.length,
      matchedAppCount: matchedApps.length,
      groupCount,
      unmatchedAppCount: unmatchedIds.length,
      outputPath,
      versionPath,
      reportPath,
    },
    null,
    2,
  ),
);
