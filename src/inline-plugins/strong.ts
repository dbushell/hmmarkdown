import type {InlinePlugin} from '../types.ts';

const REGEXP = /(\*\*|__)(.+?)\1/g;

const plugin: InlinePlugin = {
  type: 'strong',
  render: (text: string) => {
    text = text.replace(REGEXP, '<strong>$2</strong>');
    return Promise.resolve(text);
  }
};

export default plugin;
