# 个人手机 GKD 订阅

根据仓库内 `apps.txt` 中的包名，从以下订阅筛选已适配的应用规则：

`https://registry.npmmirror.com/gkd-subscription/latest/files`

当前构建使用 `gkd-subscription 2.0.75`，订阅版本 v75。

## 构建

```powershell
cd 'D:\Projects\gkd-personal-subscription'
npm install
npm run build
npm run check
```

## 后续更新

执行以下命令会重新下载指定订阅的最新版本、筛选手机应用并完成校验：

```powershell
cd 'D:\Projects\gkd-personal-subscription'
npm run update
```

如果应用清单移动了位置，可以显式传入新路径：

```powershell
npm run update -- 'D:\其他目录\apps.txt'
```

生成文件：

- `dist\personal-gkd.json5`：可导入 GKD 的本地订阅。
- `dist\personal-gkd.version.json5`：GKD 远程版本检查文件。
- `dist\coverage.txt`：匹配统计和未适配包名。

## 手机订阅地址

```text
https://raw.githubusercontent.com/a727081046/gkd-personal-subscription/main/dist/personal-gkd.json5
```

GitHub Actions 每天北京时间 04:25 检查上游；内容变化时自动提交。

## 导入

将 `dist\personal-gkd.json5` 复制到手机，然后在 GKD 的订阅页面通过本地文件导入。

## 限制

- 规则覆盖范围取决于指定上游订阅。
- 规则只覆盖上游已有适配的应用和版本。
- 为降低误触风险，本订阅没有继承上游全局规则。
