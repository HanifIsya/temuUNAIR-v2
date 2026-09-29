#!/usr/bin/env node
// Contrast check for the design tokens (docs/02-design/10-accessibility.md).
// Verifies the WCAG 2.2 AA pairings that the UI relies on. Run in `gate` once tokens exist.
import { readFileSync } from "node:fs";

const tokens = JSON.parse(readFileSync("docs/02-design/tokens.json", "utf8"));

const hex = (h) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const c = tokens.color;
const pairs = [
  ["primary-700 on white", c.primary["700"], "#FFFFFF", 4.5],
  ["white on primary-700", "#FFFFFF", c.primary["700"], 4.5],
  ["text on white", c.neutral.text, "#FFFFFF", 4.5],
  ["text-muted on white", c.neutral.textMuted, "#FFFFFF", 4.5],
  ["text on accent-400 (yellow)", c.neutral.text, c.accent["400"], 4.5],
  ["white on success-600", "#FFFFFF", c.success["600"], 4.5],
  ["white on warn-600", "#FFFFFF", c.warn["600"], 4.5],
  ["white on danger-600", "#FFFFFF", c.danger["600"], 4.5],
];

let failed = 0;
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${r.toFixed(2)}:1 (min ${min}:1)`);
}

// Yellow must never be text on white
const yellowOnWhite = ratio(c.accent["400"], "#FFFFFF");
console.log(
  `${yellowOnWhite < 4.5 ? "PASS" : "FAIL"}  accent-400 must NOT be used as text on white (${yellowOnWhite.toFixed(2)}:1)`,
);
if (yellowOnWhite >= 4.5) failed++;

if (failed) {
  console.error(`\ncontrast: ${failed} check(s) failed`);
  process.exit(1);
}
console.log("\ncontrast: all pairings pass");
