/**
 * Syntax highlighting for code blocks in posts. Posts render on demand in the
 * Worker, so this uses Shiki's core with the JavaScript regex engine (no
 * WebAssembly) and a fixed set of grammars to keep the bundle small.
 */
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import diff from "shiki/langs/diff.mjs";
import html from "shiki/langs/html.mjs";
import ini from "shiki/langs/ini.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import python from "shiki/langs/python.mjs";
import sql from "shiki/langs/sql.mjs";
import toml from "shiki/langs/toml.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";

const grammars = [
  bash,
  css,
  diff,
  html,
  ini,
  javascript,
  json,
  python,
  sql,
  toml,
  tsx,
  typescript,
  yaml,
];

/** Grammar names (and their aliases) we can highlight. Anything else renders as plain text. */
const known = new Set(
  grammars.flat().flatMap((grammar) => [grammar.name, ...(grammar.aliases ?? [])]),
);

let highlighter: Promise<HighlighterCore> | undefined;

export async function highlight(code: string, language: string | undefined): Promise<string> {
  highlighter ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: grammars,
    engine: createJavaScriptRegexEngine(),
  });

  const name = language?.toLowerCase();

  return (await highlighter).codeToHtml(code, {
    lang: name && known.has(name) ? name : "text",
    themes: { light: "github-light", dark: "github-dark" },
  });
}
