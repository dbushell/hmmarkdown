import {renderNode} from '../render.ts';
import type {HmmBlock, BlockPlugin, HmmOptions} from '../types.ts';

const plugin: BlockPlugin = {
  type: 'paragraph',
  multiline: true,
  matchStart: () => false,
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    if (block.lines.length === 1 && block.lines[0] === '') {
      return '';
    }
    const line = block.lines.join('\n');
    const {text} = await renderNode(line, options, 'html');
    block.render = text;
    return block.render;
  }
};

export default plugin;
