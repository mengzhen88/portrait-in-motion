#!/usr/bin/env python3
"""Build the portfolio's CSS foundation from its versioned Figma token snapshot."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'assets/design-system'
data = json.loads((BASE / 'tokens.json').read_text())
fonts = {
    'font/font-sans': '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif',
    'font/font-serif': 'Georgia, "Times New Roman", serif',
    'font/font-mono': '"Geist Mono", Menlo, Monaco, Consolas, monospace',
}

def value(token):
    if token['type'] == 'STRING':
        return fonts.get(token['name'], fonts['font/font-sans'])
    if token['type'] == 'FLOAT':
        unit = 'px' if token['name'].endswith(('font-size', 'line-height')) else ''
        return f"{token['light']}{unit}"
    return token['light']

lines = [
    '/* Generated from [00] Miaoda foundation library; run scripts/build-foundation.py.',
    ' * Source: CI1B3ustz0AEKJjRnRk50C, default Theme + Light Mode, 2026-11-04.',
    ' * Versioned snapshot: Figma changes require an explicit sync into tokens.json. */',
    '@font-face{font-family:"Geist Mono";src:url("../fonts/geist-mono-latin.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}',
    ':root {',
]
for token in data['tokens']:
    lines.append(f"  {token['cssVariable']}: {value(token)};")
lines += [
    '  /* Portfolio identity extends the neutral library theme. */',
    '  --portfolio-accent: #d97757;',
    '  --paper: var(--md-background);',
    '  --ink: var(--md-foreground);',
    '  --muted: var(--md-subtle-foreground);',
    '  --line: var(--md-border);',
    '  --sans: var(--md-font-sans);',
    '  --display: var(--md-font-sans);',
    '  --mono: var(--md-font-mono);',
    '}',
    ':root[data-case="byteio"] { --portfolio-accent: #6558de; }',
    '/* Dark values are available only on explicitly selected dark surfaces. */',
    '[data-md-theme="dark"] {',
]
for token in data['tokens']:
    if 'dark' in token:
        lines.append(f"  {token['cssVariable']}: {token['dark']};")
lines += ['}', '']
(BASE / 'tokens.css').write_text('\n'.join(lines))
print(f"Built {len(data['tokens'])} foundation tokens")
