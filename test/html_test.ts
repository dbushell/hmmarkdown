import { hmmarkdown } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("<p> with strong markdown", async () => {
  const input = `<p>**Pass!**</p>`;
  const html = await hmmarkdown(input);
  assertEquals(html, `<p><strong>Pass!</strong></p>`);
});

Deno.test("<div> with strong markdown", async () => {
  const input = `<div>**Pass!**</div>`;
  const html = await hmmarkdown(input);
  assertEquals(html, `<div><p><strong>Pass!</strong></p></div>`);
});

Deno.test("<aside> with blockquote markdown", async () => {
  const input = `<aside>
  > This is multiline
  > blockquote content
  > on *three* lines.
</aside>`;
  const html = await hmmarkdown(input);
  assertEquals(
    html,
    `<aside><blockquote><p>This is multiline</p><p>blockquote content</p><p>on <em>three</em> lines.</p></blockquote></aside>`,
  );
});

Deno.test("<figure> with blockquote markdown and <cite> with markdown anchor", async () => {
  const input = `<figure>
  > This is multiline
  > blockquote content
  > on *three* lines.
  <figcaption>With <cite>[citation](http://example.com)</cite></figcaption>
</figure>`;
  const html = await hmmarkdown(input);
  assertEquals(
    html,
    `<figure><blockquote><p>This is multiline</p><p>blockquote content</p><p>on <em>three</em> lines.</p></blockquote><figcaption>With <cite><a href="http://example.com">citation</a></cite></figcaption></figure>`,
  );
});
