'use client';

import {useState, useEffect} from 'react';
import { Event } from '../../utils/interfaces';
import WeeklyEventsView from '../../components/WeeklyEventsView';

export default function SchedulePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate/schedule`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                if(!response.ok) {
                    throw new Error(data.detail);
                }
                else {
                    setEvents(data);
                    console.log(events);
                }
                setLoading(false);
            } catch (error) {
                setError(true);
                console.error('Error fetching schedule:', error);
            }
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
        return <WeeklyEventsView events={events} />;
    }
}