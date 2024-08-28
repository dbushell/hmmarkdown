import type {InlinePlugin, HmmOptions} from '../types.ts';
import {renderInline} from '../render.ts';
import {replace} from '../utils.ts';
import {escape} from '../vendor/std-html.ts';

const REGEXP = /(?<!\!)\[(.+?)\]\(([^()\s]+)\)/g;

// Apply to anchor text content
const inlinePlugins = ['deleted', 'emphasis', 'strong'];

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
  let anchor = '';
  let href = '';
  let text = '';
  let startHref = false;
  let startText = false;
  for (let end = -1, i = match[0].length - 1; i >= 0; i--) {
    const char = match[0][i];
    anchor += char;
    if (startHref) href += char;
    if (startText) text += char;
    if (!startText) {
      if (char === ')') startHref = true;
      if (char === '(') {
        startHref = false;
        startText = true;
      }
    }
    if (char === ']') end = end === -1 ? 1 : end + 1;
    if (char === '[') end--;
    if (end === 0) break;
  }
  return {
    anchor: [...anchor].reverse().join(''),
    href: [...href.slice(0, -1)].reverse().join(''),
    text: [...text.slice(1, -1)].reverse().join('')
  };
};

const plugin: InlinePlugin = {
  type: 'anchor',
  render: async (out: string, options: HmmOptions) => {
    // Find unprocessed inline code markdown
    const codeOffsets: Array<[number, number]> = [];
    if (out.indexOf('`') !== -1) {
      for (const code of out.matchAll(/`[^`]+`/g)) {
        codeOffsets.push([code.index, code.index + code[0].length]);
      }
    }
    for (const match of out.matchAll(REGEXP)) {
      // const {0: anchor, 1: text, 2: href} = match;
      // Get the true match
      const reduced = reduceMatch(match);
      const {anchor, href, text} = reduced;

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

      const props = {text, attributes: {href}};
      props.text = await renderInline(props.text, {
        ...options,
        inlinePlugins: options.inlinePlugins.filter((plugin) =>
          inlinePlugins.includes(plugin.type)
        )
      });
      const filter = options.inlineFilters.anchor;
      if (filter) await filter(props);
      const attr = Object.entries(props.attributes)
        .map(([k, v]) => `${k}="${escape(v)}"`)
        .join(' ');
      out = replace(out, anchor, `<a ${attr}>${props.text}</a>`);
    }
    return out;
  }
};

export default plugin;
