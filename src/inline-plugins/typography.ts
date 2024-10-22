/**
 * Baed on SmartyPants - BSD 3-Clause License
 * @see {@link https://github.com/othree/smartypants.js/blob/master/LICENSE}
 */
import type { InlinePlugin } from "../types.ts";

const PUNCT = "[!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~]";
const CLOSE = "[^\\ \\t\\r\\n\\[\\{\\(\\-]";
const NOT_CLOSE = "[\\ \\t\\r\\n\\[\\{\\(\\-]";
const DASHES = "&#8211;|&#8212;";

/** Render smart typography as Unicode characters */
const plugin: InlinePlugin = {
  type: "typography",
  render: (text: string) => {
    // Escapes
    text = text.replace(/\\"/g, "&#34;");
    text = text.replace(/\\'/g, "&#39;");

    // Ellipses
    text = text.replace(/\.\.\./g, "…");

    // Skip if no quotes found
    if (text.indexOf("'") === -1 && text.indexOf('"') === -1) {
      return Promise.resolve(text);
    }

    /**
     * Special case if the very first character is a quote
     * followed by punctuation at a non-word-break. Close the quotes by brute force:
     */
    text = text.replace(new RegExp(`^'(?=${PUNCT}\\B)`), "’");
    text = text.replace(new RegExp(`^"(?=${PUNCT}\\B)`), "”");

    /**
     * Special case for double sets of quotes, e.g.:
     *   <p>He said, "'Quoted' words in a larger quote."</p>
     */
    text = text.replace(/"'(?=\w)/, "“‘");
    text = text.replace(/'"(?=\w)/, "‘“");

    /**
     * Special case for decade abbreviations (the '80s):
     */
    text = text.replace(/'(?=\d\d)/, "’");

    /**
     * Get most opening single quotes:
     * s {
     *     (
     *         \s          |   # a whitespace char, or
     *         &nbsp;      |   # a non-breaking space entity, or
     *         --          |   # dashes, or
     *         &[mn]dash;  |   # named dash entities
     *         $DASHES     |   # or decimal entities
     *         &\#x201[34];    # or hex
     *     )
     *     '                   # the quote
     *     (?=\w)              # followed by a word character
     * } {$1‘}xg;
     */
    text = text.replace(
      new RegExp(
        `(\\*|\\s|&nbsp;|--|&[mn]dash;|${DASHES}|&#x201[34])'(?=\\w)`,
        "g",
      ),
      (...match) => `${match[1]}‘`,
    );

    /**
     * Single closing quotes:
     * s {
     *     ($CLOSE)?
     *     '
     *     (?(1)|          # If $1 captured, then do nothing;
     *       (?=\s | s\b)  # otherwise, positive lookahead for a whitespace
     *     )               # char or an 's' at a word ending position. This
     *                     # is a special case to handle something like:
     *                     # "<i>Custer</i>'s Last Stand."
     * } {$1’}xgi;
     */
    text = text.replace(new RegExp(`(${CLOSE})'`, "g"), "$1’");
    text = text.replace(
      new RegExp(`(${NOT_CLOSE}?)'(?=\\s|s\\b)`, "g"),
      (...match) => `${match[1]}’`,
    );

    /**
     * Any remaining single quotes should be opening ones:
     */
    text = text.replace(/'/g, "‘");

    /**
     * Get most opening double quotes:
     * s {
     *     (
     *         \s          |   # a whitespace char, or
     *         &nbsp;      |   # a non-breaking space entity, or
     *         --          |   # dashes, or
     *         &[mn]dash;  |   # named dash entities
     *         $DASHES     |   # or decimal entities
     *         &\#x201[34];    # or hex
     *     )
     *     "                   # the quote
     *     (?=\w)              # followed by a word character
     * } {$1“}xg;
     */
    text = text.replace(
      new RegExp(
        `(\\*|\\s|&nbsp;|--|&[mn]dash;|${DASHES}|&#x201[34])"(?=\\w)`,
        "g",
      ),
      (...match) => `${match[1]}“`,
    );

    /**
     * Double closing quotes:
     * s {
     *     ($CLOSE)?
     *     "
     *     (?(1)|(?=\s))   # If $1 captured, then do nothing;
     *                        # if not, then make sure the next char is whitespace.
     * } {$1”;}xg;
     */
    text = text.replace(
      new RegExp(`(${CLOSE})"`, "g"),
      (...match) => `${match[1]}”`,
    );
    text = text.replace(
      new RegExp(`(${NOT_CLOSE}?)"(?=\\s)`, "g"),
      (...match) => `${match[1]}”`,
    );

    /**
     * Any remaining quotes should be opening ones.
     */
    text = text.replace(/"/g, "“");

    return Promise.resolve(text);
  },
};

export default plugin;
