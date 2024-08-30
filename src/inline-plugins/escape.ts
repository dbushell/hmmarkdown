import type {InlinePlugin} from '../types.ts';
import {escape, unescape, type EntityList} from '../vendor/std-html.ts';

const entityList: EntityList = Object.fromEntries([
  // Initial list
  ['&amp;', '&'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&quot;', '"'],
  ['&#39;', "'"],
  // Original list
  ['&apos;', "'"],
  ['&nbsp;', '\xa0'],
  // Extended list
  ['&ndash;', '–'],
  ['&mdash;', '—'],
  ['&copy;', '©'],
  ['&hellip;', '…']
]);

const plugin: InlinePlugin = {
  type: 'escape',
  render: (text: string) => {
    text = unescape(text, {entityList});
    text = escape(text);
    return Promise.resolve(text);
  }
};

export default plugin;
