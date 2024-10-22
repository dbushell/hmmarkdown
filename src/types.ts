/** Markdown block */
export type HmmBlock = {
  type: string;
  lines: Array<string>;
  matches: Array<string>;
  render: string;
};

/** Markdown block plugin */
export type BlockPlugin = {
  type: string;
  multiline: boolean;
  render: (block: HmmBlock, options: HmmOptions) => Promise<string>;
  matchStart: (line: string, index: number) => boolean | Array<string>;
  matchEnd?: (line: string) => boolean;
};

/** Markdown inline plugin */
export type InlinePlugin = {
  type: string;
  render: (text: string, options: HmmOptions) => Promise<string>;
  prerender?: (text: string, options: HmmOptions) => string;
};

/** Markdown block stream options */
export type HmmOptions = {
  blockPlugins: Array<BlockPlugin>;
  inlinePlugins: Array<InlinePlugin>;
};
