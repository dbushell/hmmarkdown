import type { BlockPlugin, HmmBlock, HmmOptions } from "../types.ts";
import { renderNode } from "../render.ts";

const plugin: BlockPlugin = {
  type: "blockquote",
  multiline: true,
  matchStart: (line: string, index: number): boolean => {
    // Allow empty line in middle of blockquote
    if (index > 0 && line === ">") return true;
    // Otherwise require two characters
    if (line.length < 2) return false;
    if (line[0] !== ">") return false;
    if (line[1] !== " ") return false;
    return true;
  },
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    block.render = "<blockquote>";
    for (let line of block.lines) {
      // Skip empty lines
      line = line.substring(2);
      if (/^\s*$/.test(line)) continue;
      block.render += await renderNode(line, options, "blockquote");
    }
    block.render += "</blockquote>";
    return block.render;
  },
};

export default plugin;
