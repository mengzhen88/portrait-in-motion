# Miaoda portfolio foundation

Source: [00] 妙搭基础组件库 — Figma file `CI1B3ustz0AEKJjRnRk50C`.
Snapshot: 2026-11-04; default Theme, Light Mode; typography reference `17031:160280`.

`tokens.json` keeps each source variable's Figma ID, name and resolved value.
`tokens.css` provides 109 shared color, typography and font-weight variables.
`foundation.css` applies them to existing pages and exposes reusable button,
card, input and text classes. No framework or runtime UI package is needed.

The site uses PingFang SC with platform fallbacks and a locally served, licensed
Geist Mono Latin subset. The type scale is 12/16, 14/22, 16/24, 18/28, 20/28,
24/32, 30/36, 36/40, 48/48, 60/60, 72/72, 96/96 and 128/128.
Text styles use the library's normal (400), medium (500) and semibold (600) roles.

Portfolio orange and ByteIO purple are explicit project extensions, rather than
Miaoda library colors. Illustrations, photos, screenshots, video content and
their artwork palettes retain their source appearance.

All five portfolio HTML pages load the shared styles. Scaled HTML illustrations
in Anyclaw use `assets/detail/anyclaw-type.js` to resolve their final screen type
sizes from these tokens; layout compensation remains separate from typography.
Dark values are exported for reuse, but are not enabled automatically.

To update: read the required Figma variables again, update the snapshot in
`tokens.json`, then run `python3 scripts/build-foundation.py`. This is an explicit
sync, not a live link to Figma. Verify affected pages before publishing.
