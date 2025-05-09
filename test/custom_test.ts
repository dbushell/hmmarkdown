import { hmmarkdown } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("block <custom-element>", async () => {
  const html = await hmmarkdown(
    "This is not <custom-element>a lime 🍋‍🟩</custom-element>",
  );
  assertEquals(
    html,
    "<p>This is not </p><custom-element>a lime 🍋‍🟩</custom-element>",
  );
});

Deno.test("inline <custom-element>", async () => {
  const html = await hmmarkdown(
    "This is not <custom-element>a lime 🍋‍🟩</custom-element>",
    {
      inlineTags: new Set<string>(["custom-element"]),
    },
  );
  assertEquals(
    html,
    "<p>This is not <custom-element>a lime 🍋‍🟩</custom-element></p>",
  );
});
