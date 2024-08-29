import type {HmmOptions, InlinePlugin} from '../types.ts';
import {replace2} from '../utils.ts';
import {escape} from '../vendor/std-html.ts';

const REGEXP = /!\[([^\]]+)\]\(([^()\s]+)\)/g;

const plugin: InlinePlugin = {
  type: 'image',
  render: async (text: string, options: HmmOptions): Promise<string> => {
    if (text.indexOf('![') === -1) {
      return Promise.resolve(text);
    }
    for (const match of text.matchAll(REGEXP)) {
      const props = {
        attributes: {
          alt: match[1],
          src: match[2]
        },
        before: '',
        after: ''
      };
      const filter = options.blockFilters.image;
      if (filter) await filter(props);
      const attr = Object.entries(props.attributes)
        .map(([k, v]) => `${k}="${escape(v)}"`)
        .join(' ');
      text = replace2(
        text,
        match[0],
        `${props.before}<img ${attr}>${props.after}`
      );
    }
    return Promise.resolve(text);
  }
};

export default plugin;
