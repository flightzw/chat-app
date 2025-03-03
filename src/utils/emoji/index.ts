import { emojiTags, emojiTagGroups } from './data';

function replaceEmojiTag(text: string) {
  return text.replace(/\[[a-z\u4e00-\u9fa5]{1,5}\]/gi, (subStr) => {
    subStr = subStr.slice(1, subStr.length - 1);
    const idx = emojiTags.indexOf(subStr);
    if (idx > -1) {
      return `<img class='ql-img-emoji' alt='${subStr}' src="${import.meta.env.VITE_EMOJI_BASE_URL}/${idx}.gif" />`;
    }
    return `[${subStr}]`;
  });
}

export default {
  baseUrl: import.meta.env.VITE_EMOJI_BASE_URL,
  tags: emojiTags,
  groups: emojiTagGroups,
  replaceEmojiTag,
};
