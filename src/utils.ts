import type { HmmOptions } from "./types.ts";
import {
  getParseOptions,
  type Node,
  parseHTML as originalParseHTML,
  type ParseOptions,
} from "@dbushell/hyperless";

/** Extended with options */
export const parseHTML = (
  html: string,
  options: HmmOptions,
  parse_options: Partial<ParseOptions> = {},
): Node => {
  const original = getParseOptions();
  let { inlineTags, opaqueTags, voidTags } = original;
  if (options.inlineTags) {
    inlineTags = inlineTags.union(options.inlineTags);
  }
  if (parse_options?.inlineTags) {
    inlineTags = inlineTags.union(parse_options.inlineTags);
  }
  if (parse_options?.opaqueTags) {
    opaqueTags = opaqueTags.union(parse_options.opaqueTags);
  }
  if (parse_options?.voidTags) {
    voidTags = voidTags.union(parse_options.voidTags);
  }
  return originalParseHTML(html, {
    ...original,
    ...parse_options,
    inlineTags,
    opaqueTags,
    voidTags,
  });
};

/** Perform replace on string parts ignoring inline code */
export const splitCode = async (
  text: string,
  replace: (part: string) => Promise<string>,
): Promise<string> => {
  // Split text by inline `code` syntax
  const codes: Array<string> = [];
  const parts: Array<string> = [text];
  let match: RegExpMatchArray | null;
  /** @todo Option for all skipping all tags? */
  // <([a-zA-Z][\w:-]*)([^>]*)>(.*?)<\/\1>
  while ((match = parts.at(-1)!.match(/`[^`]+?`|<(a|code)[^>]*>(.*?)<\/\1>/))) {
    codes.push(match[0]);
    const part = parts.pop()!;
    // Part is split before and after inline code
    const offset = part.indexOf(match[0]);
    parts.push(part.substring(0, offset));
    parts.push(part.substring(offset + match[0].length));
  }
  // Join rendered parts back with codes
  text = "";
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    part = await replace(part);
    text += part + (codes[i] ?? "");
  }
  return text;
};
