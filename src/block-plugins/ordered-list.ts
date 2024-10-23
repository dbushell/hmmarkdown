import type { BlockPlugin, HmmBlock, HmmOptions } from "../types.ts";
import { renderNode } from "../render.ts";

const REGEXP = /^\d+\.\s+/;

/**
 * @todo Handle nested and indented lists
 */
const plugin: BlockPlugin = {
  type: "orderedList",
  multiline: true,
  matchStart: (line: string, index: number): boolean => {
    if (index > 0 && /^\s{4}[^\s]/.test(line)) return true;
    return REGEXP.test(line);
  },
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    block.render = "<ol>";
    // Merge space-indented lines
    const lines: Array<string> = [];
    for (let i = 0; i < block.lines.length; i++) {
      const line = block.lines[i];
      if (/^\s*$/.test(line)) continue;
      if (line.startsWith("    ")) {
        lines[lines.length - 1] += `<br>${line}`;
      } else {
        lines.push(line.replace(/^\d+\.\s+/, ""));
      }
    }
    for (const line of lines) {
      const text = await renderNode(line, options, "li");
      block.render += `<li>${text}</li>`;
    }
    block.render += "</ol>";
    return block.render;
  },
};

export default plugin;
