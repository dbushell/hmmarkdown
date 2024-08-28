import {hmmarkdown} from '../mod.ts';
import {assertEquals} from 'jsr:@std/assert';

Deno.test('block image', async () => {
  const html = await hmmarkdown(
    '![photo of a lime 🍋‍🟩](https://example.com/ling.avif)'
  );
  assertEquals(
    html,
    '<img alt="photo of a lime 🍋‍🟩" src="https://example.com/ling.avif">'
  );
});
