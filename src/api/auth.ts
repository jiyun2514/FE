// src/api/auth.ts
import Auth0 from 'react-native-auth0';
import client, { setAccessToken } from './Client';

export const auth0 = new Auth0({
  domain: 'dev-rc5gsyjk5pfptk72.us.auth0.com',
  clientId: 'k1naLtV7ldGAv6ufgUsNe6XlrOQynDpt',
});

export const REDIRECT_URI =
  'com.lingomateapp.auth0://dev-rc5gsyjk5pfptk72.us.auth0.com/android/com.lingomateapp/callback';

const AUDIENCE = 'https://api.lingomate.com';

// ✅ Backend API wrappers
export const authApi = {
  getMyAuthInfo: () => client.get('/api/auth/me'),
  // ✅ IMPORTANT: send {} so backend never sees req.body as undefined
  registerIfNeeded: () => client.post('/api/auth/register-if-needed', {}),
};

// ✅ Login
export async function login() {
  const res: any = await auth0.webAuth.authorize({
    scope: 'openid profile email',
    audience: AUDIENCE,

    // 라이브러리 버전별로 redirectUrl/redirectUri 다를 수 있어서 둘 다 넣음
    // @ts-ignore
    redirectUrl: REDIRECT_URI,
    // @ts-ignore
    redirectUri: REDIRECT_URI,
  });

  const accessToken = res?.accessToken ?? null;

  console.log('🔐 Auth0 login result keys:', Object.keys(res || {}));
  console.log('🔐 has accessToken?', accessToken ? 'YES' : 'NO');

  if (!accessToken) {
    throw new Error(
      'Auth0 did not return accessToken. Check audience/redirect settings.'
    );
  }

  // ✅ 1) Save token so axios interceptor attaches it
  await setAccessToken(accessToken);

  // ✅ 2) Create/Sync user in DB BEFORE calling /home/status anywhere
  await authApi.registerIfNeeded();

  return res;
}

// ✅ Logout
export async function logout() {
  // 1) clear token in app
  await setAccessToken(null);

  // 2) clear Auth0 session
  return auth0.webAuth.clearSession({
    // @ts-ignore
    returnTo: REDIRECT_URI,
    // @ts-ignore
    redirectUrl: REDIRECT_URI,
    federated: false,
  });
}
