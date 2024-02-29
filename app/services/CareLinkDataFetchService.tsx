import fs from 'fs';
import dotenv from 'dotenv';
import TokenPayloadService from "@/app/services/TokenPayloadService";
import AccessTokenValidator from "@/app/services/AccessTokenValidator";
import TokenRefreshService from "@/app/services/TokenRefreshService";
import CareLinkConfigService from "@/app/services/CareLinkConfigService";

const updateEnvVariables = (newEnvVariables: object) => {
    try {
        // Read existing .env.local file
        const currentEnvContent = fs.readFileSync('.env.local', 'utf8');
        const data = {
            "ACCESS_TOKEN": newEnvVariables.accessToken,
            "REFRESH_TOKEN": newEnvVariables.refreshToken,
            "SCOPE": process.env.SCOPE,
            "CLIENT_ID": process.env.CLIENT_ID,
            "CLIENT_SECRET": process.env.CLIENT_SECRET,
            "MAG_IDENTIFIER": process.env.MAG_IDENTIFIER,
        };


        // Parse existing environment variables
        const currentEnvVariables = currentEnvContent
            .split('\n')
            .map(line => line.split('='))
            .reduce((acc, [key, value]) => {
                if (key) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>);

        // Update existing environment variables with new values
        const updatedEnvVariables = { ...currentEnvVariables, ...data };

        // Serialize updated environment variables
        const updatedEnvContent = Object.entries(updatedEnvVariables)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Write to a new .env.local file
        fs.writeFileSync('.env.local', updatedEnvContent, 'utf8');
        dotenv.config();

        console.log('.env.local file updated successfully.');
    } catch (error) {
        console.error('Error updating .env.local file:', error);
    }
};

class CareLinkDataFetchService {
    async getLast24HoursData() {
        const data = {
            "accessToken": process.env.ACCESS_TOKEN,
            "refreshToken": process.env.REFRESH_TOKEN,
            "scope": process.env.SCOPE,
            "clientId": process.env.CLIENT_ID,
            "clientSecret": process.env.CLIENT_SECRET,
            "magIdentifier": process.env.MAG_IDENTIFIER
        };

        const tokenPayloadService = new TokenPayloadService();
        const accessTokenValidator: AccessTokenValidator = new AccessTokenValidator();
        const tokenRefreshService: TokenRefreshService = new TokenRefreshService();
        const accessTokenPayload = tokenPayloadService.getAccessTokenPayload(data);
        const isTokenValid = accessTokenValidator.validate(accessTokenPayload);

        if (!isTokenValid) {
            const careLinkConfigService = new CareLinkConfigService();
            const careLinkConfig :Record<string, any> | null = await careLinkConfigService.getConfig("RO");
            const newAccessData = await tokenRefreshService.refresh(careLinkConfig, data);
            data.accessToken = newAccessData.accessToken;
            data.refreshToken = newAccessData.refreshToken;
            updateEnvVariables(data);
        }

        const headers: object = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Nexus 5X Build/QQ3A.200805.001)",
            'mag-identifier': data.magIdentifier,
            'Authorization': 'Bearer ' + data.accessToken
        };
        const currentTimestamp: number = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
        const currentTimestampAsString: string = currentTimestamp.toString();

        const queryParams: object = {
            "cpSerialNumber": "NONE",
            "msgType": "last24Hours",
            "requestTime": currentTimestampAsString
        };

        const apiUrl: string = "https://carelink.minimed.eu/patient/connect/data";
        const url: URL = new URL(apiUrl);
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: headers
            }
        );

        return await response.json();
    }


    async sortBgByDate(last24HoursSensorData: Promise<any>)
    {
        const sgArray: Array<Array<any>> = Object.values(last24HoursSensorData.sgs);
        sgArray.sort((a: any, b: any) =>{ return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()});

        return sgArray;
    }
}

export default CareLinkDataFetchService;
