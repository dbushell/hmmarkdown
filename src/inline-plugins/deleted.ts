import type {InlinePlugin} from '../types.ts';

const REGEXP = /(~~)(.+?)\1/g;

const plugin: InlinePlugin = {
  type: 'deleted',
  render: (text: string) => {
    text = text.replace(REGEXP, '<del>$2</del>');
    return Promise.resolve(text);
  }
};

export default plugin;
