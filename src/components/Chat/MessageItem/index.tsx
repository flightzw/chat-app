import { Avatar, Dropdown, MenuProps } from 'antd';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

import { ChatMember } from '../model';

import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS for you
import 'highlight.js/styles/atom-one-dark.css';
import './index.scss';

type MessageItemProps = {
  menu: MenuProps;
  readed: boolean;
  content: string;
  showName: boolean;
  leftAlign: boolean;
  sender: ChatMember;
  useMarkDown: boolean;
};

export default function MessageItem({
  leftAlign,
  showName,
  sender,
  menu,
  readed,
  content,
  useMarkDown,
}: MessageItemProps) {
  return (
    <div className="message-item-container" style={{ justifyContent: leftAlign ? 'flex-start' : 'flex-end' }}>
      {leftAlign && (
        <Avatar className="message-item-avatar" src={sender.avatarUrl || undefined}>
          {sender.nickname.substring(0, 2)}
        </Avatar>
      )}
      <div className="message-item-body" style={{ alignItems: leftAlign ? 'flex-start' : 'flex-end' }}>
        {showName && <div className="message-item-nickname">{sender.nickname}</div>}
        <Dropdown menu={menu} trigger={['contextMenu']}>
          {useMarkDown ? (
            <div
              style={{ backgroundColor: leftAlign ? '#fff' : '#89D961' }}
              className={`message-item-bubble-md message-item-bubble-arrow-${leftAlign ? 'left' : 'right'}`}
            >
              <Markdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
              >
                {content.replace(/(\\\[|\\\])/g, '$$')}
              </Markdown>
            </div>
          ) : (
            <div
              style={{ backgroundColor: leftAlign ? '#fff' : '#89D961' }}
              className={`message-item-bubble message-item-bubble-arrow-${leftAlign ? 'left' : 'right'}`}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </Dropdown>
        {!leftAlign && (
          <div className={`message-item-readtips no-select ${readed ? 'msg-readed' : ''}`}>
            {readed ? '已读' : '未读'}
          </div>
        )}
      </div>
      {!leftAlign && (
        <Avatar className="message-item-avatar" src={sender.avatarUrl || undefined}>
          {sender.nickname.substring(0, 2)}
        </Avatar>
      )}
    </div>
  );
}
