import type {InlinePlugin} from '../types.ts';
import {escape} from '../vendor/std-html.ts';

const REGEXP = /`([^`]+)`/g;

const plugin: InlinePlugin = {
  type: 'code',
  prerender: (text: string) => {
    if (text.indexOf('`') === -1) return text;
    // Inline code is escaped early to avoid `<div>` being parsed as HTML node
    return text.replace(REGEXP, (...match) => escape(match[0]));
  },
  render: (text: string) => {
    text = text.replace(REGEXP, (...match) => `<code>${match[1]}</code>`);
    return Promise.resolve(text);
  }
};

export default plugin;
