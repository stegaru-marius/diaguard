// pages/index.tsx
"use client"
import { useEffect, useState } from 'react';

const getNextAPICallTime = (dateTimeString: string): number => {
    console.log(dateTimeString);
    const dateTime = new Date(dateTimeString);
    const targetTime = new Date(dateTime.getTime() + 5 * 60000); // Add 5 minutes to the given dateTime
    console.log(dateTime);
    const currentTime = new Date();
    const timeDifference = targetTime.getTime() - currentTime.getTime();

    if (timeDifference <= 0) {
        return 0;
    } else {
        return timeDifference;
    }
};

interface BloodGlucoseData {
    glucose: number | null;
    dateTime: string | null;
}

const Home = ({}: object) => {
    const [glucoseData, setGlucoseData] = useState<BloodGlucoseData>({
        glucose: null,
        dateTime: '',
    });

    const fetchData = async () => {
        const res = await fetch('/api/bg');
        const data = await res.json();
        const glucoseData = {
            glucose: data.lastSG.sg,
            dateTime: data.lastSG.datetime
        };
        setGlucoseData(glucoseData);
    };

    useEffect(() => {
        fetchData();

        const fetchDataInterval = setInterval(() => {
            const currentTime = new Date();
            const receivedTime = new Date(glucoseData.dateTime);
            const timeDifference = (currentTime.getTime() - receivedTime.getTime()) / (1000 * 60); // Difference in minutes

            if (timeDifference >= 5) {
                console.log('test');
                // If it has been more than 5 minutes since last fetch, fetch data again
                fetchData();
            }
        }, 10000); // Fetch data every minute


        return () => clearInterval(fetchDataInterval);


        }, [glucoseData.glucose]); // Include initialBloodGlucose in the dependency array to re-run effect on its change

    return (
        <div>
            { glucoseData.glucose !== null &&
                <><h1>Blood Glucose Level: {glucoseData.glucose}</h1><p>Last Updated: {glucoseData.dateTime}</p></>
            }
            {glucoseData.glucose == null &&
                <h1>Loading...</h1>
            }

        </div>
    );
};

export default Home;
