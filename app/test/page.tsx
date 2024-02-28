import TimeAgoComponent from './TimeAgoComponent';
import CareLinkDataFetchService from "@/app/services/CareLinkDataFetchService";

export default async function Page() {
    const careLinkDataFetchService = new CareLinkDataFetchService();
    const last24HoursSensorData = await careLinkDataFetchService.getLast24HoursData();
    const sgArray = await careLinkDataFetchService.sortBgByDate(last24HoursSensorData);

    return  (
        <div>
            <h1>Current BG Value Sgs: { sgArray[0].sg } {<TimeAgoComponent dateTime={sgArray[0].datetime} />}.</h1>
            <h1>SG Trend: { last24HoursSensorData.lastSGTrend} </h1>
            <h1>Pacient Full Name: { last24HoursSensorData.firstName } { last24HoursSensorData.lastName } </h1>
            <h1>Transmitter Battery Level: { last24HoursSensorData.medicalDeviceBatteryLevelPercent }%</h1>
            <h1>Sensor Duration Hours: { last24HoursSensorData.sensorDurationHours / 24 } days </h1>
        </div>
    );
}

