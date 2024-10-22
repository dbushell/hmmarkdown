import type { InlinePlugin } from "../types.ts";
import { escape } from "@dbushell/hyperless";

const REGEXP = /!\[([^\]]+)\]\(([^()\s]+)\)/g;

const plugin: InlinePlugin = {
  type: "image",
  render: (text: string): Promise<string> => {
    if (text.indexOf("![") === -1) {
      return Promise.resolve(text);
    }
    for (const match of text.matchAll(REGEXP)) {
      const alt = escape(match[1]);
      const src = escape(match[2]);
      text = text.replace(
        match[0],
        () => `<img alt="${alt}" src="${src}">`,
      );
    }
    return Promise.resolve(text);
  },
};

export default plugin;
