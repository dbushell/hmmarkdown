import type {HmmBlock, HmmOptions} from './types.ts';
import {BlockStream} from './block-stream.ts';
import {blockGenerator} from './block-generator.ts';
import {TextLineStream} from './vendor/std-streams.ts';

// Block Plugins
import blockBlockquote from './block-plugins/blockquote.ts';
import blockHeading from './block-plugins/heading.ts';
import blockHorizontalRule from './block-plugins/horizontal-rule.ts';
import blockImage from './block-plugins/image.ts';
import blockOrderedList from './block-plugins/ordered-list.ts';
import blockParagraph from './block-plugins/paragraph.ts';
import blockPreformatted from './block-plugins/preformatted.ts';
import blockUnorderedList from './block-plugins/unordered-list.ts';

// Inline Plugins
import inlineAnchor from './inline-plugins/anchor.ts';
import inlineCode from './inline-plugins/code.ts';
import inlineDeleted from './inline-plugins/deleted.ts';
import inlineEmphasis from './inline-plugins/emphasis.ts';
import inlineEscape from './inline-plugins/escape.ts';
import inlineImage from './inline-plugins/image.ts';
import inlineStrong from './inline-plugins/strong.ts';
import inlineTypography from './inline-plugins/typography.ts';

// Default options
export const defaultOptions: HmmOptions = {
  blockPlugins: [
    blockBlockquote,
    blockPreformatted,
    blockHeading,
    blockHorizontalRule,
    blockImage,
    blockOrderedList,
    blockUnorderedList,
    blockParagraph
  ],
  // Order is significant
  inlinePlugins: [
    inlineTypography,
    inlineEscape,
    inlineImage,
    inlineAnchor,
    inlineCode,
    inlineStrong,
    inlineEmphasis,
    inlineDeleted
  ],
  blockFilters: {},
  inlineFilters: {}
};

export const parse = async (
  input: string | ReadableStream<Uint8Array>,
  options = defaultOptions
): Promise<Array<Promise<string>>> => {
  let stream: ReadableStream<HmmBlock> | AsyncGenerator<HmmBlock, void, void>;

  if (typeof input === 'string') {
    // Read string input
    const lines = input.split('\n');
    stream = blockGenerator(lines, options);
  } else {
    // Read streamable input
    stream = input
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
      .pipeThrough(new BlockStream(options));
  }

  // Get pre-render plugins
  const prerender = options.inlinePlugins.filter((plugin) =>
    Object.hasOwn(plugin, 'prerender')
  );

  // Final block renders
  const blocks: Array<Promise<string>> = [];

  for await (const block of stream) {
    // Apply pre-render plugins to all lines
    if (block.type !== 'preformatted') {
      for (let i = 0; i < block.lines.length; i++) {
        prerender.forEach((plugin) => {
          block.lines[i] = plugin.prerender!(block.lines[i], options);
        });
      }
    }
    // Start block render
    const plugin = options.blockPlugins.find((p) => p.type === block.type)!;
    blocks.push(Promise.resolve(plugin.render(block, options)));
  }
  return blocks;
};

/** Render Markdown stream to HTML */
export const hmmarkdown = async (
  input: string | ReadableStream<Uint8Array>,
  options = defaultOptions
): Promise<string> => {
  const blocks = await parse(input, options);
  return (await Promise.all(blocks)).join('');
};

/** Apply typography inline plugin */
export const hmmtypography = (input: string): Promise<string> =>
  inlineTypography.render(input, defaultOptions);
