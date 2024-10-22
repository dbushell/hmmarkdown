# 🤔 Hmmarkdown

[![JSR](https://jsr.io/badges/@dbushell/hmmarkdown?labelColor=98e6c8&color=333)](https://jsr.io/@dbushell/hmmarkdown) [![NPM](https://img.shields.io/npm/v/@dbushell/hmmarkdown?labelColor=98e6c8&color=333)](https://www.npmjs.com/package/@dbushell/hmmarkdown)

**Hmmarkdown** is a HTML-aware Markdown parser and renderer. Hmmarkdown is as fast as everything else. If you need faster stop using JavaScript.

⚠️ **Work in progress!** ⚠️

## Cons

* Opinionated; limited syntax support
* Unforgiving; no affordance for errors
* Unstable; refactored on a whim

## Pros

* Accepts a `string` or stream (e.g. `Response.body`)
* Processes some *HTML-in-Markdown* and *Markdown-in-HTML*
* Asynchronous architecture

## Development

[Hmmarkdown is under active development](https://dbushell.com/2024/09/01/hmmarkdown/). It is not stable or "production ready" — although I am **testing in production** ([on my website](https://dbushell.com)).

## Block Syntax

Only the following Markdown syntax is supported for now because it's all I need. If you need alternate or additional syntax use another Markdown library.

### Blockquote

```markdown
> This is a blockquote.
> Blockquotes can have multiple lines.
> <cite>[Some name](https://example.com)</cite>
```

Lines must start with a `>` greater-than sign followed by a single space.

Consecutive lines form new paragraphs within the same `blockquote`.

### Heading

```markdown
# Heading level one
## Level two
### Level three
#### Level four
##### Level five
###### Level six
```

Line must start with 1–6 `#` hash characters followed by a single space before the heading.

### Horizontal Rule

```markdown
* * *
```

Any three asterisks, hyphens, or underscores will render a `<hr>` element.

Spaces between characters are optional. Spaces around characters are not allowed.

### Image

```markdown
![alternate description](https://example.com/image.jpg)
```

`![alt](%20%28image%29.jpg)` — URL **spaces** and **parentheses** must be URL encoded.

Alternate text cannot include square brackets (`[` or `]`).

```html
<img alt="" src="https://example.com/image.jpg">
```

HTML image tags are passed through the same renderer and filter.

### Unordered List

```markdown
* List item one
    Indented second line
* List item two
* List item three
```

New lines within an item are indented with exactly four spaces.

### Ordered List

```markdown
1. List item one
    Indented second line
2. List item two
3. List item three
```

### Paragraph

```markdown
This will become a paragraph.
<div>
  This will also become a paragraph.
</div>
```

Plain text is wrapped in `<p>` paragraph tags.

### Preformatted

````markdown
```html
<h1>Hello, World!</h1>
```
````

Exactly three backticks followed by an optional language name.

## Inline Markdown

### Anchor

```markdown
[example link](https://example.com/slug%20%28parentheses%29/)
```

URL **spaces** and **parentheses** must be URI encoded.

### Code

```markdown
Text between `backticks` is wrapped in `<code>`.
```

### Deleted

```markdown
Text between ~~double tilde~~ is wrapped in `<del>`.
```

### Emphasis

```markdown
Text between *single asterisk* is wrapped in `<em>`.
```

### Strong

```markdown
Text between **double asterisk** is wrapped in `<strong>`.
```

## HTML and Inline Markdown

Text content within a subset of HTML tags will have inline Markdown parsed.

```markdown
<p>These words **are strong**.</p>
```

Will render:

```html
<p>These words <strong>are strong</strong>.</p>
```

Inline Markdown with HTML inside is not parsed.

```markdown
These words **<span>are not strong</span>**.
```

Will render:

```html
<p>These words **<span>are not strong</span>**.</p>
```

[Void elements](https://developer.mozilla.org/en-US/docs/Glossary/Void_element) and a subset of elements like `iframe` and `video` are left untouched and text content within is not parsed.

Nested Markdown blocks are not supported, e.g. lists in blockquotes, lists in lists, etc.

## Configuration

Documentation coming soon (maybe lol).

* * *

[MIT License](/LICENSE) | Copyright © 2024 [David Bushell](https://dbushell.com)
