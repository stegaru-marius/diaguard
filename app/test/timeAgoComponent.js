import React from 'react';

const TimeAgoComponent = ({ dateTime }) => {
    const getTimeAgo = (dateTimeString) => {
        const currentTimestamp = new Date().getTime();
        const dateTimeTimestamp = new Date(dateTimeString).getTime();
        const differenceInMilliseconds = currentTimestamp - dateTimeTimestamp;

        // Convert milliseconds to minutes
        const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

        if (differenceInMinutes < 1) {
            return 'just now';
        } else if (differenceInMinutes < 60) {
            return `${differenceInMinutes} minute${differenceInMinutes > 1 ? 's' : ''} ago`;
        } else if (differenceInMinutes < 1440) { // 24 * 60
            return `${Math.floor(differenceInMinutes / 60)} hour${Math.floor(differenceInMinutes / 60) > 1 ? 's' : ''} ago`;
        } else {
            return `${Math.floor(differenceInMinutes / 1440)} day${Math.floor(differenceInMinutes / 1440) > 1 ? 's' : ''} ago`;
        }
    };

    const timeAgo = getTimeAgo(dateTime);

    return <span>{timeAgo}</span>;
};

export default TimeAgoComponent;
