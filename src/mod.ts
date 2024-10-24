import type { HmmBlock, HmmOptions } from "./types.ts";
import { TextLineStream } from "@std/streams/text-line-stream";
import { escape, unescape } from "@dbushell/hyperless";
import { blockParser } from "./block-parser.ts";
import { BlockStream } from "./block-stream.ts";

// Block Plugins
import blockBlockquote from "./block-plugins/blockquote.ts";
import blockHeading from "./block-plugins/heading.ts";
import blockHorizontalRule from "./block-plugins/horizontal-rule.ts";
import blockImage from "./block-plugins/image.ts";
import blockOrderedList from "./block-plugins/ordered-list.ts";
import blockParagraph from "./block-plugins/paragraph.ts";
import blockPreformatted from "./block-plugins/preformatted.ts";
import blockUnorderedList from "./block-plugins/unordered-list.ts";

// Inline Plugins
import inlineAnchor from "./inline-plugins/anchor.ts";
import inlineCode from "./inline-plugins/code.ts";
import inlineDeleted from "./inline-plugins/deleted.ts";
import inlineEmphasis from "./inline-plugins/emphasis.ts";
import inlineEscape from "./inline-plugins/escape.ts";
import inlineImage from "./inline-plugins/image.ts";
import inlineStrong from "./inline-plugins/strong.ts";
import inlineTypography from "./inline-plugins/typography.ts";

// Default options
export const defaultOptions: HmmOptions = {
  blockPlugins: new Map([
    [blockBlockquote.type, blockBlockquote],
    [blockPreformatted.type, blockPreformatted],
    [blockHeading.type, blockHeading],
    [blockHorizontalRule.type, blockHorizontalRule],
    [blockImage.type, blockImage],
    [blockOrderedList.type, blockOrderedList],
    [blockUnorderedList.type, blockUnorderedList],
    [blockParagraph.type, blockParagraph],
  ]),
  // Order is significant
  inlinePlugins: new Map([
    [inlineTypography.type, inlineTypography],
    [inlineEscape.type, inlineEscape],
    [inlineImage.type, inlineImage],
    [inlineAnchor.type, inlineAnchor],
    [inlineCode.type, inlineCode],
    [inlineStrong.type, inlineStrong],
    [inlineEmphasis.type, inlineEmphasis],
    [inlineDeleted.type, inlineDeleted],
  ]),
};

export const parse = async (
  input: string | ReadableStream<Uint8Array>,
  options = defaultOptions,
): Promise<Array<Promise<string>>> => {
  let stream: AsyncIterable<HmmBlock> | Iterable<HmmBlock>;

  if (typeof input === "string") {
    // Read string input
    const lines = input.split("\n");
    stream = blockParser(lines, options);
  } else {
    // Read streamable input
    stream = input
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
      .pipeThrough(new BlockStream(options));
  }

  // Final block renders
  const blocks: Array<Promise<string>> = [];

  for await (const block of stream) {
    if (block.type !== "preformatted") {
      // Inline code is escaped early to avoid `<div>` being parsed as HTML node
      for (let i = 0; i < block.lines.length; i++) {
        if (block.lines[i].includes("`") === false) continue;
        block.lines[i] = block.lines[i].replace(
          /`([^`]+)`/g,
          (...match) => escape(unescape(match[0])),
        );
      }
    }
    // Start block render
    const plugin = options.blockPlugins.get(block.type)!;
    blocks.push(plugin.render(block, options));
  }
  return blocks;
};

/** Render Markdown stream to HTML */
export const hmmarkdown = async (
  input: string | ReadableStream<Uint8Array>,
  options = defaultOptions,
): Promise<string> => {
  const blocks = await parse(input, options);
  return (await Promise.all(blocks)).join("");
};

/** Apply typography inline plugin */
export const hmmtypography = (input: string): Promise<string> =>
  inlineTypography.render(input, defaultOptions);
