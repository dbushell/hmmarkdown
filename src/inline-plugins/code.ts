import type { InlinePlugin } from "../types.ts";
import { escape, unescape } from "@dbushell/hyperless";

const REGEXP = /`([^`]+)`/g;

const plugin: InlinePlugin = {
  type: "code",
  prerender: (text: string) => {
    if (text.indexOf("`") === -1) return text;
    // Inline code is escaped early to avoid `<div>` being parsed as HTML node
    return text.replace(REGEXP, (...match) => {
      const text = unescape(match[0]);
      return escape(text);
    });
  },
  render: (text: string) => {
    text = text.replace(REGEXP, (...match) => `<code>${match[1]}</code>`);
    return Promise.resolve(text);
  },
};

export default plugin;
