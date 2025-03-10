import { FilterXSS } from 'xss';

/** 聊天消息输入过滤 */
const inputFilter = new FilterXSS({
  whiteList: { img: ['alt', 'class', 'src'], p: [], br: [] },
  stripIgnoreTag: true,
});

/** 聊天消息提交过滤 */
const submitFilter = new FilterXSS({
  whiteList: { img: ['alt', 'class', 'src'] },
  stripIgnoreTag: true,
  onTag: (tag, html) => {
    if (tag !== 'img') {
      return;
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return `[${doc.images.item(0)!.alt}]`;
  },
});

const latestMsgFilter = new FilterXSS({
  whiteList: { img: ['src', 'class', 'alt'] },
  stripIgnoreTag: true,
});

export default {
  inputFilter,
  submitFilter,
  latestMsgFilter,
};
