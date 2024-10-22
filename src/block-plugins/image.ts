import type { BlockPlugin, HmmBlock } from "../types.ts";
import { escape } from "@dbushell/hyperless";

const REGEXP = /^!\[([^\]]+)\]\(([^()\s]+)\)/;

/**
 * @todo Allow optional title syntax?
 */
const plugin: BlockPlugin = {
  type: "image",
  multiline: false,
  matchStart: (line: string): false | Array<string> => {
    if (line[0] !== "!") return false;
    if (line[1] !== "[") return false;
    if (line[line.length - 1] !== ")") return false;
    const match = line.match(REGEXP);
    return match ? [match[1], match[2]] : false;
  },
  render: (block: HmmBlock): Promise<string> => {
    const alt = escape(block.matches[0]);
    const src = escape(block.matches[1]);
    block.render = `<img alt="${alt}" src="${src}">`;
    return Promise.resolve(block.render);
  },
};

export default plugin;
