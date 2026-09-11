import { ArrowDown, ArrowRight, ArrowUpRight, GitBranch } from "lucide-react";
import { ThemeToggle } from "./components/Theme";
const sources = [
  [
    "Newell、Shaw 与 Simon，1959",
    "Report on a General Problem-Solving Program · CMU 档案目录",
    "https://findingaids.library.cmu.edu/repositories/2/archival_objects/22561",
  ],
  [
    "Carnegie Mellon University",
    "Allen Newell 与 Herbert Simon 的研究档案",
    "https://digitalcollections.library.cmu.edu/cmu-collection/allen-newell",
  ],
  [
    "Peter Norvig · PAIP，第 4 章",
    "GPS 教学实现、子目标与目标相互干扰",
    "https://github.com/norvig/paip-lisp/blob/main/docs/chapter4.md",
  ],
  [
    "参考实现 · thundergolfer",
    "the-general-problem-solver，多语言教学实现",
    "https://github.com/thundergolfer/the-general-problem-solver",
  ],
];
export default function Landing() {
  return (
    <div className="landing">
      <header className="site-header">
        <a className="brand" href="#">
          <GitBranch />
          <span>GPS</span>
        </a>
        <nav aria-label="主导航">
          <a href="#principle">求解原理</a>
          <a href="#history">历史背景</a>
          <a href="#scope">复刻范围</a>
        </nav>
        <div className="site-header-actions">
          <ThemeToggle />
          <a className="landing-button primary" href="#/lab">
            打开实验 <ArrowUpRight />
          </a>
        </div>
      </header>
      <main className="landing-main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">符号人工智能 / 1957—1959</p>
            <h1>
              General
              <br />
              Problem Solver<span>通用问题解决者</span>
            </h1>
            <p className="hero-intro">
              把“想要什么”转化为“先做什么”。GPS
              将目标与当前状态之间的差异，逐层分解为可以执行的操作和需要先满足的子目标。
            </p>
            <div className="hero-actions">
              <a className="landing-button primary" href="#/lab">
                进入求解实验 <ArrowRight />
              </a>
              <a className="text-link" href="#principle">
                阅读求解原理 <ArrowDown />
              </a>
            </div>
            <dl className="hero-facts">
              <div>
                <dt>研究者</dt>
                <dd>Newell · Shaw · Simon</dd>
              </div>
              <div>
                <dt>核心方法</dt>
                <dd>手段—目的分析</dd>
              </div>
              <div>
                <dt>表示形式</dt>
                <dd>事实 · 目标 · 操作符</dd>
              </div>
            </dl>
          </div>
          <div className="method-figure" aria-label="目标递归分解示意">
            <div className="figure-caption">
              <span>MEANS–ENDS ANALYSIS</span>
              <span>01</span>
            </div>
            <div className="goal-node">
              <small>目标</small>
              <strong>不再饥饿</strong>
            </div>
            <div className="connector">
              <span>选择能够实现目标的操作</span>
            </div>
            <div className="operation-node">
              <small>操作符</small>
              <strong>吃掉香蕉</strong>
              <span>前置条件：拿着香蕉</span>
            </div>
            <div className="connector">
              <span>将前置条件变成新的目标</span>
            </div>
            <div className="subgoal-nodes">
              <div>
                <small>子目标</small>
                <strong>够得到香蕉</strong>
              </div>
              <div>
                <small>子目标</small>
                <strong>空手</strong>
              </div>
            </div>
            <div className="figure-foot">
              <span className="mini-dot" />
              递归分解，直到条件已成立或分支失败
            </div>
          </div>
        </section>
        <section className="knowledge-section" id="principle">
          <div className="section-index">
            <span>01 / MECHANISM</span>
            <h2>
              目标向下分解，
              <br />
              行动向上完成。
            </h2>
          </div>
          <div className="section-body">
            <p>
              求解器首先检查目标是否已在当前状态中。如果没有，就寻找添加列表中包含该目标的操作符。操作的前置条件会成为新的子目标；这些条件全部成立后，操作才可以更新状态。
            </p>
            <div className="formula">
              <span>新状态</span>
              <strong>（当前状态 − 删除列表）∪ 添加列表</strong>
            </div>
            <ol className="mechanism-list">
              <li>
                <span>01</span>
                <div>
                  <h3>选择操作</h3>
                  <p>从操作符的添加列表判断，它能否消除当前差异。</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>建立子目标</h3>
                  <p>递归求解前置条件，用目标栈识别循环依赖。</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>应用或回退</h3>
                  <p>
                    条件成立时更新事实；分支失败时恢复其起点，尝试下一个操作。
                  </p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <h3>复查所有目标</h3>
                  <p>
                    后面的行动可能破坏先前成果，结束前必须检查目标是否同时成立。
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section className="history-section" id="history">
          <div className="section-index">
            <span>02 / CONTEXT</span>
            <h2>
              从模拟推理，
              <br />
              到研究问题求解。
            </h2>
          </div>
          <div className="section-body">
            <p>
              Allen Newell、J. C. Shaw 与 Herbert A. Simon 在 1950 年代发展
              GPS。研究关注的不只是得出答案，也包括人如何比较现状与目标、选择行动，并在困难面前建立子目标。1959
              年的《Report on a General Problem-Solving
              Program》记录了这一方向的早期工作。
            </p>
            <p>
              “通用”指求解程序与具体问题知识可以分离：更换事实、目标和操作符，同一套程序便能处理另一个被形式化的问题域。它依赖人工提供的表示，并不意味着可以理解或解决所有现实问题。
            </p>
            <a
              className="text-link"
              href={sources[0][2]}
              target="_blank"
              rel="noreferrer"
            >
              查看 CMU 原始报告档案 <ArrowUpRight />
            </a>
          </div>
        </section>
        <section className="examples-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / PROBLEM DOMAINS</p>
              <h2>同一求解器，四个可检查的案例。</h2>
            </div>
            <a className="text-link" href="#/lab">
              打开案例 <ArrowUpRight />
            </a>
          </div>
          <div className="domain-grid">
            <article>
              <span>01</span>
              <h3>猴子与香蕉</h3>
              <p>
                推椅子、爬高、腾出双手，再拿到并吃掉香蕉。观察行动如何由最终目标倒推出来。
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>送孩子上学</h3>
              <p>
                汽车故障让出行目标依赖于联系修理厂、付款与维修，展示跨步骤的前置条件。
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>路线规划</h3>
              <p>
                把地点和移动表示成事实与操作符，观察目标递归如何寻找一条可行路线。
              </p>
            </article>
            <article>
              <span>04</span>
              <h3>目标顺序</h3>
              <p>
                一项操作消耗另一目标仍需要的凭证。交换目标顺序，比较搜索结果为什么不同。
              </p>
            </article>
          </div>
        </section>
        <section className="knowledge-section" id="scope">
          <div className="section-index">
            <span>04 / IMPLEMENTATION</span>
            <h2>这个复刻的边界。</h2>
          </div>
          <div className="section-body">
            <p>
              本实验参考所提供的多语言实现，并以 PAIP 风格的目标栈算法重新编写
              TypeScript 求解器。它是可运行、可观察的教学复刻，不是 1950 年代
              IPL 原程序的逐行移植。
            </p>
            <div className="scope-table">
              <div>
                <strong>可以检查</strong>
                <p>
                  每次目标尝试、操作选择、循环检测、分支回退、状态增删，以及最后所有目标是否成立。
                </p>
              </div>
              <div>
                <strong>可以修改</strong>
                <p>
                  导入或编辑
                  JSON，改变初始事实、目标顺序、操作符与前置条件；事实字符串可以使用中文。
                </p>
              </div>
              <div>
                <strong>算法限制</strong>
                <p>
                  固定目标与操作顺序、局部回退；不保证完备性、最短计划，也不自动枚举目标排列。失败仅表示当前搜索未找到计划。
                </p>
              </div>
              <div>
                <strong>实现限制</strong>
                <p>
                  最多 128 个操作符、64 层子目标和 3,000
                  条搜索事件。三维场景解释符号状态，不承担现实物理仿真。
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="references">
          <h2>资料与实现依据</h2>
          <ol>
            {sources.map(([title, description, url]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  <span>{title}</span>
                  <ArrowUpRight />
                </a>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer className="landing-footer">
        <a className="brand" href="#">
          <GitBranch />
          GPS
        </a>
        <span>General Problem Solver</span>
        <a href="#/lab">
          打开实验 <ArrowUpRight />
        </a>
      </footer>
    </div>
  );
}
