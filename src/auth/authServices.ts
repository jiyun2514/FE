import { authorize, revoke, refresh } from 'react-native-app-auth';
import { authConfig } from './authConfig';

const config = {
  issuer: `https://${authConfig.domain}`,
  clientId: authConfig.clientId,
  redirectUrl: authConfig.redirectUri,
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  additionalParameters: {},
  serviceConfiguration: {
    authorizationEndpoint: `https://${authConfig.domain}/authorize`,
    tokenEndpoint: `https://${authConfig.domain}/oauth/token`,
    revocationEndpoint: `https://${authConfig.domain}/oauth/revoke`,
  },
};

let authState: any = null;

export async function login() {
  try {
    const result = await authorize(config);
    authState = result;
    return result;
  } catch (e) {
    console.error("Auth0 Login Error:", e);
    throw e;
  }
}

export async function logout() {
  try {
    await revoke(config, {
      tokenToRevoke: authState?.accessToken,
    });
    authState = null;
  } catch (e) {
    console.error("Logout Error:", e);
  }
}

export function getAccessToken() {
  return authState?.accessToken ?? null;
}

export async function refreshToken() {
  if (!authState?.refreshToken) return null;
  const refreshed = await refresh(config, {
    refreshToken: authState.refreshToken,
  });
  authState = refreshed;
  return refreshed.accessToken;
}
