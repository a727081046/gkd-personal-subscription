import fs from 'node:fs';
import path from 'node:path';
import JSON5 from 'json5';

const root = path.resolve(import.meta.dirname, '..');
const outputPath = path.join(root, 'dist', 'personal-gkd.json5');
const versionPath = path.join(root, 'dist', 'personal-gkd.version.json5');
const subscription = JSON5.parse(fs.readFileSync(outputPath, 'utf8'));
const version = JSON5.parse(fs.readFileSync(versionPath, 'utf8'));

if (!Number.isSafeInteger(subscription.id) || subscription.id <= 0) {
  throw new Error('订阅 id 无效');
}
if (!Array.isArray(subscription.apps)) {
  throw new Error('apps 必须是数组');
}
const ids = subscription.apps.map((app) => app.id);
if (new Set(ids).size !== ids.length) {
  throw new Error('apps 中存在重复包名');
}
if (subscription.globalGroups.length !== 0) {
  throw new Error('个人精简订阅不应包含全局规则');
}
if (version.version !== subscription.version) {
  throw new Error('版本检查文件与订阅版本不一致');
}

console.log(
  JSON.stringify(
    {
      valid: true,
      appCount: subscription.apps.length,
      groupCount: subscription.apps.reduce(
        (total, app) => total + (app.groups?.length ?? 0),
        0,
      ),
    },
    null,
    2,
  ),
);
