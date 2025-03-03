import { useEffect, useState } from 'react';
import { message, Modal } from 'antd';

import { friendApi, msgApi, ws } from '@/api';
import { auth, useStore } from '@/store';
import { cache, newChatInfoByFriend } from '@/store/chat';
import { loadingChatData } from '@/store/chat/cache';
import { useNavigate } from 'react-router-dom';
import { clearTokenInfo } from '@/store/auth';

export function useChatConn(userID: number, maxReConnNum: number) {
  const navigate = useNavigate();
  const friends = useStore((state) => state.friendStore.friends);

  const fetchUserInfo = useStore((state) => state.fetchUserInfo);
  const fetchFriendInfo = useStore((state) => state.fetchFriendInfo);
  const appendFriend = useStore((state) => state.appendFriend);
  const initChatStore = useStore((state) => state.initChatStore);
  const openChat = useStore((state) => state.openChat);
  const readedMessage = useStore((state) => state.readedMessage);
  const saveOrUpdateMessage = useStore((state) => state.saveOrUpdateMessage);

  const [loading, setLoading] = useState(true);
  const [connStat, setConnStat] = useState(ws.ConnStatus.WaitConnect);

  useEffect(() => {
    Promise.all([fetchUserInfo(), fetchFriendInfo()])
      .finally(() => setLoading(false))
      .catch(() => Modal.error({ title: '系统提示', content: '数据加载失败，请检查网络是否正常' }));
  }, [fetchUserInfo, fetchFriendInfo]);

  useEffect(() => {
    if (loading) {
      return;
    }
    const findFriendInfo = async (id: number) => {
      try {
        const friend = friends.find((item) => item.id === id);
        if (friend) {
          return friend;
        }
        const { data } = await friendApi.getFriend(id);
        appendFriend(data);
        return data;
      } catch (err) {
        console.error('friendApi.getFriend failed:', err);
        return null;
      }
    };
    cache.loadingChatData(userID).then((cacheData) => {
      initChatStore(cacheData);
      const conn = ws.create(import.meta.env.VITE_WEB_SOCKET_URL, {
        getToken: auth.getToken,
        onConnect: async function () {
          setConnStat(ws.ConnStatus.Connected);
          try {
            if (conn.getRetryCount() > 0) {
              // 重连时，重新拉取本地数据到缓存
              cacheData = await loadingChatData(userID);
              conn.resetRetryCount();
            }
            cacheData.isLoading = true;
            // 从服务端拉取未接收的消息
            await msgApi.pullOfflineMessage(cacheData.maxMsgID);
          } catch (err) {
            cacheData.isLoading = false;
            console.warn('msgApi.pullOfflineMessage error:', err);
          }
        },
        onMessage: async function (info: ws.RecvInfo) {
          // 根据消息类型执行对应操作
          switch (info.action) {
            case ws.ActionType.Signout:
              conn.close(3000);
              clearTokenInfo();
              navigate('/login', { replace: true });
              window.location.reload();
              break;
            case ws.ActionType.OfflinePush:
              cacheData.isLoading = info.data as boolean;
              if (!cacheData.isLoading) {
                initChatStore(cacheData);
              }
              break;
            case ws.ActionType.PrivateMessage: {
              const msg = info.data as msgApi.PrivateMessage;
              const chatId = cacheData.userID === msg.send_id ? msg.recv_id : msg.send_id;
              const friend = await findFriendInfo(chatId);
              if (!friend) {
                break;
              }
              const chat = newChatInfoByFriend(userID, friend);
              if (cacheData.isLoading) {
                cache.saveOrUpdateChatCache(cacheData, chat, msg);
              } else {
                openChat(chat);
                saveOrUpdateMessage(chatId, msg);
              }
              break;
            }
            case ws.ActionType.SystemMessage:
              Modal.confirm({ title: '系统通知', content: info.data as string });
              break;
            case ws.ActionType.MessageReaded: {
              const data = info.data as Record<string, unknown>;
              readedMessage(data.chat_id as number, data.self_readed as boolean);
              break;
            }
            default:
              console.error('invalid message data:', info);
              message.error(`action value: ${info.action} invalid`, 15);
          }
        },
        onClose: function (code) {
          if (code !== 3000) {
            if (conn.getRetryCount() >= maxReConnNum) {
              conn.resetRetryCount();
              setConnStat(ws.ConnStatus.ConnTimeouted);
              Modal.error({ title: '重连失败', content: '无法连接至服务器，请稍后再试' });
              return;
            }
            conn.reconnect();
            setConnStat(ws.ConnStatus.Reconnecting);
          } else {
            setConnStat(ws.ConnStatus.ConnClosed);
          }
        },
      });
    });
  }, [
    userID,
    friends,
    maxReConnNum,
    loading,
    navigate,
    openChat,
    appendFriend,
    initChatStore,
    setConnStat,
    readedMessage,
    saveOrUpdateMessage,
  ]);
  return connStat;
}
