import {hmmarkdown} from '../mod.ts';
import {assertEquals} from 'jsr:@std/assert';

Deno.test('block paragraph (basic)', async () => {
  const html = await hmmarkdown('This is not a lime 🍋‍🟩');
  assertEquals(html, '<p>This is not a lime 🍋‍🟩</p>');
});

Deno.test('block paragraph (html)', async () => {
  const html = await hmmarkdown('<div><b>This</b> is not a lime 🍋‍🟩</div>');
  assertEquals(html, '<div><p><b>This</b> is not a lime 🍋‍🟩</p></div>');
});

Deno.test('block paragraph (line break)', async () => {
  const html = await hmmarkdown(`
This is not a lime 🍋‍🟩
with break
 `);
  assertEquals(html, '<p>This is not a lime 🍋‍🟩<br>with break</p>');
});

Deno.test('block paragraph (double)', async () => {
  const html = await hmmarkdown(`


This is not a lime 🍋‍🟩



This is not a lime 🍋‍🟩


`);
  assertEquals(
    html,
    '<p>This is not a lime 🍋‍🟩</p><p>This is not a lime 🍋‍🟩</p>'
  );
});
