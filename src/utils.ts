/** Perform replace on string parts ignoring inline code */
export const splitCode = async (
  text: string,
  replace: (part: string) => Promise<string>
): Promise<string> => {
  // Split text by inline `code` syntax
  const codes: Array<string> = [];
  const parts: Array<string> = [text];
  let match: RegExpMatchArray | null;
  /** @todo Option for all skipping all tags? */
  // <([a-zA-Z][\w:-]*)([^>]*)>(.*?)<\/\1>
  while ((match = parts.at(-1)!.match(/`[^`]+?`|<(a|code)[^>]*>(.*?)<\/\1>/))) {
    codes.push(match[0]);
    const part = parts.pop()!;
    // Part is split before and after inline code
    const offset = part.indexOf(match[0]);
    parts.push(part.substring(0, offset));
    parts.push(part.substring(offset + match[0].length));
  }
  // Join rendered parts back with codes
  text = '';
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    part = await replace(part);
    text += part + (codes[i] ?? '');
  }
  return text;
};

/** String replace without side effects */
export const replace = (
  subject: string,
  search: string,
  replace = '',
  all = false
): string => {
  let parts = subject.split(search);
  if (parts.length === 1) return subject;
  if (!all) parts = [parts.shift()!, parts.join(search)];
  return parts.join(replace);
};
