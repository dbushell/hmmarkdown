import type {InlinePlugin} from '../types.ts';

const REGEXP = /(\*|_)(.+?)\1/g;

const plugin: InlinePlugin = {
  type: 'emphasis',
  render: (text: string) => {
    text = text.replace(REGEXP, '<em>$2</em>');
    return Promise.resolve(text);
  }
};

export default plugin;
