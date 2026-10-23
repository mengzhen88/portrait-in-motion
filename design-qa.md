# Design QA

- Source visual truth: `assets/figma/reference-home.png` (Figma node `917:18022`, natural canvas 1920 × 5660, captured 1390 × 4096)
- Implementation: `http://127.0.0.1:8765/`
- Browser viewport: 1280 × 720 CSS px, device scale 1
- Implementation captures: `implementation-hero.png`, `implementation-projects-v2.png`, `implementation-resume-v2.png`
- Comparison sheets: `design-qa-hero.jpg`, `design-qa-projects-v2.jpg`, `design-qa-resume-v2.jpg`
- State: default desktop, animated doodle running

## Findings

No actionable P0/P1/P2 mismatch remains.

- Fonts and typography: serif display hierarchy, PingFang body copy, Menlo metadata, weights, line heights and responsive scaling follow the Figma design. System fallbacks may cause small platform-level glyph differences.
- Spacing and layout rhythm: 1440/1920 content ratio, hero centering, four-column capability strip, alternating project rows, section spacing, radii and resume timeline align with the source.
- Colors and tokens: warm paper `#faf9f5`, project surface `#f0eee6`, ink, muted copy and divider colors match the design context.
- Image quality and assets: existing transparent portrait and all eleven doodle frames are unchanged. Project screenshots, gradient backgrounds, QR image and company marks use original Figma assets; no temporary Figma URLs remain.
- Copy and content: three requested sections and the visible design copy are represented. Placeholder project copy remains because it is also placeholder content in the design.

## Comparison history

1. Initial comparison found a P2 density mismatch at 1280 px: the implementation retained 1920-canvas type sizes and content width, causing project and resume content to appear too large.
2. Fixed with a 901–1500 px responsive scale: content width changed from 1440 to 960, project cards from 432 to 288, and typography/gaps were scaled proportionally.
3. Post-fix evidence in `design-qa-projects-v2.jpg` and `design-qa-resume-v2.jpg` shows matching margins, density, card proportions and timeline rhythm.

## Interaction and responsive checks

- Anchor navigation targets: project collection, about/resume, contact.
- Reduced-motion preference stops the doodle animation on the first frame.
- Desktop views at 1280 × 720 rendered successfully; mobile rules stack project rows and resume items without fixed horizontal overflow.
- Browser accessibility state exposed all navigation and content sections. No runtime error surfaced in page state; this browser surface did not expose a dedicated console-log capability.

## Follow-up polish

- P3: exact Source Han Serif rendering depends on the font installed on the viewer's system; Songti SC and Georgia are used as fallbacks.

final result: passed
