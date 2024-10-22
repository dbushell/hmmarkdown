import { hmmarkdown } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("block list (unordered)", async () => {
  const html = await hmmarkdown(`
* one
* *two*
* **three**
* ~~four~~
    four 🍋‍🟩 sentence
* five [link](/link)
`);
  assertEquals(
    html,
    `<ul>
  <li>one</li>
  <li><em>two</em></li>
  <li><strong>three</strong></li>
  <li><del>four</del>
      <br/>    four 🍋‍🟩 sentence</li>
  <li>five <a href="/link">link</a></li>
</ul>`
      .split("\n")
      .map((p) => p.trim())
      .join(""),
  );
});

Deno.test("block list (ordered)", async () => {
  const html = await hmmarkdown(`
1. one
2. *two*
3. **three**
4. ~~four~~
    four 🍋‍🟩 sentence
5. five [link](/link)
`);
  assertEquals(
    html,
    `<ol>
  <li>one</li>
  <li><em>two</em></li>
  <li><strong>three</strong></li>
  <li><del>four</del>
      <br/>    four 🍋‍🟩 sentence</li>
  <li>five <a href="/link">link</a></li>
</ol>`
      .split("\n")
      .map((p) => p.trim())
      .join(""),
  );
});
