/** Elements that cannot have children */
export const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];
Object.freeze(voidElements);

/** Inline elements that can be wrapped in a paragraph */
export const inlineElements = [
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'i',
  'ins',
  'kbd',
  'mark',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr'
];
Object.freeze(inlineElements);

/** Block elements with text nodes to wrap in a paragraph */
export const parentElements = [
  'article',
  'aside',
  'blockquote',
  'details',
  'dialog',
  'div',
  'fieldset',
  'figure',
  'footer',
  'form',
  'header',
  'html', // used by parser as root node
  'main',
  'nav',
  'search',
  'section'
];
Object.freeze(parentElements);

/** Elements to parse for markdown text content */
export const parseElements = [
  ...inlineElements,
  ...parentElements,
  'address',
  'caption',
  'dd',
  'dl',
  'dt',
  'figcaption',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hgroup',
  'li',
  'ol',
  'p',
  'ul'
];
Object.freeze(parseElements);
