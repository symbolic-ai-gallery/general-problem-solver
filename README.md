# GPS · General Problem Solver

通用问题解决者的浏览器教学复刻。以用户提供的多语言 GPS 实现为参考，重新实现 PAIP 风格的目标栈与手段—目的分析；全部求解在本地 Web Worker 中完成，不需要模型服务或 API Key。

这是可观察的教学实现，不是 1950 年代 IPL 原程序的逐行移植。搜索采用给定的目标与操作符顺序，不保证完备性或最短计划。失败表示本轮搜索没有找到计划，并不证明问题无解。

## 运行

```sh
volta install node@24.19.0
volta install pnpm@11.23.0
pnpm install --frozen-lockfile
pnpm dev --port 5174
```

首次安装需要网络；运行时脚本与资源均来自本项目。Node / pnpm 版本由 `package.json` 固定。`pnpm-workspace.yaml` 只允许 esbuild 的必要安装脚本。

- 主入口：`http://127.0.0.1:5174/`
- 实验台：`http://127.0.0.1:5174/#/lab`

```sh
pnpm build       # TypeScript 严格检查，生产构建到 docs/
pnpm preview     # 预览 docs/ 中的产物
pnpm test        # 6 项核心算法测试
pnpm format      # 格式化源文件与 documents/，不处理构建产物
```

`docs/` 专用于静态构建输出，每次构建重新生成；`documents/` 保存项目文档。资源使用相对路径，支持部署到项目子目录。没有执行线上发布。

## 使用

1. 从顶部选择猴子与香蕉、送孩子上学、路线规划或目标顺序。
2. 点击“求解”。“计划”只显示成功分支的实际操作；“搜索”保留所有尝试、循环、回退及目标冲突。
3. 点击步骤或使用底部控制栏回放，支持暂停、前后步进和速度切换。猴子场景等待当前动画完成后才自动进入下一步。
4. “问题”页签查看当前事实，以及每个操作符的前置、添加和删除列表。
5. 右上角 JSON 按钮编辑问题；支持导入文件、编辑和校验后重新求解。“更多操作”可导出问题或完整求解记录。
6. 太阳／月亮按钮切换主题；默认跟随系统，手动选择保存在本地。“更多操作”可切换中文／English。

JSON 沿用参考实现的 `start` / `finish` / `ops` 格式：

```json
{
  "start": ["准备"],
  "finish": ["完成"],
  "ops": [
    {
      "action": "执行",
      "preconds": ["准备"],
      "add": ["完成"],
      "delete": ["准备"]
    }
  ]
}
```

事实使用完整字符串匹配，支持 Unicode；这不是自然语言解析器。自定义问题用通用事实面板展示，专用三维场景对应内置猴子案例。

“目标顺序”案例默认会失败：先把凭证换成餐食，会失去领取入场券的条件。把 `finish` 改为 `["have ticket", "have meal"]` 后重试，同一套操作符能找到两步计划。

## 技术与结构

Volta + pnpm · React + Vite + TypeScript · Tailwind CSS + Base UI · Three.js · react-bottom-fixed。

```text
src/
  Landing.tsx              历史背景、方法说明与引用
  App.tsx                  问题编辑、求解控制、计划／搜索／问题面板
  engine/
    solver.ts              目标栈递归、分支恢复、目标复查、输入校验
    worker.ts              求解线程
    useSolver.ts           取消、时间预算与工作线程生命周期
    presets.ts             案例数据及中文显示名称
  components/
    WorldScene.tsx         猴子场景、状态插值与动画完成确认
    StateDiagram.tsx       路线与事实状态图
    ComposerDock.tsx       react-bottom-fixed 的 iOS 底部栏适配
    Theme.tsx              主题状态、系统偏好与持久化
documents/                 算法边界、参考来源及验证记录
docs/                      生成的静态站点
tests/                     六项核心算法验证
```

说明：[兼容性与算法边界](documents/COMPATIBILITY.md) · [验证记录](documents/VALIDATION.md) · [参考来源](documents/SOURCES.md) · [第三方声明](THIRD_PARTY_NOTICES.md)。
