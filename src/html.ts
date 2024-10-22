import { inlineTags } from "@dbushell/hyperless";

/** Block elements with text nodes to wrap in a paragraph */
export const parentTags = new Set([
  "article",
  "aside",
  "blockquote",
  "details",
  "dialog",
  "div",
  "fieldset",
  "figure",
  "footer",
  "form",
  "header",
  "html", // used by parser as root node
  "main",
  "nav",
  "search",
  "section",
]);

/** Elements to parse for Markdown text content */
export const parseTags = new Set([
  ...inlineTags,
  ...parentTags,
  "address",
  "caption",
  "dd",
  "dl",
  "dt",
  "figcaption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hgroup",
  "li",
  "ol",
  "p",
  "ul",
]);
