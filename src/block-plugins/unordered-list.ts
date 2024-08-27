import type {HmmBlock, BlockPlugin, HmmOptions} from '../types.ts';
import {renderNode} from '../render.ts';

/**
 * @todo Handle nested and indented lists
 */
const plugin: BlockPlugin = {
  type: 'unorderedList',
  multiline: true,
  matchStart: (line: string, index: number): boolean => {
    if (index > 0 && /^\s{4}[^\s]/.test(line)) return true;
    if (line[0] !== '*') return false;
    if (line[1] !== ' ') return false;
    return true;
  },
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    block.render = '<ul>';
    // Merge space-indented lines
    const lines: Array<string> = [];
    for (let i = 0; i < block.lines.length; i++) {
      const line = block.lines[i];
      if (line.trim() === '') continue;
      if (line[0] === '*') {
        lines.push(line.substring(2));
      } else {
        lines[lines.length - 1] += `<br>${line}`;
      }
    }
    for (const line of lines) {
      const {text} = await renderNode(line, options, 'ul');
      block.render += `<li>${text}</li>`;
    }
    block.render += '</ul>';
    return block.render;
  }
};

export default plugin;
