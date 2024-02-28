interface TokenData {
    access_token: string;
}

interface AccessTokenPayload {
    exp: number;
}

class TokenPayloadService {
    getAccessTokenPayload(tokenData: TokenData): Record<string, any> | null {
        try {
            const payloadB64 = tokenData.accessToken.split('.')[1];
            const payloadB64Bytes = Buffer.from(payloadB64 + '=='.slice((payloadB64.length + 3) % 4), 'base64');

            return JSON.parse(payloadB64Bytes.toString());
        } catch (error) {
            // this.logger.error("[Decrypting Access Token] Malformed access token! Please try to reconnect to CareLink.");
            return null;
        }
    }
}

export default TokenPayloadService;
