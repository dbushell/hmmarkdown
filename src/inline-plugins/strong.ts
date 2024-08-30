import type {InlinePlugin} from '../types.ts';

// Allow underscore syntax but don't tell anyone
const REGEXP = /(\*\*|__)(.+?)\1/g;

const plugin: InlinePlugin = {
  type: 'strong',
  render: (text: string) => {
    // Used to track `text.length` increase because `match.index` doesn't
    let startOffset = 0;
    for (const match of text.matchAll(REGEXP)) {
      // Text to replace
      const search = match[0];
      // Match extra character at end allowing for nested emphasis
      // For example: `***stronger***` will become:
      // <strong><em>stronger</em></strong>
      let extra = '';
      const endOffset = startOffset + match.index + search.length;
      for (let i = endOffset; i < text.length; i++) {
        if (text[i] === search[0]) {
          extra += search[0];
        } else {
          break;
        }
      }
      const length = text.length;
      text = text.replace(
        search + extra,
        () => `<strong>${match[2]}${extra}</strong>`
      );
      startOffset += text.length - length;
    }
    return Promise.resolve(text);
  }
};

export default plugin;
