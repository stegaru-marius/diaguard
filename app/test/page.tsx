// pages/index.tsx
"use client"
import {useEffect, useState} from 'react';

interface BloodGlucoseData {
    glucose: number | null;
    dateTime: string | null;
}

const Home = ({}: object) => {
    const [glucoseData, setGlucoseData] = useState<BloodGlucoseData>({
        glucose: null,
        dateTime: null,
    });

    let hbA1C = null;

    const fetchData = async () => {
        const res = await fetch('/api/bg');
        const data = await res.json();
        const glucoseData = {
            glucose: data.lastSG.sg,
            dateTime: data.lastSG.datetime
        };
        setGlucoseData(glucoseData);
    };

    const fetchHbA1cData = async () => {
        const res = await fetch('/api/hba1c');
        return await res.json();
    };


    useEffect(() => {
        hbA1C = fetchHbA1cData();
    }, []);

    useEffect(() => {
        const fetchDataInterval = setInterval(() => {
            const currentTime = new Date();
            let timeDifference;
            if (glucoseData.dateTime == null) {
                timeDifference = 5;
            } else {
                const receivedTime = new Date(glucoseData.dateTime);
                timeDifference = (currentTime.getTime() - receivedTime.getTime()) / (1000 * 60); // Difference in minutes
            }

            if (timeDifference >= 5) {
                // If it has been more than 5 minutes since last fetch, fetch data again
                fetchData();
            }
        }, 10000);


        return () => clearInterval(fetchDataInterval);


        }, [glucoseData.dateTime]); // Include glucoseData.dateTime in the dependency array to re-run effect on its change

    return (
        <div>
            { glucoseData.glucose !== null &&
                <><h1>Blood Glucose Level: {glucoseData.glucose}</h1><p>Last Updated: {glucoseData.dateTime}</p><p>Estimated HbA1c: {glucoseData.estimatedHbA1c}</p></>
            }
            {glucoseData.glucose == null &&
                <h1>Loading...</h1>
            }

        </div>
    );
};

export default Home;
