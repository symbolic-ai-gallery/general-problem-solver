# Third-party notices

## Reference algorithms and example data

The local reference material points to [thundergolfer/the-general-problem-solver](https://github.com/thundergolfer/the-general-problem-solver). Its Lisp implementation credits Peter Norvig's _Paradigms of Artificial Intelligence Programming_; its Python implementation credits Daniel Connelly.

This project contains a newly written TypeScript goal-stack solver. It does not redistribute the reference implementation source files. The monkey-and-bananas problem uses the small factual domain data and JSON structure supplied in the reference directory. Other problem domains and the interface are new work.

Historical authorship of GPS: Allen Newell, J. C. Shaw and Herbert A. Simon. See [sources](documents/SOURCES.md) for attribution and the distinction between the historical program and this teaching reconstruction.

## Runtime and development dependencies

React, React DOM, Vite, TypeScript, Tailwind CSS, Base UI, Three.js, Lucide, react-bottom-fixed, esbuild and Vitest retain their respective licenses. Versions and integrity information are recorded in pnpm-lock.yaml.

react-bottom-fixed 0.2.0 by almond-bongbong is used under its MIT license. Its installed source is unchanged; the application supplies an iOS Portal/placeholder wrapper and positioning CSS. Source: https://github.com/almond-bongbong/react-bottom-fixed .

The Three.js monkey scene and diagrams are created in code for this project. No image, 3D model or artwork from the reference directory is bundled.
