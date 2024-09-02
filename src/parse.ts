import {parseElements, voidElements} from './html.ts';
import {HmmNode} from './node.ts';

/** Parse text into node tree */
export const parseNode = (text: string, tag = 'html'): HmmNode => {
  // Setup root node
  const root = new HmmNode(null, 'root', '', tag);
  // Set root as starting parent
  let parent: HmmNode = root;
  // Find first tag
  let offset = text.indexOf('<');
  // Check minimum tag length
  while (offset >= 0 && offset < text.length - 2) {
    // Skip to start of tag
    if (offset > 0) {
      parent.append(new HmmNode(parent, 'text', text.substring(0, offset)));
      text = text.substring(offset);
      offset = 0;
    }
    // Find next HTML comment or tag
    const tag = text.match(/^<!--[\s\S]*?-->|^<\/?([a-zA-Z][\w:-]*)([^>]*)>/);
    if (!tag) {
      offset = text.substring(1).indexOf('<');
      // Add one to account for substring if found
      if (offset >= 0) offset += 1;
      continue;
    }
    // Ignore comments, self-closing, and void tags
    const isVoid =
      tag[0].startsWith(`<!--`) ||
      tag[0].endsWith('/>') ||
      voidElements.includes(tag[1]);
    if (isVoid) {
      parent.append(new HmmNode(parent, 'void', tag[0], tag[1]));
      text = text.substring(tag[0].length);
      offset = text.indexOf('<');
      continue;
    }
    // Opening or closing node?
    const isClose = tag[0].startsWith('</');
    const node = new HmmNode(
      parent,
      isClose ? 'close' : 'open',
      tag[0],
      tag[1]
    );
    parent.append(node);
    if (isClose) {
      parent = parent.parent;
      if (parent === undefined) {
        throw new Error('descended past root node');
      }
    } else {
      parent = node;
    }
    text = text.substring(tag[0].length);
    offset = text.indexOf('<');
  }
  // Append leftover text
  if (text.length) {
    parent.append(new HmmNode(parent, 'text', text));
  }
  // Merge void and unparsable nodes
  root.merge(
    (node: HmmNode) =>
      node.type === 'open' && !parseElements.includes(node.tag ?? '')
  );
  return root;
};
