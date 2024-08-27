/**
 * @std/streams
 * @see {@link https://jsr.io/@std/streams/1.0.3/LICENSE}
 * @license
 * MIT License
 *
 * Copyright 2018-2022 the Deno authors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/** Options for {@linkcode TextLineStream}. */
export interface TextLineStreamOptions {
  /**
   * Allow splitting by `\r`.
   *
   * @default {false}
   */
  allowCR?: boolean;
}

/**
 * Transform a stream into a stream where each chunk is divided by a newline,
 * be it `\n` or `\r\n`. `\r` can be enabled via the `allowCR` option.
 *
 * If you want to split by a custom delimiter, consider using {@linkcode TextDelimiterStream}.
 *
 * @example JSON Lines
 * ```ts
 * import { TextLineStream } from "@std/streams/text-line-stream";
 * import { toTransformStream } from "@std/streams/to-transform-stream";
 * import { assertEquals } from "@std/assert";
 *
 * const stream = ReadableStream.from([
 *   '{"name": "Alice", "age": ',
 *   '30}\n{"name": "Bob", "age"',
 *   ": 25}\n",
 * ]);
 *
 * type Person = { name: string; age: number };
 *
 * // Split the stream by newline and parse each line as a JSON object
 * const jsonStream = stream.pipeThrough(new TextLineStream())
 *   .pipeThrough(toTransformStream(async function* (src) {
 *     for await (const chunk of src) {
 *       if (chunk.trim().length === 0) {
 *         continue;
 *       }
 *       yield JSON.parse(chunk) as Person;
 *     }
 *   }));
 *
 * assertEquals(
 *   await Array.fromAsync(jsonStream),
 *   [{ "name": "Alice", "age": 30 }, { "name": "Bob", "age": 25 }],
 * );
 * ```
 *
 * @example Allow splitting by `\r`
 *
 * ```ts
 * import { TextLineStream } from "@std/streams/text-line-stream";
 * import { assertEquals } from "@std/assert";
 *
 * const stream = ReadableStream.from([
 *  "CR\rLF",
 *  "\nCRLF\r\ndone",
 * ]).pipeThrough(new TextLineStream({ allowCR: true }));
 *
 * const lines = await Array.fromAsync(stream);
 *
 * assertEquals(lines, ["CR", "LF", "CRLF", "done"]);
 * ```
 */
export class TextLineStream extends TransformStream<string, string> {
  #currentLine = '';

  /**
   * Constructs a new instance.
   *
   * @param options Options for the stream.
   */
  constructor(options: TextLineStreamOptions = {allowCR: false}) {
    super({
      transform: (chars, controller) => {
        chars = this.#currentLine + chars;

        while (true) {
          const lfIndex = chars.indexOf('\n');
          const crIndex = options.allowCR ? chars.indexOf('\r') : -1;

          if (
            crIndex !== -1 &&
            crIndex !== chars.length - 1 &&
            (lfIndex === -1 || lfIndex - 1 > crIndex)
          ) {
            controller.enqueue(chars.slice(0, crIndex));
            chars = chars.slice(crIndex + 1);
            continue;
          }

          if (lfIndex === -1) break;

          const endIndex = chars[lfIndex - 1] === '\r' ? lfIndex - 1 : lfIndex;
          controller.enqueue(chars.slice(0, endIndex));
          chars = chars.slice(lfIndex + 1);
        }

        this.#currentLine = chars;
      },
      flush: (controller) => {
        if (this.#currentLine === '') return;
        const currentLine =
          options.allowCR && this.#currentLine.endsWith('\r')
            ? this.#currentLine.slice(0, -1)
            : this.#currentLine;
        controller.enqueue(currentLine);
      }
    });
  }
}
