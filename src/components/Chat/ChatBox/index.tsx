import dayjs from 'dayjs';
import Delta from 'quill-delta';
import VirtualList, { ListRef } from 'rc-virtual-list';
import ReactQuill, { EmitterSource, Quill } from 'react-quill-new';
import { Affix, Button, Flex, message, Popover } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SmileOutlined, UnorderedListOutlined } from '@ant-design/icons';

import days from '@/utils/days';
import strings from '@/utils/strings';
import { msgApi } from '@/api';
import { ChatInfo } from '@/store/chat';
import EmojiBlot from '../embed';
import EmojiList from '../EmojiList';
import MessageItem from '../MessageItem';
import ChatHistoryModal from '../ChatHistoryModal';

import './index.scss';
import 'react-quill-new/dist/quill.snow.css';
import errors from '@/utils/errors';
import emoji from '@/utils/emoji';
import { ChatMember } from '../model';

type ChatBoxProps = {
  chat: ChatInfo;
  members: ChatMember[];
  messages: msgApi.PrivateMessage[];
  maxInputCount: number;
  height: number;
  onInputChange: (info: { text: string; count: number }) => void;
  onInputSubmit: (text: string) => void;
};

const modules = { toolbar: { container: '#toolbar' } };

Quill.register({ 'formats/emoji': EmojiBlot }, true);

const virtualListStyle: Record<string, React.CSSProperties> = {
  verticalScrollBar: { width: 6 },
  verticalScrollBarThumb: { backgroundColor: '#B8B8B8' },
};

