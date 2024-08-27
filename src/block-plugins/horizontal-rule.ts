import type {HmmBlock, BlockPlugin, HmmOptions} from '../types.ts';

const plugin: BlockPlugin = {
  type: 'horizontalRule',
  multiline: false,
  matchStart: (line: string): boolean => {
    if (line === '***') return true;
    if (line === '---') return true;
    if (line === '___') return true;
    if (line === '* * *') return true;
    if (line === '- - -') return true;
    if (line === '_ _ _') return true;
    return false;
  },
  render: (block: HmmBlock, _options: HmmOptions): Promise<string> => {
    block.render = '<hr>';
    return Promise.resolve(block.render);
  }
};

export default plugin;
