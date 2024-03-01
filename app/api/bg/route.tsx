import {NextResponse} from "next/server";
import CareLinkDataFetchService from "@/app/services/CareLinkDataFetchService";
import { connectToDatabase } from '@/app/services/MongoService';
import {MongoClient} from "mongodb";

let isWriting = false;

export async function GET() {
    const careLinkDataFetchService = new CareLinkDataFetchService();
    const last24HoursData = await careLinkDataFetchService.getLast24HoursData();


    if (!isWriting) {
        isWriting = true;
        const client: MongoClient = await connectToDatabase();
        const db = client.db();

        const collection = db.collection('testCollection');
        const lastSg = last24HoursData.lastSG.sg,
            lastDateTime = last24HoursData.lastSG.datetime;
        const existingDocument = await collection.findOne({ lastSg, lastDateTime });
        if (!existingDocument) {
            const result = await collection.insertOne({ lastSg, lastDateTime });
        }

        isWriting = false;
    }
    console.log(last24HoursData);
    return NextResponse.json(last24HoursData);
}