import type {InlinePlugin, HmmOptions} from '../types.ts';
import {renderInline} from '../render.ts';
import {replace} from '../utils.ts';
import {escape} from '../vendor/std-html.ts';

const REGEXP = /(?<!\!)\[(.+?)\]\(([^()\s]+)\)/g;

/*

Okay hear me out...
Give the following markdown line:

This [emoji] 🍋‍🟩 is a [lime 🍋‍🟩](https://emojipedia.org/lime) ok?

REGEXP will capture too much: "[emoji".."lime)"
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

const inlinePlugins = ['emphasis', 'strong'];

const plugin: InlinePlugin = {
  type: 'anchor',
  render: async (out: string, options: HmmOptions) => {
    for (const match of out.matchAll(REGEXP)) {
      const reduced = reduceMatch(match);
      const {anchor, href, text} = reduced;
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
