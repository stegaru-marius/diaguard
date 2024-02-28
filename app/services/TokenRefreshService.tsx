interface TokenData {
  refresh_token: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
  access_token: string;
}

interface Config {
  token_url: string;
}

class TokenRefreshService {
  async refresh(config: Config, tokenData: TokenData): Promise<TokenData> {
    try {
      const tokenUrl = config.tokenUrl;
      const data = {
        refresh_token: tokenData.refreshToken,
        client_id: tokenData.clientId,
        client_secret: tokenData.clientSecret,
        grant_type: 'refresh_token'
      };
      const headers = {
        'mag-identifier': tokenData.magIdentifier,
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers,
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error('ERROR: failed to refresh token');
      }

      const newData: TokenData = await response.json();
      tokenData.accessToken = newData.access_token;
      tokenData.refreshToken = newData.refresh_token;

      return tokenData;
    } catch (error) {
      throw error;
    }
  }
}

export default TokenRefreshService;
