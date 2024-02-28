interface AccessTokenPayload {
    exp: number;
}

class AccessTokenValidator {
    validate(accessTokenPayload: Object): boolean {
        try {
            const tokenValidTo = accessTokenPayload.exp;
            const tdiff = tokenValidTo - Math.floor(Date.now() / 1000);

            if (tdiff < 0) {
                // this.logger.info("[AccessTokenValidator] Access token has expired " + Math.abs(tdiff) + "s ago!");
                return false;
            }

            if (tdiff < 600) {
                // this.logger.info("[AccessTokenValidator] Access token is about to expire in " + Math.abs(tdiff) + "s!");
                return false;
            }

            const authTokenValidTo = new Date(tokenValidTo * 1000).toUTCString();
            // this.logger.info("[AccessTokenValidator] Access token expires in " + tdiff + "s (" + authTokenValidTo + ")!");
            return true;
        } catch (error) {
            // this.logger.info("[AccessTokenValidator] Access Token Payload is missing data!");
            return false;
        }
    }
}

export default AccessTokenValidator;
