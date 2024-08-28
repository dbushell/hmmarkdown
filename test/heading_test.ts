import {hmmarkdown} from '../mod.ts';
import {assertEquals} from 'jsr:@std/assert';

Deno.test('block heading (h1)', async () => {
  const html = await hmmarkdown('# Level one');
  assertEquals(html, '<h1 id="level-one">Level one</h1>');
});

Deno.test('block heading (h2)', async () => {
  const html = await hmmarkdown('## Level two');
  assertEquals(html, '<h2 id="level-two">Level two</h2>');
});

Deno.test('block heading (h3)', async () => {
  const html = await hmmarkdown('### Level three');
  assertEquals(html, '<h3 id="level-three">Level three</h3>');
});

Deno.test('block heading (h4)', async () => {
  const html = await hmmarkdown('#### Level four');
  assertEquals(html, '<h4 id="level-four">Level four</h4>');
});

Deno.test('block heading (h5)', async () => {
  const html = await hmmarkdown('##### Level five');
  assertEquals(html, '<h5 id="level-five">Level five</h5>');
});

Deno.test('block heading (h6)', async () => {
  const html = await hmmarkdown('###### Level six');
  assertEquals(html, '<h6 id="level-six">Level six</h6>');
});

Deno.test('block heading (id attribute)', async () => {
  const html = await hmmarkdown('# Lime 🍋‍🟩 PÓŵéřĘď & Juicy--wow!');
  assertEquals(
    html,
    '<h1 id="lime-powered-and-juicy-wow">Lime 🍋‍🟩 PÓŵéřĘď &amp; Juicy--wow!</h1>'
  );
});
