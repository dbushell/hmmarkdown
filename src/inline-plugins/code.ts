import type {InlinePlugin} from '../types.ts';
import {replace2} from '../utils.ts';
import {escape} from '../vendor/std-html.ts';

const REGEXP = /`([^`]+)`/g;

const plugin: InlinePlugin = {
  type: 'code',
  prerender: (text: string) => {
    if (text.indexOf('`') === -1) return text;
    // Inline code is escaped early to avoid `<div>` being parsed as HTML node
    for (const match of text.matchAll(REGEXP)) {
      text = replace2(text, match[0], escape(match[0]));
    }
    return text;
  },
  render: (text: string) => {
    for (const match of text.matchAll(REGEXP)) {
      text = replace2(text, match[0], `<code>${match[1]}</code>`);
    }
    return Promise.resolve(text);
  }
};

export default plugin;
