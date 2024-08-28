import {hmmarkdown} from '../mod.ts';
import {assertEquals} from 'jsr:@std/assert';

Deno.test('block paragraph (basic)', async () => {
  const html = await hmmarkdown('This is not a lime 🍋‍🟩');
  assertEquals(html, '<p>This is not a lime 🍋‍🟩</p>');
});

Deno.test('block paragraph (html)', async () => {
  const html = await hmmarkdown('<div>This is not a lime 🍋‍🟩</div>');
  assertEquals(html, '<div><p>This is not a lime 🍋‍🟩</p></div>');
});
