import type {HmmOptions} from './types.ts';
import type {HmmNode} from './node.ts';
import {parseNode} from './parse.ts';
import {inlineElements} from './html.ts';
import {splitCode} from './utils.ts';

/** Render inline Markdown */
export const renderInline = async (
  text: string,
  options: HmmOptions
): Promise<string> => {
  for (const plugin of options.inlinePlugins) {
    if (['anchor', 'code'].includes(plugin.type)) {
      text = await plugin.render(text, options);
    } else {
      text = await splitCode(text, (part) => plugin.render(part, options));
    }
  }
  return text;
};

/** Apply inline render to text nodes */
export const renderTextNodes = async (
  root: HmmNode,
  options: HmmOptions
): Promise<void> => {
  if (root.tag === 'code') return;
  if (root.type === 'text') {
    root.text = await renderInline(root.text, options);
  }
  if (root.children.length === 0) {
    return;
  }
  const work = [];
  for (const node of root.children) {
    work.push(renderTextNodes(node, options));
  }
  await Promise.all(work);
};

/** Apply image render to top-level HTML `<img>` nodes */
export const renderImageNodes = async (
  root: HmmNode,
  options: HmmOptions
): Promise<void> => {
  const imagePlugin = options.blockPlugins.find(
    (plugin) => plugin.type === 'image'
  );
  if (!imagePlugin) return;
  const work: Array<Promise<void>> = [];
  for (const node of root.children) {
    if (node.children.length) {
      work.push(renderImageNodes(node, options));
    }
    if (node.tag !== 'img') {
      continue;
    }
    node.text = node.text.replaceAll('\n', ' ');
    const attributes: Record<string, string> = {};
    const regex = /([\w:.-]+)\s*=\s*(["'])(.*?)\2/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(node.text)) !== null) {
      attributes[match[1]] = match[3];
    }
    if (!attributes.src) continue;
    /** @todo Fix this hack? */
    attributes._parentTag = node.parent.tag ?? '';
    node.text = await imagePlugin.render(
      {
        type: 'image',
        lines: [node.text],
        /** @todo Fix this hack? */
        matches: ['', '', attributes as unknown as string],
        render: ''
      },
      options
    );
  }
  await Promise.all(work);
};

/** Parse and render inline HTML and Markdown */
export const renderNode = async (
  text: string,
  options: HmmOptions,
  tag?: string
): Promise<{text: string; node: HmmNode}> => {
  const node = parseNode(text, tag);
  await renderTextNodes(node, options);
  // Merge rendered text inlines nodes
  node.merge(
    (node) => node.type === 'open' && inlineElements.includes(node.tag ?? ''),
    'text'
  );
  node.mergeText();
  await renderImageNodes(node, options);
  text = node.flatten();
  return {text, node};
};
