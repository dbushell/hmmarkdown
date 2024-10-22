import { hmmarkdown } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("preformatted (no lang)", async () => {
  const input = `<pre>&lt;script&gt;
  /* &lt;/script&gt; */
&lt;/script&gt;</pre>`;
  const html = await hmmarkdown(input);
  assertEquals(html, input);
});

Deno.test("preformatted (html escape)", async () => {
  const input = `\`\`\`html\n<script>
  /* </script> */
</script>\n\`\`\``;
  const output = `<pre data-lang="html" tabindex="0"><code>&lt;script&gt;
  /* &lt;/script&gt; */
&lt;/script&gt;</code></pre>`;
  const html = await hmmarkdown(input);
  assertEquals(html, output);
});
