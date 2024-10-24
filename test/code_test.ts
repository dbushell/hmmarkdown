import { hmmarkdown } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("code (basic)", async () => {
  const html = await hmmarkdown("`lime 🍋‍🟩`");
  assertEquals(html, "<p><code>lime 🍋‍🟩</code></p>");
});

Deno.test("code (typography)", async () => {
  const html = await hmmarkdown('`"lime" > 🍋‍🟩`');
  assertEquals(html, "<p><code>&quot;lime&quot; &gt; 🍋‍🟩</code></p>");
});

Deno.test("code (markdown)", async () => {
  const html = await hmmarkdown("`[**lime** 🍋‍🟩](#no)`");
  assertEquals(html, "<p><code>[**lime** 🍋‍🟩](#no)</code></p>");
});

Deno.test("code (anchor inception)", async () => {
  const html = await hmmarkdown(
    "`This [emoji] 🍋‍🟩 is a [lime](https://emojipedia.org/lime) ok?`",
  );
  assertEquals(
    html,
    "<p><code>This [emoji] 🍋‍🟩 is a [lime](https://emojipedia.org/lime) ok?</code></p>",
  );
});

Deno.test("code (html)", async () => {
  const html = await hmmarkdown("<div>`</div>`</div>");
  assertEquals(html, "<div><p><code>&lt;/div&gt;</code></p></div>");
});
