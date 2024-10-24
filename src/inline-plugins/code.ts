import type { InlinePlugin } from "../types.ts";

const REGEXP = /`([^`]+)`/g;

const plugin: InlinePlugin = {
  type: "code",
  render: (text: string) => {
    text = text.replace(REGEXP, (...match) => `<code>${match[1]}</code>`);
    return Promise.resolve(text);
  },
};

export default plugin;
