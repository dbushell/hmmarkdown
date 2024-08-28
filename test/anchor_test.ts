import {hmmarkdown} from '../mod.ts';
import {assertEquals} from 'jsr:@std/assert';

Deno.test('inline anchor (basic)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [lime](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a <a href="https://emojipedia.org/lime">lime</a> ok?</p>'
  );
});

Deno.test('inline anchor (reduced)', async () => {
  const html = await hmmarkdown(
    'This [emoji] 🍋‍🟩 is a [lime](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This [emoji] 🍋‍🟩 is a <a href="https://emojipedia.org/lime">lime</a> ok?</p>'
  );
});

Deno.test('inline anchor (missing text)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a [](https://emojipedia.org/lime) ok?</p>'
  );
});

Deno.test('inline anchor (missing href)', async () => {
  const html = await hmmarkdown('This [emoji] 🍋‍🟩 is a [lime]() ok?');
  assertEquals(html, '<p>This [emoji] 🍋‍🟩 is a [lime]() ok?</p>');
});

Deno.test('inline anchor (nested square brackets)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [[lime]](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a <a href="https://emojipedia.org/lime">[lime]</a> ok?</p>'
  );
});

Deno.test('inline anchor (nested parentheses)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [(lime)](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a <a href="https://emojipedia.org/lime">(lime)</a> ok?</p>'
  );
});

Deno.test('inline anchor (emphasis)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [*lime*](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a <a href="https://emojipedia.org/lime"><em>lime</em></a> ok?</p>'
  );
});

Deno.test('inline anchor (strong)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [**lime**](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a <a href="https://emojipedia.org/lime"><strong>lime</strong></a> ok?</p>'
  );
});

Deno.test('inline anchor (deleted)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [~~lime~~](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a <a href="https://emojipedia.org/lime"><del>lime</del></a> ok?</p>'
  );
});

Deno.test('inline anchor (code)', async () => {
  const html = await hmmarkdown(
    'This emoji 🍋‍🟩 is a [`lime`](https://emojipedia.org/lime) ok?'
  );
  assertEquals(
    html,
    '<p>This emoji 🍋‍🟩 is a <a href="https://emojipedia.org/lime"><code>lime</code></a> ok?</p>'
  );
});
