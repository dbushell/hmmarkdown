import type {HmmBlock, HmmOptions} from './types.ts';

export async function* blockGenerator(
  allLines: Array<string>,
  options: HmmOptions
): AsyncGenerator<HmmBlock, void, void> {
  // Buffers
  let type: string | undefined;
  let lines: Array<string> = [];
  let matches: Array<string> = [];

  while (allLines.length) {
    const line = allLines.shift()!;
    // Work with previous multi-line block
    if (type) {
      const plugin = options.blockPlugins.find((p) => p.type === type);
      if (plugin === undefined) throw new Error('undefined plugin');
      // Check for end of multi-line block
      if (plugin.matchEnd) {
        lines.push(line);
        if (plugin.matchEnd(line)) {
          if (type === undefined) throw new Error('undefined type');
          yield {
            type,
            lines,
            matches,
            render: ''
          };
          type = undefined;
          lines = [];
          matches = [];
        }
        continue;
      }
      // Check for continuation of multi-line block
      if (plugin.matchStart(line, lines.length)) {
        lines.push(line);
        continue;
      }
      if (type === undefined) throw new Error('undefined type');
      yield {
        type,
        lines,
        matches: matches,
        render: ''
      };
      type = undefined;
      lines = [];
      matches = [];
      continue;
    }
    // Check for new block match
    let found = false;
    for (const plugin of options.blockPlugins) {
      let newMatches = plugin.matchStart(line, 0);
      if (newMatches === false) {
        continue;
      }
      found = true;
      newMatches = Array.isArray(newMatches) ? newMatches : [];
      // Empty lines as default block
      if (lines.length) {
        yield {
          lines,
          type: 'paragraph',
          matches: [],
          render: ''
        };
        lines = [];
      }
      if (plugin.multiline) {
        type = plugin.type;
        matches = newMatches;
        lines.push(line);
        break;
      }
      yield {type: plugin.type, matches: newMatches, lines: [line], render: ''};
      break;
    }
    // Continue with default paragraph block
    if (found == false) {
      lines.push(line);
    }
  }
  // Empty leftover lines
  if (lines.length) {
    yield {
      lines,
      type: type ?? 'paragraph',
      matches: [],
      render: ''
    };
  }
}
