import type { HmmOptions } from "./types.ts";
import {
  getParseOptions,
  inlineTags,
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

/** Apply image render to top-level HTML `<img>` nodes */

// Convert inline tags to text nodes
const mergeText = (n: Node) => {
  for (const child of [...n.children]) {
    if (child.type === "OPAQUE") {
      continue;
    }
    mergeText(child);
    // Merge adjacent text nodes
    if (child.type === "TEXT" && child.previous?.type === "TEXT") {
      child.previous.raw += child.toString();
      child.detach();
      continue;
    }
    if (inlineTags.has(child.tag)) {
      // Merge inline into previous text node
      if (child.previous?.type === "TEXT") {
        child.previous.raw += child.toString();
        child.detach();
        continue;
      }
      // Convert inline to text node
      child.replace(new Node(null, "TEXT", child.toString()));
      continue;
    }
  }
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
  mergeText(node);

  // Wrap paragraphs
  /** @todo queue worker later? */
  node.traverse((n) => {
    if (n.type !== "TEXT") return;
    if (n.parent === null) return;
    if (n.tag === "p") return false;
    if (parentTags.has(n.parent.tag)) {
      const p = new Node(null, "ELEMENT", "<p>", "p");
      n.replace(p);
      p.append(n);
    }
  });

  // Replace excess whitespace in paragraphs
  const remove = new Set<Node>();
  node.traverse((n) => {
    if (n.tag !== "p") return;
    let raw = n.children[0].raw;
    raw = raw.trim();
    raw = raw.replace(/\n{3,}/g, "\n\n");
    if (raw.length === 0 || /^\s+$/.test(raw)) {
      remove.add(n);
      return;
    }
    raw = raw.replaceAll("\n\n", "</p><p>");
    raw = raw.replaceAll("\n", "<br/>");
    n.children[0].raw = raw;
  });
  remove.forEach((n) => n.detach());

  text = node.toString();
  return { text, node };
};
