import { AxiosError } from 'axios';

import { RespResult } from '@/api/request';
import { message } from 'antd';

// 处理 http 错误并弹窗提示
export function showHttpErrorMessageTips(err: unknown) {
  try {
    if (err instanceof AxiosError) {
      let msg = err.message;
      switch (err.code) {
        case 'ERR_NETWORK':
          msg = '网络故障或服务器不可用，请稍后再试';
      }
      message.error(`通信异常: [code: ${err.code}] ${msg}`);
      return;
    }
    const res = err as RespResult<undefined>;
    message.warning(`系统提示: [code: ${res.code}] ${res.message}`);
  } catch {
    console.error('showHttpErrorMessageTips parse failed:', err);
  }
}

export default {
  showHttpErrorMessageTips,
};
