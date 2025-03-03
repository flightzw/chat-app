import { Quill } from 'react-quill-new';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Embed: any = Quill.import('blots/embed');

type EmojiEmbedCfg = {
  src: string;
  alt: string;
};

export default class EmojiBlot extends Embed {
  static create(config: EmojiEmbedCfg) {
    const node = super.create() as HTMLImageElement;
    node.setAttribute('class', 'ql-img-emoji');
    node.setAttribute('src', config.src);
    node.setAttribute('alt', config.alt);
    return node;
  }

  static value(node: HTMLImageElement) {
    return {
      src: node.src || 'xxx',
      alt: node.alt || '无法解析',
    };
  }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.tagName = 'img';
