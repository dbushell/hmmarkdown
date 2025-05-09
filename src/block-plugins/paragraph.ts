import { mergeInlineNodes, Node } from "@dbushell/hyperless";
import { renderNode } from "../render.ts";
import type { BlockPlugin, HmmBlock, HmmOptions } from "../types.ts";
import { parentTags } from "../html.ts";
import { hmmarkdown } from "../mod.ts";
import { parseHTML } from "../utils.ts";

/** @todo Configurable option? */
const tab = "  ";

const plugin: BlockPlugin = {
  type: "paragraph",
  multiline: true,
  matchStart: () => false,
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    if (block.lines.length === 1 && block.lines[0] === "") {
      return "";
    }
    // Parse content as HTML and merge inline elements.
    // e.g. "Start <b>middle</b> end." becomes one text node.
    const content = block.lines.join("\n");
    const root = parseHTML(content, options);
    mergeInlineNodes(root, options.inlineTags);

    const render = async (node: Node) => {
      for (const child of node.children) {
        if (child.type === "TEXT") {
          let { raw } = child;
          // Pass nested text through the block level parser
          if (node.depth) {
            const indent = new RegExp(`^${tab.repeat(node.depth)}`, "gm");
            raw = raw.replace(indent, "");
            child.raw = await hmmarkdown(raw);
            continue;
          }
          // Render inline markdown only
          child.raw = await renderNode(raw, options, "html");
          continue;
        }
        // Recurse special elements
        if (parentTags.has(child.tag)) {
          await render(child);
          continue;
        }
        // For other elements render inline markdown
        const text = await renderNode(child.toString(), options, "html");
        const textNode = new Node(null, "TEXT", text);
        child.replace(textNode);
      }
    };

    await render(root);
    block.render = root.toString();
    return block.render;
  },
};

export default plugin;
