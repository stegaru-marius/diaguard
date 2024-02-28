import {promises as fs} from "fs";
import TokenPayloadService from "@/app/services/TokenPayloadService";
import AccessTokenValidator from "@/app/services/AccessTokenValidator";
import TokenRefreshService from "@/app/services/TokenRefreshService";
import CareLinkConfigService from "@/app/services/CareLinkConfigService";

class CareLinkDataFetchService {
    async getLast24HoursData() {
        const filePath = process.cwd() + '/app/logindata.json';
        const file = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(file);
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

            fs.writeFile(filePath, JSON.stringify(data))
                .then(() => {
                    console.log('File written successfully.');
                })
                .catch(error => {
                    console.error('Error writing file:', error);
                });
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

export default await CareLinkDataFetchService;
