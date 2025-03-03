import { Avatar, Dropdown, MenuProps } from 'antd';

import { ChatMember } from '../model';

import './index.scss';

type MessageItemProps = {
  menu: MenuProps;
  readed: boolean;
  content: string;
  showName: boolean;
  leftAlign: boolean;
  sender: ChatMember;
};

export default function MessageItem({ leftAlign, showName, sender, menu, readed, content }: MessageItemProps) {
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
          <div
            style={{ backgroundColor: leftAlign ? '#fff' : '#89D961' }}
            className={`message-item-bubble message-item-bubble-arrow-${leftAlign ? 'left' : 'right'}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
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
