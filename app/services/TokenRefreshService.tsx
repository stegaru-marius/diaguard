interface Config {
  token_url: string;
}

class TokenRefreshService {
  async refresh(config: Config, tokenData): Promise<TokenData> {
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
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br'
      };

      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers,
        body: formData.toString(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('ERROR: failed to refresh token');
      }

      const newData = await response.json();

      tokenData.accessToken = newData.access_token;
      tokenData.refreshToken = newData.refresh_token;

      return tokenData;
    } catch (error) {
      throw error;
    }
  }
}

export default TokenRefreshService;
