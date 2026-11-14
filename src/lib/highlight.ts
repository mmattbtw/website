/**
 * Syntax highlighting for code blocks in posts. Posts render on demand in the
 * Worker, so this uses Shiki's core with the JavaScript regex engine (no
 * WebAssembly), and loads only the grammar a block asks for: compiling every
 * grammar up front costs far more CPU than one request should spend.
 */
import type { LanguageRegistration } from "shiki";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";

type Grammar = () => Promise<{ default: LanguageRegistration[] }>;

const bash: Grammar = () => import("shiki/langs/bash.mjs");
const javascript: Grammar = () => import("shiki/langs/javascript.mjs");
const typescript: Grammar = () => import("shiki/langs/typescript.mjs");
const yaml: Grammar = () => import("shiki/langs/yaml.mjs");
const python: Grammar = () => import("shiki/langs/python.mjs");

/** Language names (and common aliases) we can highlight. Anything else renders as plain text. */
const grammars = new Map<string, Grammar>([
  ["bash", bash],
  ["sh", bash],
  ["shell", bash],
  ["shellscript", bash],
  ["zsh", bash],
  ["css", () => import("shiki/langs/css.mjs")],
  ["diff", () => import("shiki/langs/diff.mjs")],
  ["html", () => import("shiki/langs/html.mjs")],
  ["ini", () => import("shiki/langs/ini.mjs")],
  ["javascript", javascript],
  ["js", javascript],
  ["json", () => import("shiki/langs/json.mjs")],
  ["python", python],
  ["py", python],
  ["sql", () => import("shiki/langs/sql.mjs")],
  ["toml", () => import("shiki/langs/toml.mjs")],
  ["tsx", () => import("shiki/langs/tsx.mjs")],
  ["typescript", typescript],
  ["ts", typescript],
  ["yaml", yaml],
  ["yml", yaml],
]);

let highlighter: Promise<HighlighterCore> | undefined;

export async function highlight(code: string, language: string | undefined): Promise<string> {
  highlighter ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });

  const shiki = await highlighter;
  const name = language?.toLowerCase() ?? "";
  const grammar = grammars.get(name);

  if (grammar && !shiki.getLoadedLanguages().includes(name)) {
    await shiki.loadLanguage(...(await grammar()).default);
  }

  return shiki.codeToHtml(code, {
    lang: grammar ? name : "text",
    themes: { light: "github-light", dark: "github-dark" },
  });
}
