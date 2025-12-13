// src/api/auth.ts
import Auth0 from 'react-native-auth0';
import client, { setAccessToken } from './Client';

export const auth0 = new Auth0({
  domain: 'dev-rc5gsyjk5pfptk72.us.auth0.com',
  clientId: 'k1naLtV7ldGAv6ufgUsNe6XlrOQynDpt',
});

export const REDIRECT_URI =
  'com.lingomateapp.auth0://dev-rc5gsyjk5pfptk72.us.auth0.com/android/com.lingomateapp/callback';

export async function login() {
  const res: any = await auth0.webAuth.authorize({
    scope: 'openid profile email',
    // @ts-ignore
    redirectUri: REDIRECT_URI,
  });

  const token = res?.accessToken || res?.idToken || null;

  await setAccessToken(token);

  console.log('🔐 Auth0 login result keys:', Object.keys(res || {}));
  console.log('🔐 token set?', token ? 'YES' : 'NO');

  return res;
}

// ✅ 로그아웃
export async function logout() {
  // 1) 프론트 토큰 제거(중요)
  await setAccessToken(null);

  // 2) Auth0 세션도 종료
  return auth0.webAuth.clearSession({
    // @ts-ignore
    returnTo: REDIRECT_URI,
    federated: false,
  });
}

// ✅ 백엔드 API
export const authApi = {
  getMyAuthInfo: () => client.get('/api/auth/me'),
  registerIfNeeded: () => client.post('/api/auth/register-if-needed'),
};
