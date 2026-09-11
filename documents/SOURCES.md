# 参考来源

## 用户提供的本地资料

`/Users/bush/_ROOT_/_CODE_/_GITHERE_/【符号人工智能】/the-general-problem-solver-master/`

阅读了：

- `README.md` 与 `natlang_GPS_description.txt`；
- `gps_typescript/gps.ts` 与 `gps_typescript/examples/monkeys.json`；
- `gps_python/general_problem_solver.py`；
- `general_problem_solver.lisp`。

目录中的 README 指向 [thundergolfer/the-general-problem-solver](https://github.com/thundergolfer/the-general-problem-solver)。其中 Lisp 实现注明参考 Peter Norvig 的 PAIP，Python 实现注明 Daniel Connelly。本项目沿用猴子问题的事实数据和输入结构，重新编写现代求解器，没有复制整套上游源码。

## 历史与方法

- [CMU：1959 年 Report on a General Problem-Solving Program 档案目录](https://findingaids.library.cmu.edu/repositories/2/archival_objects/22561)：确认报告题名、作者与年份；未声称已逐页阅读原始报告。
- [CMU：Allen Newell 研究档案](https://digitalcollections.library.cmu.edu/cmu-collection/allen-newell)：Logic Theorist 与 GPS 的研究脉络、手段—目的分析。
- [CMU：Herbert Simon 研究档案](https://digitalcollections.library.cmu.edu/cmu-collection/herbert-simon)：1957 年将手段—目的分析引入 GPS 的历史背景。
- [Peter Norvig：PAIP 第 4 章](https://github.com/norvig/paip-lisp/blob/main/docs/chapter4.md)：教学型 GPS、目标递归与相互干扰问题。
- [Norvig 的 PAIP 代码索引](https://www.norvig.com/paip/)：GPS 教学程序的代码来源。

## 界面约定

沿用同一 gallery 内 SHRDLU 项目的要求：独立专业入口页、功能界面无营销文案、移动视口内可操作、明暗主题、Base UI、Three.js、底部固定栏适配、docs 构建目录及 documents 文档目录。

参考 [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)、[shadcn/ui](https://ui.shadcn.com/docs)、[react-bottom-fixed](https://github.com/almond-bongbong/react-bottom-fixed)。实际组件继续使用 Base UI。
