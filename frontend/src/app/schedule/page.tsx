'use client';

import {useState, useEffect} from 'react';
import { Event } from '../../utils/interfaces';

export default function SchedulePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate/schedule`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if(!response.ok) {
                setError(true);
                console.log(data.detail);
            
            }
            else {
                setEvents(data);
                console.log(events);
            }
            setLoading(false);
        }
        fetchSchedule();
    }, []);

    if(loading) {
        return <div>Loading...</div>;
    }
    else if(error) {
        return <div>Sorry. We had trouble generating your schedule. Please try again later.</div>;
    }
    else {
        return <div>{events.map((event) => (
            <div key={event.id}>
                <h2>{event.summary}</h2>
                <p>{event.start.dateTime}</p>
                <p>{event.end.dateTime}</p>
            </div>
        ))}</div>;
    }
}