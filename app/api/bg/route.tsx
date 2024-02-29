import {NextResponse} from "next/server";
import CareLinkDataFetchService from "@/app/services/CareLinkDataFetchService";
import { MongoClient } from 'mongodb';

let isWriting = false;

export async function GET() {
    const careLinkDataFetchService = new CareLinkDataFetchService();
    const last24HoursData = await careLinkDataFetchService.getLast24HoursData();
    const uri =
        "mongodb+srv://diaguardro:QNeLaFFtDiF9p2Cc@diaguard-cluster.79edapo.mongodb.net/?retryWrites=true&w=majority&appName=DiaGuard-Cluster";

    // Check if a write operation is already in progress
    // if (isWriting) {
    //     return NextResponse.json({ message: 'Write operation in progress' }, {status: 400});
    // }


    if (!isWriting) {
        isWriting = true;
        const client = await MongoClient.connect(uri);
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

    return NextResponse.json(last24HoursData);
}