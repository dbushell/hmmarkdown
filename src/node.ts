import type {HmmNodeType} from './types.ts';
import {parentElements} from './html.ts';

export class HmmNode {
  #parent: null | HmmNode = null;
  children: Array<HmmNode> = [];
  tag: string;
  text: string;
  type: HmmNodeType;

  constructor(
    parent: null | HmmNode = null,
    type: HmmNodeType = 'text',
    text = '',
    tag = ''
  ) {
    this.#parent = parent;
    this.tag = tag;
    this.text = text;
    this.type = type;
  }

  get parent(): HmmNode {
    return this.#parent ?? this;
  }

  /** Add a child node */
  append(node: HmmNode) {
    this.children.push(node);
  }

  /** Flatten node and childen to text content */
  flatten() {
    let text = this.text;
    for (const node of this.children) {
      text += node.flatten();
    }
    this.children = [];
    this.text = text;
    return text;
  }

  /** Merge node if callback returns true */
  merge(callback: (node: HmmNode) => boolean, type: HmmNodeType = 'void') {
    if (callback(this)) {
      this.flatten();
      this.type = type;
    }
    for (const node of this.children) {
      node.merge(callback, type);
    }
  }

  /** Merge adjacent text nodes */
  mergeText() {
    const children: Array<HmmNode> = [];
    let group = new HmmNode(this);
    const flush = () => {
      if (group.children.length === 0) {
        return;
      }
      let text = group.flatten();
      // Auto-format text nodes with paragraphs and breaks
      if (parentElements.includes(group.parent.tag)) {
        text = text.trim();
        // Remove excess newlines
        while (text.includes('\n\n\n')) {
          text = text.replaceAll('\n\n\n', '\n\n');
        }
        // Wrap paragraphs
        if (text.length) {
          const lines = text.split('\n\n');
          text = '';
          for (let line of lines) {
            if (!line.length) continue;
            if (group.parent.tag === 'html') {
              line = line.replaceAll('\n', '<br>');
            }
            text += `<p>${line}</p>`;
          }
        }
      }
      if (text.trim() === '') {
        return;
      }
      group.text = text;
      children.push(group);
      group = new HmmNode(this);
    };
    for (const node of this.children) {
      if (node.type === 'text') {
        group.children.push(node);
      } else {
        flush();
        node.mergeText();
        children.push(node);
      }
    }
    flush();
    this.children = children;
  }
}