export default function ChatBox({
  chat,
  messages,
  members,
  height,
  maxInputCount,
  onInputChange,
  onInputSubmit,
}: ChatBoxProps) {
  const msgBoxRef = useRef<ListRef>(null);
  const inputRef = useRef<ReactQuill>(null);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const listHeight = useMemo(() => height - 200, [height]);
  const [openEmojiPopover, setOpenEmojiPopover] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [showAffix, setShowAffix] = useState(false);

  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.nativeElement.style.visibility = 'hidden';
      const msgs = chat.getMessages();
      msgBoxRef.current.scrollTo({ key: msgs.length > 0 ? msgs[msgs.length - 1].id : 0 });
      setTimeout(() => (msgBoxRef.current!.nativeElement.style.visibility = 'visible'), 10);
    }
  }, [chat]);

  useEffect(() => {
    if (!msgBoxRef.current) {
      return;
    }
    const scrollTop = msgBoxRef.current.getScrollInfo().y;
    const scrollHeight = getListScrollHeight(msgBoxRef.current.nativeElement);
    const bottomOffset = scrollHeight - scrollTop - listHeight;
    if (bottomOffset > 10 && bottomOffset <= 100) {
      msgBoxRef.current.scrollTo({ top: scrollHeight });
    }
  }, [msgBoxRef, messages, listHeight]);

  const handleMsgBoxScroll = () => {
    const scrollTop = msgBoxRef.current!.getScrollInfo().y;
    const bottomOffset = getListScrollHeight(msgBoxRef.current!.nativeElement) - scrollTop - listHeight;
    if (showAffix && bottomOffset <= 100) {
      setShowAffix(false);
    }
    if (!showAffix && bottomOffset > 100) {
      setShowAffix(true);
    }
  };

  const handleMsgBoxWheel = async () => {
    try {
      if (chat.getUnreadCount() > 0) {
        await msgApi.readedPrivateMessage(chat.id);
      }
    } catch (err) {
      console.error('msgApi.readedPrivateMessage failed:', err);
    }
  };

  const selectEmoji = (emoji: string, url: string) => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
      const editer = inputRef.current.getEditor();
      const range = editer.getSelection();
      if (range) {
        editer.insertEmbed(range.index, 'emoji', { src: url, size: 18, alt: emoji });
        editer.setSelection(range.index + 1);
      }
    }
    setOpenEmojiPopover(false);
  };

  const handleInputChange = (
    value: string,
    delta: Delta,
    _source: EmitterSource,
    editer: ReactQuill.UnprivilegedEditor
  ) => {
    editer.getSelection(); // 临时处理 setSelection 不生效的问题
    for (const op of delta.ops) {
      if (op.insert && typeof op.insert === 'object' && !op.insert.emoji) {
        message.warning('聊天框仅支持输入文本与 emoji 表情');
        return onInputChange({ ...chat.draft });
      }
    }

    let count = editer.getText().length - 1;
    const contents = editer.getContents();
    for (const opt of contents.ops) {
      if (opt.insert && typeof opt.insert === 'object' && opt.insert.emoji) {
        count += 4;
      }
      if (count > maxInputCount) {
        message.warning('输入内容不得超过最大字符数限制');
        return onInputChange({ ...chat.draft });
      }
    }
    onInputChange({ text: strings.inputFilter.process(value), count: count });
  };

  const msgBoxScrollToBottom = () => {
    msgBoxRef.current!.scrollTo({ index: chat.getMaxMsgId() });
  };

  return (
    <>
      <div className="chatbox-message-list" onWheel={handleMsgBoxWheel}>
        <Affix
          className="chatbox-affix"
          offsetTop={0}
          style={!showAffix ? { display: 'none' } : { width: 'calc(100% - 366px)' }}
        >
          <Button type="link" onClick={msgBoxScrollToBottom}>
            返回底部
          </Button>
        </Affix>
        <VirtualList
          ref={msgBoxRef}
          className="chatbox-virtual-list"
          height={listHeight}
          itemHeight={80}
          data={messages}
          itemKey="id"
          onScroll={handleMsgBoxScroll}
          styles={virtualListStyle}
        >
          {(item, idx) => {
            const sender = memberMap.get(item.send_id) as ChatMember;
            const content = emoji.replaceEmojiTag(item.content);
            const prevTime = idx == 0 ? null : messages[idx - 1].created_at;
            const showTimeTips =
              prevTime && dayjs(prevTime).isBefore(dayjs(item.created_at).add(-30, 'minute'), 'minute');
            return (
              <div key={item.id}>
                {showTimeTips && (
                  <div className="message-item-timetips no-select">
                    <span>{days.formatSendTime(item.created_at)}</span>
                  </div>
                )}
                {item.status === msgApi.MessageStatus.Recall ? (
                  <div className="message-item-timetips no-select">
                    <span>{item.content}</span>
                  </div>
                ) : (
                  <MessageItem
                    showName={false}
                    leftAlign={item.send_id !== chat.userID}
                    sender={sender}
                    content={content}
                    menu={{
                      items: initMsgMenuItems(chat.userID, item),
                      onClick: initMsgMenuClick(item.id, content),
                    }}
                    readed={item.status === msgApi.MessageStatus.Readed}
                  />
                )}
              </div>
            );
          }}
        </VirtualList>
      </div>
      <div className="chatbox-message-input">
        <div id="toolbar">
          <Popover
            trigger="click"
            open={openEmojiPopover}
            content={<EmojiList onSelect={selectEmoji} />}
            onOpenChange={(open) => setOpenEmojiPopover(open)}
          >
            <button title="表情">
              <SmileOutlined />
            </button>
          </Popover>
          <button title="聊天记录" onClick={() => setOpenHistoryModal(true)}>
            <UnorderedListOutlined />
          </button>
        </div>
        <ReactQuill
          className="message-input-body"
          ref={inputRef}
          onChange={handleInputChange}
          modules={modules}
          value={chat.draft.text}
          theme={'snow'}
        />
        <Flex vertical={true} align="flex-end">
          <div>
            {chat.draft.count} / {maxInputCount}
          </div>
          <Button
            disabled={chat.draft.count === 0}
            className="message-input-submit"
            color="primary"
            variant="solid"
            onClick={() => {
              onInputSubmit(
                strings.submitFilter.process(
                  chat.draft.text
                    .trim()
                    .replace(/<br>/g, '')
                    .replace(/<\/p><p>/g, '\n')
                )
              );
              setTimeout(msgBoxScrollToBottom, 300);
            }}
          >
            发送
          </Button>
        </Flex>
      </div>
      <ChatHistoryModal
        title={chat.name}
        open={openHistoryModal}
        chatID={chat.id}
        members={members}
        onCancel={() => setOpenHistoryModal(false)}
      />
    </>
  );
}

function initMsgMenuItems(userID: number, msg: msgApi.PrivateMessage) {
  const items = [{ key: 'copy', label: '复制' }];
  if (msg.send_id === userID && dayjs(msg.created_at).isAfter(dayjs().add(-15, 'minute'))) {
    items.push({ key: 'recall', label: '撤回消息' });
  }
  return items;
}

const initMsgMenuClick = (msgID: number, content: string) => {
  return ({ key }: { key: string }) => {
    switch (key) {
      case 'copy':
        navigator.clipboard.write([
          new ClipboardItem({ 'text/html': new Blob([content.replace(/\n/g, '<br>')], { type: 'text/html' }) }),
        ]);
        return;
      case 'recall':
        msgApi.recallPrivateMessage(msgID).catch((err) => errors.showHttpErrorMessageTips(err));
        return;
      default:
        console.warn('[useChatListMenu]: invalid menu key:', key);
    }
  };
};

function getListScrollHeight(listElement: HTMLDivElement) {
  return listElement.children.item(0)!.children.item(0)!.scrollHeight;
}
