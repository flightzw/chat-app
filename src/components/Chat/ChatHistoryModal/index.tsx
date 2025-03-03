import { Input, Modal, Avatar, List, Button, Popover, Tag } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Dayjs } from 'dayjs';

import { msgApi } from '@/api';
import days from '@/utils/days';
import emoji from '@/utils/emoji';
import errors from '@/utils/errors';
import DateSelector from '@/components/DateSelector';
import { ChatMember } from '../model';

import './index.scss';

type ChatHistoryProps = {
  title: string;
  open: boolean;
  chatID: number;
  members: ChatMember[];
  onCancel: () => void;
};

type ListConfig = {
  nextPage: number;
  data: msgApi.PrivateMessage[];
  total: number;
};

type TagGroup = {
  date?: string;
};

const dateFormat = 'YYYY-MM-DD';

export default function ChatHistoryModal({ title, open, chatID, members, onCancel }: ChatHistoryProps) {
  const [openDateSelector, setOpenDateSelector] = useState(false);
  const [config, setConfig] = useState<ListConfig>({ data: [], total: 0, nextPage: 1 });
  const [query, setQuery] = useState<msgApi.PrivateMessageQuery>({ friend_id: chatID });

  const memberMap = useMemo(() => new Map(members.map((u) => [u.id, u])), [members]);
  const tags = useMemo(() => {
    const tags: TagGroup = {};
    if (query.send_date_gte && query.send_date_lte && query.send_date_gte <= query.send_date_lte) {
      tags.date =
        query.send_date_gte === query.send_date_lte
          ? query.send_date_gte
          : `${query.send_date_gte}/${query.send_date_lte}`;
    }
    return tags;
  }, [query]);

  const loadingMessage = useCallback(async (query: msgApi.PrivateMessageQuery, page: number, cover = false) => {
    try {
      const { data, total } = await msgApi.listPrivateMessage(query, page, 10);
      setConfig((c) => ({
        data: cover ? data : c.data.concat(data),
        total: total as number,
        nextPage: page + 1,
      }));
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  }, []);

  useEffect(() => {
    if (open && chatID > 0) loadingMessage({ friend_id: chatID }, 1, true);
  }, [open, chatID, loadingMessage]);

  const selectSendDate = (start: Dayjs, end: Dayjs) => {
    setOpenDateSelector(false);
    setQuery({ ...query, send_date_gte: start.format(dateFormat), send_date_lte: end.format(dateFormat) });
  };

  const removeTag = (key: string) => {
    switch (key) {
      case 'date':
        delete query.send_date_gte;
        delete query.send_date_lte;
        setQuery({ ...query });
    }
  };

  return (
    <Modal
      className="chat-history-container"
      centered={true}
      title={title}
      open={open}
      maskClosable={false}
      footer={null}
      onCancel={() => {
        onCancel();
        setConfig({ data: [], total: 0, nextPage: 1 });
        setQuery({ friend_id: chatID });
      }}
    >
      <div>
        <Input
          maxLength={10}
          value={query.keyword}
          prefix={initSearchInputPrefix(tags, removeTag)}
          placeholder="按消息内容搜索"
          onPressEnter={() => loadingMessage(query, 1, true)}
          onChange={(e) => setQuery({ ...query, keyword: e.target.value })}
        />
        <Popover
          open={openDateSelector}
          onOpenChange={setOpenDateSelector}
          content={<DateSelector onComfirm={selectSendDate} />}
          trigger="click"
        >
          <Button type="link">日期</Button>
        </Popover>
      </div>
      <InfiniteScroll
        className="chat-history-content"
        dataLength={config.data.length}
        next={async () => await loadingMessage(query, config.nextPage)}
        hasMore={config.data.length < config.total}
        height={440}
        inverse={true}
        loader={
          <div className="chat-history-dataloading no-select">
            <LoadingOutlined />
            数据加载中...
          </div>
        }
        endMessage={<div className="chat-history-listend no-select">没有更多数据了</div>}
      >
        <List
          dataSource={config.data}
          renderItem={(msg) => {
            const user = memberMap.get(msg.send_id);
            return (
              <List.Item className="message-item">
                <div className="message-item-avatar">
                  <Avatar shape="square" src={user?.avatarUrl}>
                    {user?.nickname.substring(0, 2) || `用户${msg.send_id}`}
                  </Avatar>
                </div>
                <div className="message-item-content">
                  <div className="message-item-header">
                    <span>{user?.nickname || `用户${msg.send_id}`}</span>
                    <span>{days.formatSendTime(msg.created_at)}</span>
                  </div>
                  <div
                    className="message-item-body"
                    dangerouslySetInnerHTML={{
                      __html: emoji.replaceEmojiTag(msg.content),
                    }}
                  />
                </div>
              </List.Item>
            );
          }}
        />
      </InfiniteScroll>
    </Modal>
  );
}

function initSearchInputPrefix(group: Record<string, string>, removeTag: (key: string) => void) {
  const tags = [];
  for (const key in group) {
    if (group[key]) {
      tags.push(
        <Tag key={key} color="blue" closeIcon onClose={() => removeTag(key)}>
          {group[key]}
        </Tag>
      );
    }
  }
  return tags.length > 0 ? tags : <SearchOutlined />;
}
