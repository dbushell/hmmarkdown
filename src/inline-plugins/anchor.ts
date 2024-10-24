import type { HmmOptions, InlinePlugin } from "../types.ts";
import { renderInline } from "../render.ts";
import { escape } from "@dbushell/hyperless";

const REGEXP = /(?<!\!)\[(.+?)\]\(([^()\s]+)\)/g;

// Apply to anchor text content
const inlinePlugins = ["deleted", "emphasis", "strong"];

/**
Okay hear me out... given the following markdown line:

This [emoji] 🍋‍🟩 is a [lime 🍋‍🟩](https://emojipedia.org/lime) ok?

`REGEXP` will capture too much: "[emoji".."lime)"
My solution is to walk backgrounds through the matched characters.
I count the nested square bracket groups and end on zero.
Parentheses in URLs must be URL encoded.

Acceptable fails:
  * Anchor `text` has uneven square brackets inside
  * Anchor `href` has un-encoded parentheses

*/
const reduceMatch = (match: RegExpExecArray) => {
  const anchor = [];
  const href = [];
  const text = [];
  let startHref = false;
  let startText = false;
  for (let end = -1, i = match[0].length - 1; i >= 0; i--) {
    const char = match[0][i];
    anchor.push(char);
    if (startHref) href.push(char);
    if (startText) text.push(char);
    if (!startText) {
      if (char === ")") startHref = true;
      if (char === "(") {
        startHref = false;
        startText = true;
      }
    }
    if (char === "]") end = end === -1 ? 1 : end + 1;
    if (char === "[") end--;
    if (end === 0) break;
  }
  return {
    anchor: anchor.reverse().join(""),
    href: href.reverse().slice(1).join(""),
    text: text.reverse().slice(1, -1).join(""),
  };
};

const plugin: InlinePlugin = {
  type: "anchor",
  render: async (out: string, options: HmmOptions) => {
    // Find unprocessed inline code markdown
    const codeOffsets: Array<[number, number]> = [];
    if (out.includes("`") !== false) {
      for (const code of out.matchAll(/`[^`]+`/g)) {
        codeOffsets.push([code.index, code.index + code[0].length]);
      }
    }
    for (const match of out.matchAll(REGEXP)) {
      // Get the true match
      const reduced = reduceMatch(match);
      let { anchor, href, text } = reduced;
      // Skip if anchor falls within a code offset
      if (codeOffsets.length) {
        const start = match.index + (match[0].length - anchor.length);
        const end = start + anchor.length;
        let skip = false;
        for (const code of codeOffsets) {
          if (start > code[0] && end < code[1]) {
            skip = true;
            break;
          }
        }
        if (skip) continue;
      }
      text = await renderInline(text, {
        ...options,
        inlinePlugins: options.inlinePlugins.filter((plugin) =>
          inlinePlugins.includes(plugin.type)
        ),
      });
      out = out.replace(anchor, () => `<a href="${escape(href)}">${text}</a>`);
    }
    return out;
  },
};

export default plugin;
