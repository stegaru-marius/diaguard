import fs from 'fs';
import dotenv from 'dotenv';
import TokenPayloadService from "@/app/services/TokenPayloadService";
import AccessTokenValidator from "@/app/services/AccessTokenValidator";
import TokenRefreshService from "@/app/services/TokenRefreshService";
import CareLinkConfigService from "@/app/services/CareLinkConfigService";
import { connectToDatabase } from '@/app/services/MongoService';
import {MongoClient} from "mongodb";

let isWriting = false;
class CareLinkDataFetchService {
    async getLast24HoursData() {
        let data: object = {
            "accessToken": '',
            "refreshToken": process.env.REFRESH_TOKEN,
            "scope": process.env.SCOPE,
            "clientId": process.env.CLIENT_ID,
            "clientSecret": process.env.CLIENT_SECRET,
            "magIdentifier": process.env.MAG_IDENTIFIER
        };

        const client: MongoClient = await connectToDatabase();
        const db = client.db();

        const collections = await db.listCollections({name: "tokens"}).toArray();
        if (collections.length === 0) {
            await db.createCollection("tokens");
        }
        const fieldExists = await db.collection("tokens").findOne({accessToken: {$exists: true}});

        if (!fieldExists) {
            if (!isWriting) {
                isWriting = true;
                const accessToken = process.env.ACCESS_TOKEN;
                data.accessToken = accessToken;
                await db.collection("tokens").insertOne({accessToken});
                isWriting = false;
            }
        } else {
            data.accessToken = fieldExists.accessToken == null ? process.env.ACCESS_TOKEN : fieldExists.accessToken;
        }

        const tokenPayloadService = new TokenPayloadService();
        const accessTokenValidator: AccessTokenValidator = new AccessTokenValidator();
        const tokenRefreshService: TokenRefreshService = new TokenRefreshService();
        const accessTokenPayload = tokenPayloadService.getAccessTokenPayload(data);
        const isTokenValid = accessTokenValidator.validate(accessTokenPayload);

        if (isTokenValid) {
            const careLinkConfigService = new CareLinkConfigService();
            const careLinkConfig :Record<string, any> | null = await careLinkConfigService.getConfig("RO");
            data = await tokenRefreshService.refresh(careLinkConfig, data);
            const accessToken = data.accessToken;

            await db.collection("tokens").updateOne(
                { accessToken: { $exists: true } },
                { $set: { accessToken } }
            );
        }
        const headers: object = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Nexus 5X Build/QQ3A.200805.001)",
            'mag-identifier': data.magIdentifier,
            'Authorization': 'Bearer ' + data.accessToken
        };

        console.log(JSON.stringify(headers));
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
