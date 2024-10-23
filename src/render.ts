import type { HmmOptions } from "./types.ts";
import {
  getParseOptions,
  mergeInlineNodes,
  Node,
  parseHTML,
} from "@dbushell/hyperless";
import { splitCode } from "./utils.ts";
import { parentTags, parseTags } from "./html.ts";

const parseOptions = getParseOptions();

/** Render inline Markdown */
export const renderInline = async (
  text: string,
  options: HmmOptions,
): Promise<string> => {
  for (const plugin of options.inlinePlugins) {
    if (["anchor", "code"].includes(plugin.type)) {
      text = await plugin.render(text, options);
    } else {
      text = await splitCode(text, (part) => plugin.render(part, options));
    }
  }
  return text;
};

/** Apply inline render to text nodes */
export const renderTextNodes = async (
  node: Node,
  options: HmmOptions,
): Promise<void> => {
  if (node.tag === "pre") return;
  if (node.tag === "code") return;
  if (node.type === "OPAQUE") return;
  if (node.type === "TEXT") {
    node.raw = await renderInline(node.raw, options);
    return;
  }
  await Promise.all(
    node.children.map((child) => renderTextNodes(child, options)),
  );
};

/** Parse and render inline HTML and Markdown */
export const renderNode = async (
  text: string,
  options: HmmOptions,
  tag?: string,
): Promise<{ text: string; node: Node }> => {
  const node = parseHTML(text, { ...parseOptions, rootTag: tag ?? "html" });

  // Flag child nodes to ignore
  node.traverse((n) => {
    if (parseTags.has(n.tag)) return;
    node.type === "OPAQUE";
  });

  // Render inline markdown and then merge
  await renderTextNodes(node, options);
  mergeInlineNodes(node);

  // Find text Nodes that need paragraphs
  const wrapNodes: Array<Node> = [];
  node.traverse((n) => {
    if (n.tag === "p") return false;
    if (n.type !== "TEXT") return;
    if (n.parent === null) return;
    if (parentTags.has(n.parent.tag)) {
      wrapNodes.push(n);
    }
  });

  // Wrap text Nodes in paragraphs
  for (const oldText of wrapNodes) {
    // Collapse excess whitespace
    let raw = oldText.raw.trim();
    raw = raw.replace(/\n{3,}/g, "\n\n");
    // Iterate paragraphs
    for (const str of oldText.raw.split("\n\n")) {
      // Skip empty lines
      if (/^\s*$/.test(str)) continue;
      // Create new text Node
      const newText = parseHTML(str);
      // Do not wrap single <img> elements
      if (newText.size === 1 && newText.at(0)?.tag === "img") {
        oldText.before(newText);
        continue;
      }
      // Handle line breaks
      newText.traverse((n) => {
        if (n.type !== "TEXT") return;
        if (n.previous === null) {
          n.raw = n.raw.replace(/^\s*\n/g, "");
        }
        if (n.next === null) {
          n.raw = n.raw.replace(/\n\s*$/g, "");
        }
        n.raw = n.raw.replaceAll("\n", "<br/>");
      });
      // Wrap in paragraph Node
      const p = new Node(null, "ELEMENT", "<p>", "p");
      p.append(newText);
      oldText.before(p);
    }
    // Remove original Node
    oldText.detach();
  }

  return { node, text: node.toString() };
};
