import type {HmmBlock, HmmOptions} from './types.ts';

export class BlockStream extends TransformStream<string, HmmBlock> {
  constructor(options: HmmOptions) {
    // Buffers
    let type: string | undefined;
    let lines: Array<string> = [];
    let matches: Array<string> = [];

    super({
      flush: (controller) => {
        // Empty leftover lines
        if (lines.length) {
          controller.enqueue({
            lines,
            type: type ?? 'paragraph',
            matches: [],
            render: ''
          });
        }
      },
      transform: (line, controller) => {
        // Flush multi-line block and reset parser
        const flushBuffer = () => {
          if (type === undefined) throw new Error('undefined type');
          controller.enqueue({
            type,
            lines,
            matches,
            render: ''
          });
          type = undefined;
          lines = [];
          matches = [];
        };
        // Work with previous multi-line block
        if (type) {
          const plugin = options.blockPlugins.find((p) => p.type === type);
          if (plugin === undefined) throw new Error('undefined plugin');
          // Check for end of multi-line block
          if (plugin.matchEnd) {
            lines.push(line);
            if (plugin.matchEnd(line)) {
              flushBuffer();
            }
            return;
          }
          // Check for continuation of multi-line block
          if (plugin.matchStart(line, lines.length)) {
            lines.push(line);
            return;
          }
          flushBuffer();
          return;
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
            controller.enqueue({
              lines,
              type: 'paragraph',
              matches: [],
              render: ''
            });
            lines = [];
          }
          if (plugin.multiline) {
            type = plugin.type;
            matches = newMatches;
            lines.push(line);
            return;
          }
          controller.enqueue({
            type: plugin.type,
            matches: newMatches,
            lines: [line],
            render: ''
          });
          return;
        }
        // Continue with default paragraph block
        lines.push(line);
      }
    });
  }
}
