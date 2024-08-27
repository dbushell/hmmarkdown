import type {HmmBlock, BlockPlugin, HmmOptions} from '../types.ts';
import {escape} from '../vendor/std-html.ts';

const REGEXP = /^```\s?(\w*)\s*$/;

const plugin: BlockPlugin = {
  type: 'preformatted',
  multiline: true,
  matchStart: (line: string): false | Array<string> => {
    if (line[0] !== '`') return false;
    if (line[1] !== '`') return false;
    if (line[2] !== '`') return false;
    const match = line.match(REGEXP);
    return match ? [match[1]] : false;
  },
  matchEnd: (line: string): boolean => {
    return line === '```';
  },
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    const code = block.lines.slice(1, block.lines.length - 1).join('\n');
    const props = {
      code,
      attributes: {
        'data-lang': block.matches[0],
        tabindex: '0'
      }
    };
    const filter = options.blockFilters.preformatted;
    if (filter) await filter(props);
    const attr = Object.entries(props.attributes)
      .map(([k, v]) => `${k}="${escape(v)}"`)
      .join(' ');
    block.render = `<pre ${attr}>`;
    block.render += `<code>${props.code}</code>`;
    block.render += `</pre>`;
    return block.render;
  }
};

export default plugin;
