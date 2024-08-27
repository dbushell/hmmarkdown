import type {HmmBlock, BlockPlugin, HmmOptions} from '../types.ts';
import {escape} from '../vendor/std-html.ts';

const REGEXP = /^!\[([^\]]+)\]\(([^()\s]+)\)/;
// const REGEXP = /^!\[([^\]]+)\]\(([^)]+)\)/;

/**
 * @todo Allow optional title syntax?
 */
const plugin: BlockPlugin = {
  type: 'image',
  multiline: false,
  matchStart: (line: string): false | Array<string> => {
    if (line[0] !== '!') return false;
    if (line[1] !== '[') return false;
    if (line[line.length - 1] !== ')') return false;
    const match = line.match(REGEXP);
    return match ? [match[1], match[2]] : false;
  },
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    const props = {
      attributes: {
        alt: block.matches[0],
        src: block.matches[1]
      },
      before: '',
      after: ''
    };
    if (typeof block.matches[2] === 'object') {
      props.attributes = {
        ...props.attributes,
        ...(block.matches[2] as object)
      };
    }
    const filter = options.blockFilters.image;
    if (filter) await filter(props);
    const attr = Object.entries(props.attributes)
      .map(([k, v]) => `${k}="${escape(v)}"`)
      .join(' ');
    block.render = `${props.before}<img ${attr}>${props.after}`;
    return block.render;
  }
};

export default plugin;
