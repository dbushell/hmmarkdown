import type { InlinePlugin } from "../types.ts";
import { escape } from "@dbushell/hyperless";

const entities = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
  ["'", "&apos;"],
  ["\xa0", "&nbsp;"],
  ["–", "&ndash;"],
  ["—", "&mdash;"],
  ["©", "&copy;"],
  ["…", "&hellip;"],
]);

const encodes = new Map(Array.from(entities, ([k, v]) => [v, k]));

const encodedKeys = new RegExp([...encodes.keys()].join("|"), "g");

const unescape = (str: string): string =>
  str.replaceAll(encodedKeys, (k) => encodes.get(k)!);

const plugin: InlinePlugin = {
  type: "escape",
  render: (text: string) => {
    text = unescape(text);
    text = escape(text);
    return Promise.resolve(text);
  },
};

export default plugin;
