const storage = window.sessionStorage;

const userTokenKey = 'user_token';
const refreshTokenKey = 'refresh_token';

export function getToken() {
  const token = storage.getItem(userTokenKey);
  if (token) {
    return token;
  }
  return '';
}

export function getRefreshToken() {
  const token = storage.getItem(refreshTokenKey);
  if (token) {
    return token;
  }
  return '';
}

/** 保存认证 token */
export function saveTokenInfo(token: string, refreshToken?: string) {
  storage.setItem(userTokenKey, token);
  if (refreshToken) {
    storage.setItem(refreshTokenKey, refreshToken);
  }
}

/** 清空用户信息 */
export function clearTokenInfo() {
  storage.removeItem(userTokenKey);
  storage.removeItem(refreshTokenKey);
}
