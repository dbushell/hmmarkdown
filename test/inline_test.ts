import {hmmarkdown} from '../mod.ts';
import {assertEquals} from 'jsr:@std/assert';

Deno.test('inline (deleted)', async () => {
  const html = await hmmarkdown('~~emphasis~~');
  assertEquals(html, '<p><del>emphasis</del></p>');
});

Deno.test('inline (emphasis)', async () => {
  const html = await hmmarkdown('*emphasis*');
  assertEquals(html, '<p><em>emphasis</em></p>');
});

Deno.test('inline (strong)', async () => {
  const html = await hmmarkdown('**strong** and **bold**');
  assertEquals(
    html,
    '<p><strong>strong</strong> and <strong>bold</strong></p>'
  );
});

Deno.test('inline (emphasis + strong)', async () => {
  const html = await hmmarkdown('***stronger***');
  assertEquals(html, '<p><strong><em>stronger</em></strong></p>');
});

Deno.test('inline (emphasis + strong (1))', async () => {
  const html = await hmmarkdown('***emphasis* inside**');
  assertEquals(html, '<p><strong><em>emphasis</em> inside</strong></p>');
});

Deno.test('inline (emphasis + strong (2))', async () => {
  const html = await hmmarkdown('**with *emphasis***');
  assertEquals(html, '<p><strong>with <em>emphasis</em></strong></p>');
});

Deno.test('inline (emphasis + strong (3))', async () => {
  const html = await hmmarkdown('**strong** and ***strong***');
  assertEquals(
    html,
    '<p><strong>strong</strong> and <strong><em>strong</em></strong></p>'
  );
});

Deno.test('inline (emphasis + strong (4))', async () => {
  const html = await hmmarkdown('_**em + strong**_');
  assertEquals(html, '<p><em><strong>em + strong</strong></em></p>');
});
