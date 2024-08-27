import type {HmmNode, HmmOptions} from './types.ts';
import {parentElements, parseElements, voidElements} from './html.ts';

/** Flatten node and childen to text content */
export const flattenNode = (root: HmmNode, options: HmmOptions): string => {
  let text = root.text ?? '';
  for (const node of root.children) {
    text += flattenNode(node, options);
  }
  return text;
};

/** Merge node if callback returns true */
export const mergeNodes = (
  root: HmmNode,
  options: HmmOptions,
  callback: (node: HmmNode) => boolean,
  type: HmmNode['type'] = 'void'
) => {
  if (callback(root)) {
    root.text = flattenNode(root, options);
    root.type = type;
    root.children = [];
  }
  for (const node of root.children) {
    mergeNodes(node, options, callback, type);
  }
  return root;
};

/* Merge adjacent text nodes */
export const mergeTextNodes = (root: HmmNode, options: HmmOptions) => {
  const children: Array<HmmNode> = [];
  let group: HmmNode = {
    parent: root,
    type: 'text',
    text: '',
    children: []
  };
  const flush = () => {
    if (!group.children.length) {
      return;
    }
    let text = flattenNode(group, options);
    group.children = [];
    // Auto-format text nodes with paragraphs and breaks
    if (parentElements.includes(group.parent.tag!)) {
      text = text.trim();
      // Remove excess newlines
      while (text.includes('\n\n\n')) {
        text = text.replaceAll('\n\n\n', '\n\n');
      }
      // Wrap paragraphs
      if (text.length) {
        text = `<p>${text}</p>`;
        text = text.replaceAll('\n\n', '</p><p>');
      }
      // Replace line breaks
      if (group.parent.tag === 'html') {
        text = text.replaceAll('\n', '<br>');
      }
    }
    if (text.trim() === '') {
      return;
    }
    group.text = text;
    children.push(group);
    group = {
      parent: root,
      type: 'text',
      text: '',
      children: []
    };
  };
  for (const node of root.children) {
    if (node.type === 'text') {
      group.children.push(node);
    } else {
      flush();
      mergeTextNodes(node, options);
      children.push(node);
    }
  }
  flush();
  root.children = children;
};

/**
 * Parse text into node tree
 * @param text
 * @returns {HmmNode}
 */
export const parseNode = (
  text: string,
  options: HmmOptions,
  tag = 'html'
): HmmNode => {
  // Setup root node
  const root = {
    type: 'root',
    tag,
    children: []
  } as unknown as HmmNode;
  // Set root as starting parent
  let parent: HmmNode = root;
  // Find first tag
  let offset = text.indexOf('<');
  // Check minimum tag length
  while (offset >= 0 && offset < text.length - 2) {
    // if (text[offset] !== '<') {
    //   throw new Error('offset was not "<" symbol');
    // }
    // Skip to start of tag
    if (offset > 0) {
      parent.children.push({
        parent,
        children: [],
        type: 'text',
        text: text.substring(0, offset)
      });
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
      parent.children.push({
        type: 'void',
        text: tag[0],
        children: [],
        parent
      });
      text = text.substring(tag[0].length);
      offset = text.indexOf('<');
      continue;
    }
    // Opening or closing node?
    const isClose = tag[0].startsWith('</');
    const node: HmmNode = {
      type: isClose ? 'close' : 'open',
      text: tag[0],
      tag: tag[1],
      children: [],
      parent
    };
    if (isClose) {
      parent.children.push(node);
      parent = parent.parent;
      if (parent === undefined) {
        throw new Error('descended past root node');
      }
    } else {
      parent.children.push(node);
      parent = node;
    }
    text = text.substring(tag[0].length);
    offset = text.indexOf('<');
  }
  // Append leftover text
  if (text.length) {
    parent.children.push({
      text,
      type: 'text',
      children: [],
      parent
    });
  }
  // Merge void and unparsable nodes
  mergeNodes(
    root,
    options,
    (node: HmmNode) =>
      node.type === 'open' && !parseElements.includes(node.tag ?? '')
  );
  return root;
};
