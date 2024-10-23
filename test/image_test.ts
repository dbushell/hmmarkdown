import { hmmarkdown } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("block image", async () => {
  const html = await hmmarkdown(
    "![photo of a lime 🍋‍🟩](https://example.com/ling.avif)",
  );
  assertEquals(
    html,
    '<img alt="photo of a lime 🍋‍🟩" src="https://example.com/ling.avif">',
  );
});

Deno.test("inline image", async () => {
  const html = await hmmarkdown(
    "inline ![photo of a lime 🍋‍🟩](https://example.com/ling.avif)",
  );
  assertEquals(
    html,
    '<p>inline <img alt="photo of a lime 🍋‍🟩" src="https://example.com/ling.avif"/></p>',
  );
});

Deno.test("linked image", async () => {
  const html = await hmmarkdown(
    "[![photo of a lime 🍋‍🟩](https://example.com/ling.avif)](https://example.com)",
  );
  assertEquals(
    html,
    '<p><a href="https://example.com"><img alt="photo of a lime 🍋‍🟩" src="https://example.com/ling.avif"/></a></p>',
  );
});
