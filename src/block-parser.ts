import type { HmmBlock, HmmOptions } from "./types.ts";

/** Transform lines into Markdown blocks */
export const blockParser = (
  allLines: Array<string>,
  options: HmmOptions,
): Array<HmmBlock> => {
  const blocks: Array<HmmBlock> = [];

  let type: string | undefined;
  let lines: Array<string> = [];
  let matches: Array<string> = [];

  // Flush multi-line block and reset parser
  const flushBuffer = () => {
    if (type === undefined) throw new Error("undefined type");
    blocks.push({
      type,
      lines,
      matches,
      render: "",
    });
    type = undefined;
    lines = [];
    matches = [];
  };

  nextLine: while (allLines.length) {
    const line = allLines.shift()!;
    // Work with previous multi-line block
    if (type) {
      const plugin = options.blockPlugins.find((p) => p.type === type);
      if (plugin === undefined) throw new Error("undefined plugin");
      // Check for end of multi-line block
      if (plugin.matchEnd) {
        lines.push(line);
        if (plugin.matchEnd(line)) {
          flushBuffer();
        }
        continue;
      }
      // Check for continuation of multi-line block
      if (plugin.matchStart(line, lines.length)) {
        lines.push(line);
        continue;
      }
      flushBuffer();
      continue;
    }
    // Check for new block match
    for (const plugin of options.blockPlugins) {
      let newMatches = plugin.matchStart(line, 0);
      if (newMatches === false) {
        continue;
      }
      newMatches = Array.isArray(newMatches) ? newMatches : [];
      // Empty lines as default block
      if (lines.length) {
        blocks.push({
          lines,
          type: "paragraph",
          matches: [],
          render: "",
        });
        lines = [];
      }
      if (plugin.multiline) {
        type = plugin.type;
        matches = newMatches;
        lines.push(line);
        continue nextLine;
      }
      blocks.push({
        type: plugin.type,
        matches: newMatches,
        lines: [line],
        render: "",
      });
      continue nextLine;
    }
    // Continue with default paragraph block
    lines.push(line);
  }
  // Empty leftover lines
  if (lines.length) {
    blocks.push({
      lines,
      type: type ?? "paragraph",
      matches: [],
      render: "",
    });
  }
  return blocks;
};
