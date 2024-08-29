/** Markdown block */
export type HmmBlock = {
  type: string;
  lines: Array<string>;
  matches: Array<string>;
  render: string;
};

export type HmmNodeType = 'close' | 'open' | 'root' | 'text' | 'void';

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
  blockFilters: {
    image?: (props: {
      attributes: Record<string, string> & {alt: string; src: string};
      before: string;
      after: string;
    }) => Promise<void>;
    preformatted?: (props: {
      code: string;
      attributes: Record<string, string> & {'data-lang': string};
    }) => Promise<void>;
  };
  inlineFilters: {
    anchor?: (props: {
      text: string;
      attributes: Record<string, string>;
    }) => Promise<void>;
  };
};
