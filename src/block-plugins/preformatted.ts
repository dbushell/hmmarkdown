import type { BlockPlugin, HmmBlock } from "../types.ts";
import { escape } from "@dbushell/hyperless";

const REGEXP = /^```\s?(\w*)\s*$/;

const plugin: BlockPlugin = {
  type: "preformatted",
  multiline: true,
  matchStart: (line: string): false | Array<string> => {
    if (line[0] !== "`") return false;
    if (line[1] !== "`") return false;
    if (line[2] !== "`") return false;
    const match = line.match(REGEXP);
    return match ? [match[1]] : false;
  },
  matchEnd: (line: string): boolean => {
    return line === "```";
  },
  render: (block: HmmBlock): Promise<string> => {
    const code = block.lines.slice(1, block.lines.length - 1).join("\n");
    block.render = `<pre data-lang="${escape(block.matches[0])}" tabindex="0">`;
    block.render += `<code>${escape(code)}</code>`;
    block.render += `</pre>`;
    return Promise.resolve(block.render);
  },
};

export default plugin;
