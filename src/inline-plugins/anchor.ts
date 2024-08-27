import type {InlinePlugin, HmmOptions} from '../types.ts';
import {renderInline} from '../render.ts';
import {replace} from '../utils.ts';
import {escape} from '../vendor/std-html.ts';

// const REGEXP = /\[([^\]]+)\]\(([^()\s]+)\)/g;
// const REGEXP = /\[(.+?)\]\(([^()\s]+)\)/g;
const REGEXP = /(?<!\!)\[(.+?)\]\(([^()\s]+)\)/g;

const inlinePlugins = ['emphasis', 'strong'];

const plugin: InlinePlugin = {
  type: 'anchor',
  render: async (out: string, options: HmmOptions) => {
    for (const match of out.matchAll(REGEXP)) {
      const {0: anchor, 1: text, 2: href} = match;
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
