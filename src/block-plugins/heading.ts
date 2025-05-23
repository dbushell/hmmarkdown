import type { BlockPlugin, HmmBlock, HmmOptions } from "../types.ts";
import { renderNode } from "../render.ts";

const REGEXP = /^(#{1,6})\s+/;

const idAttribute = (text: string) =>
  text
    // Remove diacritical marks
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    // Strip tags
    .replace(/<\/?[^>]+>/g, "")
    // Replace ampersand
    .replace(/&/g, "-and-")
    // Replace spaces with hyphen
    .replace(/\s+/g, "-")
    // Remove non-alphanumeric except hyphen
    .replace(/[^a-z0-9-]+/g, "")
    // Collapse and trim hypens
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const plugin: BlockPlugin = {
  type: "heading",
  multiline: false,
  matchStart: (line: string): false | Array<string> => {
    if (line[0] !== "#") return false;
    const match = line.match(REGEXP);
    return match ? [match[1]] : false;
  },
  render: async (block: HmmBlock, options: HmmOptions): Promise<string> => {
    let line = block.lines[0];
    line = line.replace(/^#{1,6}\s+/, "");
    const level = block.matches[0].length;

    block.render = `<h${level} id="${idAttribute(line)}">`;
    block.render += await renderNode(line, options, `h${level}`);
    block.render += `</h${level}>`;
    return block.render;
  },
};

export default plugin;
