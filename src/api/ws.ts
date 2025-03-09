import { clearTokenInfo } from '@/store/auth';
import navigate from '@/utils/navigate';

export enum ConnStatus {
  /** 等待连接 */
  WaitConnect,
  /** 已连接 */
  Connected,
  /** 正在重连 */
  Reconnecting,
  /** 连接超时 */
  ConnTimeouted,
  /** 连接已关闭 */
  ConnClosed,
}

export enum ActionType {
  /** 登录认证 */
  Auth = 1,
  /** 断开连接 */
  Signout,
  /** 离线消息推送标记 */
  OfflinePush,
  /** 私聊消息 */
  PrivateMessage,
  /** 系统消息 */
  SystemMessage,
  /** 消息已读 */
  MessageReaded,
}

export type RecvInfo = {
  action: ActionType;
  data?: unknown;
};

type AuthResult = {
  code: number;
  message: number;
};

type ConnConfig = {
  getToken: () => string; // 获取认证 token
  onConnect: () => void;
  onMessage: (data: RecvInfo) => void;
  onClose: (code: number) => void;
};

class ChatSocket {
  // 连接标记
  protected isConnected = false;
  // 重连定时器 id
  protected reconnTimerId: NodeJS.Timeout | null = null;
  protected retryCount: number = 0;

  protected socket?: WebSocket;

  protected url: string;
  protected config: ConnConfig;

  constructor(url: string, config: ConnConfig) {
    this.url = url;
    this.config = config;
    this.initWebSocket(url, config);
  }

  private initWebSocket(url: string, config: ConnConfig) {
    this.socket = new WebSocket(url);
    this.socket.onopen = () => {
      this.isConnected = true;
      this.socket!.send(
        JSON.stringify({
          action: ActionType.Auth,
          data: { token: config.getToken() },
        })
      );
    };

    this.socket.onmessage = (e) => {
      const recvInfo: RecvInfo = JSON.parse(e.data);
      if (recvInfo.action !== ActionType.Auth) {
        config.onMessage(recvInfo);
        return;
      }
      if (!recvInfo.data) {
        config.onConnect();
        return;
      }
      const { code } = recvInfo.data as AuthResult;
      if (code !== 401) {
        clearTokenInfo();
        navigate.replace('/login'); // token 无效，返回登录页
      }
      window.location.reload();
    };

    this.socket.onclose = (e) => {
      this.isConnected = false;
      config.onClose(e.code);
    };

    this.socket.onerror = (e) => {
      console.error('socket.onerror: ', e);
    };
  }

  close(code?: number) {
    this.socket?.close(code);
  }

  reconnect() {
    if (this.isConnected) {
      return;
    }
    if (this.reconnTimerId) {
      clearTimeout(this.reconnTimerId); // 重试前，取消之前的重连任务
    }
    this.reconnTimerId = setTimeout(() => this.initWebSocket(this.url, this.config), 5000);
    this.retryCount++;
  }

  getRetryCount() {
    return this.retryCount;
  }
  resetRetryCount() {
    this.retryCount = 0;
  }

  isReady() {
    return this.socket?.readyState === 1;
  }
}

export function create(url: string, config: ConnConfig) {
  return new ChatSocket(url, config);
}
